import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch, ApiError, type ApiResponse } from '@/api'
import { socialApi, listSocialEditableOrgUuids, safeSocialUrl, socialErrorKey } from '@/api/social'
import { accountDto, postDto } from './fixtures/social'
import type { SocialAccountInput } from '@/domain/social/social.model'

vi.mock('@/api', async importOriginal => ({ ...await importOriginal<typeof import('@/api')>(), apiFetch: vi.fn() }))
function respond(data: unknown, status = 200) {
  const response: ApiResponse<unknown> = { service: 'API', api_version: '1', response_type: 'test', status, timestamp: '', data }
  vi.mocked(apiFetch).mockResolvedValueOnce(response)
}
const input: SocialAccountInput = { platform: 'mastodon', name: 'Culture', remoteAccountId: '123', remoteAccountName: null,
  baseUrl: 'https://social.example', enabled: true, tokenExpiresAt: null }

beforeEach(() => vi.resetAllMocks())
describe('social API contracts', () => {
  it('loads only accounts belonging to the requested organization and discards credentials', async () => {
    respond({ accounts: [{ ...accountDto(), access_token: 'never-return-me' }, { ...accountDto('other'), org_uuid: 'other-org' }] })
    const accounts = await socialApi.listAccounts('org-1')
    expect(apiFetch).toHaveBeenCalledWith('/api/admin/social/accounts?org_uuid=org-1', { method: 'GET' })
    expect(accounts).toHaveLength(1)
    expect(accounts[0]).toMatchObject({ remoteAccountId: '123', hasAccessToken: true })
    expect(JSON.stringify(accounts)).not.toContain('never-return-me')
  })
  it('creates accounts using write-only credentials and snake_case fields', async () => {
    respond(accountDto(), 201)
    await socialApi.createAccount('org-1', { ...input, accessToken: 'new-secret' })
    const body = JSON.parse(String(vi.mocked(apiFetch).mock.calls[0]?.[1]?.body))
    expect(body).toMatchObject({ org_uuid: 'org-1', remote_account_id: '123', access_token: 'new-secret' })
    expect(body).not.toHaveProperty('accessToken')
  })
  it('preserves omitted credentials and allows explicit clearing on edit', async () => {
    respond(accountDto())
    await socialApi.updateAccount('account-1', { ...input, enabled: false, refreshToken: null })
    const body = JSON.parse(String(vi.mocked(apiFetch).mock.calls[0]?.[1]?.body))
    expect(body).not.toHaveProperty('access_token')
    expect(body).toMatchObject({ enabled: false, refresh_token: null })
    expect(apiFetch).toHaveBeenCalledWith('/api/admin/social/accounts/account-1', expect.objectContaining({ method: 'PUT' }))
  })
  it('uses the existing delete endpoint and propagates conflicts', async () => {
    vi.mocked(apiFetch).mockRejectedValueOnce(new ApiError('protected', 409))
    await expect(socialApi.deleteAccount('account-1')).rejects.toMatchObject({ status: 409 })
    expect(apiFetch).toHaveBeenCalledWith('/api/admin/social/accounts/account-1', { method: 'DELETE' })
  })
  it('creates one event post containing multiple targets', async () => {
    respond(postDto(), 201)
    const post = await socialApi.createEventPost('org-1', 'event-1', ['account-1', 'account-2'])
    expect(apiFetch).toHaveBeenCalledTimes(1)
    expect(JSON.parse(String(vi.mocked(apiFetch).mock.calls[0]?.[1]?.body))).toEqual({
      org_uuid: 'org-1', source_type: 'event', source_uuid: 'event-1',
      targets: [{ social_account_uuid: 'account-1' }, { social_account_uuid: 'account-2' }],
    })
    expect(post.targets.map(t => t.socialAccountUuid)).toEqual(['account-1', 'account-2'])
  })
  it('filters post lists by event AND organization', async () => {
    respond({ posts: [postDto(), { ...postDto(), source_uuid: 'other' }, { ...postDto(), org_uuid: 'other' }, { ...postDto(), source_type: 'venue' }] })
    expect(await socialApi.listEventPosts('org-1', 'event-1')).toHaveLength(1)
  })
  it('uses server-generated previews and strips unsafe links', async () => {
    respond({ previews: [{ target_uuid: 'target-1', platform: 'mastodon', text: 'Server text', image_url: 'javascript:alert(1)', url: 'https://events.example/event/1' }] })
    expect(await socialApi.preview('post-1', 'de')).toEqual([{ targetUuid: 'target-1', platform: 'mastodon', text: 'Server text', imageUrl: null, imageAlt: null, url: 'https://events.example/event/1' }])
    expect(apiFetch).toHaveBeenCalledWith('/api/admin/social/posts/post-1/preview?lang=de', { method: 'POST' })
  })
  it('interprets the asynchronous publish response without inventing request content', async () => {
    respond({ results: [{ target_uuid: 'target-1', social_account_uuid: 'account-1', status: 'scheduled' }] }, 202)
    expect(await socialApi.publish('post-1', 'da')).toEqual([{ targetUuid: 'target-1', socialAccountUuid: 'account-1', status: 'scheduled', error: null }])
    expect(apiFetch).toHaveBeenCalledWith('/api/admin/social/posts/post-1/publish?lang=da', { method: 'POST' })
  })
  it('uses API-supplied edit-org permissions', async () => {
    respond({ organizations: [{ uuid: 'allowed', can_edit_org: true }, { uuid: 'denied', can_edit_org: false }] })
    expect(await listSocialEditableOrgUuids()).toEqual(['allowed'])
  })
  it('handles the existing organization endpoint null empty-list representation', async () => {
    respond({ organizations: null })
    expect(await listSocialEditableOrgUuids()).toEqual([])
  })
  it('rejects malformed responses instead of treating them as empty/successful', async () => {
    respond({ accounts: [{ ...accountDto(), enabled: 'true' }] })
    await expect(socialApi.listAccounts('org-1')).rejects.toThrow('Invalid social response')
    respond({ ...postDto(), targets: [{ status: 'invented' }] })
    await expect(socialApi.getPost('post-1')).rejects.toThrow()
  })
  it('maps errors without reflecting submitted secrets', () => {
    for (const status of [400, 401, 403, 404, 409, 500]) {
      expect(socialErrorKey(new ApiError('private-token-value', status))).not.toContain('private-token-value')
    }
    expect(socialErrorKey(new ApiError('target: an image is required', 400))).toBe('social_error_image')
    expect(safeSocialUrl('https://user:secret@example.com')).toBeNull()
  })
})

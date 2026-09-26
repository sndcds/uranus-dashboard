import type { SocialAccount, SocialPost, SocialPreview, SocialTargetStatus } from '@/domain/social/social.model'

export function socialAccount(uuid = 'account-1', overrides: Partial<SocialAccount> = {}): SocialAccount {
  return { uuid, orgUuid: 'org-1', platform: 'mastodon', name: uuid, remoteAccountId: '123',
    remoteAccountName: '@culture', baseUrl: 'https://social.example', enabled: true,
    hasAccessToken: true, hasRefreshToken: false, tokenExpiresAt: null, ...overrides }
}
export function socialPost(status: SocialTargetStatus = 'draft', accountUuids = ['account-1', 'account-2']): SocialPost {
  return { uuid: 'post-1', orgUuid: 'org-1', sourceType: 'event', sourceUuid: 'event-1', createdAt: '2026-09-26T10:00:00Z',
    targets: accountUuids.map((uuid, i) => ({ uuid: `target-${i}`, socialAccountUuid: uuid, status,
      publicationSource: 'manual', publishLanguage: null, scheduledAt: null, publishedAt: null, remotePostId: null, error: null })) }
}
export function socialPreviews(): SocialPreview[] {
  return socialPost().targets.map(t => ({ targetUuid: t.uuid, platform: 'mastodon', text: 'Concert preview', imageUrl: null, imageAlt: null, url: null }))
}
export function accountDto(uuid = 'account-1') {
  return { uuid, org_uuid: 'org-1', platform: 'mastodon', name: 'Culture', remote_account_id: '123',
    remote_account_name: null, base_url: 'https://social.example', enabled: true, token_expires_at: null,
    has_access_token: true, has_refresh_token: false }
}
export function postDto() {
  return { uuid: 'post-1', org_uuid: 'org-1', source_type: 'event', source_uuid: 'event-1', created_at: '2026-09-26T10:00:00Z',
    targets: ['account-1', 'account-2'].map((uuid, i) => ({ uuid: `target-${i}`, social_account_uuid: uuid, status: 'draft',
      publication_source: 'manual', publish_language: null, scheduled_at: null, published_at: null, remote_post_id: null, error: null })) }
}

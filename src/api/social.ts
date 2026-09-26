import { apiFetch, ApiError } from '@/api'
import {
  socialPlatforms, socialTargetStatuses,
  type SocialAccount, type SocialAccountInput, type SocialPost,
  type SocialPostTarget, type SocialPreview, type SocialPublishResult,
} from '@/domain/social/social.model'

// Validate unknown responses at the boundary and explicitly discard unrecognized fields.
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid social response')
  return value as Record<string, unknown>
}
function string(value: unknown): string {
  if (typeof value !== 'string') throw new Error('Invalid social response')
  return value
}
function nullable(value: unknown): string | null {
  return value === null ? null : string(value)
}
function boolean(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new Error('Invalid social response')
  return value
}
function array<T>(value: unknown, map: (entry: unknown) => T): T[] {
  if (!Array.isArray(value)) throw new Error('Invalid social response')
  return value.map(map)
}
function enumValue<T extends string>(value: unknown, values: readonly T[]): T {
  const match = values.find(entry => entry === value)
  if (!match) throw new Error('Invalid social response')
  return match
}
function account(value: unknown): SocialAccount {
  const v = object(value)
  return {
    uuid: string(v.uuid), orgUuid: string(v.org_uuid), platform: enumValue(v.platform, socialPlatforms),
    name: string(v.name), remoteAccountId: string(v.remote_account_id),
    remoteAccountName: nullable(v.remote_account_name), baseUrl: nullable(v.base_url),
    enabled: boolean(v.enabled), tokenExpiresAt: nullable(v.token_expires_at),
    hasAccessToken: boolean(v.has_access_token), hasRefreshToken: boolean(v.has_refresh_token),
  }
}
function target(value: unknown): SocialPostTarget {
  const v = object(value)
  return {
    uuid: string(v.uuid), socialAccountUuid: string(v.social_account_uuid),
    status: enumValue(v.status, socialTargetStatuses), publicationSource: string(v.publication_source),
    publishLanguage: nullable(v.publish_language), scheduledAt: nullable(v.scheduled_at),
    publishedAt: nullable(v.published_at), remotePostId: nullable(v.remote_post_id), error: nullable(v.error),
  }
}
function post(value: unknown): SocialPost {
  const v = object(value)
  return {
    uuid: string(v.uuid), orgUuid: string(v.org_uuid), sourceType: string(v.source_type),
    sourceUuid: string(v.source_uuid), createdAt: string(v.created_at), targets: array(v.targets, target),
  }
}
function preview(value: unknown): SocialPreview {
  const v = object(value)
  return {
    targetUuid: string(v.target_uuid), platform: enumValue(v.platform, socialPlatforms), text: string(v.text),
    imageUrl: safeSocialUrl(v.image_url), imageAlt: nullable(v.image_alt ?? null), url: safeSocialUrl(v.url),
  }
}
export function safeSocialUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null
  } catch { return null }
}
function accountBody(input: SocialAccountInput) {
  return {
    platform: input.platform, name: input.name, remote_account_id: input.remoteAccountId,
    remote_account_name: input.remoteAccountName, base_url: input.baseUrl, enabled: input.enabled,
    token_expires_at: input.tokenExpiresAt,
    ...(input.accessToken !== undefined ? { access_token: input.accessToken } : {}),
    ...(input.refreshToken !== undefined ? { refresh_token: input.refreshToken } : {}),
  }
}
const root = '/api/admin/social'
const id = encodeURIComponent
async function request(path: string, method = 'GET', body?: unknown): Promise<unknown> {
  const response = await apiFetch<unknown>(path, { method, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) })
  return response.data
}

export const socialApi = {
  async listAccounts(orgUuid: string): Promise<SocialAccount[]> {
    const data = object(await request(`${root}/accounts?org_uuid=${id(orgUuid)}`))
    return array(data.accounts, account).filter(entry => entry.orgUuid === orgUuid)
  },
  async createAccount(orgUuid: string, input: SocialAccountInput): Promise<SocialAccount> {
    return account(await request(`${root}/accounts`, 'POST', { org_uuid: orgUuid, ...accountBody(input) }))
  },
  async updateAccount(uuid: string, input: SocialAccountInput): Promise<SocialAccount> {
    return account(await request(`${root}/accounts/${id(uuid)}`, 'PUT', accountBody(input)))
  },
  async deleteAccount(uuid: string): Promise<void> {
    await request(`${root}/accounts/${id(uuid)}`, 'DELETE')
  },
  async listEventPosts(orgUuid: string, eventUuid: string): Promise<SocialPost[]> {
    const data = object(await request(`${root}/posts?org_uuid=${id(orgUuid)}`))
    return array(data.posts, post).filter(p => p.orgUuid === orgUuid && p.sourceType === 'event' && p.sourceUuid === eventUuid)
  },
  async createEventPost(orgUuid: string, eventUuid: string, accountUuids: string[]): Promise<SocialPost> {
    return post(await request(`${root}/posts`, 'POST', {
      org_uuid: orgUuid, source_type: 'event', source_uuid: eventUuid,
      targets: accountUuids.map(uuid => ({ social_account_uuid: uuid })),
    }))
  },
  async getPost(uuid: string): Promise<SocialPost> {
    return post(await request(`${root}/posts/${id(uuid)}`))
  },
  async updateTargets(uuid: string, accountUuids: string[]): Promise<SocialPost> {
    return post(await request(`${root}/posts/${id(uuid)}`, 'PUT', {
      targets: accountUuids.map(accountUuid => ({ social_account_uuid: accountUuid })),
    }))
  },
  async preview(uuid: string, locale: string): Promise<SocialPreview[]> {
    const data = object(await request(`${root}/posts/${id(uuid)}/preview?lang=${id(locale)}`, 'POST'))
    return array(data.previews, preview)
  },
  async publish(uuid: string, locale: string): Promise<SocialPublishResult[]> {
    const data = object(await request(`${root}/posts/${id(uuid)}/publish?lang=${id(locale)}`, 'POST'))
    return array(data.results, value => {
      const v = object(value)
      return { targetUuid: string(v.target_uuid), socialAccountUuid: string(v.social_account_uuid),
        status: enumValue(v.status, socialTargetStatuses), error: nullable(v.error ?? null) }
    })
  },
}

// Use the existing server-computed permission, not a new bitmask/role implementation.
export async function listSocialEditableOrgUuids(): Promise<string[]> {
  const data = object(await request('/api/admin/org/list'))
  // The existing organization handler serializes its uninitialized empty slice as null.
  if (data.organizations === null) return []
  return array(data.organizations, value => {
    const v = object(value)
    return { uuid: string(v.uuid), canEdit: boolean(v.can_edit_org) }
  }).filter(org => org.canEdit).map(org => org.uuid)
}

// Never surface raw server messages, submitted credentials or provider response bodies.
export function socialErrorKey(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 401) return 'social_error_auth'
    if (error.status === 403) return 'error_message_forbidden_action'
    if (error.status === 404) return 'social_error_missing'
    if (error.status === 409) return 'social_error_conflict'
    if (error.status === 400) {
      if (error.message.includes('an image is required')) return 'social_error_image'
      if (error.message.includes('text exceeds limit')) return 'social_error_length'
      return 'social_error_input'
    }
  }
  return 'social_error_request'
}

// Mirrors sndcds/uranus dev 106ab24: model/social_{account,post,publish}.go.
// The API exposes no platform lookup or generated TypeScript definitions.
export const socialPlatforms = ['facebook', 'instagram', 'mastodon', 'bluesky'] as const
export type SocialPlatform = typeof socialPlatforms[number]
// service/social_publish.go: the other recognized platforms only have renderers.
// Replace with an API capability lookup when one is available.
export const socialPublishingPlatforms: readonly SocialPlatform[] = ['mastodon']
export const socialTargetStatuses = ['draft', 'scheduled', 'publishing', 'published', 'failed', 'cancelled'] as const
export type SocialTargetStatus = typeof socialTargetStatuses[number]

export interface SocialAccount {
  uuid: string
  orgUuid: string
  platform: SocialPlatform
  name: string
  remoteAccountId: string
  remoteAccountName: string | null
  baseUrl: string | null
  enabled: boolean
  tokenExpiresAt: string | null
  hasAccessToken: boolean
  hasRefreshToken: boolean
}

// Credentials exist only in the transient form/request, never in response models or stores.
export interface SocialAccountInput {
  platform: SocialPlatform
  name: string
  remoteAccountId: string
  remoteAccountName: string | null
  baseUrl: string | null
  enabled: boolean
  tokenExpiresAt: string | null
  accessToken?: string | null
  refreshToken?: string | null
}

export interface SocialPostTarget {
  uuid: string
  socialAccountUuid: string
  status: SocialTargetStatus
  publicationSource: string
  publishLanguage: string | null
  scheduledAt: string | null
  publishedAt: string | null
  remotePostId: string | null
  error: string | null
}

export interface SocialPost {
  uuid: string
  orgUuid: string
  sourceType: string
  sourceUuid: string
  createdAt: string
  targets: SocialPostTarget[]
}

export interface SocialPreview {
  targetUuid: string
  platform: SocialPlatform
  text: string
  imageUrl: string | null
  imageAlt: string | null
  url: string | null
}

export interface SocialPublishResult {
  targetUuid: string
  socialAccountUuid: string
  status: SocialTargetStatus
  error: string | null
}

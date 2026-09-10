export interface NotificationDTO {
  uuid: string
  type: string
  organization_uuid: string | null
  action_url: string | null
  metadata: Record<string, unknown>
  created_at: string
  read_at: string | null
  dismissed_at: string | null
}

export interface UserNotification {
  uuid: string
  type: string
  organizationUuid: string | null
  actionUrl: string | null
  organizationName: string
  memberName: string
  createdAt: string
  readAt: string | null
  dismissedAt: string | null
}

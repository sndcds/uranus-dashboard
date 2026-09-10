import type {
  NotificationDTO,
  UserNotification,
} from '@/domain/notification/notification.model'

// Notification links stay inside the authenticated dashboard.
export function safeNotificationAction(value: string | null): string | null {
  if (!value || !value.startsWith('/admin/') || /[\\\u0000-\u0020]/.test(value))
    return null
  return value
}

export function mapNotification(dto: NotificationDTO): UserNotification {
  return {
    uuid: dto.uuid,
    type: dto.type,
    organizationUuid: dto.organization_uuid,
    actionUrl: safeNotificationAction(dto.action_url),
    organizationName:
      typeof dto.metadata.organization_name === 'string'
        ? dto.metadata.organization_name
        : '',
    memberName:
      typeof dto.metadata.member_name === 'string'
        ? dto.metadata.member_name
        : '',
    createdAt: dto.created_at,
    readAt: dto.read_at,
    dismissedAt: dto.dismissed_at,
  }
}

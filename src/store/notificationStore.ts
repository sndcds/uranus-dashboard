import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/api'
import { useUserStore } from '@/store/userStore'
import { useTokenStore } from '@/store/uranusTokenStore'
import { mapNotification } from '@/domain/notification/notification.mapper'
import type {
  NotificationDTO,
  UserNotification,
} from '@/domain/notification/notification.model'

interface NotificationPage {
  notifications: NotificationDTO[]
  has_more: boolean
}
interface NotificationStatus {
  read_at: string | null
  dismissed_at: string | null
}

export const useNotificationStore = defineStore('notification', () => {
  const user = useUserStore()
  const auth = useTokenStore()
  const notifications = ref<UserNotification[]>([])
  const loading = ref(false)
  const error = ref(false)
  const hasMore = ref(false)
  const busyIds = ref<string[]>([])
  const unreadCount = computed(
    () => notifications.value.filter((item) => !item.readAt).length,
  )
  let generation = 0
  let request = 0

  function reset() {
    generation++
    request++
    notifications.value = []
    busyIds.value = []
    hasMore.value = false
    loading.value = false
    error.value = false
  }

  // No persisted client cache: clear immediately on logout/account changes, and
  // discard stale requests so another user's notifications can never reappear.
  watch(() => [user.userUuid, auth.isAuthenticated], reset, { flush: 'sync' })

  async function load(append = false) {
    if (!auth.isAuthenticated || (append && loading.value)) return
    const current = generation
    const requestId = ++request
    loading.value = true
    error.value = false
    try {
      const offset = append ? notifications.value.length : 0
      const response = await apiFetch<NotificationPage>(
        `/api/admin/user/notifications?offset=${offset}`,
      )
      if (current !== generation || requestId !== request) return
      if (!response.data) throw new Error('Missing notification response')
      const incoming = response.data.notifications.map(mapNotification)
      const merged = append ? [...notifications.value, ...incoming] : incoming
      notifications.value = [
        ...new Map(merged.map((item) => [item.uuid, item])).values(),
      ]
      hasMore.value = response.data.has_more
    } catch {
      if (current === generation && requestId === request) error.value = true
    } finally {
      if (current === generation && requestId === request) loading.value = false
    }
  }

  async function update(
    uuid: string,
    action: 'read' | 'dismiss',
  ): Promise<boolean> {
    if (!auth.isAuthenticated || busyIds.value.includes(uuid)) return false
    const current = generation
    busyIds.value.push(uuid)
    error.value = false
    // Prevent an earlier GET from overwriting the successfully changed state.
    request++
    loading.value = false
    try {
      const response = await apiFetch<NotificationStatus>(
        `/api/admin/user/notifications/${uuid}/${action}`,
        { method: 'PATCH' },
      )
      if (current !== generation) return false
      if (!response.data) throw new Error('Missing notification response')
      request++
      loading.value = false
      if (response.data.dismissed_at) {
        notifications.value = notifications.value.filter(
          (item) => item.uuid !== uuid,
        )
      } else {
        const notification = notifications.value.find(
          (item) => item.uuid === uuid,
        )
        if (notification) notification.readAt = response.data.read_at
      }
      return true
    } catch {
      if (current === generation) error.value = true
      return false
    } finally {
      if (current === generation)
        busyIds.value = busyIds.value.filter((id) => id !== uuid)
    }
  }

  return {
    notifications,
    loading,
    error,
    hasMore,
    unreadCount,
    busyIds,
    load,
    update,
    reset,
  }
})

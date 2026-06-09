<!--
  src/component/dashboard/UranusDashboardEventNotifications.vue
-->

<template>
  <div class="uranus-main-layout">
    <h1>{{ t('messages') }}</h1>

    <UranusFeedback v-if="error" type="error" :delaySeconds="1">
      {{ error }}
    </UranusFeedback>

    <UranusOrgRequiredNotification v-if="!appStore.orgUuid" :org-uuid="appStore.orgUuid" />

    <div v-else>
      <UranusFeedback v-if="isLoading" type="notice" :delaySeconds="1">
        {{ t('notifications_loading') }}
      </UranusFeedback>

      <UranusFeedback v-else-if="!notifications.length" type="notice" :delaySeconds="1">
        {{ t('no_messages') }}
      </UranusFeedback>

      <div v-else class="uranus-dashboard-card-grid uranus-max-layout">
        <div
            v-for="notification in notifications"
            :key="notification.event_uuid"
            class="uranus-card notification-card"
        >
          <UranusFeedback
              v-if="notification.no_event_dates || notification.no_upcoming_date"
              type="error"
          >
            {{ t('event_without_date_message') }}
          </UranusFeedback>


          <UranusEventReleaseChip :releaseStatus="notification.release_status" />
          <ul class="event-card__details">
            <li class="event-card__title">
              <h3 class="event-title">{{ notification.event_title }}</h3>
              <span>{{ t('event_organizer') }}: {{ notification.org_name }}</span>
            </li>
            <li>
              <span v-if="notification.first_date" class="event-card__value">
                {{ t('event_starts') }}: {{ formatDate(notification.first_date) }}
                <template v-if="notification.days_until_first_date">
                  ({{ formatEventCountdown(notification.days_until_first_date) }})
                </template>
              </span>
            </li>
          </ul>
          <p class="event-actions">
            <UranusButton
                class="uranus-button tiny"
                icon="edit"
                :to="`/admin/event/${notification.event_uuid}`"
            >
              {{ t('edit') }}
            </UranusButton>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import UranusEventReleaseChip from '@/component/event/ui/UranusEventReleaseChip.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import { uranusStringInterpolate } from '@/util/string.ts'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusOrgRequiredNotification from '@/component/org/UranusOrgRequiredNotification.vue'

interface EventNotification {
  event_uuid: string
  event_title: string
  org_uuid: string
  org_name: string

  venue_uuid: string | null
  venue_name: string | null
  venue_city: string | null

  release_status: string | null

  first_date: string | null
  days_until_first_date: number | null

  no_image: boolean
  no_event_dates: boolean
  no_venue_or_online_link: boolean
  no_event_type: boolean
  no_title: boolean
  no_upcoming_date: boolean
}



const { t, locale } = useI18n({ useScope: 'global' })
const appStore = useAppStore()

const notifications = ref<EventNotification[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      dateStyle: 'medium',
    })
)

const formatDate = (value: string) => {
  try {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }
    return dateFormatter.value.format(date)
  } catch {
    return value
  }
}

const formatEventCountdown = (days: number) => {
  if (Number.isNaN(days)) {
    return ''
  }
  if (days === 0) {
    return t('today')
  }
  if (days < 0) {
    return uranusStringInterpolate(t('n_days_ago'), {
      n: Math.abs(days)
    })
  }

  return uranusStringInterpolate(t('in_n_days'), {
    n: days
  });
}

const loadNotifications = async () => {
  isLoading.value = true
  error.value = null

  if (appStore.orgUuid === null) {
    notifications.value = []
    isLoading.value = false
    return
  }

  try {
    const res = await apiFetch<{ notifications: EventNotification[] }>(
        `/api/admin/user/org/${appStore.orgUuid}/event/notifications?event-lookahead-days=14`
    )

    if (Array.isArray(res.data?.notifications)) {
      notifications.value = res.data?.notifications
    } else {
      notifications.value = []
    }
  } catch (err) {
    error.value = t('notifications_load_error')
    notifications.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped lang="scss">
.notification-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.event-title {
  margin-bottom: 0.5rem !important;
}

.event-actions {
  margin-top: 0;
  margin-bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.event-card__details {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
}

.event-card__title h3 {
  margin: 0;
  font-size: 1.4rem;
}

.event-card__title p {
  margin: 0.15rem 0 0;
}

.event-card__value {
  display: block;
}

.event-card__value--muted {
  margin-left: 0.5rem;
  color: var(--uranus-muted-text);
  font-size: 0.85rem;
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 8px;
}
</style>

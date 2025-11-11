<template>
  <section>
    <h2 class="section-title">{{ t('notifications') }}</h2>

    <div v-if="error" class="feedback feedback--error" role="alert">
      {{ error }}
    </div>

    <div v-else>
      <div v-if="isLoading" class="events-feedback">
        {{ t('notifications_loading') }}
      </div>
      <div v-else-if="!notifications.length" class="events-feedback">
        {{ t('notifications_empty') }}
      </div>
      <div v-else class="events-list">
        <article v-for="notification in notifications" :key="notification.event_id">
          <router-link :to="`/admin/event/${notification.event_id}`" class="uranus-card notification-card">
            <span
              v-if="notification.release_status_name || notification.release_status_id"
              class="release-status-chip"
              :class="releaseStatusClass(notification.release_status_id)"
            >
              {{ formatReleaseStatus(notification) }}
            </span>
            <ul class="event-card__details">
              <li class="event-card__title">
                <h3>{{ notification.event_title }}</h3>
                <p>{{ notification.organizer_name }}</p>
              </li>
              <li>
                <span class="event-card__value">
                  {{ t('release_date') }} · {{ formatDate(notification.release_date) }}
                </span>
              </li>
              <li>
                <span class="event-card__value">
                  {{ formatReleaseCountdown(notification.days_until_release) }}
                </span>
              </li>
              <li>
                <span class="event-card__value">
                  {{ t('event_starts') }} · {{ formatDate(notification.earliest_event_date) }}
                  <span class="event-card__value--muted">{{ formatEventCountdown(notification.days_until_event) }}</span>
                </span>
              </li>
            </ul>
            <p class="event-actions">
              <router-link :to="`/admin/event/${notification.event_id}`" class="uranus-secondary-button">
                {{ t('edit_event') }}
              </router-link>
            </p>
          </router-link>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

interface Notification {
  event_id: number
  event_title: string
  organizer_id: number
  organizer_name: string
  release_date: string
  release_status_id: number | null
  release_status_name?: string | null
  earliest_event_date: string
  days_until_release: number | null
  days_until_event: number
}

const { t, locale } = useI18n({ useScope: 'global' })

const notifications = ref<Notification[]>([])
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

const releaseStatusClass = (statusId: number | null | undefined) => {
  switch (statusId) {
    case 1:
      return 'release-status-chip--red'
    case 2:
      return 'release-status-chip--orange'
    case 3:
      return 'release-status-chip--green'
    case 4:
      return 'release-status-chip--blue'
    case 5:
      return 'release-status-chip--pink'
    default:
      return ''
  }
}

const formatReleaseStatus = (notification: Notification) => {
  if (notification.release_status_name && notification.release_status_name.trim().length > 0) {
    return notification.release_status_name
  }
  if (notification.release_status_id) {
    return t('event_release_status_placeholder', { id: notification.release_status_id })
  }
  return t('event_release_status_placeholder', { id: '—' })
}

const formatReleaseCountdown = (days: number | null) => {
  if (days === null || Number.isNaN(days)) {
    return `${t('release_date')}: —`
  }
  if (days === 0) {
    return t('today')
  }
  if (days === 1) {
    return t('tomorrow')
  }
  if (days < 0) {
    return `${Math.abs(days)} ${t('days_overdue')}`
  }
  return `${days} ${t('days_left')}`
}

const formatEventCountdown = (days: number) => {
  if (Number.isNaN(days)) {
    return ''
  }
  if (days === 0) {
    return `(${t('today')})`
  }
  if (days < 0) {
    return `(${Math.abs(days)} ${t('days_ago')})`
  }
  return `(${t('in')} ${days} ${t('days')})`
}

const loadNotifications = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const { data } = await apiFetch<Notification[]>(`/api/admin/user/event/notification?lang=${locale.value}`)
    
    if (Array.isArray(data)) {
      notifications.value = data
    } else {
      notifications.value = []
    }
  } catch (err) {
    console.error('Failed to load notifications:', err)
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
.section-title {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
}

.notification-card {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.release-status-chip {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &--red {
    background: #fee2e2;
    color: #991b1b;
  }

  &--orange {
    background: #ffedd5;
    color: #9a3412;
  }

  &--green {
    background: #dcfce7;
    color: #166534;
  }

  &--blue {
    background: #dbeafe;
    color: #1e40af;
  }

  &--pink {
    background: #fce7f3;
    color: #9d174d;
  }
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
  font-size: 1rem;
}

.event-card__title p {
  margin: 0.15rem 0 0;
  font-size: 0.85rem;
  color: var(--muted-text);
}

.event-card__value {
  display: block;
  margin-top: 0.75rem;
  font-size: 0.95rem;
}

.event-card__value--muted {
  margin-left: 0.5rem;
  color: var(--muted-text);
  font-size: 0.85rem;
}

.feedback {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.9rem;

  &--error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }
}

.events-feedback {
  text-align: center;
  color: var(--muted-text);
  font-weight: 500;
  padding: 1rem 0;
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  gap: 8px;
}
</style>

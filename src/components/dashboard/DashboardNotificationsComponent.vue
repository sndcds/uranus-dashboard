<template>
  <section class="uranus-card">
    <h2>{{ t('notifications') }}</h2>

    <div v-if="isLoading" class="notifications-feedback">
      {{ t('notifications_loading') }}
    </div>
    
    <div v-else-if="error" class="feedback feedback--error" role="alert">
      {{ error }}
    </div>
    
    <div v-else-if="!notifications.length" class="notifications-feedback">
      {{ t('notifications_empty') }}
    </div>
    
    <ul v-else class="notifications-list">
      <li v-for="notification in notifications" :key="notification.event_id" class="notification-item">
        <div class="notification-content">
          <h3 class="notification-title">{{ notification.event_title }}</h3>
          <div class="notification-organizer">{{ notification.organizer_name }}</div>
          <div class="notification-meta">
            <span class="notification-date">
              {{ t('release_date') }}: {{ formatDate(notification.release_date) }}
            </span>
            <span class="days-until-release" :class="{
              'is-urgent': notification.days_until_release <= 3,
              'is-soon': notification.days_until_release > 3 && notification.days_until_release <= 7,
              'is-past': notification.days_until_release < 0
            }">
              <template v-if="notification.days_until_release === 0">
                {{ t('today') }}
              </template>
              <template v-else-if="notification.days_until_release === 1">
                {{ t('tomorrow') }}
              </template>
              <template v-else-if="notification.days_until_release < 0">
                {{ Math.abs(notification.days_until_release) }} {{ t('days_overdue') }}
              </template>
              <template v-else>
                {{ notification.days_until_release }} {{ t('days_left') }}
              </template>
            </span>
            <span class="event-date-info">
              {{ t('event_starts') }}: {{ formatDate(notification.earliest_event_date) }}
              <template v-if="notification.days_until_event < 0">
                ({{ Math.abs(notification.days_until_event) }} {{ t('days_ago') }})
              </template>
              <template v-else-if="notification.days_until_event === 0">
                ({{ t('today') }})
              </template>
              <template v-else>
                ({{ t('in') }} {{ notification.days_until_event }} {{ t('days') }})
              </template>
            </span>
            <span>
              <router-link :to="`/admin/event/${notification.event_id}`" class="uranus-button">
                {{ t('edit_event') }}
              </router-link>
            </span>
          </div>
        </div>
      </li>
    </ul>
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
  release_status_id: number
  earliest_event_date: string
  days_until_release: number
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

const loadNotifications = async () => {
  isLoading.value = true
  error.value = null
  
  try {
    const { data } = await apiFetch<Notification[]>('/api/admin/user/event/notification')
    
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
h2 {
  margin: 0 0 1rem;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text);
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

.notifications-feedback {
  padding: 1rem;
  text-align: center;
  color: var(--muted-text);
  font-size: 0.95rem;
}

.notifications-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-item {
  background: var(--surface-muted);
  border-radius: 0.75rem;
  border: 1px solid var(--border-soft);
  transition: background 0.2s ease;
  
  &:hover {
    background: var(--surface-hover);
  }
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text);
}

.notification-organizer {
  font-size: 0.85rem;
  color: var(--muted-text);
  font-style: italic;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.notification-date {
  font-size: 0.8rem;
  color: var(--muted-text);
}

.event-date-info {
  font-size: 0.8rem;
  color: var(--muted-text);
}

.days-until-release {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: var(--surface-muted);
  color: var(--color-text);
  
  &.is-urgent {
    background-color: #fee2e2;
    color: #991b1b;
  }
  
  &.is-soon {
    background-color: #ffedd5;
    color: #9a3412;
  }
  
  &.is-past {
    background-color: #f3f4f6;
    color: #6b7280;
    text-decoration: line-through;
  }
}
</style>

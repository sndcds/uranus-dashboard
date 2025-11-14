<template>
  <section>
    <div v-if="error" class="feedback feedback--error" role="alert">
      {{ error }}
    </div>
    <div v-else>
      <div v-if="isLoading" class="events-feedback">
        {{ t('events_loading') }}
      </div>
      <div v-else-if="!events.length" class="events-feedback">
        {{ t('events_empty') }}
      </div>

      <div class="events-list">
        <article v-for="event in events" :key="event.event_id">
          <router-link :to="`/admin/event/${event.event_id}`" class="uranus-card">
            <span v-if="event.release_status_name" class="release-status-chip" :class="{
              'release-status-chip--red': event.release_status_id === 1,
              'release-status-chip--orange': event.release_status_id === 2,
              'release-status-chip--green': event.release_status_id === 3,
              'release-status-chip--blue': event.release_status_id === 4,
              'release-status-chip--pink': event.release_status_id === 5
            }">
              {{ event.release_status_name }}
            </span>
            <img class="events-card__image" v-if="event.image_id" :src="buildImageUrl(event)"
              :alt="event.event_title" />
            <ul class="event-card__details">
              <li class="event-card__title">
                <h3>{{ event.event_title }}</h3>
              </li>
              <li>
                <span class="event-card__value">
                  {{ formatDate(event.start_date) }} · {{ event.start_time }}
                </span>
              </li>
              <li class="event-card__value">
                <span class="event-card__value">{{ event.venue_name || '—' }}</span> / <span
                  class="event-card__value">{{ event.space_name || '—' }}</span>
              </li>
              <li v-if="event.event_types">
                <span class="event-card__value chip-wrapper">
                  <span class="chip" v-for="ev in event.event_types" :key="ev.type_id">
                    {{ formatTypeGenre(ev) }}
                  </span>
                </span>
              </li>
            </ul>
            <p class="event-actions">
              <router-link v-if="event.can_edit_event" :to="`/admin/event/${event.event_id}`"
                class="uranus-secondary-button">
                {{ t('edit_event') }}
              </router-link>
              <button v-if="event.can_delete_event" class="uranus-secondary-button"
                @click.prevent.stop="requestDelete(event)">
                {{ t('delete_event') }}
              </button>
            </p>
          </router-link>
        </article>
      </div>
    </div>

    <PasswordConfirmModal :show="showDeleteModal" :title="t('confirm_delete_event')" :description="pendingDeleteTitle"
      :confirm-text="t('delete_event')" :loading-text="t('deleting')" :error="deleteError" :is-submitting="isDeleting"
      @confirm="confirmDelete" @cancel="cancelDelete" :time-series="pendingTimeSeriesCount" />
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import PasswordConfirmModal from '@/components/PasswordConfirmModal.vue'

export interface OrganizerEventType {
  type_id: number
  type_name: string | null
  genre_id: number | null
  genre_name: string | null
}

export interface OrganizerEventItem {
  event_id: number
  event_date_id: number
  event_title: string
  event_subtitle: string | null
  event_organizer_id: number
  event_organizer_name: string
  start_date: string
  start_time: string
  end_date: string | null
  end_time: string | null
  venue_id: number | null
  venue_name: string | null
  venue_lon: number | null
  venue_lat: number | null
  space_name?: string | null
  event_types: OrganizerEventType[] | null
  image_id: number | null
  focus_x?: number | null
  focus_y?: number | null
  release_status_id: number | null
  release_status_name: string | null
  can_edit_event: boolean
  can_delete_event: boolean
  can_release_event: boolean
  time_series: number
}

const props = withDefaults(
  defineProps<{
    events: OrganizerEventItem[]
    isLoading: boolean
    error: string | null
    apiBase: string
  }>(),
  {
    events: () => [],
    isLoading: false,
    error: null,
  }
)

const { t, locale } = useI18n({ useScope: 'global' })

const dateFormatter = computed(
  () =>
    new Intl.DateTimeFormat(locale.value, {
      dateStyle: 'medium',
    })
)

const formatTypeGenre = (type: OrganizerEventType) => {
  if (type.genre_name) {
    return `${type.type_name} / ${type.genre_name}`
  }
  return type.type_name || ''
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return dateFormatter.value.format(date)
}

const buildImageUrl = (event: OrganizerEventItem) => {
  if (!event.image_id) {
    return ''
  }

  const params = new URLSearchParams({
    mode: 'cover',
    width: '480',
    ratio: '3by2',
    type: 'webp',
    quality: '90',
  })

  if (typeof event.focus_x === 'number') {
    params.set('focusx', event.focus_x.toString())
  }
  if (typeof event.focus_y === 'number') {
    params.set('focusy', event.focus_y.toString())
  }

  return `${props.apiBase}/api/image/${event.image_id}?${params.toString()}`
}

const emit = defineEmits<{
  deleted: [payload: { eventId: number; eventDateId: number | null; deleteSeries: boolean }]
}>()

interface PasswordConfirmPayload {
  password: string
  deleteSeries?: boolean
}

const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)
const pendingDeleteId = ref<number | null>(null)
const pendingDeleteTitle = ref('')
const pendingTimeSeriesCount = ref(1)
const pendingEventDateId = ref<number | null>(null)

const requestDelete = (event: OrganizerEventItem) => {
  if (!event.can_delete_event) {
    return
  }
  pendingDeleteId.value = event.event_id
  pendingDeleteTitle.value = event.event_title
  pendingTimeSeriesCount.value = event.time_series ?? 1
  pendingEventDateId.value = event.event_date_id
  deleteError.value = ''
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleteError.value = ''
  pendingDeleteId.value = null
  pendingDeleteTitle.value = ''
  pendingTimeSeriesCount.value = 1
  pendingEventDateId.value = null
}

const confirmDelete = async ({ password, deleteSeries }: PasswordConfirmPayload) => {
  if (!pendingDeleteId.value) {
    return
  }

  deleteError.value = ''
  isDeleting.value = true

  try {
    const body: Record<string, unknown> = { password }
    const deleteEntireSeries = Boolean(deleteSeries)
    if (deleteEntireSeries) {
      body.delete_series = true
    }
    let url: string
    if (deleteEntireSeries) {
      url = `/api/admin/event/${pendingDeleteId.value}`
    } else if (pendingEventDateId.value !== null) {
      url = `/api/admin/event/${pendingDeleteId.value}/date/${pendingEventDateId.value}`
    } else {
      url = `/api/admin/event/${pendingDeleteId.value}`
    }
    await apiFetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    emit('deleted', {
      eventId: pendingDeleteId.value,
      eventDateId: pendingEventDateId.value,
      deleteSeries: deleteEntireSeries,
    })
    cancelDelete()
  } catch (err: unknown) {
    console.error('Failed to delete event:', err)
    const status = typeof err === 'object' && err !== null ? (err as { status?: number }).status : undefined
    if (status === 401 || status === 403) {
      deleteError.value = t('incorrect_password')
    } else {
      deleteError.value = t('failed_to_delete_event')
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped lang="scss">
.uranus-card {
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
  z-index: 10;

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

.chip-wrapper {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
}

.chip {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  background: var(--accent-muted);
  color: var(--accent-primary);
  font-weight: 600;
  font-size: 0.82rem;
  letter-spacing: 0.02em;
}

.feedback {
  @include form-feedback();

  &--error {
    @include form-feedback-error();
  }
}

.events-feedback {
  text-align: center;
  color: var(--muted-text);
  font-weight: 500;
}

.events-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 8px;
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

.event-card__details {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  // gap: 0.5rem;
}

.event-card__details li {
  flex-direction: row;
  align-items: center;
  gap: 0.75rem;
}

.event-card__value {
  margin-top: 1rem;
  font-size: 0.95rem;
}

.events-card__image {
  width: 84px;
  height: 64px;
  border-radius: var(--uranus-tiny-border-radius);
  object-fit: cover;
  display: block;
}

@media (min-width: 768px) {
  .event-card__title h3 {
    font-size: 1.1rem;
  }

  .event-card__title p {
    font-size: 0.9rem;
  }

  .event-card__details {
    flex: 1;
    // gap: 0.75rem;
  }

  .event-card__value {
    font-size: 0.98rem;
  }

  .events-card__image {
    width: 140px;
    height: 92px;
  }
}
</style>

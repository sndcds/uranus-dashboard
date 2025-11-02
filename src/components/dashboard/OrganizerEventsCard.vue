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
              <li>
                <span class="event-card__value">{{ event.venue_name || '—' }}</span> /
                <span class="event-card__value">{{ event.space_name || '—' }}</span>
              </li>
              <li>
                <span class="event-card__value">
                  <span class="chip">{{ event.event_type || t('event_type_unknown') }}</span>
                </span>
              </li>
            </ul>
          </router-link>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

export interface OrganizerEventItem {
  event_id: number
  event_title: string
  start_date: string
  start_time: string
  venue_name: string | null
  space_name: string | null
  event_organizer_name: string
  event_type: string | null
  image_id: number | null
  focus_x?: number | null
  focus_y?: number | null
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
</script>

<style scoped lang="scss">
.uranus-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  /* Important: fill the grid cell */
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
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: stretch;
}

.event-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  border: 1px solid var(--border-soft);
  border-radius: 1.25rem;
  background: rgba(79, 70, 229, 0.06);
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.08);
}

.event-card__header {
  width: 33%;
  display: flex;
  align-items: center;
  gap: 1rem;
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
  gap: 0.5rem;
}

.event-card__details li {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.event-card__label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--muted-text);
}

.event-card__value {
  font-size: 0.95rem;
}

.event-card__footer {
  display: flex;
  justify-content: flex-start;
  margin-top: 0.5rem;
}

.events-card__image {
  width: 84px;
  height: 64px;
  border-radius: var(--uranus-tiny-border-radius);
  object-fit: cover;
  display: block;
}

@media (min-width: 768px) {
  .events-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  }

  .event-card {
    flex-direction: row;
    align-items: stretch;
    gap: 1.25rem;
  }

  .event-card__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    min-width: 180px;
  }

  .event-card__title h3 {
    font-size: 1.1rem;
  }

  .event-card__title p {
    font-size: 0.9rem;
  }

  .event-card__details {
    flex: 1;
    gap: 0.75rem;
  }

  .event-card__details li {
    flex-direction: row;
    align-items: center;
    gap: 0.75rem;
  }

  .event-card__label {
    min-width: 120px;
    font-size: 0.78rem;
    letter-spacing: 0.1em;
  }

  .event-card__value {
    font-size: 0.98rem;
  }

  .event-card__footer {
    align-items: center;
    margin-top: 0;
  }

  .events-card__image {
    width: 140px;
    height: 92px;
  }
}
</style>

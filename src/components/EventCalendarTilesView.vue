<template>
  <section class="calendar-content-tiles" aria-live="polite">
    <div v-if="isLoading" class="calendar-state calendar-state--loading">
      <span>{{ loadingLabel }}</span>
    </div>
    <div v-else-if="loadError" class="calendar-state calendar-state--error" role="alert">
      <span>{{ loadError }}</span>
    </div>
    <div v-else-if="filteredEvents.length === 0" class="calendar-state calendar-state--empty">
      <span>{{ emptyLabel }}</span>
    </div>
    <div v-else class="calendar-events-tiles">
      <article v-for="(event, index) in filteredEvents" :key="event.renderKey || index" class="calendar-tile">
        <router-link :to="`/event/${event.id}/date/${event.event_date_id}`">
          <div class="calendar-tile__image-container">
            <img v-if="event.image_path" :src="event.image_path.includes('?')
                ? `${event.image_path}&ratio=3:2&width=320`
                : `${event.image_path}?ratio=3:2&width=320`" :alt="event.title"
                class="calendar-tile__image" />
          </div>
          <div>
            <div class="calendar-content__body">
              <h3 class="calendar-tile__title">{{ event.title }}</h3>
              <div class="calendar-tile__meta">
                <span>{{ formatNumberDate(event.start_date) }} {{
                    formatTime(event.start_date, event.start_time)
                }}</span>
                <span>{{ event.venue_name }}</span>
              </div>
            </div>
          </div>
        </router-link>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface CalendarEventType {
  genre_id: number | null
  genre_name: string | null
  type_id: number
  type_name: string
}

interface CalendarEvent {
  id: number
  event_date_id: number
  title: string
  subtitle: string | null
  image_path: string | null
  teaser_text: string | null
  description: string | null
  start_date: string
  start_time: string | null
  end_date: string | null
  end_time: string | null
  venue_name: string | null
  venue_city: string | null
  venue_street: string | null
  venue_house_number: string | null
  venue_postal_code: string | null
  event_types: CalendarEventType[] | null
  organizer_name: string | null
}

interface AugmentedEvent extends CalendarEvent {
  startDateTime: number
  typeLabels: string[]
  renderKey: string
}

interface Props {
  isLoading: boolean
  loadError: string | null
  filteredEvents: AugmentedEvent[]
  formatTime: (date: string, time: string | null) => string
  formatNumberDate: (date: string, locale?: string) => string
}

const props = defineProps<Props>()

const { t } = useI18n({ useScope: 'global' })

const loadingLabel = computed(() => t('events_calendar_loading'))
const emptyLabel = computed(() => t('events_calendar_empty'))
</script>

<style scoped lang="scss">
.calendar-content-tiles {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
}

.calendar-state {
  border-radius: 18px;
  padding: clamp(2rem, 5vw, 3rem);
  text-align: center;
  font-weight: 600;
  background: var(--input-bg);
  border: 1px solid var(--border-soft);
}

.calendar-state--loading {
  color: var(--uranus-muted-text);
}

.calendar-state--error {
  color: #b91c1c;
}

.calendar-state--empty {
  color: var(--uranus-muted-text);
}

.calendar-events-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--uranus-grid-gap);
}

.calendar-tile {
  display: flex;
  flex-direction: column;
  background: var(--uranus-bg-color);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  border-radius: var(--uranus-card-border-radius);
  overflow: hidden;
}

.calendar-tile:hover {
  transform: translate(-2px, -4px);
  box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.2);
}

.calendar-tile__image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 4/3;
  overflow: hidden;
}

.calendar-tile__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.calendar-content__body {
  display: flex;
  overflow: hidden;
  word-break: unset;
  flex-direction: column;
  padding: 8px;
}

.calendar-tile__title {
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: normal;
}

.calendar-tile__meta {
  display: flex;
  font-size: 0.95rem;
  flex-direction: column;
}

@media (max-width: 900px) {
  .calendar-events-tiles {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}
</style>

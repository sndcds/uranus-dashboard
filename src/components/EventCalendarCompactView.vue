<template>
  <section class="calendar-content-compact" aria-live="polite">
    <div v-if="isLoading" class="calendar-state calendar-state--loading">
      <span>{{ loadingLabel }}</span>
    </div>
    <div v-else-if="loadError" class="calendar-state calendar-state--error" role="alert">
      <span>{{ loadError }}</span>
    </div>
    <div v-else-if="filteredEvents.length === 0" class="calendar-state calendar-state--empty">
      <span>{{ emptyLabel }}</span>
    </div>
    <div v-else class="calendar-events-compact">
      <article v-for="event in filteredEvents" :key="`${event.id}-${event.event_date_id}`" class="calendar-event-compact">
        <div
            class="calendar-event-compact__summary"
            @click="toggleEvent(event.id, event.event_date_id, $event)"
        >
          <div class="calendar-event-compact__time">
            <span class="calendar-event-compact__date-badge">
              {{ formatCompactDate(event.start_date) }}
            </span>
            <span class="calendar-event-compact__time-badge">
              {{ formatTime(event.start_date, event.start_time) }}
            </span>
          </div>
          <div class="calendar-event-compact__content">
            <header class="calendar-event-compact__header">
              <h3>{{ event.title }}</h3>
              <p v-if="event.subtitle" class="calendar-event-compact__subtitle">
                {{ event.subtitle }}
              </p>
            </header>
          <div class="calendar-event-compact__meta">
            <span v-if="event.venue_name || event.venue_city" class="calendar-event-compact__location">
              {{ formatLocation(event) }}
            </span>
            <ul v-if="event.typeLabels.length" class="calendar-event-compact__tags">
              <li v-for="tag in event.typeLabels" :key="tag">
                <button
                    type="button" class="calendar-event-compact__tag-button"
                    :class="{ 'is-active': selectedType === tag }"
                    @click.prevent.stop="emit('filterByTag', tag)"
                    :aria-pressed="selectedType === tag">
                  {{ tag }}
                </button>
              </li>
            </ul>
          </div>
        </div>
        <div class="calendar-event-compact__icon">
          <span :class="{ 'is-expanded': expandedEventId === `${event.id}-${event.event_date_id}` }">▼</span>
        </div>
      </div>
      <div
          v-if="expandedEventId === `${event.id}-${event.event_date_id}`"
          class="calendar-event-compact__details"
      >
        <div
            v-if="loadingEventId === `${event.id}-${event.event_date_id}`"
            class="calendar-event-compact__loading"
        >
          {{ detailLoadingLabel }}
        </div>
        <div v-else-if="eventDetailsError" class="calendar-event-compact__error">
          {{ eventDetailsError }}
        </div>
          <div v-else-if="eventDetails" class="calendar-event-compact__info">
            <div v-if="eventDetails.image_path" class="calendar-event-compact__image-wrapper">
              <img
                  :src="eventDetails.image_path + (eventDetails.image_path.includes('?') ? '&' : '?') + 'ratio=16:9&width=600'"
                  :alt="eventDetails.image_alt_text || eventDetails.title"
                  class="calendar-event-compact__image"
              />
            </div>
            <div
                v-if="formattedDescription"
                class="calendar-event-compact__description"
                v-html="formattedDescription">
            </div>
            <div class="calendar-event-compact__metadata">
              <div class="calendar-event-compact__field">
                <strong>{{ detailDateLabel }}:</strong> {{ formatCompactDate(eventDetails.date.startDate) }}
                  <template v-if="eventDetails.date.startTime">
                    {{ t('events_calendar_detail_at') }} {{ formatTime(eventDetails.date.startDate, eventDetails.date.startTime) }}
                  </template>
                  <template v-if="eventDetails.date.endDate || eventDetails.date.endTime">
                    -
                  <template
                      v-if="eventDetails.date.endDate && eventDetails.date.endDate !== eventDetails.date.startDate">
                    {{ formatCompactDate(eventDetails.date.endDate) }}
                  </template>
                  <template v-if="eventDetails.date.endTime">
                    {{ formatTime(eventDetails.date.endDate || eventDetails.date.startDate, eventDetails.date.endTime) }}
                  </template>
                </template>
              </div>
              <div v-if="eventDetails.organizer_name" class="calendar-event-compact__field">
                <strong>{{ detailOrganizerLabel }}:</strong> {{ eventDetails.organizer_name }}
              </div>
              <div v-if="eventDetails.date.spaceName" class="calendar-event-compact__field">
                <strong>{{ detailSpaceLabel }}:</strong> {{ eventDetails.date.spaceName }}
              </div>
              <div
                  v-if="eventDetails.date.venueStreet && eventDetails.date.venueHouseNumber"
                  class="calendar-event-compact__field"
              >
                <strong>
                  {{ detailAddressLabel }}:
                </strong>
                {{ eventDetails.date.venueStreet }}
                {{ eventDetails.date.venueHouseNumber }},
                {{ eventDetails.date.venuePostalCode }} {{ eventDetails.date.venueCity }}
              </div>
              <div v-if="eventDetails.event_urls?.length" class="calendar-event-compact__field">
                <strong>{{ detailLinksLabel }}:</strong>
                <ul class="calendar-event-compact__links">
                  <li v-for="link in eventDetails.event_urls" :key="link.id">
                    <a :href="link.url" target="_blank" rel="noopener noreferrer">
                      {{ link.title || link.url }}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div class="calendar-event-compact__actions">
              <router-link
                  :to="`/event/${event.id}/date/${event.event_date_id}`"
                  class="calendar-event-compact__view-button"
              >
                {{ viewFullEventLabel }}
              </router-link>
            </div>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { marked } from 'marked'

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
}

interface EventUrl {
    id: number
    title: string
    url: string
    url_type: string
}

interface EventDateDetails {
  dateId: number
  eventId: number
  spaceBuildingLevel: number | null
  spaceId: number | null
  spaceName: string | null
  spaceSeatingCapacity: number | null
  spaceTotalCapacity: number | null
  spaceUrl?: string | null
  startDate: string
  startTime: string | null
  endDate: string | null
  endTime: string | null
  entryTime: string | null
  venueCity: string | null
  venueCountry: string | null
  venueHouseNumber: string | null
  venueId: number | null
  venueLat: number | null
  venueLon: number | null
  venueName: string | null
  venuePostalCode: string | null
  venueStreet: string | null
  venueState?: string | null
  venueGeometry?: string | null
}

interface EventDetails {
    event_id: number
    title: string
    subtitle: string | null
    description: string | null
    teaser_text: string | null
    organizer_id: number | null
    organizer_name: string | null
    event_types: CalendarEventType[]
    event_urls: EventUrl[] | null
    languages: string[]
    image_path: string | null
    image_alt_text: string | null
    image_copyright?: string | null
    image_license_name?: string | null
    further_dates: unknown
    date: EventDateDetails
}

interface Props {
    isLoading: boolean
    loadError: string | null
    filteredEvents: AugmentedEvent[]
    selectedType: 'all' | string
    formatTime: (date: string, time: string | null) => string
    formatCompactDate: (date: string) => string
    formatLocation: (event: CalendarEvent) => string
}

const props = defineProps<Props>()
const emit = defineEmits<{
    filterByTag: [tag: string]
}>()

const { t } = useI18n({ useScope: 'global' })

const loadingLabel = computed(() => t('events_calendar_loading'))
const emptyLabel = computed(() => t('events_calendar_empty'))
const detailLoadingLabel = computed(() => t('events_calendar_loading_details'))
const detailDateLabel = computed(() => t('events_calendar_detail_date_label'))
const detailOrganizerLabel = computed(() => t('events_calendar_detail_organizer_label'))
const detailSpaceLabel = computed(() => t('events_calendar_detail_space_label'))
const detailAddressLabel = computed(() => t('events_calendar_detail_address_label'))
const detailLinksLabel = computed(() => t('events_calendar_detail_links_label'))
const viewFullEventLabel = computed(() => t('show_event_page'))
const eventDetailsErrorLabel = computed(() => t('events_calendar_event_details_error'))

// Accordion state
const expandedEventId = ref<string | null>(null)
const loadingEventId = ref<string | null>(null)
const eventDetails = ref<EventDetails | null>(null)
const eventDetailsError = ref<string | null>(null)
const formattedDescription = ref<string>('')

const getEventKey = (eventId: number, eventDateId: number) => `${eventId}-${eventDateId}`

const toggleEvent = async (eventId: number, eventDateId: number, event: MouseEvent) => {
    const eventKey = getEventKey(eventId, eventDateId)

    if (expandedEventId.value === eventKey) {
        // Collapse if already expanded
        expandedEventId.value = null
        eventDetails.value = null
        eventDetailsError.value = null
        formattedDescription.value = ''
        return
    }

    // Expand new event
    expandedEventId.value = eventKey
    loadingEventId.value = eventKey
    eventDetailsError.value = null
    eventDetails.value = null
    formattedDescription.value = ''

    // Scroll to the top of the clicked accordion
    const target = event.currentTarget as HTMLElement
    const article = target.closest('.calendar-event-compact')
    if (article) {
        article.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    try {
        const response = await apiFetch<EventDetails>(`/api/event/${eventId}/date/${eventDateId}`)
        eventDetails.value = response.data

        // Convert markdown to HTML
        if (response.data.description) {
            formattedDescription.value = marked.parse(response.data.description, { async: false }) as string
        } else {
            formattedDescription.value = ''
        }
    } catch (error) {
        eventDetailsError.value =
            error instanceof Error && error.message
                ? error.message
                : eventDetailsErrorLabel.value
    } finally {
        loadingEventId.value = null
    }
}
</script>

<style scoped lang="scss">
.calendar-content-compact {
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

.calendar-events-compact {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.calendar-event-compact {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    background: var(--uranus-bg-color);
    border: 1px solid var(--border-soft);
    transition: box-shadow 0.2s ease;
    overflow: hidden;
}

.calendar-event-compact:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.calendar-event-compact__summary {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    cursor: pointer;
    user-select: none;
}

.calendar-event-compact__summary:hover {
    background: rgba(0, 0, 0, 0.02);
}

.calendar-event-compact__time {
    flex-shrink: 0;
    min-width: 80px;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.calendar-event-compact__date-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    background: rgba(139, 92, 246, 0.12);
    color: var(--accent-primary, #8b5cf6);
    font-weight: 600;
    font-size: 0.85rem;
}

.calendar-event-compact__time-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    background: rgba(14, 165, 233, 0.12);
    color: var(--accent-secondary, #0ea5e9);
    font-weight: 600;
    font-size: 0.85rem;
}

.calendar-event-compact__content {
    flex: 1;
    min-width: 0;
}

.calendar-event-compact__header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 0.5rem;
}

.calendar-event-compact__header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.3;
}

.calendar-event-compact__subtitle {
    margin: 0;
    color: var(--uranus-muted-text);
    font-size: 0.9rem;
}

.calendar-event-compact__meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.calendar-event-compact__date,
.calendar-event-compact__location {
    color: var(--color-text-secondary, #475569);
    font-size: 0.85rem;
    font-weight: 500;
}

.calendar-event-compact__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    margin: 0;
    padding: 0;
    list-style: none;
}

.calendar-event-compact__tag-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    border: none;
    background: rgba(79, 70, 229, 0.12);
    color: var(--accent-primary);
    font-weight: 500;
    font-size: 0.75rem;
    cursor: pointer;
    transition: background 0.2s ease;
}

.calendar-event-compact__tag-button:hover {
    background: rgba(79, 70, 229, 0.2);
}

.calendar-event-compact__tag-button.is-active {
    background: rgba(79, 70, 229, 0.28);
    color: #fff;
}

.calendar-event-compact__icon {
    flex-shrink: 0;
    padding: 0 0.5rem;
}

.calendar-event-compact__icon span {
    display: inline-block;
    transition: transform 0.2s ease;
    color: var(--uranus-muted-text);
    font-size: 0.75rem;
}

.calendar-event-compact__icon span.is-expanded {
    transform: rotate(180deg);
}

.calendar-event-compact__details {
    border-top: 1px solid var(--border-soft);
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.01);
}

.calendar-event-compact__loading,
.calendar-event-compact__error {
    padding: 1rem;
    text-align: center;
    color: var(--uranus-muted-text);
}

.calendar-event-compact__error {
    color: #b91c1c;
}

.calendar-event-compact__info {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.calendar-event-compact__image-wrapper {
    width: 100%;
    max-width: 600px;
    border-radius: 8px;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(14, 165, 233, 0.1));
}

.calendar-event-compact__image {
    width: 100%;
    max-width: 600px;
    height: auto;
    display: block;
    object-fit: cover;
}

.calendar-event-compact__description {
    line-height: 1.6;
    color: var(--color-text-primary);
}

.calendar-event-compact__description :deep(h1),
.calendar-event-compact__description :deep(h2),
.calendar-event-compact__description :deep(h3) {
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.calendar-event-compact__description :deep(p) {
    margin: 0.5rem 0;
}

.calendar-event-compact__description :deep(ul),
.calendar-event-compact__description :deep(ol) {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
}

.calendar-event-compact__description :deep(a) {
    color: var(--accent-primary);
    text-decoration: underline;
}

.calendar-event-compact__metadata {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.calendar-event-compact__field {
    display: flex;
    gap: 0.5rem;
    font-size: 0.9rem;
}

.calendar-event-compact__field strong {
    font-weight: 600;
    min-width: 80px;
}

.calendar-event-compact__links {
    margin: 0;
    padding: 0;
    list-style: none;
}

.calendar-event-compact__links li {
    margin: 0.25rem 0;
}

.calendar-event-compact__links a {
    color: var(--accent-primary);
    text-decoration: underline;
}

.calendar-event-compact__links a:hover {
    text-decoration: none;
}

.calendar-event-compact__actions {
    display: flex;
    justify-content: flex-end;
}

.calendar-event-compact__view-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    background: var(--accent-primary);
    color: white;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: background 0.2s ease;
}

.calendar-event-compact__view-button:hover {
    background: var(--accent-primary-hover, #5b21b6);
}

@media (max-width: 900px) {
    .calendar-event-compact__summary {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .calendar-event-compact__time {
        min-width: auto;
    }

    .calendar-event-compact__icon {
        position: absolute;
        top: 1rem;
        right: 1rem;
    }

    .calendar-event-compact {
        position: relative;
    }
}
</style>

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
            <article v-for="event in filteredEvents" :key="event.id" class="calendar-event-compact">
                <div class="calendar-event-compact__summary" @click="toggleEvent(event.id, event.event_date_id, $event)">
                    <div class="calendar-event-compact__time">
                        <span class="calendar-event-compact__date-badge">{{ formatCompactDate(event.start_date) }}</span>
                        <span class="calendar-event-compact__time-badge">{{ formatTime(event.start_date, event.start_time) }}</span>
                    </div>
                    <div class="calendar-event-compact__content">
                        <header class="calendar-event-compact__header">
                            <h3>{{ event.title }}</h3>
                            <p v-if="event.subtitle" class="calendar-event-compact__subtitle">{{ event.subtitle }}
                            </p>
                        </header>
                        <div class="calendar-event-compact__meta">
                            <span v-if="event.venue_name || event.venue_city" class="calendar-event-compact__location">
                                {{ formatLocation(event) }}
                            </span>
                            <ul v-if="event.typeLabels.length" class="calendar-event-compact__tags">
                                <li v-for="tag in event.typeLabels" :key="tag">
                                    <button type="button" class="calendar-event-compact__tag-button"
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
                        <span :class="{ 'is-expanded': expandedEventId === event.id }">▼</span>
                    </div>
                </div>
                <div v-if="expandedEventId === event.id" class="calendar-event-compact__details">
                    <div v-if="loadingEventId === event.id" class="calendar-event-compact__loading">
                        Loading...
                    </div>
                    <div v-else-if="eventDetailsError" class="calendar-event-compact__error">
                        {{ eventDetailsError }}
                    </div>
                    <div v-else-if="eventDetails" class="calendar-event-compact__info">
                        <div v-if="eventDetails.image_path" class="calendar-event-compact__image-wrapper">
                            <img 
                                :src="eventDetails.image_path + (eventDetails.image_path.includes('?') ? '&' : '?') + 'ratio=16by9&width=600'"
                                :alt="eventDetails.image_alt_text || eventDetails.title"
                                class="calendar-event-compact__image" />
                        </div>
                        <div v-if="eventDetails.description" class="calendar-event-compact__description" v-html="formatDescription(eventDetails.description)"></div>
                        <div class="calendar-event-compact__metadata">
                            <div class="calendar-event-compact__field">
                                <strong>Date:</strong> {{ formatCompactDate(eventDetails.start_date) }}
                                <template v-if="eventDetails.start_time">
                                    at {{ formatTime(eventDetails.start_date, eventDetails.start_time) }}
                                </template>
                                <template v-if="eventDetails.end_date || eventDetails.end_time">
                                    - 
                                    <template v-if="eventDetails.end_date && eventDetails.end_date !== eventDetails.start_date">
                                        {{ formatCompactDate(eventDetails.end_date) }}
                                    </template>
                                    <template v-if="eventDetails.end_time">
                                        {{ formatTime(eventDetails.end_date || eventDetails.start_date, eventDetails.end_time) }}
                                    </template>
                                </template>
                            </div>
                            <div v-if="eventDetails.organizer_name" class="calendar-event-compact__field">
                                <strong>Organizer:</strong> {{ eventDetails.organizer_name }}
                            </div>
                            <div v-if="eventDetails.space_name" class="calendar-event-compact__field">
                                <strong>Space:</strong> {{ eventDetails.space_name }}
                            </div>
                            <div v-if="eventDetails.venue_street && eventDetails.venue_house_number" class="calendar-event-compact__field">
                                <strong>Address:</strong> {{ eventDetails.venue_street }} {{ eventDetails.venue_house_number }}, {{ eventDetails.venue_postal_code }} {{ eventDetails.venue_city }}
                            </div>
                            <div v-if="eventDetails.event_urls?.length" class="calendar-event-compact__field">
                                <strong>Links:</strong>
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
                            <router-link :to="`/event/${event.id}/date/${event.event_date_id}`" class="calendar-event-compact__view-button">
                                View Full Event
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

interface EventDetails {
    id: number
    title: string
    subtitle: string | null
    description: string | null
    teaser_text: string | null
    start_date: string
    start_time: string | null
    end_date: string | null
    end_time: string | null
    entry_time: string | null
    duration: number | null
    organizer_id: number
    organizer_name: string
    venue_id: number
    venue_name: string
    venue_street: string
    venue_house_number: string
    venue_postal_code: string
    venue_city: string
    venue_state: string
    venue_country: string
    venue_lat: number
    venue_lon: number
    venue_geometry: string
    space_id: number
    space_name: string
    space_building_level: number
    space_seating_capacity: number
    space_total_capacity: number
    space_url: string
    event_types: CalendarEventType[]
    event_urls: EventUrl[] | null
    languages: string[]
    has_main_image: boolean
    image_id: number | null
    image_path: string | null
    image_alt_text: string | null
    image_copyright: string | null
    image_created_by: string | null
    image_license_id: number | null
    image_license_name: string | null
    image_license_short_name: string | null
    image_license_url: string | null
    image_mime_type: string | null
    image_width: number | null
    image_height: number | null
    image_focus_x: number
    image_focus_y: number
    meeting_point: string | null
    participation_info: string | null
    visitor_info_flags: number | null
    visitor_info_flag_names: string[] | null
    accessibility_flags: number | null
    accessibility_flag_names: string[] | null
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

// Accordion state
const expandedEventId = ref<number | null>(null)
const loadingEventId = ref<number | null>(null)
const eventDetails = ref<EventDetails | null>(null)
const eventDetailsError = ref<string | null>(null)

const toggleEvent = async (eventId: number, eventDateId: number, event: MouseEvent) => {
    if (expandedEventId.value === eventId) {
        // Collapse if already expanded
        expandedEventId.value = null
        eventDetails.value = null
        eventDetailsError.value = null
        return
    }

    // Expand new event
    expandedEventId.value = eventId
    loadingEventId.value = eventId
    eventDetailsError.value = null
    eventDetails.value = null

    // Scroll to the top of the clicked accordion
    const target = event.currentTarget as HTMLElement
    const article = target.closest('.calendar-event-compact')
    if (article) {
        article.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    try {
        const response = await apiFetch<EventDetails>(`/api/event/${eventId}/date/${eventDateId}`)
        eventDetails.value = response.data
    } catch (error) {
        eventDetailsError.value = error instanceof Error ? error.message : 'Failed to load event details'
    } finally {
        loadingEventId.value = null
    }
}

const formatDescription = (description: string): string => {
    return marked.parse(description, { async: false }) as string
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
    color: var(--muted-text);
}

.calendar-state--error {
    color: #b91c1c;
}

.calendar-state--empty {
    color: var(--muted-text);
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
    color: var(--muted-text);
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
    color: var(--muted-text);
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
    color: var(--muted-text);
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
    border-radius: 8px;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(14, 165, 233, 0.1));
}

.calendar-event-compact__image {
    width: 100%;
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

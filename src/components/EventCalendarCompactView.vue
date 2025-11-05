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
                <router-link :to="`/event/${event.id}/date/${event.event_date_id}`">
                    <div class="calendar-event-compact__time">
                        <span>{{ formatTime(event.start_date, event.start_time) }}</span>
                    </div>
                    <div class="calendar-event-compact__content">
                        <header class="calendar-event-compact__header">
                            <h3>{{ event.title }}</h3>
                            <p v-if="event.subtitle" class="calendar-event-compact__subtitle">{{ event.subtitle }}
                            </p>
                        </header>
                        <div class="calendar-event-compact__meta">
                            <span class="calendar-event-compact__date">{{ formatCompactDate(event.start_date) }}</span>
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
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border-radius: 8px;
    background: var(--uranus-bg-color);
    border: 1px solid var(--border-soft);
    transition: box-shadow 0.2s ease;
}

.calendar-event-compact:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.calendar-event-compact__time {
    flex-shrink: 0;
    min-width: 80px;
}

.calendar-event-compact__time span {
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

@media (max-width: 900px) {
    .calendar-event-compact {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .calendar-event-compact__time {
        min-width: auto;
    }
}
</style>

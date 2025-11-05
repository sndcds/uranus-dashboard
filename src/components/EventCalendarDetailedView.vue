<template>
    <section class="calendar-content" aria-live="polite">
        <div v-if="isLoading" class="calendar-state calendar-state--loading">
            <span>{{ loadingLabel }}</span>
        </div>
        <div v-else-if="loadError" class="calendar-state calendar-state--error" role="alert">
            <span>{{ loadError }}</span>
        </div>
        <div v-else-if="groupedEvents.length === 0" class="calendar-state calendar-state--empty">
            <span>{{ emptyLabel }}</span>
        </div>
        <div v-else class="calendar-groups">
            <section v-for="group in groupedEvents" :key="group.date" class="calendar-group">
                <header class="calendar-group__header">
                    <h2>{{ group.formattedDate }}</h2>
                    <p>{{ group.weekday }}</p>
                </header>
                <div class="calendar-group__events">
                    <article v-for="event in group.events" :key="event.id" class="calendar-card">
                        <router-link :to="`/event/${event.id}/date/${event.event_date_id}`" class="calendar-card__link">
                            <div class="calendar-card__image-wrapper">
                                <img v-if="event.image_path" 
                                    :src="event.image_path.includes('?')
                                        ? `${event.image_path}&ratio=16by9&width=400`
                                        : `${event.image_path}?ratio=16by9&width=400`" 
                                    :alt="event.title"
                                    class="calendar-card__image" />
                                <div v-else class="calendar-card__image-placeholder">
                                    <span>{{ event.title.charAt(0) }}</span>
                                </div>
                                <div class="calendar-card__accent"></div>
                            </div>
                            <div class="calendar-card__content">
                                <div class="calendar-card__time">
                                    <span>{{ formatTime(event.start_date, event.start_time) }}</span>
                                </div>
                                <header class="calendar-card__header">
                                    <h3>{{ event.title }}</h3>
                                    <p v-if="event.subtitle" class="calendar-card__subtitle">{{ event.subtitle }}</p>
                                </header>
                                <p v-if="event.teaser_text" class="calendar-card__teaser">{{ event.teaser_text }}</p>
                                <div class="calendar-card__footer">
                                    <p class="calendar-card__location">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                            <circle cx="12" cy="10" r="3"></circle>
                                        </svg>
                                        {{ formatLocation(event) }}
                                    </p>
                                    <ul v-if="event.typeLabels.length" class="calendar-card__tags">
                                        <li v-for="tag in event.typeLabels" :key="tag">
                                            <button type="button" class="calendar-card__tag-button"
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

interface GroupedEvents {
    date: string
    formattedDate: string
    weekday: string
    events: AugmentedEvent[]
}

interface Props {
    isLoading: boolean
    loadError: string | null
    groupedEvents: GroupedEvents[]
    selectedType: 'all' | string
    formatTime: (date: string, time: string | null) => string
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
.calendar-content {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.calendar-state {
    border-radius: 12px;
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

.calendar-groups {
    display: flex;
    flex-direction: column;
    gap: clamp(2rem, 4vw, 3rem);
}

.calendar-group {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 3vw, 1.5rem);
}

.calendar-group__header {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--border-soft);
}

.calendar-group__header h2 {
    margin: 0;
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    font-weight: 700;
    color: var(--text-primary);
}

.calendar-group__header p {
    margin: 0;
    color: var(--muted-text);
    font-weight: 500;
    font-size: 0.9rem;
    text-transform: capitalize;
}

.calendar-group__events {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

/* Mobile-first: Horizontal card layout */
.calendar-card {
    position: relative;
    background: var(--card-bg, #fff);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-soft);
    transition: transform 0.2s ease, box-shadow 0.3s ease;
}

.calendar-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.calendar-card:hover .calendar-card__accent {
    transform: scaleY(1);
}

.calendar-card__link {
    display: flex;
    flex-direction: column;
    text-decoration: none;
    color: inherit;
    height: 100%;
}

.calendar-card__image-wrapper {
    position: relative;
    flex-shrink: 0;
    width: 100%;
    height: 160px;
    overflow: hidden;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(14, 165, 233, 0.1));
}

.calendar-card__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.calendar-card__image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--accent-primary);
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.15), rgba(14, 165, 233, 0.15));
}

.calendar-card__accent {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: auto;
    width: auto;
    height: 4px;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary, #0ea5e9));
    transform: scaleY(0);
    transform-origin: top;
    transition: transform 0.3s ease;
}

.calendar-card__content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    flex: 1;
    min-width: 0;
}

.calendar-card__time {
    display: flex;
    align-items: center;
}

.calendar-card__time span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.65rem;
    border-radius: 6px;
    background: rgba(14, 165, 233, 0.12);
    color: var(--accent-secondary, #0ea5e9);
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.02em;
}

.calendar-card__header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1.3;
    color: var(--text-primary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
}

.calendar-card__subtitle {
    margin: 0.25rem 0 0;
    color: var(--muted-text);
    font-size: 0.85rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    line-clamp: 1;
    overflow: hidden;
}

.calendar-card__teaser {
    margin: 0;
    color: var(--muted-text);
    font-size: 0.85rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
}

.calendar-card__footer {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: auto;
}

.calendar-card__location {
    margin: 0;
    color: var(--color-text-secondary, #64748b);
    font-weight: 500;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.35rem;
}

.calendar-card__location svg {
    flex-shrink: 0;
    opacity: 0.7;
}

.calendar-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.35rem;
    margin: 0;
    padding: 0;
    list-style: none;
}

.calendar-card__tags li {
    margin: 0;
}

.calendar-card__tag-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    border: none;
    background: rgba(79, 70, 229, 0.1);
    color: var(--accent-primary);
    font-weight: 600;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.calendar-card__tag-button:hover {
    background: rgba(79, 70, 229, 0.18);
    transform: translateY(-1px);
}

.calendar-card__tag-button:focus-visible {
    outline: 2px solid var(--accent-primary);
    outline-offset: 2px;
}

.calendar-card__tag-button.is-active {
    background: var(--accent-primary);
    color: #fff;
}

/* Tablet: 2-column grid */
@media (min-width: 640px) {
    .calendar-group__events {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 1.25rem;
    }

    .calendar-card__image-wrapper {
        height: 180px;
    }

    .calendar-card__content {
        padding: 1.25rem;
    }

    .calendar-card__header h3 {
        font-size: 1.1rem;
        -webkit-line-clamp: 3;
        line-clamp: 3;
    }

    .calendar-card__teaser {
        font-size: 0.9rem;
        -webkit-line-clamp: 3;
        line-clamp: 3;
    }
}

/* Desktop: Better spacing */
@media (min-width: 1024px) {
    .calendar-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    }
}
</style>

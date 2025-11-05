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
                        <router-link :to="`/event/${event.id}/date/${event.event_date_id}`">
                            <img v-if="event.image_path" :src="event.image_path.includes('?')
                                ? `${event.image_path}&ratio=16by9&width=320`
                                : `${event.image_path}?ratio=16by9&width=320`" alt=""
                                class="calendar-card__image" />
                            <div class="calendar-card__time">
                                <span>{{ formatTime(event.start_date, event.start_time) }}</span>
                            </div>
                            <div class="calendar-card__body">
                                <header class="calendar-card__header">
                                    <h3>{{ event.title }}</h3>
                                    <p v-if="event.subtitle" class="calendar-card__subtitle">{{ event.subtitle }}
                                    </p>
                                </header>
                                <p v-if="event.teaser_text" class="calendar-card__teaser">{{ event.teaser_text }}
                                </p>
                                <p class="calendar-card__location">{{ formatLocation(event) }}</p>
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

.calendar-groups {
    display: flex;
    flex-direction: column;
    gap: clamp(1.75rem, 4vw, 2.5rem);
}

.calendar-group {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 3vw, 1.75rem);
}

.calendar-group__header {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.calendar-group__header h2 {
    margin: 0;
    font-size: clamp(1.5rem, 3.2vw, 1.9rem);
    font-weight: 700;
}

.calendar-group__header p {
    margin: 0;
    color: var(--muted-text);
    font-weight: 600;
    text-transform: capitalize;
}

.calendar-group__events {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: clamp(1rem, 2.5vw, 1.5rem);
}

.calendar-card {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    border-radius: 12px;
    border: 0px solid var(--border-soft);
    background: var(--card-bg, #fff);
    padding: clamp(1.15rem, 3vw, 1.5rem);
    min-height: 228px;
}

.calendar-card__time span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    background: rgba(14, 165, 233, 0.12);
    color: var(--accent-secondary, #0ea5e9);
    font-weight: 600;
    font-size: 0.9rem;
}

.calendar-card__header h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.4;
}

.calendar-card__subtitle {
    margin: 0.25rem 0 0;
    color: var(--muted-text);
    font-size: 0.95rem;
}

.calendar-card__teaser {
    margin: 0;
    color: var(--muted-text);
    font-size: 0.95rem;
    line-height: 1.5;
    flex-grow: 1;
}

.calendar-card__location {
    margin: 0;
    color: var(--color-text-secondary, #475569);
    font-weight: 600;
    font-size: 0.95rem;
}

.calendar-card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
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
    padding: 0.35rem 0.65rem;
    border-radius: 999px;
    border: none;
    background: rgba(79, 70, 229, 0.12);
    color: var(--accent-primary);
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.calendar-card__tag-button:hover {
    transform: translateY(-1px);
}

.calendar-card__tag-button:focus-visible {
    outline: none;
}

.calendar-card__tag-button.is-active {
    background: rgba(79, 70, 229, 0.28);
    color: #fff;
}

@media (max-width: 900px) {
    .calendar-group__events {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }
}
</style>

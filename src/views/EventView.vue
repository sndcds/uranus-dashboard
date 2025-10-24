<template>
    <div class="event-page" v-if="event">
        <header class="event-hero">
            <div class="event-hero__meta">
                <p class="event-hero__date">{{ formattedDate }}</p>
                <p class="event-hero__time" v-if="event.start_time">{{ formattedTime }}</p>
            </div>

            <EventHeaderSection
                :event-id="event.id"
                :title="event.title"
                :subtitle="event.subtitle"
                @updated="loadEvent"
            />

            <p class="event-hero__organizer">{{ event.organizer_name }}</p>
        </header>

        <section class="event-layout">
            <div class="event-main">
                <EventImageUploadComponent
                    v-model="eventImage"
                    v-model:alt-text="imageAltText"
                    v-model:copyright="imageCopyright"
                    v-model:license="imageLicense"
                    v-model:created-by="imageCreatedBy"
                    :event-id="eventId"
                    :max-size="5 * 1024 * 1024"
                    :accepted-types="['image/jpeg', 'image/png', 'image/webp']"
                    @updated="loadEvent"
                />

                <EventDescriptionSection
                    :event-id="event.id"
                    :description="event.description"
                    :participation-info="event.participation_info"
                    :meeting-point="event.meeting_point"
                    :event-types="event.event_types"
                    :genre-types="event.genre_types"
                    :locale="locale"
                    @updated="loadEvent"
                />

                <EventUrlSection
                    :event-id="event.id"
                    @updated="loadEvent"
                />
            </div>

            <EventTeaserSection
                :event-id="event.id"
                :teaser-text="event.teaser_text"
                @updated="loadEvent"
                class="event-teaser"
            />

            <aside class="event-aside">
                <LocationMapComponent
                    :latitude="event.venue_lat"
                    :longitude="event.venue_lon"
                    :zoom="18"
                    :selectable="false"
                    class="event-map"
                />

                <EventVenueSection
                    :event-id="event.id"
                    :organizer-id="event.organizer_id"
                    :venue-id="event.venue_id"
                    :venue-name="event.venue_name"
                    :venue-street="event.venue_street"
                    :venue-house-number="event.venue_house_number"
                    :venue-postal-code="event.venue_postal_code"
                    :venue-city="event.venue_city"
                    :space-id="event.space_id"
                    :space-name="event.space_name"
                    :space-total-capacity="event.space_total_capacity"
                    @updated="loadEvent"
                />

                <EventScheduleSection
                    :event-id="event.id"
                    :organizer-id="event.organizer_id"
                    :venue-id="event.venue_id"
                    :start-date="event.start_date"
                    :start-time="event.start_time"
                    :end-date="event.end_date"
                    :end-time="event.end_time"
                    :entry-time="event.entry_time"
                    :dates="event.dates"
                    :event-dates="event.event_dates"
                    :space-id="event.space_id"
                    :space-name="event.space_name"
                    @updated="loadEvent"
                />
            </aside>
        </section>
    </div>
    <div v-else class="event-loading">
        <p v-if="error">{{ error }}</p>
        <p v-else>{{ t('loading') }}</p>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import EventImageUploadComponent from '@/components/event/EventImageUploadComponent.vue'
import LocationMapComponent from '@/components/LocationMapComponent.vue'
import EventHeaderSection from '@/components/event/EventHeaderSection.vue'
import EventDescriptionSection from '@/components/event/EventDescriptionSection.vue'
import EventTeaserSection from '@/components/event/EventTeaserSection.vue'
import EventVenueSection from '@/components/event/EventVenueSection.vue'
import EventUrlSection from '@/components/event/EventUrlSection.vue'
import EventScheduleSection from '@/components/event/EventScheduleSection.vue'

interface EventType {
    id: number
    name: string
}

interface EventGenreType {
    id: number
    name: string
    event_type_id?: number | null
    type_id?: number | null
}

interface EventDateApi {
    id?: number | null
    start_date?: string
    end_date?: string | null
    start_time?: string | null
    end_time?: string | null
    entry_time?: string | null
    all_day?: boolean | null
    space_id?: number | null
}

type EventDateSource = EventDateApi[] | Record<string, EventDateApi> | null | undefined

interface EventDetail {
    id: number
    title: string
    subtitle: string
    description: string
    organizer_name: string
    organizer_id: number | null
    start_date: string
    start_time: string | null
    end_date: string | null
    end_time: string | null
    entry_time: string | null
    event_types: EventType[]
    genre_types: EventGenreType[]
    participation_info: string | null
    meeting_point: string | null
    teaser_text: string | null
    venue_name: string
    venue_id: number | null
    venue_street: string
    venue_house_number: string
    venue_postal_code: string
    venue_city: string
    venue_lat: number
    venue_lon: number
    space_name: string
    space_id: number | null
    space_total_capacity: number
    dates?: EventDateSource
    event_dates?: EventDateSource
}

interface QueryResponse {
    events: EventDetail[]
}

const route = useRoute()
const { t, locale } = useI18n({ useScope: 'global' })
const event = ref<EventDetail | null>(null)
const error = ref<string | null>(null)

const eventId = computed(() => Number(route.params.id))
const eventImage = ref<File | null>(null)
const imageAltText = ref('')
const imageCopyright = ref('')
const imageLicense = ref('')
const imageCreatedBy = ref('')
const dateFormatter = computed(
    () =>
        new Intl.DateTimeFormat(locale.value, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
)

const timeFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }))

const formattedDate = computed(() => (event.value ? dateFormatter.value.format(new Date(event.value.start_date)) : ''))

const formattedTime = computed(() =>
    event.value?.start_time ? timeFormatter.value.format(new Date(`${event.value.start_date}T${event.value.start_time}`)) : ''
)

const normalizeCollection = <T>(collection: T[] | Record<string, T> | null | undefined): T[] => {
    if (Array.isArray(collection)) return collection
    if (collection && typeof collection === 'object') {
        return Object.values(collection as Record<string, T>)
    }
    return []
}

const loadEvent = async () => {
    try {
        const { data } = await apiFetch<QueryResponse>(
            `/api/query?mode=event&events=${eventId.value}&start=2000-01-01`
        )

        if (data?.events?.length) {
            const eventData = data.events[0]
            if (eventData) {
                eventData.event_types = normalizeCollection(eventData.event_types)
                eventData.genre_types = normalizeCollection(eventData.genre_types)
                event.value = eventData
                error.value = null
            }
        } else {
            error.value = t('event_not_found')
            event.value = null
        }
    } catch (err) {
        console.error(err)
        error.value = t('event_load_error')
        event.value = null
    }
}

onMounted(() => {
    loadEvent()
})
</script>

<style scoped lang="scss">
.event-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 4vw, 1.5rem);
}

.event-hero {
    text-align: center;
    color: var(--color-text);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem 0;
}

.event-hero__meta {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
    color: var(--accent-primary);
    font-size: 0.9rem;
}

.event-hero__organizer {
    font-weight: 600;
    color: var(--muted-text);
    margin: 0;
    font-size: 0.85rem;
}

// Mobile: Single column, stacked layout
.event-layout {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 4vw, 1.5rem);
}

.event-main {
    border-radius: 16px;
    padding: clamp(1rem, 4vw, 1.5rem);
    background: var(--card-bg);
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 4vw, 1.25rem);
    order: 1;
}

.event-teaser {
    order: 2;
}

.event-map {
    width: 100%;
    height: 250px;
    border-radius: 12px;
    overflow: hidden;
}

.event-aside {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    order: 3;
}


.event-loading {
    min-height: 50vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    color: var(--muted-text);
    padding: 2rem 1rem;
}

// Tablet: Enhanced spacing and sizing
@media (min-width: 640px) {
    .event-page {
        gap: clamp(1.25rem, 3vw, 2rem);
        padding: 0 clamp(1.5rem, 5vw, 3rem);
    }

    .event-hero {
        padding: 1.5rem 0;
        gap: 0.75rem;
    }

    .event-hero__meta {
        flex-direction: row;
        gap: 1rem;
        font-size: 1rem;
    }

    .event-hero__organizer {
        font-size: 0.9rem;
    }

    .event-layout {
        gap: clamp(1.25rem, 3vw, 2rem);
    }

    .event-main {
        border-radius: 20px;
        padding: clamp(1.25rem, 3vw, 2rem);
        gap: clamp(1.25rem, 3vw, 1.75rem);
    }

    .event-map {
        height: 280px;
    }

    .event-aside {
        gap: 1.25rem;
    }

}

// Desktop: Two-column layout
@media (min-width: 1024px) {
    .event-page {
        gap: clamp(1.5rem, 3vw, 2.5rem);
        margin: 0 auto;
    }

    .event-hero {
        padding: 2rem 0;
        gap: 1rem;
    }

    .event-hero__meta {
        font-size: 1.1rem;
    }

    .event-hero__organizer {
        font-size: 1rem;
    }

    // Desktop: Two-column grid layout
    .event-layout {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
        gap: clamp(1.5rem, 3vw, 2rem);
    }

    .event-main {
        grid-row: 1 / 2;
        grid-column: 1 / 2;
        border-radius: 24px;
        padding: clamp(1.75rem, 3vw, 2.4rem);
        gap: clamp(1.5rem, 3vw, 2rem);
    }

    .event-teaser {
        grid-row: 2 / 3;
        grid-column: 1 / 2;
    }

    .event-map {
        height: 300px;
    }

    .event-aside {
        grid-row: 1 / 3;
        grid-column: 2 / 3;
        gap: 1.2rem;
    }

}

// Large desktop: Enhanced spacing
@media (min-width: 1280px) {
    .event-page {
        padding: 0 clamp(3rem, 8vw, 6rem);
    }

    .event-layout {
        gap: clamp(2rem, 4vw, 3rem);
    }

    .event-main {
        padding: clamp(2rem, 4vw, 3rem);
    }

    .event-map {
        height: 350px;
    }

}
</style>

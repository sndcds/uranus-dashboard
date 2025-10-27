<template>
    <div class="event-page" v-if="event">
        <header class="event-hero">
            <div class="event-hero__meta">
                <p class="event-hero__date">{{ formattedDate }}</p>
                <p class="event-hero__time" v-if="event.start_time">{{ formattedTime }}</p>
            </div>

            <EventHeaderSection :event-id="event.id" :title="event.title" :subtitle="event.subtitle"
                @updated="loadEvent" />

            <p class="event-hero__organizer">{{ event.organizer_name }}</p>
        </header>

        <section class="event-layout">
            <div class="event-main">
                <EventImageUploadComponent v-model="eventImage" v-model:alt-text="imageAltText"
                    v-model:copyright="imageCopyright" v-model:license="imageLicense"
                    v-model:created-by="imageCreatedBy" :event-id="eventId" :max-size="5 * 1024 * 1024"
                    :accepted-types="['image/jpeg', 'image/png', 'image/webp']" @updated="loadEvent" />

                <EventDescriptionSection :event-id="event.id" :description="event.description"
                    :participation-info="event.participation_info" :meeting-point="event.meeting_point"
                    :event-types="event.event_types" :genre-types="event.genre_types" :locale="locale"
                    @updated="loadEvent" />

                <EventUrlSection :event-id="event.id" :links="eventLinks" @updated="loadEvent" />
            </div>

            <EventTeaserSection :event-id="event.id" :teaser-text="event.teaser_text"
                :has-main-image="event.has_main_image" :image-id="event.image_id" :image-focus-x="event.image_focus_x"
                :image-focus-y="event.image_focus_y" @updated="loadEvent" class="event-teaser" />

            <aside class="event-aside">
                <LocationMapComponent :latitude="event.venue_lat" :longitude="event.venue_lon" :zoom="18"
                    :selectable="false" class="event-map" />

                <EventVenueSection :event-id="event.id" :organizer-id="event.organizer_id" :venue-id="event.venue_id"
                    :venue-name="event.venue_name" :venue-street="event.venue_street"
                    :venue-house-number="event.venue_house_number" :venue-postal-code="event.venue_postal_code"
                    :venue-city="event.venue_city" :space-id="event.space_id" :space-name="event.space_name"
                    :space-total-capacity="event.space_total_capacity" @updated="loadEvent" />

                <EventScheduleSection :event-id="event.id" :organizer-id="event.organizer_id" :venue-id="event.venue_id"
                    :start-date="event.start_date" :start-time="event.start_time" :end-date="event.end_date"
                    :end-time="event.end_time" :entry-time="event.entry_time" :dates="event.dates"
                    :event-dates="event.event_dates" :space-id="event.space_id" :space-name="event.space_name"
                    @updated="loadEvent" />
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
    type_id: number
    type_name: string
    genre_id: number | null
    genre_name: string | null
}

interface EventGenreType {
    id: number
    name: string
    event_type_id?: number | null
    type_id?: number | null
}

interface EventUrl {
    id: number | null
    title: string
    url: string
    url_type: string
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
    description: string | null
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
    venue_lat: number | null
    venue_lon: number | null
    venue_country?: string | null
    venue_state?: string | null
    venue_geometry?: string | null
    space_name: string
    space_id: number | null
    space_total_capacity: number | null
    space_seating_capacity?: number | null
    space_building_level?: number | null
    space_url?: string | null
    has_main_image?: boolean | null
    image_id?: number | null
    image_focus_x?: number | null
    image_focus_y?: number | null
    duration?: number | null
    accessibility_flag_names?: string[] | null
    accessibility_flags?: number | null
    visitor_info_flag_names?: string[] | null
    visitor_info_flags?: number | null
    dates?: EventDateSource
    event_dates?: EventDateSource
    event_urls?: EventUrl[]
}

type QueryResponse = { events?: unknown }

const route = useRoute()
const { t, locale } = useI18n({ useScope: 'global' })
const event = ref<EventDetail | null>(null)
const error = ref<string | null>(null)
const eventLinks = ref<EventUrl[]>([])

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

const formattedDate = computed(() => {
    const startDate = event.value?.start_date
    if (!startDate) return ''

    const parsed = new Date(startDate)
    return Number.isNaN(parsed.getTime()) ? '' : dateFormatter.value.format(parsed)
})

const formattedTime = computed(() => {
    const startDate = event.value?.start_date
    const startTime = event.value?.start_time
    if (!startDate || !startTime) return ''

    const parsed = new Date(`${startDate}T${startTime}`)
    return Number.isNaN(parsed.getTime()) ? '' : timeFormatter.value.format(parsed)
})

const normalizeCollection = <T>(collection: T[] | Record<string, T> | null | undefined): T[] => {
    if (Array.isArray(collection)) return collection
    if (collection && typeof collection === 'object') {
        return Object.values(collection as Record<string, T>)
    }
    return []
}

const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

const toStringOrEmpty = (value: unknown): string => {
    if (typeof value === 'string') return value
    if (value == null) return ''
    return String(value)
}

const toNullableString = (value: unknown): string | null => {
    if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed.length ? trimmed : null
    }
    return null
}

const toEventUrl = (raw: unknown): EventUrl | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>

    const url = toNullableString(record.url)
    if (!url) return null

    return {
        id: toNumberOrNull(record.id),
        title: toNullableString(record.title) ?? '',
        url,
        url_type: toNullableString(record.url_type) ?? '',
    }
}

const toStringArrayOrNull = (value: unknown): string[] | null => {
    if (!Array.isArray(value)) return null
    const filtered = value.filter((entry): entry is string => typeof entry === 'string')
    return filtered.length ? filtered : []
}

const mapEventType = (raw: unknown): EventType | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>

    const typeId =
        toNumberOrNull(record.type_id) ??
        toNumberOrNull(record.typeId) ??
        toNumberOrNull(record.id) ??
        toNumberOrNull(record.event_type_id) ??
        toNumberOrNull(record.eventTypeId)

    if (typeId === null) return null

    const typeName =
        toNullableString(record.type_name) ??
        toNullableString(record.typeName) ??
        toNullableString(record.name) ??
        ''

    const genreRecord = typeof record.genre === 'object' && record.genre ? (record.genre as Record<string, unknown>) : null

    const genreId =
        toNumberOrNull(record.genre_id) ??
        toNumberOrNull(record.genreId) ??
        toNumberOrNull(record.genre_type_id) ??
        (genreRecord ? toNumberOrNull(genreRecord.id) : null)

    const genreName =
        toNullableString(record.genre_name) ||
        toNullableString(record.genreName) ||
        (genreRecord ? toNullableString(genreRecord.name) : null)

    return {
        type_id: typeId,
        type_name: typeName,
        genre_id: genreId,
        genre_name: genreName,
    }
}

const mapEventGenreType = (raw: unknown): EventGenreType | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>

    const id = toNumberOrNull(record.id) ?? toNumberOrNull(record.genre_id)
    const name =
        toNullableString(record.name) ??
        toNullableString(record.genre_name) ??
        null

    if (id === null || name === null) return null

    return {
        id,
        name,
        event_type_id: toNumberOrNull(record.event_type_id) ?? null,
        type_id: toNumberOrNull(record.type_id) ?? null,
    }
}

const mapEventDetail = (raw: unknown): EventDetail | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>

    const id = toNumberOrNull(record.id)
    const startDate = toNullableString(record.start_date)

    if (id === null || !startDate) return null

    const rawEventTypes = normalizeCollection<unknown>(record['event_types'] as
        | Array<unknown>
        | Record<string, unknown>
        | null
        | undefined)
    const eventTypes = rawEventTypes.map(mapEventType).filter(Boolean) as EventType[]

    const rawGenreTypes = normalizeCollection<unknown>(record['genre_types'] as
        | Array<unknown>
        | Record<string, unknown>
        | null
        | undefined)
    const genreTypes = rawGenreTypes
        .map(mapEventGenreType)
        .filter(Boolean) as EventGenreType[]

    const eventUrlsSource = record['event_urls'] as unknown
    let rawEventUrls: unknown[] = []

    if (Array.isArray(eventUrlsSource)) {
        rawEventUrls = eventUrlsSource
    } else if (eventUrlsSource && typeof eventUrlsSource === 'object') {
        const maybeLinks = (eventUrlsSource as { links?: unknown }).links
        if (Array.isArray(maybeLinks)) {
            rawEventUrls = maybeLinks
        } else {
            rawEventUrls = Object.values(eventUrlsSource as Record<string, unknown>)
        }
    }

    const eventUrls = rawEventUrls.map(toEventUrl).filter(Boolean) as EventUrl[]

    const detail: EventDetail = {
        id,
        title: toStringOrEmpty(record.title),
        subtitle: toStringOrEmpty(record.subtitle),
        description: toNullableString(record.description),
        organizer_name: toStringOrEmpty(record.organizer_name),
        organizer_id: toNumberOrNull(record.organizer_id),
        start_date: startDate,
        start_time: toNullableString(record.start_time),
        end_date: toNullableString(record.end_date),
        end_time: toNullableString(record.end_time),
        entry_time: toNullableString(record.entry_time),
        event_types: eventTypes,
        genre_types: genreTypes,
        participation_info: toNullableString(record.participation_info),
        meeting_point: toNullableString(record.meeting_point),
        teaser_text: toNullableString(record.teaser_text),
        venue_name: toStringOrEmpty(record.venue_name),
        venue_id: toNumberOrNull(record.venue_id),
        venue_street: toStringOrEmpty(record.venue_street),
        venue_house_number: toStringOrEmpty(record.venue_house_number),
        venue_postal_code: toStringOrEmpty(record.venue_postal_code),
        venue_city: toStringOrEmpty(record.venue_city),
        venue_lat: toNumberOrNull(record.venue_lat),
        venue_lon: toNumberOrNull(record.venue_lon),
        space_name: toStringOrEmpty(record.space_name),
        space_id: toNumberOrNull(record.space_id),
        space_total_capacity: toNumberOrNull(record.space_total_capacity),
        dates: record['dates'] as EventDateSource,
        event_dates: record['event_dates'] as EventDateSource,
        event_urls: eventUrls,
    }

    if ('venue_country' in record) detail.venue_country = toNullableString(record.venue_country)
    if ('venue_state' in record) detail.venue_state = toNullableString(record.venue_state)
    if ('venue_geometry' in record) detail.venue_geometry = toNullableString(record.venue_geometry)
    if ('space_seating_capacity' in record) detail.space_seating_capacity = toNumberOrNull(record.space_seating_capacity)
    if ('space_building_level' in record) detail.space_building_level = toNumberOrNull(record.space_building_level)
    if ('space_url' in record) detail.space_url = toNullableString(record.space_url)
    if ('has_main_image' in record) {
        const value = record.has_main_image
        detail.has_main_image = value == null ? null : Boolean(value)
    }
    if ('image_id' in record) detail.image_id = toNumberOrNull(record.image_id)
    if ('image_focus_x' in record) detail.image_focus_x = toNumberOrNull(record.image_focus_x)
    if ('image_focus_y' in record) detail.image_focus_y = toNumberOrNull(record.image_focus_y)
    if ('duration' in record) detail.duration = toNumberOrNull(record.duration)
    if ('accessibility_flag_names' in record) detail.accessibility_flag_names = toStringArrayOrNull(record.accessibility_flag_names)
    if ('accessibility_flags' in record) detail.accessibility_flags = toNumberOrNull(record.accessibility_flags)
    if ('visitor_info_flag_names' in record) detail.visitor_info_flag_names = toStringArrayOrNull(record.visitor_info_flag_names)
    if ('visitor_info_flags' in record) detail.visitor_info_flags = toNumberOrNull(record.visitor_info_flags)

    return detail
}

const extractEvents = (payload: unknown): unknown[] => {
    console.log(payload)
    if (payload && typeof payload === 'object') {
        const maybeEvents = (payload as QueryResponse).events
        if (Array.isArray(maybeEvents)) {
            return maybeEvents
        }
        if ('id' in payload) {
            return [payload]
        }
    }
    return []
}

const loadEvent = async () => {
    try {
        const { data } = await apiFetch<unknown>(
            `/api/admin/event/${eventId.value}?lang=${locale.value}`
        )

        const events = extractEvents(data)
        const mapped = events.length ? mapEventDetail(events[0]) : null

        if (mapped) {
            event.value = mapped
            error.value = null
            eventLinks.value = mapped.event_urls ?? []
        } else {
            error.value = t('event_not_found')
            event.value = null
            eventLinks.value = []
        }
    } catch (err) {
        console.error(err)
        error.value = t('event_load_error')
        event.value = null
        eventLinks.value = []
    }
}

onMounted(() => {
    void loadEvent()
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

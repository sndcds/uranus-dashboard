<template>
    <div class="event-page" v-if="event">
        <header class="event-hero">
            <EventHeaderSection :event-id="event.id" :title="event.title" :subtitle="event.subtitle"
                @updated="loadEvent" />
        </header>

        <div class="event-content">
            <section class="event-layout">
                <div class="event-main">
                    <EventImageUploadComponent v-model="eventImage" v-model:alt-text="imageAltText"
                        v-model:copyright="imageCopyright" v-model:license="imageLicense"
                        v-model:created-by="imageCreatedBy" :event-id="eventId" :max-size="5 * 1024 * 1024"
                        :accepted-types="['image/jpeg', 'image/png', 'image/webp']"
                        :existing-image-url="existingImagePreviewUrl" @updated="loadEvent" />

                    <EventDescriptionSection :event-id="event.id" :description="event.description"
                        :participation-info="event.participation_info" :meeting-point="event.meeting_point"
                        :event-types="event.event_types" :languages="event.languages" :locale="locale" @updated="loadEvent" />

                    <EventUrlSection :event-id="event.id" :links="eventLinks" @updated="loadEvent" />
                </div>

                <EventTeaserSection :event-id="event.id" :teaser-text="event.teaser_text"
                    :has-main-image="Boolean(event.image_id)" :image-id="event.image_id"
                    :image-focus-x="event.image_focus_x" :image-focus-y="event.image_focus_y" class="event-teaser"
                    @updated="loadEvent" />
            </section>

            <div class="event-sidebar">
                <LocationMapComponent :latitude="event.venue_lat" :longitude="event.venue_lon" :zoom="18"
                    :selectable="false" class="event-map" />

                <EventScheduleSection :event-id="event.id" :organizer-id="event.organizer_id" :venue-id="event.venue_id"
                    :event-dates="event.event_dates" :space-id="event.space_id" :space-name="event.space_name ?? ''"
                    @updated="loadEvent" />

                <EventVenueSection :event-id="event.id" :organizer-id="event.organizer_id" :venue-id="event.venue_id"
                    :venue-name="event.venue_name" :venue-street="event.venue_street ?? ''"
                    :venue-house-number="event.venue_house_number ?? ''"
                    :venue-postal-code="event.venue_postal_code ?? ''" :venue-city="event.venue_city ?? ''"
                    :space-id="event.space_id" :space-name="event.space_name ?? ''" :space-total-capacity="null"
                    @updated="loadEvent" />
            </div>
        </div>
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

const envApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const apiBase = envApiUrl

interface EventType {
    type_id: number
    type_name: string
    genre_id: number | null
    genre_name: string | null
}

interface EventDate {
    event_date_id: number | null
    start_date: string | null
    start_time: string | null
    end_date: string | null
    end_time: string | null
    entry_time: string | null
    space_id: number | null
    accessibility_flags: number | null
    duration: number | null
    visitor_info_flags: number | null
}

interface EventUrl {
    id: number | null
    title: string
    url: string
    url_type: string
}

interface EventDetail {
    id: number
    title: string
    subtitle: string | null
    description: string | null
    organizer_id: number | null
    organizer_name: string
    teaser_text: string | null
    participation_info: string | null
    meeting_point: string | null
    event_types: EventType[]
    languages: string[]
    event_dates: EventDate[]
    event_urls: EventUrl[]
    image_id: number | null
    image_alt_text: string | null
    image_copyright: string | null
    image_created_by: string | null
    image_focus_x: number | null
    image_focus_y: number | null
    image_license_id: string | null
    venue_id: number | null
    venue_name: string
    venue_street: string | null
    venue_house_number: string | null
    venue_postal_code: string | null
    venue_city: string | null
    venue_lat: number | null
    venue_lon: number | null
    venue_country_code: string | null
    venue_state_code: string | null
    space_id: number | null
    space_name: string | null
    start_date: string | null
    start_time: string | null
    end_date: string | null
    end_time: string | null
    entry_time: string | null
}

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

const primaryEventDate = computed<EventDate | null>(() => {
    const dates = event.value?.event_dates ?? []
    return dates.find((entry) => entry.start_date || entry.start_time || entry.entry_time || entry.end_date || entry.end_time) ?? null
})

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
    const startDate = primaryEventDate.value?.start_date
    if (!startDate) return ''
    const parsed = new Date(startDate)
    return Number.isNaN(parsed.getTime()) ? '' : dateFormatter.value.format(parsed)
})

const formattedTime = computed(() => {
    const startDate = primaryEventDate.value?.start_date
    const startTime = primaryEventDate.value?.start_time
    if (!startDate || !startTime) return ''
    const parsed = new Date(`${startDate}T${startTime}`)
    return Number.isNaN(parsed.getTime()) ? '' : timeFormatter.value.format(parsed)
})

const hasStartTime = computed(() => Boolean(primaryEventDate.value?.start_time))

const normalizeFocus = (value: number | null): string => {
    const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0.5
    const clamped = Math.min(Math.max(numeric, 0), 1)
    return clamped.toFixed(3)
}

const existingImagePreviewUrl = computed(() => {
    const current = event.value
    if (!current || current.image_id == null) return null
    const focusX = normalizeFocus(current.image_focus_x)
    const focusY = normalizeFocus(current.image_focus_y)
    return `${apiBase}/api/image/${current.image_id}?mode=cover&width=800&ratio=16by9&focusx=${focusX}&focusy=${focusY}&type=webp&quality=90`
})

const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

const toString = (value: unknown, fallback = ''): string => {
    if (typeof value === 'string') return value
    if (value == null) return fallback
    return String(value)
}

const toNullableString = (value: unknown): string | null => {
    if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed.length ? trimmed : null
    }
    return null
}

const mapEventType = (raw: unknown): EventType | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>
    const typeId = toNumberOrNull(record.type_id)
    if (typeId === null) return null
    return {
        type_id: typeId,
        type_name: toString(record.type_name),
        genre_id: toNumberOrNull(record.genre_id),
        genre_name: toNullableString(record.genre_name),
    }
}

const mapEventDate = (raw: unknown): EventDate | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>
    return {
        event_date_id: toNumberOrNull(record.event_date_id),
        start_date: toNullableString(record.start_date),
        start_time: toNullableString(record.start_time),
        end_date: toNullableString(record.end_date),
        end_time: toNullableString(record.end_time),
        entry_time: toNullableString(record.entry_time),
        space_id: toNumberOrNull(record.space_id),
        accessibility_flags: toNumberOrNull(record.accessibility_flags),
        duration: toNumberOrNull(record.duration),
        visitor_info_flags: toNumberOrNull(record.visitor_info_flags),
    }
}

const mapEventUrl = (raw: unknown): EventUrl | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>
    const url = toNullableString(record.url)
    if (!url) return null
    return {
        id: toNumberOrNull(record.id),
        title: toString(record.title),
        url,
        url_type: toString(record.url_type),
    }
}

const mapLanguageCodes = (raw: unknown): string[] => {
    if (!raw) return []
    const source = Array.isArray(raw) ? raw : []
    return source
        .map((item) => {
            if (typeof item === 'string') {
                const trimmed = item.trim()
                return trimmed.length ? trimmed : null
            }
            if (item && typeof item === 'object') {
                const record = item as Record<string, unknown>
                const candidates = [
                    record.code,
                    record.id,
                    record.language_code,
                    record.language,
                ]
                for (const candidate of candidates) {
                    if (typeof candidate === 'string' && candidate.trim().length) {
                        return candidate.trim()
                    }
                }
            }
            return null
        })
        .filter((value): value is string => value !== null)
}

const mapEventDetail = (raw: unknown): EventDetail | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>
    const id = toNumberOrNull(record.id)
    if (id === null) return null

    const eventTypes = Array.isArray(record.event_types)
        ? (record.event_types as unknown[]).map(mapEventType).filter(Boolean) as EventType[]
        : []

    const eventDates = Array.isArray(record.event_dates)
        ? (record.event_dates as unknown[]).map(mapEventDate).filter(Boolean) as EventDate[]
        : []

    const eventUrls = Array.isArray(record.event_urls)
        ? (record.event_urls as unknown[]).map(mapEventUrl).filter(Boolean) as EventUrl[]
        : []

    const languageCodes = mapLanguageCodes(
        (record.languages ?? record.language_codes ?? record.event_languages) as unknown
    )

    const primary = eventDates.find((entry) => entry.start_date || entry.start_time || entry.entry_time || entry.end_date || entry.end_time) ?? null

    return {
        id,
        title: toString(record.title),
        subtitle: toNullableString(record.subtitle),
        description: toNullableString(record.description),
        organizer_id: toNumberOrNull(record.organizer_id),
        organizer_name: toString(record.organizer_name),
        teaser_text: toNullableString(record.teaser_text),
        participation_info: toNullableString(record.participation_info),
        meeting_point: toNullableString(record.meeting_point),
        event_types: eventTypes,
        languages: languageCodes,
        event_dates: eventDates,
        event_urls: eventUrls,
        image_id: toNumberOrNull(record.image_id),
        image_alt_text: toNullableString(record.image_alt_text),
        image_copyright: toNullableString(record.image_copyright),
        image_created_by: toNullableString(record.image_created_by),
        image_focus_x: toNumberOrNull(record.image_focus_x),
        image_focus_y: toNumberOrNull(record.image_focus_y),
        image_license_id: toNullableString(record.image_license_id),
        venue_id: toNumberOrNull(record.venue_id),
        venue_name: toString(record.venue_name),
        venue_street: toNullableString(record.venue_street),
        venue_house_number: toNullableString(record.venue_house_number),
        venue_postal_code: toNullableString(record.venue_postal_code),
        venue_city: toNullableString(record.venue_city),
        venue_lat: toNumberOrNull(record.venue_lat),
        venue_lon: toNumberOrNull(record.venue_lon),
        venue_country_code: toNullableString(record.venue_country_code),
        venue_state_code: toNullableString(record.venue_state_code),
        space_id: toNumberOrNull(record.space_id),
        space_name: toNullableString(record.space_name),
        start_date: primary?.start_date ?? null,
        start_time: primary?.start_time ?? null,
        end_date: primary?.end_date ?? null,
        end_time: primary?.end_time ?? null,
        entry_time: primary?.entry_time ?? null,
    }
}

const resetState = () => {
    event.value = null
    eventLinks.value = []
    imageAltText.value = ''
    imageCopyright.value = ''
    imageLicense.value = ''
    imageCreatedBy.value = ''
}

const loadEvent = async () => {
    try {
        const { data } = await apiFetch<unknown>(`/api/admin/event/${eventId.value}?lang=${locale.value}`)
        const mapped = mapEventDetail(data)

        if (!mapped) {
            error.value = t('event_not_found')
            resetState()
            return
        }

        event.value = mapped
        error.value = null
        eventLinks.value = mapped.event_urls ?? []
        imageAltText.value = mapped.image_alt_text ?? ''
        imageCopyright.value = mapped.image_copyright ?? ''
        imageLicense.value = mapped.image_license_id ?? ''
        imageCreatedBy.value = mapped.image_created_by ?? ''
    } catch (err) {
        console.error(err)
        error.value = t('event_load_error')
        resetState()
    }
}

onMounted(() => {
    void loadEvent()
})
</script>

<style scoped lang="scss">
.event-page {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 4vw, 1.5rem);
}

.event-hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    text-align: center;
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

.event-content {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 4vw, 1.5rem);
}

.event-layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: clamp(1rem, 4vw, 1.5rem);
}

.event-main {
    border-radius: 16px;
    padding: clamp(1rem, 4vw, 1.5rem);
    background: var(--card-bg);
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 4vw, 1.25rem);
}

.event-map {
    width: 100%;
    height: 250px;
    border-radius: 12px;
    overflow: hidden;
}

.event-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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

@media (min-width: 640px) {
    .event-page {
        gap: clamp(1.25rem, 3vw, 2rem);
        padding: 0 clamp(1.5rem, 5vw, 3rem);
    }

    .event-hero {
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

    .event-sidebar {
        gap: 1.25rem;
    }
}

@media (min-width: 1024px) {
    .event-page {
        gap: clamp(1.5rem, 3vw, 2.5rem);
        margin: 0 auto;
    }

    .event-hero {
        gap: 1rem;
    }

    .event-hero__meta {
        font-size: 1.1rem;
    }

    .event-hero__organizer {
        font-size: 1rem;
    }

    .event-content {
        display: grid;
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
        gap: clamp(1.5rem, 3vw, 2rem);
        align-items: start;
    }

    .event-layout {
        gap: clamp(1.5rem, 3vw, 2rem);
    }

    .event-sidebar {
        align-self: stretch;
    }

    .event-map {
        width: 100%;
        height: 100%;
        min-height: 320px;
    }
}

@media (min-width: 1280px) {
    .event-page {
        padding: 0 clamp(2rem, 4vw, 3rem);
    }

    .event-map {
        height: 320px;
    }
}
</style>

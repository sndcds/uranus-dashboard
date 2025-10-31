<template>
    <div class="event-page" v-if="event">
        <div class="event-content">
            <section class="event-layout">
                <div class="event-main">
                    <EventImageUploadComponent v-model="eventImage" v-model:alt-text="imageAltText"
                        v-model:copyright="imageCopyright" v-model:license="imageLicense"
                        v-model:created-by="imageCreatedBy" :event-id="eventId" :max-size="5 * 1024 * 1024"
                        :accepted-types="['image/jpeg', 'image/png', 'image/webp']" :existing-image-id="event.image_id"
                        :existing-image-url="existingImagePreviewUrl" @updated="loadEvent" />

                    <EventHeaderSection :event-id="event.id" :title="event.title" :subtitle="event.subtitle"
                        @updated="loadEvent" />

                    <EventDescriptionSection :event-id="event.id" :description="event.description"
                        :participation-info="event.participation_info" :meeting-point="event.meeting_point"
                        :event-types="event.event_types" :languages="event.languages" :locale="locale"
                        @updated="loadEvent" />

                    <EventUrlSection :event-id="event.id" :links="eventLinks" @updated="loadEvent" />
                </div>

                <EventTeaserSection :event-id="event.id" :teaser-text="event.teaser_text"
                    :has-main-image="Boolean(event.image_id)" :image-id="event.image_id"
                    :image-focus-x="event.image_focus_x" :image-focus-y="event.image_focus_y" :tags="event.tags"
                    class="event-teaser" @updated="loadEvent" />
            </section>

            <div class="event-sidebar">
                <LocationMapComponent
                    :latitude="event.venue_lat"
                    :longitude="event.venue_lon"
                    :zoom="18"
                    :selectable="false" class="event-map" />

                <EventScheduleSection :event-id="event.id" :organizer-id="event.organizer_id" :venue-id="event.venue_id"
                    :event-dates="eventSchedulePayload" :space-id="event.space_id" :space-name="event.space_name ?? ''"
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
import InlineEditorLabel from "@/components/InlineEditorLabel.vue";

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

type EventSchedulePayloadItem = {
    id?: number | null
    start_date?: string
    end_date?: string | null
    start_time?: string
    end_time?: string | null
    entry_time?: string | null
    space_id?: number | null
    accessibility_flags?: number | null
    duration?: number | null
    visitor_info_flags?: number | null
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
    image_url?: string | null
    has_main_image?: boolean
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
    tags?: string[] | null
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
    if (!current) return null

    if (current.image_url) {
        return current.image_url
    }

    if (current.image_id == null) {
        return null
    }

    const focusX = normalizeFocus(current.image_focus_x)
    const focusY = normalizeFocus(current.image_focus_y)
    return `${apiBase}/api/image/${current.image_id}?mode=cover&width=800&ratio=16by9&focusx=${focusX}&focusy=${focusY}&type=webp&quality=90`
})

const eventSchedulePayload = computed<EventSchedulePayloadItem[]>(() => {
    if (!event.value) {
        return []
    }

    return event.value.event_dates.map<EventSchedulePayloadItem>((date) => {
        const payload: EventSchedulePayloadItem = {}

        if (date.event_date_id !== null) {
            payload.id = date.event_date_id
        }

        if (date.start_date) {
            payload.start_date = date.start_date
        }

        if (date.start_time) {
            payload.start_time = date.start_time
        }

        if (date.end_date) {
            payload.end_date = date.end_date
        }

        if (date.end_time) {
            payload.end_time = date.end_time
        }

        if (date.entry_time) {
            payload.entry_time = date.entry_time
        }

        if (date.space_id !== null) {
            payload.space_id = date.space_id
        }

        if (date.accessibility_flags !== null) {
            payload.accessibility_flags = date.accessibility_flags
        }

        if (date.duration !== null) {
            payload.duration = date.duration
        }

        if (date.visitor_info_flags !== null) {
            payload.visitor_info_flags = date.visitor_info_flags
        }

        return payload
    })
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

const toBoolean = (value: unknown): boolean => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        if (!normalized) return false
        return normalized === 'true' || normalized === '1' || normalized === 'yes'
    }
    return false
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

interface EventImageDetail {
    id: number | null
    url: string | null
    altText: string | null
    copyright: string | null
    createdBy: string | null
    focusX: number | null
    focusY: number | null
    licenseId: string | null
}

const mapEventImage = (raw: unknown): EventImageDetail | null => {
    if (!raw || typeof raw !== 'object') return null
    const record = raw as Record<string, unknown>
    const imageId = toNumberOrNull(record.image_id ?? record.id ?? record.imageId ?? record.main_image_id)
    const urlCandidate =
        toNullableString(
            record.url ??
                record.image_url ??
                record.path ??
                record.src ??
                (typeof record.image === 'string' ? record.image : null)
        ) ?? null

    return {
        id: imageId,
        url: urlCandidate,
        altText: toNullableString(record.alt_text ?? record.altText ?? record.description),
        copyright: toNullableString(record.copyright),
        createdBy: toNullableString(record.created_by ?? record.createdBy),
        focusX: toNumberOrNull(record.focus_x ?? record.focusX),
        focusY: toNumberOrNull(record.focus_y ?? record.focusY),
        licenseId: toNullableString(record.license_id ?? record.licence_id ?? record.licenseId ?? record.licenceId),
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

const mapTagList = (raw: unknown): string[] => {
    if (!raw) return []
    const source = Array.isArray(raw) ? raw : []
    const normalize = (value: string) => value.replace(/\s+/g, ' ').trim()
    return Array.from(
        new Set(
            source
                .map((item) => {
                    if (typeof item === 'string') {
                        const trimmed = normalize(item)
                        return trimmed.length ? trimmed : null
                    }
                    if (item && typeof item === 'object') {
                        const record = item as Record<string, unknown>
                        const candidates = [record.tag, record.name, record.label, record.id]
                        for (const candidate of candidates) {
                            if (typeof candidate === 'string') {
                                const trimmed = normalize(candidate)
                                if (trimmed.length) {
                                    return trimmed
                                }
                            }
                        }
                    }
                    return null
                })
                .filter((tag): tag is string => tag !== null)
        )
    )
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
        image_url: toNullableString(
            record.image_url ??
                record.main_image_url ??
                (typeof record.image === 'string' ? record.image : null) ??
                (record.image && typeof record.image === 'object'
                    ? (record.image as Record<string, unknown>).url
                    : null)
        ),
        has_main_image: toBoolean(record.has_main_image ?? record.hasMainImage ?? record.main_image_exists),
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
        tags: mapTagList(record.tags ?? record.event_tags ?? record.teaser_tags ?? []),
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

const ensureEventImageDetails = async (current: EventDetail) => {
    if (!current.has_main_image || current.id == null) {
        return
    }

    const hasPreviewData = current.image_id !== null || (current.image_url != null && current.image_url !== '')
    if (hasPreviewData) {
        return
    }

    try {
        const { data } = await apiFetch<unknown>(`/api/admin/event/${current.id}/image`)
        const imageDetails = mapEventImage(data)
        if (!imageDetails) {
            return
        }

        const updated: EventDetail = {
            ...current,
            image_id: imageDetails.id ?? current.image_id ?? null,
            image_focus_x: imageDetails.focusX ?? current.image_focus_x,
            image_focus_y: imageDetails.focusY ?? current.image_focus_y,
            image_license_id: imageDetails.licenseId ?? current.image_license_id,
            image_alt_text: imageDetails.altText ?? current.image_alt_text,
            image_copyright: imageDetails.copyright ?? current.image_copyright,
            image_created_by: imageDetails.createdBy ?? current.image_created_by,
            image_url: imageDetails.url ?? current.image_url ?? null,
        }

        event.value = updated

        if (imageDetails.altText != null) {
            imageAltText.value = imageDetails.altText
        }
        if (imageDetails.copyright != null) {
            imageCopyright.value = imageDetails.copyright
        }
        if (imageDetails.licenseId != null) {
            imageLicense.value = imageDetails.licenseId
        }
        if (imageDetails.createdBy != null) {
            imageCreatedBy.value = imageDetails.createdBy
        }
    } catch (err) {
        console.error('Failed to load event image details', err)
    }
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

        await ensureEventImageDetails(mapped)
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

.event-map-wrapper {
  width: 100%;          // or a fixed width
}

.event-map {
  width: 100%;
  height: 100%;         // fill the wrapper
}

@media (min-width: 640px) {
    .event-page {
        gap: clamp(1.25rem, 3vw, 2rem);
        padding: 0 clamp(1.5rem, 5vw, 3rem);
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

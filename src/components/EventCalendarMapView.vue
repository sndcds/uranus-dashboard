<template>
    <div class="calendar-map-view">
        <div v-if="isLoading" class="calendar-map-view__state">
            {{ loadingLabel }}
        </div>
        <div v-else-if="loadError" class="calendar-map-view__state calendar-map-view__state--error">
            {{ loadError }}
        </div>
        <div v-else-if="!hasFeatures" class="calendar-map-view__state">
            {{ emptyLabel }}
        </div>
        <LibreMap v-else :data="geojsonData" class="calendar-map-view__map" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Feature, FeatureCollection, Point } from 'geojson'

import LibreMap from '@/components/LibreMap.vue'

interface CalendarEventType {
    type_name: string
}

interface CalendarEvent {
    id: number
    event_date_id: number
    title: string
    start_date: string
    start_time: string | null
    venue_name: string | null
    venue_city: string | null
    venue_street: string | null
    venue_house_number: string | null
    venue_postal_code: string | null
    venue_country?: string | null
    event_types: CalendarEventType[] | null
    organizer_name: string | null
    geometry?: unknown
    geojson?: unknown
    venue_geometry?: unknown
    venue_lat?: number | null
    venue_lon?: number | null
}

interface AugmentedEvent extends CalendarEvent {
    startDateTime: number
    typeLabels: string[]
    renderKey: string
}

const props = defineProps<{
    isLoading: boolean
    loadError: string | null
    filteredEvents: AugmentedEvent[]
}>()

defineEmits<{
    filterByTag: [tag: string]
}>()

const { t } = useI18n({ useScope: 'global' })

const loadingLabel = computed(() => t('events_calendar_loading'))
const emptyLabel = computed(() => t('events_calendar_empty'))

const mapFeatures = computed(() => {
    return props.filteredEvents
        .map((event) => buildFeature(event))
        .filter((feature): feature is Feature<Point> => Boolean(feature))
})

const geojsonData = computed<FeatureCollection<Point>>(() => ({
    type: 'FeatureCollection',
    features: mapFeatures.value
}))

const hasFeatures = computed(() => mapFeatures.value.length > 0)

const buildFeature = (event: AugmentedEvent): Feature<Point> | null => {
    const geometry = extractGeometry(event)
    if (!geometry) return null

    return {
        type: 'Feature',
        geometry,
        properties: {
            event_id: event.id,
            event_date_id: event.event_date_id,
            event_title: event.title,
            title: event.title,
            start_date: event.start_date,
            start_time: event.start_time,
            venue_name: event.venue_name,
            venue_city: event.venue_city,
            venue_address: buildAddress(event),
            venue_postal_code: event.venue_postal_code,
            venue_country: event.venue_country,
            organizer_name: event.organizer_name,
            event_types: (event.event_types ?? []).map((type) => type.type_name).filter(Boolean),
        }
    }
}

const buildAddress = (event: CalendarEvent) => {
    const streetParts = [event.venue_street, event.venue_house_number].filter(Boolean)
    const cityParts = [event.venue_postal_code, event.venue_city].filter(Boolean)
    return [streetParts.join(' '), cityParts.join(' ')].filter((part) => part.length > 0).join(', ')
}

const extractGeometry = (event: CalendarEvent): Point | null => {
    const attempts = [
        event.geometry,
        event.geojson,
        event.venue_geometry,
    ]

    for (const candidate of attempts) {
        const point = normalizePoint(candidate)
        if (point) {
            return point
        }
    }

    const lat = normalizeNumber(event.venue_lat)
    const lon = normalizeNumber(event.venue_lon)
    if (lat !== null && lon !== null) {
        return {
            type: 'Point',
            coordinates: [lon, lat]
        }
    }

    return null
}

const normalizePoint = (input: unknown): Point | null => {
    if (!input) return null

    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input)
            return normalizePoint(parsed)
        } catch {
            return null
        }
    }

    if (typeof input === 'object') {
        const reference = input as Record<string, unknown>

        if (reference.type === 'Feature' && reference.geometry) {
            return normalizePoint(reference.geometry)
        }

        if (reference.type === 'Point' && Array.isArray(reference.coordinates)) {
            const [lon, lat] = reference.coordinates
            const normalizedLon = normalizeNumber(lon)
            const normalizedLat = normalizeNumber(lat)

            if (normalizedLon !== null && normalizedLat !== null) {
                return {
                    type: 'Point',
                    coordinates: [normalizedLon, normalizedLat],
                }
            }
        }
    }

    return null
}

const normalizeNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string' && value.trim().length > 0) {
        const parsed = Number(value)
        if (!Number.isNaN(parsed)) {
            return parsed
        }
    }
    return null
}
</script>

<style scoped>
.calendar-map-view {
    border-radius: 12px;
    overflow: hidden;
    background: var(--card-bg, #fff);
    border: 1px solid var(--border-soft);
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 480px;
}

.calendar-map-view__state {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    font-size: 1rem;
    color: var(--uranus-muted-text);
    text-align: center;
}

.calendar-map-view__state--error {
    color: #c62828;
}

.calendar-map-view__map {
    flex: 1;
    min-height: 100%;
    height: 100%;
}
</style>

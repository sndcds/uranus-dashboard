<template>
    <div class="calendar-page">
        <div class="calendar-view-toggle">
            <button type="button" class="calendar-toggle-btn" :class="{ 'is-active': currentView === 'detailed' }"
                @click="currentView = 'detailed'">
                {{ detailedViewLabel }}
            </button>
            <button type="button" class="calendar-toggle-btn" :class="{ 'is-active': currentView === 'compact' }"
                @click="currentView = 'compact'">
                {{ compactViewLabel }}
            </button>
            <button type="button" class="calendar-toggle-btn" :class="{ 'is-active': currentView === 'tiles' }"
                @click="currentView = 'tiles'">
                {{ tilesViewLabel }}
            </button>
            <button type="button" class="calendar-toggle-btn" :class="{ 'is-active': currentView === 'map' }"
                @click="currentView = 'map'">
                {{ t('events_calendar_map_view') }}
            </button>
        </div>

        <ul class="calendar-event-types-list">
            <li>
                <button @click="filterByType('all')" :class="{ 'is-active': activeSelectedType === 'all' }">
                    {{ allEventsLabel }} ({{ allEventsCount }})
                </button>
            </li>
            <li v-for="type in typeCountOptions" :key="type.type_id">
                <button @click="filterByType(type.type_id)"
                    :class="{ 'is-active': activeSelectedType === type.type_id }">
                    {{ type.type_name }} ({{ type.count }})
                </button>
            </li>
        </ul>

        <div v-if="currentView === 'detailed'" class="calendar-grouping-toggle">
            <button type="button" class="calendar-grouping-btn" :class="{ 'is-active': groupingMode === 'daily' }"
                @click="groupingMode = 'daily'">
                {{ dailyGroupingLabel }}
            </button>
            <button type="button" class="calendar-grouping-btn" :class="{ 'is-active': groupingMode === 'monthly' }"
                @click="groupingMode = 'monthly'">
                {{ monthlyGroupingLabel }}
            </button>
        </div>

        <div class="calendar-body" :class="{
            'calendar-body--detailed': currentView === 'detailed',
            'calendar-body--compact': currentView === 'compact',
            'calendar-body--tiles': currentView === 'tiles',
            'calendar-body--map': currentView === 'map'
        }">
            <EventCalendarSidebar
                :search-id="`calendar-search-${currentView}`"
                :date-id="`calendar-date-${currentView}`"
                :end-date-id="`calendar-end-date-${currentView}`"
                :address-search-id="`calendar-address-search-${currentView}`"
                :search-query="searchQuery"
                :selected-date="selectedDate"
                :selected-end-date="selectedEndDate"
                :temp-start-date="tempStartDate"
                :temp-end-date="tempEndDate"
                :is-loading="isLoading"
                :filters-active="filtersActive"
                :show-my-location="showMyLocation"
                :location-radius="locationRadius"
                :is-geocoding-loading="isGeocodingLoading"
                :user-latitude="userLatitude"
                :venue-count-options="venueCountOptions"
                :selected-venue="selectedVenue"
                @update:search-query="searchQuery = $event"
                @update:show-my-location="setShowMyLocation"
                @update:location-radius="locationRadius = $event"
                @radius-slide-start="isRadiusSliding = true"
                @radius-slide-end="onRadiusSlideEnd"
                @date-confirm="onDateConfirm"
                @clear-date-filters="clearDateFilters"
                @reset-filters="resetFilters"
                @address-search="onAddressSearch"
                @selected-venue="onSelectedVenue"
            />

            <EventCalendarDetailedView v-if="currentView === 'detailed'" :is-loading="isLoading" :load-error="loadError"
                :grouped-events="groupedEvents" :selected-type="selectedType"
                :is-monthly-grouping="groupingMode === 'monthly'" :format-time="formatTime"
                :format-location="formatLocation" :format-event-date="formatEventDate" @filter-by-tag="filterByTag" />

            <EventCalendarCompactView v-else-if="currentView === 'compact'" :is-loading="isLoading"
                :load-error="loadError" :filtered-events="filteredEvents" :selected-type="selectedType"
                :format-time="formatTime" :format-compact-date="formatCompactDate" :format-location="formatLocation"
                @filter-by-tag="filterByTag" />

            <EventCalendarTilesView v-else-if="currentView === 'tiles'" :is-loading="isLoading" :load-error="loadError"
                :filtered-events="filteredEvents" :format-time="formatTime" :format-number-date="formatNumberDate" />

            <EventCalendarMapView v-else-if="currentView === 'map'" :is-loading="isLoading" :load-error="loadError"
                :filtered-events="filteredEvents" :format-time="formatTime" :format-location="formatLocation"
                @filter-by-tag="filterByTag" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch, fetchCoordinatesForAddress } from '@/api'
import { useAppStore, type EventVenueSummary } from '@/store/appStore'

import EventCalendarSidebar from '@/components/EventCalendarSidebar.vue'
import EventCalendarDetailedView from '@/components/EventCalendarDetailedView.vue'
import EventCalendarCompactView from '@/components/EventCalendarCompactView.vue'
import EventCalendarTilesView from '@/components/EventCalendarTilesView.vue'
import EventCalendarMapView from '@/components/EventCalendarMapView.vue'

interface CalendarEventType {
    genre_id: number | null
    genre_name: string | null
    type_id: number
    type_name: string
}

interface EventTypeSummary {
    type_id: number
    type_name: string
    count: number
}

interface EventsResponse {
    events: CalendarEvent[]
    total: number
    type_summary: EventTypeSummary[]
    venues_summary: EventVenueSummary[]
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
    venue_lat?: number | null
    venue_lon?: number | null
    venue_geometry?: unknown
    geometry?: unknown
    geojson?: unknown
}

interface GroupedEvents {
    date: string
    formattedDate: string
    weekday: string
    events: AugmentedEvent[]
}

interface AugmentedEvent extends CalendarEvent {
    startDateTime: number
    typeLabels: string[]
}

const { t, locale } = useI18n({ useScope: 'global' })
const appStore = useAppStore()

const events = ref<AugmentedEvent[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const typeCountOptions = ref<EventTypeSummary[]>([])
const venueCountOptions = ref<EventVenueSummary[]>([])
const isInitialLoadComplete = ref(false)
const suspendDateWatcher = ref(false)
const suspendShowMyLocationWatcher = ref(false)
const activeSelectedType = ref<number | string | null>('all')
const allEventsCount = ref(0)
const pendingTypeFilterId = ref<number | string | null>(null)
let isRestoringFilters = false

const searchQuery = ref('')
const selectedType = ref<'all' | string>('all')
const selectedVenue = ref<EventVenueSummary | null>(null)
const selectedDate = ref<string | null>(null)
const selectedEndDate = ref<string | null>(null)
const showMyLocation = ref(false)
const userLatitude = ref<number | null>(null)
const userLongitude = ref<number | null>(null)
const locationRadius = ref(25) // Default 25km
const isGeocodingLoading = ref(false)
const isRadiusSliding = ref(false)

// Use appStore for persisted state
const currentView = computed({
    get: () => appStore.eventViewMode,
    set: (value) => appStore.setViewMode(value)
})

const groupingMode = computed({
    get: () => appStore.eventGroupingMode,
    set: (value) => appStore.setGroupingMode(value)
})

const apiMode = computed(() => (currentView.value === 'map' ? 'geometry' : 'basic'))

const normalizeDateValue = (value: string | null) => {
    if (value === null || value === undefined) {
        return null
    }

    const trimmed = value.trim()
    return trimmed.length ? trimmed : null
}

const today = new Date()

const intlDate = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})

const intlDateCompact = new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
})

const intlWeekday = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
})

const intlTime = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
})

const detailedViewLabel = computed(() => t('events_calendar_detailed_view'))
const compactViewLabel = computed(() => t('events_calendar_compact_view'))
const tilesViewLabel = computed(() => t('events_calendar_tiles_view'))
const dailyGroupingLabel = computed(() => t('events_calendar_daily_grouping'))
const monthlyGroupingLabel = computed(() => t('events_calendar_monthly_grouping'))
const allEventsLabel = computed(() => t('events_calendar_all_events'))

// Date field behaviour
const tempStartDate = ref<string | null>(null)
const tempEndDate = ref<string | null>(null)

watch(selectedDate, (val) => { tempStartDate.value = val })
watch(selectedEndDate, (val) => { tempEndDate.value = val })

const onDateConfirm = async (which: 'start' | 'end', event: Event) => {
    // When user presses Enter or finishes input (onchange/onblur)
    const target = event.target as HTMLInputElement
    const value = target.value || null

    // Check if value actually changed to prevent duplicate calls
    const currentValue = which === 'start' ? selectedDate.value : selectedEndDate.value
    if (currentValue === value) {
        return // No change, skip
    }

    // Update the date value with watcher suspended to avoid double trigger
    withDateWatcherSuspended(() => {
        if (which === 'start') {
            selectedDate.value = value
        } else {
            selectedEndDate.value = value
        }
    })

    // Trigger reload explicitly
    await loadEvents({ preserveSelection: true })
}

const filterByTag = (tag: string) => {
    const normalized = tag?.trim()
    if (!normalized) return

    if (selectedType.value === normalized) {
        selectedType.value = 'all'
    } else {
        selectedType.value = normalized
    }
}

const withDateWatcherSuspended = (fn: () => void) => {
    if (suspendDateWatcher.value) {
        fn()
        return
    }

    suspendDateWatcher.value = true
    try {
        fn()
    } finally {
        void nextTick(() => {
            suspendDateWatcher.value = false
        })
    }
}

const withShowMyLocationWatcherSuspended = (fn: () => void) => {
    if (suspendShowMyLocationWatcher.value) {
        fn()
        return
    }

    suspendShowMyLocationWatcher.value = true
    try {
        fn()
    } finally {
        void nextTick(() => {
            suspendShowMyLocationWatcher.value = false
        })
    }
}

const clearDateFilters = (options?: { silent?: boolean }) => {
    if (options?.silent) {
        withDateWatcherSuspended(() => {
            selectedDate.value = null
            selectedEndDate.value = null
        })
        return
    }

    selectedDate.value = null
    selectedEndDate.value = null
}

const ensureDatesWithinRange = () => {
    // No longer limiting dates to available range - let user enter any date
    return
}

const availableDates = computed(() => {
    const unique = new Set<string>()
    for (const event of events.value) {
        if (event.start_date) {
            unique.add(event.start_date)
        }
    }
    return Array.from(unique).sort()
})

const computeRequestDateRange = () => {
    const normalizedStart = normalizeDateValue(selectedDate.value)
    const normalizedEnd = normalizeDateValue(selectedEndDate.value)

    if (!normalizedStart && !normalizedEnd) {
        return null
    }

    // Only return what's actually set
    const result: { start?: string; end?: string } = {}

    if (normalizedStart) {
        result.start = normalizedStart
    }

    if (normalizedEnd) {
        result.end = normalizedEnd
    }

    return result
}

const buildApiEndpoint = (path: string, additionalParams?: Record<string, string>) => {
    const range = computeRequestDateRange()
    const params = new URLSearchParams({ mode: apiMode.value, lang: locale.value })

    if (range) {
        if (range.start) {
            params.set('start', range.start)
        }
        if (range.end) {
            params.set('end', range.end)
        }
    }

    // Add search query if present
    if (searchQuery.value.trim()) {
        params.set('search', searchQuery.value.trim())
    }

    if (selectedVenue.value?.id) {
        params.set('venues', String(selectedVenue.value.id))
    }

    // Add location coordinates and radius if available (from either geolocation or address search)
    if (userLatitude.value !== null && userLongitude.value !== null) {
        params.set('lat', userLatitude.value.toString())
        params.set('lon', userLongitude.value.toString())
        // Convert radius from kilometers to meters
        params.set('radius', (locationRadius.value * 1000).toString())
    }

    // Add any additional parameters
    if (additionalParams) {
        Object.entries(additionalParams).forEach(([key, value]) => {
            params.set(key, value)
        })
    }

    return `${path}?${params.toString()}`
}

interface LoadEventsOptions {
    preserveSelection?: boolean
}

const filtersActive = computed(() => {
    return Boolean(
        searchQuery.value ||
        selectedDate.value ||
        selectedEndDate.value ||
        (selectedType.value !== 'all') ||
        selectedVenue.value
    )
})

const filteredEvents = computed(() => {
    let list = [...events.value]

    // Filter by type in frontend (search is now done by API)
    if (selectedType.value !== 'all') {
        list = list.filter((event) => event.typeLabels.includes(selectedType.value as string))
    }

    return list.sort((a, b) => a.startDateTime - b.startDateTime)
})

const groupedEvents = computed<GroupedEvents[]>(() => {
    if (groupingMode.value === 'monthly') {
        return groupedEventsByMonth.value
    }

    const map = new Map<string, AugmentedEvent[]>()

    for (const event of filteredEvents.value) {
        const key = event.start_date
        if (!map.has(key)) {
            map.set(key, [])
        }
        map.get(key)!.push(event)
    }

    const groups: GroupedEvents[] = []
    for (const [date, groupEvents] of map.entries()) {
        const parsedDate = parseISODate(date)
        groups.push({
            date,
            formattedDate: parsedDate ? intlDate.format(parsedDate) : date,
            weekday: parsedDate ? capitalize(intlWeekday.format(parsedDate)) : '',
            events: groupEvents,
        })
    }

    return groups.sort((a, b) => a.date.localeCompare(b.date))
})

const groupedEventsByMonth = computed<GroupedEvents[]>(() => {
    const map = new Map<string, AugmentedEvent[]>()

    for (const event of filteredEvents.value) {
        const parsedDate = parseISODate(event.start_date)
        if (!parsedDate) continue

        // Group by year-month (e.g., "2025-11")
        const key = `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`
        if (!map.has(key)) {
            map.set(key, [])
        }
        map.get(key)!.push(event)
    }

    const intlMonth = new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'long' })
    const groups: GroupedEvents[] = []

    for (const [monthKey, groupEvents] of map.entries()) {
        const [year, month] = monthKey.split('-').map(Number)
        if (!year || !month) continue
        const firstDayOfMonth = new Date(year, month - 1, 1)

        groups.push({
            date: monthKey,
            formattedDate: intlMonth.format(firstDayOfMonth),
            weekday: '', // Not applicable for monthly grouping
            events: groupEvents,
        })
    }

    return groups.sort((a, b) => a.date.localeCompare(b.date))
})

const parseISODate = (input: string | null) => {
    if (!input) return null
    const [year, month, day] = input.split('-').map(Number)
    if (!year || !month || !day) return null
    return new Date(year, month - 1, day)
}

const buildStartDateTime = (date: string, time: string | null) => {
    const parsedDate = parseISODate(date)
    if (!parsedDate) return Number.MAX_SAFE_INTEGER
    if (time) {
        const [hoursRaw, minutesRaw] = time.split(':')
        const hours = Number(hoursRaw)
        const minutes = Number(minutesRaw)
        const safeHours = Number.isNaN(hours) ? 0 : hours
        const safeMinutes = Number.isNaN(minutes) ? 0 : minutes
        parsedDate.setHours(safeHours, safeMinutes, 0, 0)
    }
    return parsedDate.getTime()
}

const formatTime = (date: string, time: string | null) => {
    if (!time) return t('events_calendar_time_all_day')
    const parsedDate = parseISODate(date)
    if (!parsedDate) return time
    const [hoursRaw, minutesRaw] = time.split(':')
    const hours = Number(hoursRaw)
    const minutes = Number(minutesRaw)
    const safeHours = Number.isNaN(hours) ? 0 : hours
    const safeMinutes = Number.isNaN(minutes) ? 0 : minutes
    parsedDate.setHours(safeHours, safeMinutes, 0, 0)
    return intlTime.format(parsedDate)
}

const formatCompactDate = (date: string) => {
    const parsedDate = parseISODate(date)
    if (!parsedDate) return date
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const eventDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())

    if (eventDate.getTime() === today.getTime()) {
        return t('events_calendar_today')
    }

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (eventDate.getTime() === tomorrow.getTime()) {
        return t('events_calendar_tomorrow')
    }

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (eventDate.getTime() === yesterday.getTime()) {
        return t('events_calendar_yesterday')
    }

    return intlDateCompact.format(parsedDate)
}

const formatNumberDate = (date: string, locale = navigator.language) => {
    const parsedDate = parseISODate(date)
    if (!parsedDate) return date

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const eventDate = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())

    const tDate = (d: Date) => d.getTime()

    if (tDate(eventDate) === tDate(today)) return t('events_calendar_today')

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    if (tDate(eventDate) === tDate(tomorrow)) return t('events_calendar_tomorrow')

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (tDate(eventDate) === tDate(yesterday)) return t('events_calendar_yesterday')

    // Use Intl.DateTimeFormat with numeric month
    const formatter = new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',  // numeric month with leading zero
        day: '2-digit',
    })

    return formatter.format(parsedDate)
}

const formatEventDate = (date: string) => {
    const parsedDate = parseISODate(date)
    if (!parsedDate) return date

    const formatter = new Intl.DateTimeFormat(locale.value, {
        day: 'numeric',
        month: 'short'
    })

    return formatter.format(parsedDate)
}

const formatLocation = (event: CalendarEvent) => {
    const parts = [event.venue_name, event.venue_city]
    return parts.filter(Boolean).join(' · ')
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const resetFilters = () => {
    searchQuery.value = ''
    selectedType.value = 'all'
    selectedVenue.value = null
    clearDateFilters()
    setShowMyLocation(false)
    userLatitude.value = null
    userLongitude.value = null
}

const setShowMyLocation = (value: boolean, options?: { silent?: boolean }) => {
    if (options?.silent) {
        withShowMyLocationWatcherSuspended(() => {
            showMyLocation.value = value
        })
        return
    }

    showMyLocation.value = value
}

const applyFiltersFromStore = () => {
    const saved = appStore.calendarFilters
    if (!saved) {
        return
    }

    isRestoringFilters = true
    try {
        searchQuery.value = saved.searchQuery ?? ''
        withDateWatcherSuspended(() => {
            selectedDate.value = saved.selectedDate
            selectedEndDate.value = saved.selectedEndDate
        })
        selectedType.value = saved.selectedType ?? 'all'
        activeSelectedType.value = saved.activeSelectedType ?? 'all'
        selectedVenue.value = saved.selectedVenue ? { ...saved.selectedVenue } : null
        setShowMyLocation(Boolean(saved.showMyLocation), { silent: true })
        userLatitude.value = saved.userLatitude
        userLongitude.value = saved.userLongitude
        locationRadius.value = saved.locationRadius ?? 25
    } finally {
        isRestoringFilters = false
    }

    if (saved.activeSelectedType !== null && saved.activeSelectedType !== 'all') {
        pendingTypeFilterId.value = saved.activeSelectedType
    }
}

applyFiltersFromStore()

const hydrateEvents = (payload: CalendarEvent[]): AugmentedEvent[] => {
    return payload.map((event) => {
        const typeLabels = Array.from(
            new Set((event.event_types ?? []).map((type) => type.type_name).filter((name): name is string => Boolean(name)))
        )
        const startDateTime = buildStartDateTime(event.start_date, event.start_time)
        return {
            ...event,
            typeLabels,
            startDateTime,
        }
    })
}

const setInitialDate = () => {
    clearDateFilters({ silent: true })
}

const setActiveSelectedType = (typeId: number | string) => {
    activeSelectedType.value = typeId
}

const filterByType = async (typeId: number | string) => {
    // Handle "all" case
    if (typeId === 'all') {
        setActiveSelectedType('all')
        selectedType.value = 'all'

        isLoading.value = true
        loadError.value = null

        try {
            const endpoint = buildApiEndpoint('/api/events')
            const { data } = await apiFetch<EventsResponse>(endpoint)

            if (data) {
                events.value = hydrateEvents(Array.isArray(data.events) ? data.events : [])
                allEventsCount.value = data.total
                typeCountOptions.value = data.type_summary || []
                venueCountOptions.value = data.venues_summary || []
            }
        } catch (error: unknown) {
            loadError.value =
                error instanceof Error && error.message
                    ? error.message
                    : t('events_calendar_load_error')
        } finally {
            isLoading.value = false
        }
        return
    }

    // Handle specific type case
    const typeOption = typeCountOptions.value.find((type) => type.type_id === typeId)
    if (!typeOption) return

    setActiveSelectedType(typeId)

    isLoading.value = true
    loadError.value = null

    try {
        const endpoint = buildApiEndpoint('/api/events', { event_type: String(typeId) })
        const { data } = await apiFetch<EventsResponse>(endpoint)

        if (data) {
            events.value = hydrateEvents(Array.isArray(data.events) ? data.events : [])
            allEventsCount.value = data.total
            typeCountOptions.value = data.type_summary || []
            venueCountOptions.value = data.venues_summary || []
        }

        // Update selected type
        selectedType.value = typeOption.type_name
    } catch (error: unknown) {
        loadError.value =
            error instanceof Error && error.message
                ? error.message
                : t('events_calendar_load_error')
    } finally {
        isLoading.value = false
    }
}

const onSelectedVenue = async (venue: EventVenueSummary | number | string | null) => {
    let resolvedVenue: EventVenueSummary | null = null

    if (venue && typeof venue === 'object') {
        resolvedVenue = venue
    } else if (venue !== null && venue !== undefined) {
        const venueId = Number(venue)
        if (!Number.isNaN(venueId)) {
            resolvedVenue = venueCountOptions.value.find((item) => item.id === venueId) ?? null
        }
    }

    const currentId = selectedVenue.value?.id ?? null
    const nextId = resolvedVenue?.id ?? null

    if (currentId === nextId) {
        selectedVenue.value = null
    } else {
        selectedVenue.value = resolvedVenue
    }

    await loadEvents({ preserveSelection: true })
}

const loadEvents = async (options: LoadEventsOptions = {}) => {
    const { preserveSelection = false } = options
    isLoading.value = true
    loadError.value = null

    try {
        const endpoint = buildApiEndpoint('/api/events')
        const { data } = await apiFetch<EventsResponse>(endpoint)

        if (data) {
            events.value = hydrateEvents(Array.isArray(data.events) ? data.events : [])
            allEventsCount.value = data.total
            typeCountOptions.value = data.type_summary || []
            venueCountOptions.value = data.venues_summary || []
        }

        if (!preserveSelection) {
            setInitialDate()
        }
    } catch (error: unknown) {
        loadError.value =
            error instanceof Error && error.message
                ? error.message
                : t('events_calendar_load_error')
    } finally {
        isLoading.value = false
        if (!preserveSelection && !isInitialLoadComplete.value) {
            isInitialLoadComplete.value = true
        }
    }
}

onMounted(async () => {
    await loadEvents()

    if (pendingTypeFilterId.value !== null && pendingTypeFilterId.value !== 'all') {
        await filterByType(pendingTypeFilterId.value)
    }

    pendingTypeFilterId.value = null
})

const getUserLocation = () => {
    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by this browser'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                })
            },
            (error) => {
                reject(error)
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000 // Cache for 5 minutes
            }
        )
    })
}

type AddressSearchPayload = string | { query: string; disableMyLocation?: boolean }

const onAddressSearch = async (payload: AddressSearchPayload) => {
    isGeocodingLoading.value = true
    loadError.value = null

    const rawQuery = typeof payload === 'string' ? payload : payload.query
    const disableMyLocation = typeof payload === 'string' ? false : Boolean(payload.disableMyLocation)

    const query = rawQuery?.trim() ?? ''
    if (!query) {
        isGeocodingLoading.value = false
        return
    }

    try {
        const result = await fetchCoordinatesForAddress(query, 1)
        
        if (!result) {
            loadError.value = t('events_calendar_address_not_found')
            return
        }

        if (disableMyLocation && showMyLocation.value) {
            setShowMyLocation(false, { silent: true })
        }

        // Set coordinates from geocoding result
        userLatitude.value = parseFloat(result.lat)
        userLongitude.value = parseFloat(result.lon)

        // Reload events with new coordinates
        await loadEvents({ preserveSelection: true })
    } catch (error) {
        console.error('Geocoding error:', error)
        loadError.value = error instanceof Error
            ? `Geocoding failed: ${error.message}`
            : 'Failed to geocode address'
    } finally {
        isGeocodingLoading.value = false
    }
}

const onRadiusSlideEnd = async () => {
    isRadiusSliding.value = false
    
    // Trigger reload if we have coordinates
    if (userLatitude.value !== null && userLongitude.value !== null) {
        await loadEvents({ preserveSelection: true })
    }
}

watch(locale, () => {

})

watch(
    [
        searchQuery,
        selectedDate,
        selectedEndDate,
        selectedType,
        activeSelectedType,
        selectedVenue,
        showMyLocation,
        userLatitude,
        userLongitude,
        locationRadius,
    ],
    () => {
        if (isRestoringFilters) return
        appStore.updateCalendarFilters({
            searchQuery: searchQuery.value,
            selectedDate: selectedDate.value,
            selectedEndDate: selectedEndDate.value,
            selectedType: selectedType.value,
            activeSelectedType: activeSelectedType.value,
            selectedVenue: selectedVenue.value ? { ...selectedVenue.value } : null,
            showMyLocation: showMyLocation.value,
            userLatitude: userLatitude.value,
            userLongitude: userLongitude.value,
            locationRadius: locationRadius.value,
        })
    }
)

watch(currentView, async () => {
    if (!isInitialLoadComplete.value) return
    await loadEvents({ preserveSelection: true })
})

watch(searchQuery, async (newQuery, oldQuery) => {
    if (!isInitialLoadComplete.value) return

    // Debounce might be nice here, but for now reload immediately
    if (newQuery.trim() !== oldQuery.trim()) {
        await loadEvents({ preserveSelection: true })
    }
})

watch(showMyLocation, async (enabled) => {
    if (!isInitialLoadComplete.value) return
    if (suspendShowMyLocationWatcher.value) return

    if (enabled) {
        try {
            const location = await getUserLocation()
            userLatitude.value = location.latitude
            userLongitude.value = location.longitude
            await loadEvents({ preserveSelection: true })
        } catch (error) {
            console.error('Failed to get user location:', error)
            // Reset toggle if location access fails
            setShowMyLocation(false, { silent: true })

            // Optionally show error message to user
            loadError.value = error instanceof Error
                ? `Location access denied: ${error.message}`
                : 'Failed to get your location'
        }
    } else {
        // When toggle is off, keep coordinates from address search if they exist
        // Only reload if we previously had geolocation enabled
        if (userLatitude.value !== null && userLongitude.value !== null) {
            await loadEvents({ preserveSelection: true })
        }
    }
})

watch(locationRadius, async () => {
    // Only reload if we have coordinates (from either geolocation or address search)
    if (!isInitialLoadComplete.value) return
    if (userLatitude.value === null || userLongitude.value === null) return
    // Don't reload while user is still sliding
    if (isRadiusSliding.value) return
    await loadEvents({ preserveSelection: true })
})

watch(
    [selectedDate, selectedEndDate],
    async ([start, end], [prevStart, prevEnd]) => {
        if (!isInitialLoadComplete.value || suspendDateWatcher.value) {
            return
        }

        let nextStart = normalizeDateValue(start)
        let nextEnd = normalizeDateValue(end)
        const prevNormalizedStart = normalizeDateValue(prevStart)
        const prevNormalizedEnd = normalizeDateValue(prevEnd)

        if (start !== nextStart) {
            withDateWatcherSuspended(() => {
                selectedDate.value = nextStart
            })
        }

        if (end !== nextEnd) {
            withDateWatcherSuspended(() => {
                selectedEndDate.value = nextEnd
            })
        }

        if (nextStart && nextEnd && nextEnd < nextStart) {
            withDateWatcherSuspended(() => {
                selectedEndDate.value = nextStart!
            })
            nextEnd = nextStart
        }

        if (nextStart === prevNormalizedStart && nextEnd === prevNormalizedEnd) {
            return
        }

        await loadEvents({ preserveSelection: true })
    }
)
</script>

<style scoped lang="scss">
.calendar-event-types-list {
    list-style: none;
    padding: 0;
    margin: 0 0 clamp(1rem, 2.5vw, 1.5rem) 0;
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;

    li button {
        padding: 0.4rem 0.75rem;
        border: 1px solid var(--border-soft);
        background: var(--card-bg, #fff);
        color: var(--muted-text);
        border-radius: 6px;
        font-size: 0.85rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
    }

    .is-active {
        background: #285ff6;
        color: white;
        border-color: #285ff6;
    }
}

.calendar-page {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2.25rem);
    max-width: 1920px;
    width: 100%;
    margin: 0 auto;
}

.calendar-view-toggle {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.calendar-toggle-btn {
    padding: 0.5rem 1rem;
    border: 2px solid var(--accent-primary);
    background: transparent;
    color: var(--accent-primary);
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
}

.calendar-toggle-btn:hover {
    background: rgba(79, 70, 229, 0.1);
}

.calendar-toggle-btn.is-active {
    background: var(--uranus-brand-color);
    color: white;
}

.calendar-grouping-toggle {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

.calendar-grouping-btn {
    padding: 0.4rem 0.85rem;
    border: 1px solid var(--border-soft);
    background: var(--card-bg, #fff);
    color: var(--muted-text);
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
}

.calendar-grouping-btn:hover {
    background: var(--input-bg);
    border-color: var(--accent-primary);
    color: var(--text-primary);
}

.calendar-grouping-btn.is-active {
    background: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
}

.calendar-body {
    display: grid;
    grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
    gap: clamp(1.5rem, 3vw, 2.25rem);
    align-items: start;
}

@media (max-width: 900px) {
    .calendar-body {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>

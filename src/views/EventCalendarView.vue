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
        </div>

        <ul class="calendar-event-types-list">
            <li>
                <button @click="filterByType('all')" :class="{ 'is-active': activeSelectedType === 'all' }">{{
                    allEventsLabel }} ({{ allEventsCount }})</button>
            </li>
            <li v-for="type in typeCountOptions" :key="type.id">
                <button @click="filterByType(type.id)" :class="{ 'is-active': activeSelectedType === type.id }">{{
                    type.name }} ({{ type.count }})</button>
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
            'calendar-body--tiles': currentView === 'tiles'
        }">
            <EventCalendarSidebar :search-id="`calendar-search-${currentView}`"
                :date-id="`calendar-date-${currentView}`" :end-date-id="`calendar-end-date-${currentView}`"
                :search-query="searchQuery" :selected-date="selectedDate" :selected-end-date="selectedEndDate"
                :temp-start-date="tempStartDate" :temp-end-date="tempEndDate" :is-loading="isLoading"
                :last-available-date="lastAvailableDate" :first-available-date="firstAvailableDate"
                :filters-active="filtersActive" @update:search-query="searchQuery = $event"
                @date-confirm="onDateConfirm" @clear-date-filters="clearDateFilters" @reset-filters="resetFilters" />

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
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useAppStore } from '@/store/appStore'

import EventCalendarSidebar from '@/components/EventCalendarSidebar.vue'
import EventCalendarDetailedView from '@/components/EventCalendarDetailedView.vue'
import EventCalendarCompactView from '@/components/EventCalendarCompactView.vue'
import EventCalendarTilesView from '@/components/EventCalendarTilesView.vue'

interface CalendarEventType {
    genre_id: number | null
    genre_name: string | null
    type_id: number
    type_name: string
}

interface EventTypesCount {
    id: number
    name: string
    count: number
}

interface EventTypesCountResponse {
    result: {
        total: number
        types: EventTypesCount[]
    }
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
const typeCountOptions = ref<EventTypesCount[]>([])
const isInitialLoadComplete = ref(false)
const suspendDateWatcher = ref(false)
const activeSelectedType = ref<number | string | null>(null)

const searchQuery = ref('')
const selectedType = ref<'all' | string>('all')
const selectedDate = ref<string | null>(null)
const selectedEndDate = ref<string | null>(null)

// Use appStore for persisted state
const currentView = computed({
    get: () => appStore.eventViewMode,
    set: (value) => appStore.setViewMode(value)
})

const groupingMode = computed({
    get: () => appStore.eventGroupingMode,
    set: (value) => appStore.setGroupingMode(value)
})

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

const allEventsCount = computed(() => {
    return typeCountOptions.value.reduce((sum, type) => sum + type.count, 0)
})

// Date field behaviour
const tempStartDate = ref<string | null>(null)
const tempEndDate = ref<string | null>(null)

watch(selectedDate, (val) => { tempStartDate.value = val })
watch(selectedEndDate, (val) => { tempEndDate.value = val })

const onDateConfirm = async (which: 'start' | 'end', event: Event) => {
    // When user presses Enter or finishes input (onchange)
    const target = event.target as HTMLInputElement
    const value = target.value || null

    if (which === 'start') {
        selectedDate.value = value
    } else {
        selectedEndDate.value = value
    }

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
    const last = lastAvailableDate.value

    if (!last) {
        return
    }

    withDateWatcherSuspended(() => {
        if (selectedDate.value && selectedDate.value > last) {
            selectedDate.value = last
        }

        if (selectedEndDate.value && selectedEndDate.value > last) {
            selectedEndDate.value = last
        }

        if (selectedDate.value && selectedEndDate.value && selectedEndDate.value < selectedDate.value) {
            selectedEndDate.value = selectedDate.value
        }
    })
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

const firstAvailableDate = computed(() => (availableDates.value.length ? availableDates.value[0] : undefined))
const lastAvailableDate = computed(() => (availableDates.value.length ? availableDates.value[availableDates.value.length - 1] : undefined))

const computeRequestDateRange = () => {
    const normalizedStart = normalizeDateValue(selectedDate.value)
    const normalizedEnd = normalizeDateValue(selectedEndDate.value)
    const startCandidate = normalizedStart ?? normalizedEnd
    const endCandidate = normalizedEnd ?? normalizedStart

    if (!startCandidate && !endCandidate) {
        return null
    }

    const start = startCandidate ?? endCandidate!
    let end = endCandidate ?? start

    if (end < start) {
        end = start
    }

    return { start, end }
}

const buildEventsEndpoint = () => {
    const range = computeRequestDateRange()
    if (!range) {
        return '/api/events'
    }

    const params = new URLSearchParams({ start: range.start, end: range.end })
    return `/api/events?${params.toString()}`
}

interface LoadEventsOptions {
    preserveSelection?: boolean
}

const filtersActive = computed(() => {
    return Boolean(
        searchQuery.value ||
        selectedDate.value ||
        selectedEndDate.value ||
        (selectedType.value !== 'all')
    )
})

const filteredEvents = computed(() => {
    let list = [...events.value]

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        list = list.filter((event) => {
            const fields = [
                event.title,
                event.subtitle ?? '',
                event.teaser_text ?? '',
                event.description ?? '',
                event.organizer_name ?? '',
                event.venue_name ?? '',
                event.venue_city ?? '',
            ]
            return fields.some((field) => field.toLowerCase().includes(query))
        })
    }

    if (selectedType.value !== 'all') {
        list = list.filter((event) => event.typeLabels.includes(selectedType.value as string))
    }

    const startFilter = selectedDate.value
    const endFilter = selectedEndDate.value

    if (startFilter && endFilter) {
        const rangeStart = startFilter
        const rangeEnd = endFilter >= rangeStart ? endFilter : rangeStart
        list = list.filter((event) => event.start_date >= rangeStart && event.start_date <= rangeEnd)
    } else if (startFilter) {
        list = list.filter((event) => event.start_date === startFilter)
    } else if (endFilter) {
        list = list.filter((event) => event.start_date <= endFilter)
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
    clearDateFilters()
}

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
            const params = new URLSearchParams()
            params.set('lang', locale.value)

            const endpoint = `/api/events?${params.toString()}`
            const { data } = await apiFetch<CalendarEvent[]>(endpoint)
            events.value = hydrateEvents(Array.isArray(data) ? data : [])

            ensureDatesWithinRange()
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
    const typeOption = typeCountOptions.value.find((type) => type.id === typeId)
    if (!typeOption) return

    setActiveSelectedType(typeId)

    isLoading.value = true
    loadError.value = null

    try {
        const params = new URLSearchParams()
        params.set('lang', locale.value)
        params.set('event_type', String(typeId))

        const endpoint = `/api/events?${params.toString()}`
        const { data } = await apiFetch<CalendarEvent[]>(endpoint)
        events.value = hydrateEvents(Array.isArray(data) ? data : [])

        // Update selected type
        selectedType.value = typeOption.name

        ensureDatesWithinRange()
    } catch (error: unknown) {
        loadError.value =
            error instanceof Error && error.message
                ? error.message
                : t('events_calendar_load_error')
    } finally {
        isLoading.value = false
    }
}

const loadTypesCount = async () => {
    try {
        const endpoint = `/api/events/types-count?lang=${locale.value}`
        const { data } = await apiFetch<EventTypesCountResponse[]>(endpoint)
        
        // Handle the nested response structure
        if (Array.isArray(data) && data.length > 0) {
            const firstResult = data[0]
            if (firstResult?.result?.types) {
                typeCountOptions.value = firstResult.result.types
            } else {
                typeCountOptions.value = []
            }
        } else {
            typeCountOptions.value = []
        }
    } catch (error) {
        console.error('Failed to load event types count', error)
        typeCountOptions.value = []
    }
}

const loadEvents = async (options: LoadEventsOptions = {}) => {
    const { preserveSelection = false } = options
    isLoading.value = true
    loadError.value = null

    try {
        const endpoint = buildEventsEndpoint()
        const { data } = await apiFetch<CalendarEvent[]>(endpoint)
        events.value = hydrateEvents(Array.isArray(data) ? data : [])
        if (!preserveSelection) {
            setInitialDate()
        }

        ensureDatesWithinRange()
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

onMounted(() => {
    void loadEvents()
    void loadTypesCount()
})

watch(locale, () => {

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
    padding: clamp(1.5rem, 4vw, 2.5rem);
    max-width: 1920px;
    width: 100%;
    margin: 0 auto;
}

.calendar-hero {
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(14, 165, 233, 0.12));
    border-radius: var(--uranus-tiny-border-radius);
    border: 0px solid rgba(148, 163, 184, 0.25);
}

.calendar-hero__content {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    max-width: 720px;
}

.calendar-hero h1 {
    margin: 0;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    font-weight: 700;
}

.calendar-hero p {
    margin: 0;
    color: var(--muted-text);
    font-size: clamp(1rem, 2.4vw, 1.125rem);
    line-height: 1.6;
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

@media (max-width: 640px) {
    .calendar-page {
        padding: clamp(1.25rem, 6vw, 1.75rem);
    }
}
</style>

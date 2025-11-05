<template>
    <div class="calendar-page">

        <!-- Detailed View -->
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


        <div v-if="currentView === 'detailed'" class="calendar-body">
            <EventCalendarSidebar search-id="calendar-search" date-id="calendar-date" end-date-id="calendar-end-date"
                type-id="calendar-type" :search-query="searchQuery" :selected-type="selectedType"
                :selected-date="selectedDate" :selected-end-date="selectedEndDate" :temp-start-date="tempStartDate"
                :temp-end-date="tempEndDate" :is-loading="isLoading" :is-types-loading="isTypesLoading"
                :type-options="typeOptions" :last-available-date="lastAvailableDate"
                :first-available-date="firstAvailableDate" :filters-active="filtersActive"
                @update:search-query="searchQuery = $event" @update:selected-type="selectedType = $event"
                @date-confirm="onDateConfirm" @clear-date-filters="clearDateFilters" @reset-filters="resetFilters" />

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
                                                    :class="{ 'is-active': selectedType === tag }" @click="filterByTag(tag)"
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
        </div>

        <!-- Compact View -->
        <div v-else-if="currentView === 'compact'" class="calendar-body-compact">
            <EventCalendarSidebar search-id="calendar-search-compact" date-id="calendar-date-compact"
                end-date-id="calendar-end-date-compact" type-id="calendar-type-compact" :search-query="searchQuery"
                :selected-type="selectedType" :selected-date="selectedDate" :selected-end-date="selectedEndDate"
                :temp-start-date="tempStartDate" :temp-end-date="tempEndDate" :is-loading="isLoading"
                :is-types-loading="isTypesLoading" :type-options="typeOptions" :last-available-date="lastAvailableDate"
                :first-available-date="firstAvailableDate" :filters-active="filtersActive"
                @update:search-query="searchQuery = $event" @update:selected-type="selectedType = $event"
                @date-confirm="onDateConfirm" @clear-date-filters="clearDateFilters" @reset-filters="resetFilters" />

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
                                    <span class="calendar-event-compact__date">{{ formatCompactDate(event.start_date)
                                        }}</span>
                                    <span v-if="event.venue_name || event.venue_city"
                                        class="calendar-event-compact__location">
                                        {{ formatLocation(event) }}
                                    </span>
                                    <ul v-if="event.typeLabels.length" class="calendar-event-compact__tags">
                                        <li v-for="tag in event.typeLabels" :key="tag">
                                            <button type="button" class="calendar-event-compact__tag-button"
                                                :class="{ 'is-active': selectedType === tag }" @click="filterByTag(tag)"
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

        <!-- Tiles View -->
        <div v-else-if="currentView === 'tiles'" class="calendar-body-tiles">
            <EventCalendarSidebar search-id="calendar-search-tiles" date-id="calendar-date-tiles"
                end-date-id="calendar-end-date-tiles" type-id="calendar-type-tiles" :search-query="searchQuery"
                :selected-type="selectedType" :selected-date="selectedDate" :selected-end-date="selectedEndDate"
                :temp-start-date="tempStartDate" :temp-end-date="tempEndDate" :is-loading="isLoading"
                :is-types-loading="isTypesLoading" :type-options="typeOptions" :last-available-date="lastAvailableDate"
                :first-available-date="firstAvailableDate" :filters-active="filtersActive"
                @update:search-query="searchQuery = $event" @update:selected-type="selectedType = $event"
                @date-confirm="onDateConfirm" @clear-date-filters="clearDateFilters" @reset-filters="resetFilters" />

            <section class="calendar-content-tiles" aria-live="polite">
                <div v-if="isLoading" class="calendar-state calendar-state--loading">
                    <span>{{ loadingLabel }}</span>
                </div>
                <div v-else-if="loadError" class="calendar-state calendar-state--error" role="alert">
                    <span>{{ loadError }}</span>
                </div>
                <div v-else-if="filteredEvents.length === 0" class="calendar-state calendar-state--empty">
                    <span>{{ emptyLabel }}</span>
                </div>
                <div v-else class="calendar-events-tiles">
                    <article v-for="event in filteredEvents" :key="event.id" class="calendar-tile">
                        <router-link :to="`/event/${event.id}/date/${event.event_date_id}`">
                            <div class="calendar-tile__image-container">
                                <img v-if="event.image_path" :src="event.image_path.includes('?')
                                    ? `${event.image_path}&ratio=4by3&width=320`
                                    : `${event.image_path}?ratio=4by3&width=320`" :alt="event.title"
                                    class="calendar-tile__image" />
                            </div>
                            <div>
                                <div class="calendar-content__body">
                                    <h3 class="calendar-tile__title">{{ event.title }}</h3>
                                    <div class="calendar-tile__meta">
                                        <span>{{ formatNumberDate(event.start_date) }} {{
                                            formatTime(event.start_date, event.start_time)
                                        }}</span>
                                        <span>{{ event.venue_name }}</span>
                                    </div>
                                </div>
                            </div>
                        </router-link>
                    </article>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useTokenStore } from '@/store/token'

import EventCalendarSidebar from '@/components/EventCalendarSidebar.vue'

interface CalendarEventType {
    genre_id: number | null
    genre_name: string | null
    type_id: number
    type_name: string
}

interface EventTypeOption {
    id: number
    name: string
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
const tokenStore = useTokenStore()
const isLoggedIn = computed(() => Boolean(tokenStore.accessToken))

const events = ref<AugmentedEvent[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const typeOptions = ref<string[]>([])
const isTypesLoading = ref(false)
const isInitialLoadComplete = ref(false)
const suspendDateWatcher = ref(false)

const searchQuery = ref('')
const selectedType = ref<'all' | string>('all')
const selectedDate = ref<string | null>(null)
const selectedEndDate = ref<string | null>(null)
const currentView = ref<'detailed' | 'compact' | 'tiles'>('detailed')

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

const intlWeekday = new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
})

const intlTime = new Intl.DateTimeFormat(undefined, {
    hour: '2-digit',
    minute: '2-digit',
})

const loadingLabel = computed(() => t('events_calendar_loading'))
const emptyLabel = computed(() => t('events_calendar_empty'))
const detailedViewLabel = computed(() => t('events_calendar_detailed_view'))
const compactViewLabel = computed(() => t('events_calendar_compact_view'))
const tilesViewLabel = computed(() => t('events_calendar_tiles_view'))

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

const deriveTypeNamesFromEvents = () => {
    const names = new Set<string>()
    for (const event of events.value) {
        for (const label of event.typeLabels) {
            if (label) {
                names.add(label)
            }
        }
    }
    const localeValue = locale.value || undefined
    return Array.from(names).sort((a, b) => a.localeCompare(b, localeValue, { sensitivity: 'base' }))
}

const ensureSelectedTypeIsValid = () => {
    if (selectedType.value !== 'all' && !typeOptions.value.includes(selectedType.value)) {
        selectedType.value = 'all'
    }
}

const ensureTypeOptionPresent = (label: string) => {
    if (!label) return
    if (typeOptions.value.includes(label)) return
    const localeValue = locale.value || undefined
    const updated = [...typeOptions.value, label]
    updated.sort((a, b) => a.localeCompare(b, localeValue, { sensitivity: 'base' }))
    typeOptions.value = updated
}

const filterByTag = (tag: string) => {
    const normalized = tag?.trim()
    if (!normalized) return
    ensureTypeOptionPresent(normalized)
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

    return intlDate.format(parsedDate)
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

const loadEventTypes = async () => {
    isTypesLoading.value = true

    try {
        const params = new URLSearchParams()
        if (locale.value) {
            params.set('lang', locale.value)
        }
        const query = params.toString()
        const endpoint = query ? `/api/choosable-event-types?${query}` : '/api/choosable-event-types'
        const { data } = await apiFetch<EventTypeOption[]>(endpoint)
        const options = Array.isArray(data) ? data : []
        const names = options
            .map((option) => option?.name?.trim())
            .filter((name): name is string => Boolean(name))
        const localeValue = locale.value || undefined
        typeOptions.value = Array.from(new Set(names)).sort((a, b) => a.localeCompare(b, localeValue, { sensitivity: 'base' }))

        if (!typeOptions.value.length) {
            typeOptions.value = deriveTypeNamesFromEvents()
        }
    } catch (error) {
        console.error('Failed to load event types', error)
        typeOptions.value = deriveTypeNamesFromEvents()
    } finally {
        ensureSelectedTypeIsValid()
        isTypesLoading.value = false
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

        if (!typeOptions.value.length) {
            typeOptions.value = deriveTypeNamesFromEvents()
            ensureSelectedTypeIsValid()
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

onMounted(() => {
    void loadEvents()
    void loadEventTypes()
})

watch(locale, () => {
    void loadEventTypes()
})

watch(events, () => {
    if (!typeOptions.value.length) {
        typeOptions.value = deriveTypeNamesFromEvents()
        ensureSelectedTypeIsValid()
    }
    ensureDatesWithinRange()
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
    background: var(--accent-primary);
    color: white;
}

.calendar-body {
    display: grid;
    grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
    gap: clamp(1.5rem, 3vw, 2.25rem);
    align-items: start;
}

.calendar-content__body {
    display: flex;
    overflow: hidden;
    word-break: unset;
    flex-direction: column;
    padding: 8px;
}

.calendar-body-compact {
    display: grid;
    grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
    gap: clamp(1.5rem, 3vw, 2.25rem);
    align-items: start;
}

.calendar-body-tiles {
    display: grid;
    grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
    gap: clamp(1.5rem, 3vw, 2.25rem);
    align-items: start;
}

.calendar-content-compact {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2vw, 1.5rem);
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

.calendar-event-compact__actions {
    flex-shrink: 0;
}

.calendar-event-compact__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.4rem 0.8rem;
    border-radius: 6px;
    background: rgba(79, 70, 229, 0.12);
    color: var(--accent-primary);
    font-weight: 500;
    font-size: 0.85rem;
    text-decoration: none;
    transition: background 0.2s ease;
}

.calendar-event-compact__cta:hover {
    background: rgba(79, 70, 229, 0.2);
}

.calendar-content-tiles {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2vw, 1.5rem);
}

.calendar-events-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--uranus-grid-gap);
}

.calendar-tile {
    display: flex;
    flex-direction: column;
    background: var(--uranus-bg-color);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    position: relative;
    /* make parent the positioning context */

}

.calendar-tile:hover {
    transform: translate(-2px, -4px);
    box-shadow: 2px 4px 10px rgba(0, 0, 0, 0.2);
}

.calendar-tile__image-container {
    position: relative;
    width: 100%;
    aspect-ratio: 4/3;
    overflow: hidden;
}

.calendar-tile__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.calendar-tile__placeholder {
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(14, 165, 233, 0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.calendar-tile__placeholder span {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--accent-primary);
    text-align: center;
    line-height: 1.3;
}

.calendar-tile__title {
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    white-space: nowrap;
    /* prevent line breaks */
    overflow: hidden;
    /* optional: hide overflow if too long */
    text-overflow: ellipsis;
    /* optional: show ... for overflowed text */
    word-break: normal;
    /* prevent breaking long words */
}

.calendar-tile__meta {
    display: flex;
  font-size: 0.95rem;
    flex-direction: column;
}

.calendar-tile__time,
.calendar-tile__date {
    font-weight: 500;
    opacity: 0.9;
}

.calendar-tile__cta::before {
    content: "✎";
    /* your UTF-8 character */
    display: inline-block;
    font-size: 2rem;
    line-height: 1;
}

.calendar-tile__cta {
    position: absolute;
    bottom: 0.5rem;
    /* distance from bottom edge */
    right: 0.5rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--uranus-bg-color);
    color: var(--uranus-color);
    font-size: 1.2rem;
    text-decoration: none;
    opacity: 0;
    /* initially hidden */
    pointer-events: none;
    /* don't block clicks when hidden */
    z-index: 10;
    cursor: pointer;
    transition: opacity 0.2s ease;
}

/* Show when parent is hovered */
.calendar-tile:hover .calendar-tile__cta {
    opacity: 1;
    pointer-events: auto;
}

/* Hover effect */
.calendar-tile__cta:hover {
    color: var(--uranus-ia-color);
    /* new text/icon color */
    opacity: 1;
    /* optional: fully visible */
    transition: all 0.2s ease;
}

.calendar-sidebar {
    position: sticky;
    top: 100px;
  background: var(--uranus-bg-color);
}

.calendar-sidebar {
    position: static;
}

.calendar-sidebar__header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.calendar-sidebar__header h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
}

.calendar-sidebar__header p {
    margin: 0;
    color: var(--muted-text);
    font-size: 0.95rem;
    line-height: 1.5;
}

.calendar-sidebar__section {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.calendar-sidebar__label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--muted-text);
}

.calendar-sidebar__sublabel {
    font-weight: 600;
    font-size: 0.85rem;
    color: var(--muted-text);
}

.calendar-sidebar__end-date {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.calendar-sidebar__section input,
.calendar-sidebar__section select {
    width: 100%;
    border-radius: 999px;
    border: 1px solid var(--border-soft);
    padding: 0.65rem 1rem;
    background: var(--input-bg);
    font-size: 0.95rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.calendar-sidebar__section input:focus,
.calendar-sidebar__section select:focus {
    outline: none;
    border-color: var(--accent-primary);
    // box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18);
}

.calendar-sidebar__section--dates input {
    padding: 0.55rem 0.85rem;
}

.calendar-sidebar__date-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.calendar-sidebar__all-dates {
    width: 100%;
    justify-content: center;
}

.calendar-sidebar__footer {
    margin-top: auto;
}

.calendar-sidebar__reset {
    width: 100%;
    justify-content: center;
}

.calendar-btn {
    border: none;
    background: var(--accent-primary);
    color: #fff;
    padding: 0.55rem 0.85rem;
    border-radius: 999px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    // transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.calendar-btn--ghost {
    background: rgba(79, 70, 229, 0.08);
    color: var(--accent-primary);
}

.calendar-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: none;
}

.calendar-btn:not(:disabled):hover {
    transform: translateY(-1px);
    // box-shadow: 0 8px 18px rgba(79, 70, 229, 0.2);
}

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
    // box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
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
    // box-shadow: 0 6px 14px rgba(79, 70, 229, 0.18);
}

.calendar-card__tag-button:focus-visible {
    outline: none;
    // box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.24);
}

.calendar-card__tag-button.is-active {
    background: rgba(79, 70, 229, 0.28);
    color: #fff;
}

.calendar-card__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.6rem 1rem;
    border-radius: 999px;
    background: rgba(79, 70, 229, 0.12);
    color: var(--accent-primary);
    font-weight: 600;
    text-decoration: none;
    transition: background 0.2s ease, transform 0.2s ease;
}

.calendar-card__cta:hover {
    background: rgba(79, 70, 229, 0.2);
    transform: translateY(-1px);
}

@media (max-width: 900px) {

    .calendar-body,
    .calendar-body-compact,
    .calendar-body-tiles {
        grid-template-columns: minmax(0, 1fr);
    }

    .calendar-sidebar {
        position: static;
    }

    .calendar-group__events {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }

    .calendar-events-tiles {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }

    .calendar-event-compact {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.75rem;
    }

    .calendar-event-compact__time {
        min-width: auto;
    }

    .calendar-event-compact__actions {
        align-self: flex-end;
    }
}

@media (max-width: 640px) {
    .calendar-page {
        padding: clamp(1.25rem, 6vw, 1.75rem);
    }

    .calendar-sidebar {
        gap: clamp(1rem, 5vw, 1.5rem);
    }

}
</style>

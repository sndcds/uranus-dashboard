<template>
    <div class="calendar-page">
        <section class="calendar-hero">
            <div class="calendar-hero__content">
                <h1>{{ pageTitle }}</h1>
                <p>{{ pageSubtitle }}</p>
            </div>
        </section>
        <div class="calendar-body">
            <aside class="calendar-sidebar">
                <div class="calendar-sidebar__header">
                    <h2>{{ filtersTitle }}</h2>
                    <p>{{ filtersSubtitle }}</p>
                </div>

                <div class="calendar-sidebar__section calendar-sidebar__section--search">
                    <label class="calendar-sidebar__label" for="calendar-search">{{ searchLabel }}</label>
                    <input id="calendar-search" type="search" :placeholder="searchPlaceholder" v-model.trim="searchQuery"
                        :disabled="isLoading" />
                </div>

                <div class="calendar-sidebar__section calendar-sidebar__section--dates">
                    <label class="calendar-sidebar__label" for="calendar-date">{{ dateLabel }}</label>
                    <div class="calendar-sidebar__date-controls">
                        <input
                            id="calendar-date"
                            type="date"
                            :value="tempStartDate"
                            :max="lastAvailableDate"
                            :disabled="isLoading"
                            @blur="onDateConfirm('start', $event)"
                            @keyup.enter="onDateConfirm('start', $event)"
                        />
                        <div class="calendar-sidebar__end-date">
                            <label class="calendar-sidebar__sublabel" for="calendar-end-date">{{ endDateLabel }}</label>
                            <input
                                id="calendar-end-date"
                                type="date"
                                :value="tempEndDate"
                                :min="selectedDate ?? firstAvailableDate"
                                :max="lastAvailableDate"
                                :disabled="isLoading"
                                @blur="onDateConfirm('end', $event)"
                                @keyup.enter="onDateConfirm('end', $event)"
                            />
                        </div>
                        <button type="button" class="calendar-btn calendar-btn--ghost calendar-sidebar__all-dates"
                            :disabled="isLoading || (!selectedDate && !selectedEndDate)" @click="clearDateFilters()">
                            {{ showAllDatesLabel }}
                        </button>
                    </div>
                </div>

                <div class="calendar-sidebar__section calendar-sidebar__section--types">
                    <label class="calendar-sidebar__label" for="calendar-type">{{ typeLabel }}</label>
                    <select id="calendar-type" v-model="selectedType"
                        :disabled="isLoading || isTypesLoading || typeOptions.length === 0">
                        <option value="all">{{ allCategoriesLabel }}</option>
                        <option v-for="type in typeOptions" :key="type" :value="type">
                            {{ type }}
                        </option>
                    </select>
                </div>

                <div class="calendar-sidebar__footer">
                    <button type="button" class="calendar-btn calendar-btn--ghost calendar-sidebar__reset"
                        :disabled="!filtersActive" @click="resetFilters">
                        {{ resetFiltersLabel }}
                    </button>
                </div>
            </aside>

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
                                <img v-if="event.image_path" :src="event.image_path" alt="" class="calendar-card__image" />
                                <div class="calendar-card__time">
                                    <span>{{ formatTime(event.start_date, event.start_time) }}</span>
                                </div>
                                <div class="calendar-card__body">
                                    <header class="calendar-card__header">
                                        <h3>{{ event.title }}</h3>
                                        <p v-if="event.subtitle" class="calendar-card__subtitle">{{ event.subtitle }}</p>
                                    </header>
                                    <p v-if="event.teaser_text" class="calendar-card__teaser">{{ event.teaser_text }}</p>
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
                                <footer class="calendar-card__footer">
                                    <router-link :to="{ name: 'event-details', params: { id: event.id } }"
                                        class="calendar-card__cta">
                                        {{ viewDetailsLabel }}
                                    </router-link>
                                </footer>
                            </article>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

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

const { t, te, locale } = useI18n({ useScope: 'global' })

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

const pageTitle = computed(() => (te('events_calendar_title') ? t('events_calendar_title') : 'Event calendar'))
const pageSubtitle = computed(() =>
    te('events_calendar_subtitle')
        ? t('events_calendar_subtitle')
        : 'Discover upcoming happenings, exhibitions, concerts and more in your community.'
)
const searchPlaceholder = computed(() => (te('events_calendar_search_placeholder') ? t('events_calendar_search_placeholder') : 'Search by title, organizer or location…'))
const loadingLabel = computed(() => (te('events_calendar_loading') ? t('events_calendar_loading') : 'Loading events…'))
const emptyLabel = computed(() => (te('events_calendar_empty') ? t('events_calendar_empty') : 'No events match your filters. Try a different day or search term.'))
const showAllDatesLabel = computed(() => (te('events_calendar_all_dates') ? t('events_calendar_all_dates') : 'All dates'))
const allCategoriesLabel = computed(() => (te('events_calendar_all_categories') ? t('events_calendar_all_categories') : 'All categories'))
const resetFiltersLabel = computed(() => (te('events_calendar_reset_filters') ? t('events_calendar_reset_filters') : 'Reset filters'))
const viewDetailsLabel = computed(() => (te('events_calendar_view_details') ? t('events_calendar_view_details') : 'View details'))
const filtersTitle = computed(() => (te('events_calendar_filters_title') ? t('events_calendar_filters_title') : 'Filter events'))
const filtersSubtitle = computed(() =>
    te('events_calendar_filters_subtitle')
        ? t('events_calendar_filters_subtitle')
        : 'Use search, date and categories to tailor the calendar.'
)
const searchLabel = computed(() => (te('events_calendar_search_label') ? t('events_calendar_search_label') : 'Search events'))
const dateLabel = computed(() => (te('events_calendar_date_label') ? t('events_calendar_date_label') : 'Choose a date'))
const typeLabel = computed(() => (te('events_calendar_type_label') ? t('events_calendar_type_label') : 'Event type'))
const endDateLabel = computed(() => (te('events_calendar_end_date_label') ? t('events_calendar_end_date_label') : 'End date'))

const hasEvents = computed(() => events.value.length > 0)

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
    return new Date(Date.UTC(year, month - 1, day))
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
        parsedDate.setUTCHours(safeHours, safeMinutes, 0, 0)
    }
    return parsedDate.getTime()
}

const formatTime = (date: string, time: string | null) => {
    if (!time) return (te('events_calendar_time_all_day') ? t('events_calendar_time_all_day') : 'All day')
    const parsedDate = parseISODate(date)
    if (!parsedDate) return time
    const [hoursRaw, minutesRaw] = time.split(':')
    const hours = Number(hoursRaw)
    const minutes = Number(minutesRaw)
    const safeHours = Number.isNaN(hours) ? 0 : hours
    const safeMinutes = Number.isNaN(minutes) ? 0 : minutes
    parsedDate.setUTCHours(safeHours, safeMinutes, 0, 0)
    return intlTime.format(parsedDate)
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
    if (!events.value.length) {
        clearDateFilters({ silent: true })
        return
    }

    const todayISO = today.toISOString().slice(0, 10)
    const upcoming = availableDates.value.find((date) => date >= todayISO)
    if (upcoming) {
        withDateWatcherSuspended(() => {
            selectedDate.value = upcoming
            if (!selectedEndDate.value || selectedEndDate.value < upcoming) {
                selectedEndDate.value = upcoming
            }
        })
    } else {
        clearDateFilters({ silent: true })
    }
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
        if (error instanceof Error && error.message) {
            loadError.value = error.message
        } else {
            loadError.value = te('events_calendar_load_error')
                ? t('events_calendar_load_error')
                : 'We could not load the events calendar. Please try again later.'
        }
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
    max-width: 1200px;
    margin: 0 auto;
}

.calendar-hero {
    background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(14, 165, 233, 0.12));
    border-radius: clamp(1.25rem, 3vw, 2rem);
    padding: clamp(1.75rem, 4vw, 2.5rem);
    border: 1px solid rgba(148, 163, 184, 0.25);
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

.calendar-body {
    display: grid;
    grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
    gap: clamp(1.5rem, 3vw, 2.25rem);
    align-items: start;
}

.calendar-sidebar {
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
    background: var(--card-bg, #fff);
    border-radius: clamp(1rem, 2.5vw, 1.5rem);
    padding: clamp(1.25rem, 3vw, 1.75rem);
    border: 1px solid var(--border-soft);
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
    position: sticky;
    top: clamp(1rem, 3vw, 1.5rem);
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
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.18);
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
    transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
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
    box-shadow: 0 8px 18px rgba(79, 70, 229, 0.2);
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
    border-radius: 18px;
    border: 1px solid var(--border-soft);
    background: var(--card-bg, #fff);
    box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08);
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
    box-shadow: 0 6px 14px rgba(79, 70, 229, 0.18);
}

.calendar-card__tag-button:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.24);
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
    .calendar-body {
        grid-template-columns: minmax(0, 1fr);
    }

    .calendar-sidebar {
        position: static;
    }

    .calendar-group__events {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
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
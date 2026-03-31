<template>
  <div class="uranus-calendar-base">
    <aside class="calendar-sidebar">
      <div v-if="$slots['sidebar-header']" class="calendar-sidebar__create">
        <slot name="sidebar-header"></slot>
      </div>

      <section class="mini-calendar">
        <header class="mini-calendar__header">
          <button type="button" class="icon-button" @click="shiftMiniMonth(-1)" :aria-label="resolvedLabels.previous">
            <ChevronLeft :size="18" />
          </button>
          <strong>{{ miniMonthLabel }}</strong>
          <button type="button" class="icon-button" @click="shiftMiniMonth(1)" :aria-label="resolvedLabels.next">
            <ChevronRight :size="18" />
          </button>
        </header>

        <div class="mini-calendar__weekdays">
          <span v-for="weekday in weekdayLabelsTiny" :key="weekday">{{ weekday }}</span>
        </div>

        <div class="mini-calendar__grid">
          <button
            v-for="day in miniMonthCells"
            :key="day.dateKey"
            type="button"
            class="mini-calendar__day"
            :class="{
              'is-outside': !day.inCurrentMonth,
              'is-selected': isSameDay(day.date, selectedDate),
              'is-today': isToday(day.date),
            }"
            @click="selectDate(day.date)"
          >
            {{ day.date.getDate() }}
          </button>
        </div>
      </section>

      <section class="calendar-sidebar__panel">
        <header class="calendar-sidebar__panel-header">
          <CalendarDays :size="18" />
          <h2>{{ selectedDateLabel }}</h2>
        </header>

        <div class="calendar-sidebar__agenda">
          <article
            v-for="entry in selectedDateEntries"
            :key="entry.id"
            class="agenda-card"
            :class="{ 'is-active': activeEntry?.id === entry.id }"
            @click="selectEntry(entry, selectedDate)"
          >
            <slot
              name="agenda-entry"
              :entry="entry"
              :item="entry.item"
              :is-active="activeEntry?.id === entry.id"
              :select="() => selectEntry(entry, selectedDate)"
              :time-label="entryTimeLabel(entry)"
              :range-label="entryRangeLabel(entry)"
            >
              <span class="agenda-card__dot" :style="{ backgroundColor: entry.color }"></span>
              <div class="agenda-card__body">
                <strong>{{ entry.title }}</strong>
                <span>{{ entryTimeLabel(entry) }}</span>
              </div>
            </slot>
          </article>

          <p v-if="selectedDateEntries.length === 0" class="calendar-sidebar__empty">
            {{ resolvedLabels.emptyDay }}
          </p>
        </div>
      </section>

      <section class="calendar-sidebar__panel">
        <header class="calendar-sidebar__panel-header">
          <MapPin :size="18" />
          <h2>{{ resolvedLabels.details }}</h2>
        </header>

        <div v-if="activeEntry" class="event-inspector">
          <slot
            name="detail"
            :entry="activeEntry"
            :item="activeEntry.item"
            :time-label="entryTimeLabel(activeEntry)"
            :range-label="entryRangeLabel(activeEntry)"
          >
            <div class="event-inspector__title">
              <span class="event-inspector__color" :style="{ backgroundColor: activeEntry.color }"></span>
              <div>
                <h3>{{ activeEntry.title }}</h3>
                <p>{{ entryRangeLabel(activeEntry) }}</p>
              </div>
            </div>
          </slot>
        </div>

        <p v-else class="calendar-sidebar__empty">{{ resolvedLabels.selectEntry }}</p>
      </section>
    </aside>

    <section class="calendar-shell">
      <header class="calendar-toolbar">
        <div class="calendar-toolbar__main">
          <div class="calendar-toolbar__brand">
            <div class="calendar-toolbar__icon">
              <CalendarDays :size="20" />
            </div>
            <div>
              <h1>{{ title }}</h1>
              <p>{{ description }}</p>
            </div>
          </div>

          <div class="calendar-toolbar__actions">
            <UranusButton size="small" variant="secondary" @click="goToToday">
              {{ resolvedLabels.today }}
            </UranusButton>

            <div class="calendar-toolbar__nav">
              <button type="button" class="icon-button" @click="goToPreviousRange" :aria-label="resolvedLabels.previous">
                <ChevronLeft :size="18" />
              </button>
              <button type="button" class="icon-button" @click="goToNextRange" :aria-label="resolvedLabels.next">
                <ChevronRight :size="18" />
              </button>
            </div>

            <div class="calendar-toolbar__title-block">
              <h2>{{ currentRangeLabel }}</h2>
              <span>{{ nowSummaryLabel }}</span>
            </div>
          </div>
        </div>

        <div class="calendar-toolbar__filters">
          <label v-if="searchEnabled" class="calendar-search">
            <Search :size="18" />
            <input v-model="searchQuery" type="search" :placeholder="resolvedLabels.searchPlaceholder" />
          </label>

          <UranusSegmentedSelect
            v-model="viewMode"
            :options="viewOptions"
            size="small"
          />
        </div>
      </header>

      <div class="calendar-stage" :class="`is-${viewMode}`">
        <section v-if="viewMode === 'month'" class="month-view">
          <div class="month-view__weekdays">
            <span v-for="weekday in weekdayLabelsLong" :key="weekday">{{ weekday }}</span>
          </div>

          <div class="month-view__grid">
            <article
              v-for="day in monthCells"
              :key="day.dateKey"
              class="month-cell"
              :class="{
                'is-outside': !day.inCurrentMonth,
                'is-today': isToday(day.date),
                'is-selected': isSameDay(day.date, selectedDate),
              }"
              @click="selectDate(day.date)"
            >
              <header class="month-cell__header">
                <span class="month-cell__number">{{ day.date.getDate() }}</span>
                <span v-if="day.entries.length" class="month-cell__count">{{ day.entries.length }}</span>
              </header>

              <div class="month-cell__events">
                <button
                  v-for="entry in day.entries.slice(0, 5)"
                  :key="entry.id"
                  type="button"
                  class="month-event"
                  :style="entryBadgeStyle(entry)"
                  @click.stop="selectEntry(entry, day.date)"
                >
                  <slot
                    name="month-entry"
                    :entry="entry"
                    :item="entry.item"
                    :date="day.date"
                    :time-label="entryTimeLabel(entry)"
                    :range-label="entryRangeLabel(entry)"
                  >
                    <span class="month-event__time">{{ entry.compactTime }}</span>
                    <span class="month-event__title">{{ entry.title }}</span>
                  </slot>
                </button>

                <span v-if="day.entries.length > 5" class="month-cell__more">
                  {{ resolvedLabels.more(day.entries.length - 5) }}
                </span>
              </div>
            </article>
          </div>
        </section>

        <section v-else-if="viewMode === 'week'" class="week-list-view">
          <div class="week-list-view__grid">
            <article
              v-for="day in weekDays"
              :key="day.dateKey"
              class="week-list-day"
              :class="{ 'is-today': isToday(day.date), 'is-selected': isSameDay(day.date, selectedDate) }"
              @click="selectDate(day.date)"
            >
              <header class="week-list-day__header">
                <span>{{ day.weekday }}</span>
                <strong>{{ day.dayNumber }}</strong>
              </header>

              <div class="week-list-day__events">
                <button
                  v-for="entry in day.entries"
                  :key="`${entry.id}-${day.dateKey}`"
                  type="button"
                  class="month-event"
                  :style="entryBadgeStyle(entry)"
                  @click.stop="selectEntry(entry, day.date)"
                >
                  <slot
                    name="week-entry"
                    :entry="entry"
                    :item="entry.item"
                    :date="day.date"
                    :time-label="entryTimeLabel(entry)"
                    :range-label="entryRangeLabel(entry)"
                  >
                    <span class="month-event__time">{{ entry.isAllDay ? resolvedLabels.allDay : entryTimeLabel(entry) }}</span>
                    <span class="month-event__title">{{ entry.title }}</span>
                  </slot>
                </button>

                <p v-if="day.entries.length === 0" class="week-list-day__empty">
                  {{ resolvedLabels.emptyDay }}
                </p>
              </div>
            </article>
          </div>
        </section>

        <section v-else class="day-view">
          <header class="day-view__header">
            <div>
              <span>{{ singleDayWeekday }}</span>
              <h3>{{ singleDayLabel }}</h3>
            </div>
            <div class="day-view__badge" :class="{ 'is-today': isToday(selectedDate) }">
              {{ dayViewCountLabel }}
            </div>
          </header>

          <div class="day-view__body">
            <div class="day-view__schedule">
              <div class="day-view__axis">
                <div class="day-view__axis-track">
                  <div
                    v-for="slot in timeSlots"
                    :key="slot.hour"
                    class="day-view__axis-segment"
                  >
                    <span>{{ slot.label }}</span>
                  </div>
                </div>
              </div>

              <div v-if="selectedDayAllDayEntries.length" class="day-view__all-day">
                <div class="day-view__all-day-items">
                  <button
                    v-for="entry in selectedDayAllDayEntries"
                    :key="`${entry.id}-${selectedDateKey}-all-day`"
                    type="button"
                    class="all-day-event"
                    :style="entryBadgeStyle(entry)"
                    @click="selectEntry(entry, selectedDate)"
                  >
                    <slot
                      name="all-day-entry"
                      :entry="entry"
                      :item="entry.item"
                      :date="selectedDate"
                      :time-label="resolvedLabels.allDay"
                      :range-label="entryRangeLabel(entry)"
                    >
                      {{ entry.title }}
                    </slot>
                  </button>
                </div>
              </div>

              <div v-if="selectedDayHorizontalEntries.length" class="day-view__rows">
                <article
                  v-for="entry in selectedDayHorizontalEntries"
                  :key="`${entry.id}-${selectedDateKey}`"
                  class="day-view__row"
                >
                  <div class="day-view__row-track">
                    <div class="day-view__row-grid">
                      <div
                        v-for="slot in timeSlots"
                        :key="`${entry.id}-${slot.hour}`"
                        class="day-view__row-segment"
                      ></div>
                    </div>

                    <button
                      type="button"
                      class="day-view__event-bar"
                      :class="{ 'is-active': activeEntry?.id === entry.id }"
                      :style="dayEntryBarStyle(entry)"
                      @click="selectEntry(entry, selectedDate)"
                    >
                      <slot
                        name="day-entry"
                        :entry="entry"
                        :item="entry.item"
                        :date="selectedDate"
                        :time-label="entryTimeLabel(entry)"
                        :range-label="entryRangeLabel(entry)"
                      >
                        <strong>{{ entry.title }}</strong>
                      </slot>
                    </button>
                  </div>
                </article>
              </div>

              <p v-else class="calendar-sidebar__empty day-view__empty">
                {{ resolvedLabels.emptyDay }}
              </p>
            </div>

            <div class="day-view__agenda-panel">
              <h4>{{ selectedDateLabel }}</h4>
              <article
                v-for="entry in selectedDateEntries"
                :key="entry.id"
                class="day-view__agenda-card"
                :class="{ 'is-active': activeEntry?.id === entry.id }"
                @click="selectEntry(entry, selectedDate)"
              >
                <slot
                  name="day-agenda-entry"
                  :entry="entry"
                  :item="entry.item"
                  :is-active="activeEntry?.id === entry.id"
                  :select="() => selectEntry(entry, selectedDate)"
                  :time-label="entryTimeLabel(entry)"
                  :range-label="entryRangeLabel(entry)"
                >
                  <span class="day-view__agenda-color" :style="{ backgroundColor: entry.color }"></span>
                  <div>
                    <strong>{{ entry.title }}</strong>
                    <p>{{ entryTimeLabel(entry) }}</p>
                  </div>
                </slot>
              </article>

              <p v-if="selectedDateEntries.length === 0" class="calendar-sidebar__empty">
                {{ resolvedLabels.emptyDay }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Search } from 'lucide-vue-next'

import UranusButton from '@/component/ui/UranusButton.vue'
import UranusSegmentedSelect from '@/component/ui/UranusSegmentedSelect.vue'
import type {
  CalendarAdapter,
  CalendarDayCell,
  CalendarLabels,
  CalendarNormalizedEntry,
  CalendarPositionedEntry,
  CalendarViewMode,
  CalendarWeekDayColumn,
} from '@/component/calendar/uranusCalendar'
import {
  addDays,
  addMonths,
  defaultIsAllDayRange,
  endOfDay,
  formatCompactTime,
  formatDateKey,
  getWeekdayLabels,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toValidDate,
} from '@/component/calendar/uranusCalendar'

const props = withDefaults(defineProps<{
  entries: any[]
  adapter: CalendarAdapter<any>
  title?: string
  description?: string
  initialViewMode?: CalendarViewMode
  initialDate?: string | number | Date
  searchEnabled?: boolean
  labels?: Partial<CalendarLabels>
  views?: CalendarViewMode[]
}>(), {
  title: 'Calendar',
  description: 'Reusable calendar foundation',
  initialViewMode: 'week',
  searchEnabled: true,
  labels: () => ({}),
  views: () => ['day', 'week', 'month'],
})

const emit = defineEmits<{
  'select-entry': [entry: CalendarNormalizedEntry<any> | null]
  'select-date': [date: Date]
  'update:view-mode': [viewMode: CalendarViewMode]
}>()

const { locale } = useI18n({ useScope: 'global' })

const DEFAULT_LABELS: CalendarLabels = {
  create: 'Create',
  previous: 'Previous',
  next: 'Next',
  details: 'Details',
  emptyDay: 'No entries scheduled for this day.',
  selectEntry: 'Select an entry to inspect the details.',
  searchPlaceholder: 'Search calendar',
  today: 'Today',
  day: 'Day',
  week: 'Week',
  month: 'Month',
  allDay: 'All day',
  more: (count: number) => `+${count} more`,
}

const DAY_MINUTES = 24 * 60
const DAY_VIEW_BAR_HEIGHT = 18

const today = startOfDay(new Date())
const initialDate = resolveInitialDate(props.initialDate)

const selectedDate = ref(initialDate)
const anchorDate = ref(initialDate)
const miniCalendarDate = ref(startOfMonth(initialDate))
const viewMode = ref<CalendarViewMode>(props.initialViewMode)
const searchQuery = ref('')
const activeEntryId = ref<string | null>(null)

const resolvedLabels = computed(() => ({
  ...DEFAULT_LABELS,
  ...props.labels,
}))

const normalizedEntries = computed<CalendarNormalizedEntry<any>[]>(() => {
  const entries = props.entries
    .map((item) => normalizeEntry(item, props.adapter, locale.value))
    .filter(Boolean) as CalendarNormalizedEntry<any>[]

  return entries.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
})

const filteredEntries = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return normalizedEntries.value
  }

  return normalizedEntries.value.filter((entry) => {
    const haystack = props.adapter.getSearchText?.(entry.item) ?? entry.title
    return haystack.toLowerCase().includes(query)
  })
})

const activeEntry = computed(() => {
  return filteredEntries.value.find((entry) => entry.id === activeEntryId.value) ?? null
})

const viewOptions = computed(() => {
  return props.views.map((value) => ({
    value,
    label: resolvedLabels.value[value],
  }))
})

const weekdayLabelsLong = computed(() => getWeekdayLabels(locale.value, 'short'))
const weekdayLabelsTiny = computed(() => getWeekdayLabels(locale.value, 'narrow'))
const selectedDateKey = computed(() => formatDateKey(selectedDate.value))

const currentRangeLabel = computed(() => {
  if (viewMode.value === 'month') {
    return new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(anchorDate.value)
  }

  if (viewMode.value === 'day') {
    return new Intl.DateTimeFormat(locale.value, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(selectedDate.value)
  }

  const start = startOfWeek(anchorDate.value)
  const end = addDays(start, 6)

  const startLabel = new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' }).format(start)
  const endLabel = new Intl.DateTimeFormat(locale.value, {
    month: start.getMonth() === end.getMonth() ? undefined : 'short',
    day: 'numeric',
    year: start.getFullYear() === end.getFullYear() ? undefined : 'numeric',
  }).format(end)

  return `${startLabel} - ${endLabel}`
})

const nowSummaryLabel = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date())
})

const selectedDateLabel = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(selectedDate.value)
})

const singleDayWeekday = computed(() => {
  return new Intl.DateTimeFormat(locale.value, { weekday: 'long' }).format(selectedDate.value)
})

const singleDayLabel = computed(() => {
  return new Intl.DateTimeFormat(locale.value, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(selectedDate.value)
})

const dayViewCountLabel = computed(() => {
  const count = selectedDateEntries.value.length
  return count === 1 ? '1 entry' : `${count} entries`
})

const miniMonthLabel = computed(() => {
  return new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(miniCalendarDate.value)
})

const monthCells = computed<CalendarDayCell<any>[]>(() => {
  const monthStart = startOfMonth(anchorDate.value)
  const gridStart = startOfWeek(monthStart)
  const cells: CalendarDayCell<any>[] = []

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index)
    cells.push({
      date,
      dateKey: formatDateKey(date),
      inCurrentMonth: date.getMonth() === monthStart.getMonth(),
      entries: getEntriesForDay(date),
    })
  }

  return cells
})

const miniMonthCells = computed(() => {
  const monthStart = startOfMonth(miniCalendarDate.value)
  const gridStart = startOfWeek(monthStart)

  return Array.from({ length: 35 }, (_, index) => {
    const date = addDays(gridStart, index)
    return {
      date,
      dateKey: formatDateKey(date),
      inCurrentMonth: date.getMonth() === monthStart.getMonth(),
    }
  })
})

const weekDays = computed<CalendarWeekDayColumn<any>[]>(() => {
  const weekStart = startOfWeek(anchorDate.value)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index)
    const entries = getEntriesForDay(date)

    return {
      date,
      dateKey: formatDateKey(date),
      weekday: new Intl.DateTimeFormat(locale.value, { weekday: 'short' }).format(date),
      dayNumber: new Intl.DateTimeFormat(locale.value, { day: 'numeric' }).format(date),
      entries,
    }
  })
})

const selectedDateEntries = computed(() => getEntriesForDay(selectedDate.value))
const selectedDayAllDayEntries = computed(() => {
  return selectedDateEntries.value.filter((entry) => entry.isAllDay)
})
const selectedDayHorizontalEntries = computed(() => {
  return getHorizontalEntriesForDay(selectedDate.value, selectedDateEntries.value.filter((entry) => !entry.isAllDay))
})

const timeSlots = computed(() => {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: new Intl.DateTimeFormat(locale.value, {
      hour: 'numeric',
    }).format(new Date(2026, 0, 1, hour)),
  }))
})

watch(
  () => props.initialDate,
  (value) => {
    if (value === undefined) {
      return
    }

    const date = resolveInitialDate(value)
    selectedDate.value = date
    anchorDate.value = date
    miniCalendarDate.value = startOfMonth(date)
  },
)

watch(viewMode, (value) => {
  emit('update:view-mode', value)
})

watchEffect(() => {
  if (!filteredEntries.value.length) {
    activeEntryId.value = null
    emit('select-entry', null)
    return
  }

  const currentActiveExists = filteredEntries.value.some((entry) => entry.id === activeEntryId.value)

  if (!currentActiveExists) {
    activeEntryId.value = filteredEntries.value[0]?.id ?? null
  }

  emit('select-entry', activeEntry.value)
})

function goToToday() {
  selectDate(today)
}

function goToPreviousRange() {
  if (viewMode.value === 'month') {
    const nextAnchor = addMonths(anchorDate.value, -1)
    anchorDate.value = nextAnchor
    miniCalendarDate.value = startOfMonth(nextAnchor)
    selectedDate.value = startOfDay(nextAnchor)
    emit('select-date', selectedDate.value)
    return
  }

  if (viewMode.value === 'week') {
    const nextAnchor = addDays(anchorDate.value, -7)
    anchorDate.value = nextAnchor
    selectedDate.value = startOfWeek(nextAnchor)
    miniCalendarDate.value = startOfMonth(nextAnchor)
    emit('select-date', selectedDate.value)
    return
  }

  selectDate(addDays(selectedDate.value, -1))
}

function goToNextRange() {
  if (viewMode.value === 'month') {
    const nextAnchor = addMonths(anchorDate.value, 1)
    anchorDate.value = nextAnchor
    miniCalendarDate.value = startOfMonth(nextAnchor)
    selectedDate.value = startOfDay(nextAnchor)
    emit('select-date', selectedDate.value)
    return
  }

  if (viewMode.value === 'week') {
    const nextAnchor = addDays(anchorDate.value, 7)
    anchorDate.value = nextAnchor
    selectedDate.value = startOfWeek(nextAnchor)
    miniCalendarDate.value = startOfMonth(nextAnchor)
    emit('select-date', selectedDate.value)
    return
  }

  selectDate(addDays(selectedDate.value, 1))
}

function shiftMiniMonth(step: number) {
  miniCalendarDate.value = addMonths(miniCalendarDate.value, step)
}

function selectDate(date: Date) {
  const normalized = startOfDay(date)
  selectedDate.value = normalized
  anchorDate.value = normalized
  miniCalendarDate.value = startOfMonth(normalized)
  emit('select-date', normalized)
}

function selectEntry(entry: CalendarNormalizedEntry<any>, focusDate = entry.startDate) {
  activeEntryId.value = entry.id
  selectDate(focusDate)
  emit('select-entry', entry)
}

function getEntriesForDay(date: Date) {
  const dayStart = startOfDay(date).getTime()
  const dayEnd = endOfDay(date).getTime()

  return filteredEntries.value.filter((entry) => {
    return entry.startDate.getTime() <= dayEnd && entry.endDate.getTime() >= dayStart
  })
}

function entryTimeLabel(entry: CalendarNormalizedEntry<any>) {
  if (entry.isAllDay) {
    return resolvedLabels.value.allDay
  }

  return new Intl.DateTimeFormat(locale.value, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(entry.startDate)
}

function entryRangeLabel(entry: CalendarNormalizedEntry<any>) {
  if (entry.isAllDay) {
    return resolvedLabels.value.allDay
  }

  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(entry.startDate)
    + ' - ' +
    new Intl.DateTimeFormat(locale.value, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(entry.endDate)
}

function entryBadgeStyle(entry: CalendarNormalizedEntry<any>) {
  return {
    backgroundColor: entry.color,
    color: entry.textColor ?? '#0f172a',
  }
}

function dayEntryBarStyle(entry: CalendarPositionedEntry<any>) {
  return {
    left: `calc(${entry.left}% + 2px)`,
    width: `calc(${entry.width}% - 4px)`,
    minWidth: '14px',
    height: `${entry.height}px`,
    backgroundColor: entry.color,
    color: entry.textColor ?? '#0f172a',
  }
}

function getHorizontalEntriesForDay(date: Date, entries: CalendarNormalizedEntry<any>[]) {
  if (!entries.length) {
    return []
  }

  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  return entries
    .map((entry) => {
      const displayStartDate = new Date(Math.max(entry.startDate.getTime(), dayStart.getTime()))
      const displayEndDate = new Date(Math.min(entry.endDate.getTime(), dayEnd.getTime()))
      const startMinutes = displayStartDate.getHours() * 60 + displayStartDate.getMinutes()
      const endMinutes = Math.max(startMinutes + 15, displayEndDate.getHours() * 60 + displayEndDate.getMinutes())

      return {
        ...entry,
        displayStartDate,
        displayEndDate,
        compactTime: formatCompactTime(displayStartDate, displayEndDate, locale.value),
        top: 0,
        height: DAY_VIEW_BAR_HEIGHT,
        left: (startMinutes / DAY_MINUTES) * 100,
        width: Math.max(((endMinutes - startMinutes) / DAY_MINUTES) * 100, 0.75),
      }
    })
    .sort((a, b) => a.displayStartDate.getTime() - b.displayStartDate.getTime())
}

function isToday(date: Date) {
  return isSameDay(date, today)
}

function resolveInitialDate(value?: string | number | Date) {
  return value === undefined ? today : toValidDate(value) ?? today
}

function normalizeEntry(item: any, adapter: CalendarAdapter<any>, currentLocale: string) {
  const startDate = toValidDate(adapter.getStart(item))
  const endDate = toValidDate(adapter.getEnd(item))

  if (!startDate || !endDate) {
    return null
  }

  const resolvedEndDate = endDate.getTime() < startDate.getTime() ? startDate : endDate

  return {
    id: String(adapter.getId(item)),
    item,
    title: adapter.getTitle(item),
    startDate,
    endDate: resolvedEndDate,
    dateKey: formatDateKey(startDate),
    compactTime: formatCompactTime(startDate, resolvedEndDate, currentLocale),
    color: adapter.getColor?.(item) ?? '#8ab4f8',
    textColor: adapter.getTextColor?.(item),
    isAllDay: adapter.isAllDay?.(item, startDate, resolvedEndDate) ?? defaultIsAllDayRange(startDate, resolvedEndDate),
  }
}
</script>

<style scoped lang="scss">
.uranus-calendar-base {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  min-height: calc(100vh - 160px);
  background:
    radial-gradient(circle at top left, rgba(19, 49, 244, 0.08), transparent 24%),
    linear-gradient(180deg, #f7faff 0%, #f2f5fb 100%);
  color: var(--uranus-color);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 28px;
  overflow: hidden;
}

.calendar-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.84);
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(20px);
}

.calendar-sidebar__create {
  display: flex;
}

.mini-calendar,
.calendar-sidebar__panel {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.25rem;
  padding: 1rem;
}

.mini-calendar__header,
.calendar-sidebar__panel-header,
.calendar-toolbar__main,
.calendar-toolbar__filters,
.calendar-toolbar__actions,
.calendar-toolbar__brand,
.time-grid-view__header,
.day-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.85rem;
}

.mini-calendar__header strong,
.calendar-sidebar__panel-header h2,
.calendar-toolbar__title-block h2,
.day-view__header h3,
.event-inspector__title h3,
.day-view__agenda-panel h4 {
  margin: 0;
}

.mini-calendar__weekdays,
.mini-calendar__grid,
.month-view__weekdays,
.month-view__grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.mini-calendar__weekdays,
.month-view__weekdays {
  color: rgba(15, 23, 42, 0.58);
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mini-calendar__weekdays {
  margin-bottom: 0.45rem;
}

.mini-calendar__grid {
  gap: 0.25rem;
}

.mini-calendar__day,
.icon-button,
.month-event,
.all-day-event,
.timed-event,
.day-view__event {
  border: none;
  font: inherit;
}

.mini-calendar__day,
.icon-button {
  cursor: pointer;
}

.mini-calendar__day {
  aspect-ratio: 1;
  border-radius: 999px;
  background: transparent;
  color: inherit;
}

.mini-calendar__day.is-outside {
  color: rgba(15, 23, 42, 0.38);
}

.mini-calendar__day.is-selected,
.mini-calendar__day:hover,
.icon-button:hover {
  background: rgba(19, 49, 244, 0.1);
}

.mini-calendar__day.is-today {
  border: 1px solid rgba(19, 49, 244, 0.18);
}

.calendar-sidebar__panel-header {
  margin-bottom: 1rem;
  justify-content: flex-start;
}

.calendar-sidebar__agenda,
.event-inspector {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.agenda-card,
.day-view__agenda-card {
  display: flex;
  gap: 0.85rem;
  padding: 0.85rem;
  border-radius: 1rem;
  cursor: pointer;
  transition: background-color 160ms ease, transform 160ms ease;
}

.agenda-card:hover,
.agenda-card.is-active,
.day-view__agenda-card:hover,
.day-view__agenda-card.is-active {
  background: rgba(19, 49, 244, 0.08);
  transform: translateY(-1px);
}

.agenda-card__dot,
.day-view__agenda-color,
.event-inspector__color {
  width: 0.7rem;
  min-width: 0.7rem;
  border-radius: 999px;
  background: #8ab4f8;
}

.agenda-card__body,
.day-view__agenda-card div,
.event-inspector__title {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.agenda-card__body strong,
.day-view__agenda-card strong {
  font-size: 0.96rem;
}

.calendar-sidebar__empty {
  margin: 0;
  color: rgba(15, 23, 42, 0.6);
}

.event-inspector__title {
  flex-direction: row;
  align-items: flex-start;
  gap: 0.85rem;
}

.event-inspector__color {
  min-height: 3rem;
}

.calendar-shell {
  min-width: 0;
  padding: 1.5rem;
}

.calendar-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.calendar-toolbar__brand h1,
.calendar-toolbar__brand p,
.calendar-toolbar__title-block span,
.day-view__header span {
  margin: 0;
}

.calendar-toolbar__brand h1 {
  font-size: clamp(1.4rem, 1rem + 1vw, 2rem);
}

.calendar-toolbar__brand p,
.calendar-toolbar__title-block span {
  color: rgba(15, 23, 42, 0.64);
}

.calendar-toolbar__icon {
  display: grid;
  place-items: center;
  width: 2.9rem;
  height: 2.9rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(19, 49, 244, 0.12), rgba(19, 49, 244, 0.22));
  color: #1331f4;
}

.calendar-toolbar__actions,
.calendar-toolbar__filters {
  flex-wrap: wrap;
}

.calendar-toolbar__nav {
  display: flex;
  gap: 0.4rem;
}

.calendar-search {
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  min-width: min(100%, 280px);
  padding: 0.85rem 1rem;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
}

.calendar-search input {
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  width: 100%;
}

.calendar-search input:focus {
  outline: none;
}

.icon-button {
  display: grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.82);
  color: inherit;
}

.calendar-stage {
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.4rem;
  overflow: hidden;
}

.month-view__weekdays,
.month-cell__header,
.time-grid-view__day-header,
.time-grid-view__time,
.day-view__time {
  padding: 0.75rem 0.85rem;
}

.month-view__grid {
  grid-template-columns: repeat(7, minmax(0, 1fr));
  background: rgba(15, 23, 42, 0.05);
  gap: 1px;
}

.month-cell {
  min-height: 144px;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
}

.month-cell.is-outside {
  background: rgba(249, 250, 251, 0.86);
}

.month-cell.is-selected {
  box-shadow: inset 0 0 0 2px rgba(19, 49, 244, 0.16);
}

.month-cell.is-today .month-cell__number,
.time-grid-view__day-header.is-today strong,
.day-view__badge.is-today {
  color: #1331f4;
}

.month-cell__header {
  padding: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.month-cell__count,
.day-view__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  background: rgba(19, 49, 244, 0.08);
  font-size: 0.82rem;
  font-weight: 600;
}

.month-cell__events {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.month-event,
.all-day-event {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  width: 100%;
  padding: 0.45rem 0.55rem;
  border-radius: 0.75rem;
  text-align: left;
  cursor: pointer;
}

.month-event__time {
  font-size: 0.78rem;
  opacity: 0.86;
}

.month-event__title {
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.month-cell__more {
  font-size: 0.8rem;
  color: rgba(15, 23, 42, 0.56);
}

.week-list-view__grid,
.day-view__body {
  display: grid;
}

.week-list-view__grid {
  grid-template-columns: repeat(7, minmax(0, 1fr));
  background: rgba(15, 23, 42, 0.05);
  gap: 1px;
}

.week-list-day {
  min-height: 260px;
  padding: 0.8rem;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  cursor: pointer;
}

.week-list-day.is-selected {
  box-shadow: inset 0 0 0 2px rgba(19, 49, 244, 0.16);
}

.week-list-day.is-today strong {
  color: #1331f4;
}

.week-list-day__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.week-list-day__header span {
  color: rgba(15, 23, 42, 0.56);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.week-list-day__header strong {
  font-size: 1rem;
}

.week-list-day__events {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-height: 0;
}

.week-list-day__empty {
  margin: 0;
  color: rgba(15, 23, 42, 0.56);
  font-size: 0.82rem;
}

.day-view__body {
  grid-template-columns: minmax(0, 1fr) 320px;
}

.day-view__schedule {
  background: rgba(248, 250, 252, 0.88);
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  min-width: 0;
}

.day-view__time {
  height: 64px;
  box-sizing: border-box;
  color: rgba(15, 23, 42, 0.48);
  font-size: 0.82rem;
}

.time-grid-column,
.day-view__timeline {
  position: relative;
  min-height: calc(24 * 64px);
}

.time-grid-column {
  border-right: 1px solid rgba(15, 23, 42, 0.08);
}

.time-grid-column:last-child {
  border-right: none;
}

.time-grid-column__slot,
.day-view__slot {
  height: 64px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.time-grid-column__all-day {
  position: absolute;
  inset: 0.4rem 0.4rem auto 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  z-index: 3;
}

.timed-event,
.day-view__event {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
  padding: 0.55rem 0.7rem;
  border-radius: 0.95rem;
  border: 1px solid transparent;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
}

.timed-event.is-active,
.day-view__event.is-active {
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.16);
}

.timed-event span,
.day-view__event span {
  font-size: 0.8rem;
  opacity: 0.86;
}

.day-view__header {
  padding: 1rem 1.1rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.day-view__schedule {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  padding: 1rem;
  overflow-x: auto;
}

.day-view__axis,
.day-view__all-day,
.day-view__row {
  display: block;
}

.day-view__axis {
  padding-bottom: 0.25rem;
}

.day-view__axis-track,
.day-view__row-grid {
  display: grid;
  grid-template-columns: repeat(24, minmax(48px, 1fr));
}

.day-view__axis-track {
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.day-view__axis-segment {
  position: relative;
  min-height: 2rem;
  border-left: 1px solid rgba(15, 23, 42, 0.08);
}

.day-view__axis-segment:first-child {
  border-left: none;
}

.day-view__axis-segment span {
  position: absolute;
  left: 0.45rem;
  bottom: 0.45rem;
  font-size: 0.75rem;
  color: rgba(15, 23, 42, 0.52);
}

.day-view__all-day-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  min-width: 720px;
}

.day-view__rows {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.day-view__row-track {
  position: relative;
  min-height: 1.5rem;
}

.day-view__row-grid {
  position: absolute;
  inset: 0;
}

.day-view__row-segment {
  border-left: 1px solid rgba(15, 23, 42, 0.08);
}

.day-view__row-segment:first-child {
  border-left: none;
}

.day-view__event-bar {
  position: absolute;
  top: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 0 0.45rem;
  border-radius: 0.35rem;
  border: none;
  text-align: left;
  cursor: pointer;
  overflow: hidden;
  transform: translateY(-50%);
  box-shadow: none;
}

.day-view__event-bar.is-active {
  filter: brightness(0.96);
}

.day-view__event-bar strong,
.day-view__event-bar span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.day-view__event-bar strong {
  font-size: 0.78rem;
  line-height: 1;
  width: 100%;
  text-align: left;
}

.day-view__event-bar span {
  display: none;
}

.day-view__empty {
  padding: 0.25rem 0;
}

.day-view__agenda-panel {
  padding: 1rem;
  background: rgba(248, 250, 252, 0.86);
}

@media (max-width: 1200px) {
  .uranus-calendar-base,
  .day-view__body {
    grid-template-columns: 1fr;
  }

  .calendar-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }

  .week-list-view__grid,
  .day-view__body {
    overflow-x: auto;
  }

  .week-list-view__grid {
    min-width: 840px;
  }

  .day-view__body {
    grid-template-columns: 1fr;
  }

  .day-view__agenda-panel {
    grid-column: 1 / -1;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
  }
}

@media (max-width: 720px) {
  .calendar-shell {
    padding: 1rem;
  }

  .month-view__grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }

  .week-list-view__grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    min-width: 0;
  }

  .month-view__weekdays {
    display: none;
  }

  .month-cell {
    min-height: 0;
  }

  .week-list-day {
    min-height: 0;
  }

  .calendar-toolbar__main,
  .calendar-toolbar__filters {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

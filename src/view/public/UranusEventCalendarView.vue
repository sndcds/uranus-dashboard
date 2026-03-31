<template>
  <div class="google-calendar-view">
    <aside class="calendar-sidebar">
      <div class="calendar-sidebar__create">
        <button type="button" class="create-button">
          <Plus :size="18" />
          <span>{{ createLabel }}</span>
        </button>
      </div>

      <section class="mini-calendar">
        <header class="mini-calendar__header">
          <button type="button" class="icon-button" @click="shiftMiniMonth(-1)" :aria-label="previousLabel">
            <ChevronLeft :size="18" />
          </button>
          <strong>{{ miniMonthLabel }}</strong>
          <button type="button" class="icon-button" @click="shiftMiniMonth(1)" :aria-label="nextLabel">
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
            v-for="event in selectedDateEvents"
            :key="event.id"
            class="agenda-card"
            :class="{ 'is-active': activeEvent?.id === event.id }"
            @click="activeEventId = event.id"
          >
            <span class="agenda-card__dot" :style="{ backgroundColor: event.color }"></span>
            <div class="agenda-card__body">
              <strong>{{ event.title }}</strong>
              <span>{{ eventTimeLabel(event) }}</span>
              <span class="agenda-card__meta">{{ event.location }}</span>
            </div>
          </article>

          <p v-if="selectedDateEvents.length === 0" class="calendar-sidebar__empty">
            {{ emptyDayLabel }}
          </p>
        </div>
      </section>

      <section class="calendar-sidebar__panel">
        <header class="calendar-sidebar__panel-header">
          <MapPin :size="18" />
          <h2>{{ detailsLabel }}</h2>
        </header>

        <div v-if="activeEvent" class="event-inspector">
          <div class="event-inspector__title">
            <span class="event-inspector__color" :style="{ backgroundColor: activeEvent.color }"></span>
            <div>
              <h3>{{ activeEvent.title }}</h3>
              <p>{{ activeEvent.description }}</p>
            </div>
          </div>

          <dl class="event-inspector__list">
            <div>
              <dt>{{ whenLabel }}</dt>
              <dd>{{ eventRangeLabel(activeEvent) }}</dd>
            </div>
            <div>
              <dt>{{ whereLabel }}</dt>
              <dd>{{ activeEvent.location }}</dd>
            </div>
            <div>
              <dt>{{ guestsLabel }}</dt>
              <dd>{{ activeEvent.attendees }}</dd>
            </div>
          </dl>
        </div>

        <p v-else class="calendar-sidebar__empty">{{ selectEventLabel }}</p>
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
              <h1>Calendar</h1>
              <p>{{ toolbarDescription }}</p>
            </div>
          </div>

          <div class="calendar-toolbar__actions">
            <UranusButton size="small" variant="secondary" @click="goToToday">
              {{ todayLabel }}
            </UranusButton>

            <div class="calendar-toolbar__nav">
              <button type="button" class="icon-button" @click="goToPreviousRange" :aria-label="previousLabel">
                <ChevronLeft :size="18" />
              </button>
              <button type="button" class="icon-button" @click="goToNextRange" :aria-label="nextLabel">
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
          <label class="calendar-search">
            <Search :size="18" />
            <input v-model="searchQuery" type="search" :placeholder="searchPlaceholder" />
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
                <span v-if="day.events.length" class="month-cell__count">{{ day.events.length }}</span>
              </header>

              <div class="month-cell__events">
                <button
                  v-for="event in day.events.slice(0, 3)"
                  :key="event.id"
                  type="button"
                  class="month-event"
                  :style="monthEventStyle(event)"
                  @click.stop="selectEvent(event)"
                >
                  <span class="month-event__time">{{ event.compactTime }}</span>
                  <span class="month-event__title">{{ event.title }}</span>
                </button>

                <span v-if="day.events.length > 3" class="month-cell__more">
                  +{{ day.events.length - 3 }} more
                </span>
              </div>
            </article>
          </div>
        </section>

        <section v-else-if="viewMode === 'week'" class="time-grid-view">
          <div class="time-grid-view__header">
            <div class="time-grid-view__spacer"></div>
            <button
              v-for="day in weekDays"
              :key="day.dateKey"
              type="button"
              class="time-grid-view__day-header"
              :class="{ 'is-today': isToday(day.date), 'is-selected': isSameDay(day.date, selectedDate) }"
              @click="selectDate(day.date)"
            >
              <span>{{ day.weekday }}</span>
              <strong>{{ day.dayNumber }}</strong>
            </button>
          </div>

          <div class="time-grid-view__body">
            <div class="time-grid-view__times">
              <div v-for="slot in timeSlots" :key="slot.hour" class="time-grid-view__time">
                {{ slot.label }}
              </div>
            </div>

            <div class="time-grid-view__columns">
              <article
                v-for="day in weekDays"
                :key="day.dateKey"
                class="time-grid-column"
                :class="{ 'is-today': isToday(day.date) }"
              >
                <div
                  v-for="slot in timeSlots"
                  :key="`${day.dateKey}-${slot.hour}`"
                  class="time-grid-column__slot"
                ></div>

                <div class="time-grid-column__all-day" v-if="day.allDay.length">
                  <button
                    v-for="event in day.allDay"
                    :key="event.id"
                    type="button"
                    class="all-day-event"
                    :style="monthEventStyle(event)"
                    @click="selectEvent(event)"
                  >
                    {{ event.title }}
                  </button>
                </div>

                <button
                  v-for="event in day.positionedEvents"
                  :key="event.id"
                  type="button"
                  class="timed-event"
                  :class="{ 'is-active': activeEvent?.id === event.id }"
                  :style="timedEventStyle(event)"
                  @click="selectEvent(event)"
                >
                  <strong>{{ event.title }}</strong>
                  <span>{{ event.compactTime }}</span>
                  <span>{{ event.location }}</span>
                </button>
              </article>
            </div>
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
            <div class="day-view__times">
              <div v-for="slot in timeSlots" :key="slot.hour" class="day-view__time">
                {{ slot.label }}
              </div>
            </div>

            <div class="day-view__timeline">
              <div v-for="slot in timeSlots" :key="slot.hour" class="day-view__slot"></div>

              <button
                v-for="event in selectedDayPositionedEvents"
                :key="event.id"
                type="button"
                class="day-view__event"
                :class="{ 'is-active': activeEvent?.id === event.id }"
                :style="timedEventStyle(event)"
                @click="selectEvent(event)"
              >
                <strong>{{ event.title }}</strong>
                <span>{{ eventTimeLabel(event) }}</span>
                <span>{{ event.location }}</span>
              </button>
            </div>

            <div class="day-view__agenda-panel">
              <h4>{{ agendaLabel }}</h4>
              <article
                v-for="event in selectedDateEvents"
                :key="event.id"
                class="day-view__agenda-card"
                :class="{ 'is-active': activeEvent?.id === event.id }"
                @click="selectEvent(event)"
              >
                <span class="day-view__agenda-color" :style="{ backgroundColor: event.color }"></span>
                <div>
                  <strong>{{ event.title }}</strong>
                  <p>{{ eventTimeLabel(event) }}</p>
                  <p>{{ event.location }}</p>
                </div>
              </article>

              <p v-if="selectedDateEvents.length === 0" class="calendar-sidebar__empty">
                {{ emptyDayLabel }}
              </p>
            </div>
          </div>
        </section>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, Plus, Search } from 'lucide-vue-next'

import UranusButton from '@/component/ui/UranusButton.vue'
import UranusSegmentedSelect from '@/component/ui/UranusSegmentedSelect.vue'

type CalendarViewMode = 'day' | 'week' | 'month'

interface CalendarEventSeed {
  id: string
  title: string
  description: string
  start: string
  end: string
  color: string
  textColor?: string
  location: string
  attendees: string
}

interface CalendarEventItem extends CalendarEventSeed {
  startDate: Date
  endDate: Date
  dateKey: string
  compactTime: string
  isAllDay: boolean
}

interface CalendarDayCell {
  date: Date
  dateKey: string
  inCurrentMonth: boolean
  events: CalendarEventItem[]
}

interface PositionedEvent extends CalendarEventItem {
  top: number
  height: number
  left: number
  width: number
}

interface WeekDayColumn {
  date: Date
  dateKey: string
  weekday: string
  dayNumber: string
  allDay: CalendarEventItem[]
  positionedEvents: PositionedEvent[]
}

const { locale } = useI18n({ useScope: 'global' })

const VIEW_STEP: Record<CalendarViewMode, number> = {
  day: 1,
  week: 7,
  month: 1,
}

const HOUR_ROW_HEIGHT = 64

const today = startOfDay(new Date())
const selectedDate = ref(today)
const anchorDate = ref(today)
const miniCalendarDate = ref(startOfMonth(today))
const viewMode = ref<CalendarViewMode>('week')
const searchQuery = ref('')
const activeEventId = ref<string | null>(null)

const viewOptions = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
]

const createLabel = 'Create'
const previousLabel = 'Previous'
const nextLabel = 'Next'
const detailsLabel = 'Details'
const whenLabel = 'When'
const whereLabel = 'Where'
const guestsLabel = 'Guests'
const agendaLabel = 'Schedule'
const emptyDayLabel = 'No events scheduled for this day.'
const selectEventLabel = 'Select an event to inspect time, place, and guests.'
const searchPlaceholder = 'Search calendar'
const toolbarDescription = 'Google Calendar inspired planning view'
const todayLabel = 'Today'

const sampleEvents = computed<CalendarEventItem[]>(() => {
  const year = today.getFullYear()
  const month = today.getMonth()

  const seeds: CalendarEventSeed[] = [
    {
      id: 'kickoff',
      title: 'Team Sync',
      description: 'Weekly planning session with design, product, and engineering.',
      start: isoDateTime(year, month, 3, 9, 0),
      end: isoDateTime(year, month, 3, 10, 0),
      color: '#8ab4f8',
      textColor: '#0b57d0',
      location: 'Orbit HQ / Room Europa',
      attendees: '8 invited',
    },
    {
      id: 'design-review',
      title: 'Design Review',
      description: 'Review for public event discovery flow and map interactions.',
      start: isoDateTime(year, month, 3, 11, 30),
      end: isoDateTime(year, month, 3, 12, 30),
      color: '#f6bf26',
      textColor: '#8d5f00',
      location: 'Studio North',
      attendees: '5 invited',
    },
    {
      id: 'launch-prep',
      title: 'Launch Prep',
      description: 'Content lock, copy review, and final release checklist.',
      start: isoDateTime(year, month, 4, 13, 0),
      end: isoDateTime(year, month, 4, 15, 0),
      color: '#81c995',
      textColor: '#137333',
      location: 'Mission Control',
      attendees: '12 invited',
    },
    {
      id: 'workshop',
      title: 'Creator Workshop',
      description: 'Hands-on venue onboarding and event publishing training.',
      start: isoDateTime(year, month, 5, 10, 0),
      end: isoDateTime(year, month, 5, 12, 0),
      color: '#f28b82',
      textColor: '#a50e0e',
      location: 'Auditorium B',
      attendees: '27 attending',
    },
    {
      id: 'lunch',
      title: 'Lunch with Partners',
      description: 'Quarterly partner lunch and roadmap alignment.',
      start: isoDateTime(year, month, 5, 12, 30),
      end: isoDateTime(year, month, 5, 13, 30),
      color: '#c58af9',
      textColor: '#6a1b9a',
      location: 'Cafe Meridian',
      attendees: '6 invited',
    },
    {
      id: 'townhall',
      title: 'Town Hall',
      description: 'Organization-wide updates with Q&A and highlights.',
      start: isoDateTime(year, month, 7, 16, 0),
      end: isoDateTime(year, month, 7, 17, 30),
      color: '#78d9ec',
      textColor: '#007b83',
      location: 'Main Stage',
      attendees: 'All hands',
    },
    {
      id: 'all-day-offsite',
      title: 'Strategy Offsite',
      description: 'All-day planning, workshops, and executive sessions.',
      start: isoDateTime(year, month, 10, 0, 0),
      end: isoDateTime(year, month, 10, 23, 59),
      color: '#aecbfa',
      textColor: '#174ea6',
      location: 'Berlin Campus',
      attendees: 'Leadership team',
    },
    {
      id: 'ops',
      title: 'Operations Review',
      description: 'Budget, staffing, and rollout readiness.',
      start: isoDateTime(year, month, 12, 8, 30),
      end: isoDateTime(year, month, 12, 10, 0),
      color: '#fdcfe8',
      textColor: '#9c27b0',
      location: 'Board Room',
      attendees: '4 invited',
    },
    {
      id: 'community',
      title: 'Community Event',
      description: 'Public-facing showcase with music, talks, and food.',
      start: isoDateTime(year, month, 14, 18, 0),
      end: isoDateTime(year, month, 14, 21, 0),
      color: '#fbcfe8',
      textColor: '#b42318',
      location: 'Open Square',
      attendees: 'Open registration',
    },
    {
      id: 'product',
      title: 'Product Crit',
      description: 'UX critique focused on event browse, filters, and details.',
      start: isoDateTime(year, month, 16, 10, 30),
      end: isoDateTime(year, month, 16, 11, 30),
      color: '#a7ffeb',
      textColor: '#00695c',
      location: 'Lab 2',
      attendees: '7 invited',
    },
    {
      id: 'recording',
      title: 'Video Recording',
      description: 'Capture speaker intros and publish to campaign assets.',
      start: isoDateTime(year, month, 18, 14, 0),
      end: isoDateTime(year, month, 18, 16, 0),
      color: '#d7aefb',
      textColor: '#7b1fa2',
      location: 'Media Booth',
      attendees: 'Production crew',
    },
    {
      id: 'night-shift',
      title: 'Night Maintenance',
      description: 'Low-traffic deployment window for backend infrastructure.',
      start: isoDateTime(year, month, 21, 22, 0),
      end: isoDateTime(year, month, 21, 23, 30),
      color: '#fdd663',
      textColor: '#8d5f00',
      location: 'Remote',
      attendees: 'Ops team',
    },
    {
      id: 'speaker-briefing',
      title: 'Speaker Briefing',
      description: 'Final run-through for keynote speakers and moderators.',
      start: isoDateTime(year, month, 24, 9, 30),
      end: isoDateTime(year, month, 24, 10, 15),
      color: '#81c995',
      textColor: '#137333',
      location: 'Backstage',
      attendees: '3 speakers',
    },
    {
      id: 'board-call',
      title: 'Board Call',
      description: 'Monthly status call with external stakeholders.',
      start: isoDateTime(year, month, 26, 17, 0),
      end: isoDateTime(year, month, 26, 18, 0),
      color: '#8ab4f8',
      textColor: '#0b57d0',
      location: 'Meet Link',
      attendees: '9 invited',
    },
    {
      id: 'wrap-up',
      title: 'Wrap-up Review',
      description: 'Retro, metrics review, and next-iteration handoff.',
      start: isoDateTime(year, month, 28, 15, 0),
      end: isoDateTime(year, month, 28, 16, 30),
      color: '#f6bf26',
      textColor: '#8d5f00',
      location: 'Orbit HQ / Room Io',
      attendees: '11 invited',
    },
  ]

  return seeds
    .map((seed) => {
      const startDate = new Date(seed.start)
      const endDate = new Date(seed.end)

      return {
        ...seed,
        startDate,
        endDate,
        dateKey: formatDateKey(startDate),
        compactTime: formatCompactTime(startDate, endDate, locale.value),
        isAllDay: isAllDayEvent(startDate, endDate),
      }
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
})

const filteredEvents = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) {
    return sampleEvents.value
  }

  return sampleEvents.value.filter((event) => {
    return [event.title, event.description, event.location]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })
})

const activeEvent = computed(() => {
  return filteredEvents.value.find((event) => event.id === activeEventId.value) ?? null
})

const weekdayLabelsLong = computed(() => getWeekdayLabels(locale.value, 'short'))
const weekdayLabelsTiny = computed(() => getWeekdayLabels(locale.value, 'narrow'))

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

  return `${startLabel} – ${endLabel}`
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
  const count = selectedDateEvents.value.length
  return count === 1 ? '1 event' : `${count} events`
})

const miniMonthLabel = computed(() => {
  return new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(miniCalendarDate.value)
})

const monthCells = computed<CalendarDayCell[]>(() => {
  const monthStart = startOfMonth(anchorDate.value)
  const gridStart = startOfWeek(monthStart)
  const cells: CalendarDayCell[] = []

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(gridStart, index)
    cells.push({
      date,
      dateKey: formatDateKey(date),
      inCurrentMonth: date.getMonth() === monthStart.getMonth(),
      events: getEventsForDay(date),
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

const weekDays = computed<WeekDayColumn[]>(() => {
  const weekStart = startOfWeek(anchorDate.value)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index)
    const events = getEventsForDay(date)

    return {
      date,
      dateKey: formatDateKey(date),
      weekday: new Intl.DateTimeFormat(locale.value, { weekday: 'short' }).format(date),
      dayNumber: new Intl.DateTimeFormat(locale.value, { day: 'numeric' }).format(date),
      allDay: events.filter((event) => event.isAllDay),
      positionedEvents: getPositionedEvents(events.filter((event) => !event.isAllDay)),
    }
  })
})

const selectedDateEvents = computed(() => getEventsForDay(selectedDate.value))
const selectedDayPositionedEvents = computed(() => {
  return getPositionedEvents(selectedDateEvents.value.filter((event) => !event.isAllDay))
})

const timeSlots = computed(() => {
  return Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: new Intl.DateTimeFormat(locale.value, {
      hour: 'numeric',
    }).format(new Date(2026, 0, 1, hour)),
  }))
})

watchEffect(() => {
  if (!filteredEvents.value.length) {
    activeEventId.value = null
    return
  }

  const currentActiveExists = filteredEvents.value.some((event) => event.id === activeEventId.value)

  if (!currentActiveExists) {
    activeEventId.value = filteredEvents.value[0]?.id ?? null
  }
})

function goToToday() {
  selectedDate.value = today
  anchorDate.value = today
  miniCalendarDate.value = startOfMonth(today)
}

function goToPreviousRange() {
  if (viewMode.value === 'month') {
    anchorDate.value = addMonths(anchorDate.value, -1)
    miniCalendarDate.value = startOfMonth(anchorDate.value)
    selectedDate.value = startOfDay(anchorDate.value)
    return
  }

  if (viewMode.value === 'week') {
    anchorDate.value = addDays(anchorDate.value, -VIEW_STEP.week)
    selectedDate.value = startOfWeek(anchorDate.value)
    miniCalendarDate.value = startOfMonth(anchorDate.value)
    return
  }

  selectedDate.value = addDays(selectedDate.value, -VIEW_STEP.day)
  anchorDate.value = selectedDate.value
  miniCalendarDate.value = startOfMonth(selectedDate.value)
}

function goToNextRange() {
  if (viewMode.value === 'month') {
    anchorDate.value = addMonths(anchorDate.value, 1)
    miniCalendarDate.value = startOfMonth(anchorDate.value)
    selectedDate.value = startOfDay(anchorDate.value)
    return
  }

  if (viewMode.value === 'week') {
    anchorDate.value = addDays(anchorDate.value, VIEW_STEP.week)
    selectedDate.value = startOfWeek(anchorDate.value)
    miniCalendarDate.value = startOfMonth(anchorDate.value)
    return
  }

  selectedDate.value = addDays(selectedDate.value, VIEW_STEP.day)
  anchorDate.value = selectedDate.value
  miniCalendarDate.value = startOfMonth(selectedDate.value)
}

function shiftMiniMonth(step: number) {
  miniCalendarDate.value = addMonths(miniCalendarDate.value, step)
}

function selectDate(date: Date) {
  const normalized = startOfDay(date)
  selectedDate.value = normalized
  anchorDate.value = normalized
  miniCalendarDate.value = startOfMonth(normalized)
}

function selectEvent(event: CalendarEventItem) {
  activeEventId.value = event.id
  selectDate(event.startDate)
}

function getEventsForDay(date: Date) {
  const dayKey = formatDateKey(date)
  return filteredEvents.value.filter((event) => event.dateKey === dayKey)
}

function eventTimeLabel(event: CalendarEventItem) {
  if (event.isAllDay) {
    return 'All day'
  }

  return new Intl.DateTimeFormat(locale.value, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(event.startDate)
}

function eventRangeLabel(event: CalendarEventItem) {
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(event.startDate)
    + ' – ' +
    new Intl.DateTimeFormat(locale.value, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(event.endDate)
}

function monthEventStyle(event: CalendarEventItem) {
  return {
    backgroundColor: event.color,
    color: event.textColor ?? '#0f172a',
  }
}

function timedEventStyle(event: PositionedEvent) {
  return {
    top: `${event.top}px`,
    height: `${event.height}px`,
    left: `calc(${event.left}% + 4px)`,
    width: `calc(${event.width}% - 8px)`,
    backgroundColor: event.color,
    color: event.textColor ?? '#0f172a',
    borderColor: event.textColor ?? 'rgba(15, 23, 42, 0.18)',
  }
}

function getPositionedEvents(events: CalendarEventItem[]): PositionedEvent[] {
  if (!events.length) {
    return []
  }

  const sorted = [...events].sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
  const columnsEnd: number[] = []
  const items = sorted.map((event) => {
    const startMinutes = event.startDate.getHours() * 60 + event.startDate.getMinutes()
    const endMinutes = event.endDate.getHours() * 60 + event.endDate.getMinutes()
    let column = 0

    while (column < columnsEnd.length && columnsEnd[column]! > startMinutes) {
      column += 1
    }

    columnsEnd[column] = endMinutes
    return { event, column, startMinutes, endMinutes }
  })

  const columnCount = Math.max(...items.map((item) => item.column)) + 1

  return items.map(({ event, column, startMinutes, endMinutes }) => ({
    ...event,
    top: Math.max(0, (startMinutes / 60) * HOUR_ROW_HEIGHT),
    height: Math.max(36, ((endMinutes - startMinutes) / 60) * HOUR_ROW_HEIGHT),
    left: (column / columnCount) * 100,
    width: 100 / columnCount,
  }))
}

function isToday(date: Date) {
  return isSameDay(date, today)
}

function isSameDay(a: Date, b: Date) {
  return formatDateKey(a) === formatDateKey(b)
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function startOfWeek(date: Date) {
  const normalized = startOfDay(date)
  const day = normalized.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(normalized, diff)
}

function addDays(date: Date, amount: number) {
  const value = new Date(date)
  value.setDate(value.getDate() + amount)
  return startOfDay(value)
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isoDateTime(year: number, month: number, day: number, hour: number, minute: number) {
  return new Date(year, month, day, hour, minute).toISOString()
}

function formatCompactTime(startDate: Date, endDate: Date, currentLocale: string) {
  return new Intl.DateTimeFormat(currentLocale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(startDate)
    + ' – ' +
    new Intl.DateTimeFormat(currentLocale, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(endDate)
}

function getWeekdayLabels(currentLocale: string, width: 'short' | 'narrow') {
  const start = startOfWeek(new Date(2026, 2, 30))
  return Array.from({ length: 7 }, (_, index) => {
    return new Intl.DateTimeFormat(currentLocale, { weekday: width }).format(addDays(start, index))
  })
}

function isAllDayEvent(startDate: Date, endDate: Date) {
  return startDate.getHours() === 0 && startDate.getMinutes() === 0 && endDate.getHours() >= 23
}
</script>

<style scoped lang="scss">
.google-calendar-view {
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

.create-button {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1rem;
  background: #fff;
  color: #1f1f1f;
  padding: 0.95rem 1.2rem;
  font: inherit;
  font-weight: 600;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
  cursor: pointer;
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
.calendar-toolbar__nav,
.event-inspector__title,
.day-view__header {
  display: flex;
  align-items: center;
}

.mini-calendar__header,
.calendar-sidebar__panel-header {
  justify-content: space-between;
  gap: 0.75rem;
}

.calendar-sidebar__panel-header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.mini-calendar__header strong {
  font-size: 0.95rem;
  text-align: center;
  flex: 1;
}

.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #475569;
  cursor: pointer;
}

.icon-button:hover {
  background: rgba(15, 23, 42, 0.06);
}

.mini-calendar__weekdays,
.mini-calendar__grid,
.month-view__weekdays,
.month-view__grid {
  display: grid;
}

.mini-calendar__weekdays,
.mini-calendar__grid {
  grid-template-columns: repeat(7, 1fr);
}

.mini-calendar__weekdays {
  margin: 0.9rem 0 0.45rem;
  color: #64748b;
  font-size: 0.72rem;
  text-align: center;
}

.mini-calendar__grid {
  gap: 0.2rem;
}

.mini-calendar__day {
  border: none;
  background: transparent;
  border-radius: 999px;
  aspect-ratio: 1;
  color: #0f172a;
  font: inherit;
  cursor: pointer;
}

.mini-calendar__day.is-outside {
  color: #94a3b8;
}

.mini-calendar__day.is-selected {
  background: #1a73e8;
  color: #fff;
}

.mini-calendar__day.is-today:not(.is-selected) {
  color: #1a73e8;
  font-weight: 700;
}

.calendar-sidebar__agenda,
.event-inspector {
  margin-top: 0.9rem;
}

.agenda-card,
.day-view__agenda-card {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  border: 1px solid transparent;
  border-radius: 1rem;
  padding: 0.8rem;
  cursor: pointer;
  transition: background-color 0.18s ease, border-color 0.18s ease;
}

.agenda-card:hover,
.day-view__agenda-card:hover {
  background: rgba(15, 23, 42, 0.04);
}

.agenda-card.is-active,
.day-view__agenda-card.is-active {
  background: rgba(26, 115, 232, 0.08);
  border-color: rgba(26, 115, 232, 0.22);
}

.agenda-card + .agenda-card,
.day-view__agenda-card + .day-view__agenda-card {
  margin-top: 0.5rem;
}

.agenda-card__dot,
.day-view__agenda-color {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
  flex: 0 0 auto;
  margin-top: 0.3rem;
}

.agenda-card__body,
.event-inspector__list,
.day-view__agenda-card div {
  display: flex;
  flex-direction: column;
}

.agenda-card__body strong,
.day-view__agenda-card strong,
.event-inspector__title h3 {
  font-size: 0.92rem;
}

.agenda-card__body span,
.agenda-card__meta,
.event-inspector__title p,
.event-inspector__list dd,
.day-view__agenda-card p {
  color: #64748b;
  margin: 0;
  font-size: 0.82rem;
}

.calendar-sidebar__empty {
  color: #64748b;
  margin: 0.9rem 0 0;
  font-size: 0.9rem;
}

.event-inspector__title {
  gap: 0.9rem;
  align-items: flex-start;
}

.event-inspector__color {
  width: 1rem;
  height: 1rem;
  border-radius: 0.35rem;
  margin-top: 0.25rem;
  flex: 0 0 auto;
}

.event-inspector__title h3,
.calendar-toolbar__brand h1,
.calendar-toolbar__title-block h2,
.day-view__header h3 {
  margin: 0;
}

.event-inspector__list {
  gap: 0.8rem;
  margin: 1rem 0 0;
}

.event-inspector__list dt {
  color: #64748b;
  font-size: 0.73rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.2rem;
}

.calendar-shell {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.calendar-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.25rem 1.5rem 1rem;
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(20px);
}

.calendar-toolbar__main {
  justify-content: space-between;
  gap: 1rem;
}

.calendar-toolbar__brand {
  gap: 1rem;
}

.calendar-toolbar__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, #1a73e8, #5e97f6);
  color: #fff;
  box-shadow: 0 18px 32px rgba(26, 115, 232, 0.25);
}

.calendar-toolbar__brand p,
.calendar-toolbar__title-block span {
  margin: 0.15rem 0 0;
  color: #64748b;
  font-size: 0.88rem;
}

.calendar-toolbar__actions {
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.85rem;
}

.calendar-toolbar__title-block {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 180px;
}

.calendar-toolbar__filters {
  justify-content: space-between;
  gap: 1rem;
}

.calendar-search {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
  max-width: 360px;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  padding: 0.75rem 1rem;
  color: #64748b;
}

.calendar-search input {
  width: 100%;
  border: none;
  background: transparent;
  color: #0f172a;
  font: inherit;
  outline: none;
}

.calendar-stage {
  padding: 1rem 1.5rem 1.5rem;
  min-height: 0;
}

.month-view,
.time-grid-view,
.day-view {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.month-view__weekdays,
.month-view__grid {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.month-view__weekdays {
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background: #fbfcff;
}

.month-view__weekdays span {
  padding: 0.9rem;
  text-align: center;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.month-cell {
  min-height: 150px;
  padding: 0.75rem;
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  cursor: pointer;
  transition: background-color 0.18s ease;
}

.month-cell:hover {
  background: rgba(15, 23, 42, 0.02);
}

.month-cell.is-outside {
  background: rgba(248, 250, 252, 0.9);
}

.month-cell.is-selected {
  background: rgba(26, 115, 232, 0.04);
}

.month-cell.is-today .month-cell__number {
  background: #1a73e8;
  color: #fff;
}

.month-cell__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.7rem;
}

.month-cell__number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  font-weight: 700;
}

.month-cell__count,
.day-view__badge {
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  color: #475569;
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.day-view__badge.is-today {
  background: rgba(26, 115, 232, 0.12);
  color: #1a73e8;
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
  gap: 0.45rem;
  width: 100%;
  border: none;
  border-radius: 0.6rem;
  padding: 0.35rem 0.55rem;
  font: inherit;
  font-size: 0.75rem;
  text-align: left;
  cursor: pointer;
}

.month-event__time {
  font-weight: 700;
  white-space: nowrap;
}

.month-event__title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.month-cell__more {
  color: #64748b;
  font-size: 0.76rem;
  padding: 0.2rem 0.35rem;
}

.time-grid-view__header,
.time-grid-view__body,
.day-view__body {
  display: grid;
}

.time-grid-view__header {
  grid-template-columns: 72px repeat(7, minmax(0, 1fr));
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background: #fbfcff;
}

.time-grid-view__spacer {
  border-right: 1px solid rgba(15, 23, 42, 0.08);
}

.time-grid-view__day-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  border: none;
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  background: transparent;
  padding: 0.9rem 0.6rem;
  cursor: pointer;
  color: #475569;
  font: inherit;
}

.time-grid-view__day-header strong {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  color: #0f172a;
}

.time-grid-view__day-header.is-selected strong,
.time-grid-view__day-header.is-today strong {
  background: #1a73e8;
  color: #fff;
}

.time-grid-view__body {
  grid-template-columns: 72px minmax(0, 1fr);
}

.time-grid-view__times,
.day-view__times {
  border-right: 1px solid rgba(15, 23, 42, 0.08);
  background: #fbfcff;
}

.time-grid-view__time,
.day-view__time {
  height: 64px;
  padding: 0.35rem 0.55rem 0;
  color: #94a3b8;
  font-size: 0.75rem;
  text-align: right;
}

.time-grid-view__columns {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.time-grid-column {
  position: relative;
  min-height: 1536px;
  border-right: 1px solid rgba(15, 23, 42, 0.08);
}

.time-grid-column.is-today {
  background: rgba(26, 115, 232, 0.03);
}

.time-grid-column__slot,
.day-view__slot {
  height: 64px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.time-grid-column__all-day {
  position: absolute;
  left: 0.35rem;
  right: 0.35rem;
  top: 0.35rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  z-index: 2;
}

.timed-event,
.day-view__event {
  position: absolute;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  border: 1px solid transparent;
  border-left-width: 4px;
  border-radius: 0.9rem;
  padding: 0.55rem 0.65rem;
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  text-align: left;
  overflow: hidden;
  cursor: pointer;
}

.timed-event strong,
.day-view__event strong {
  font-size: 0.8rem;
}

.timed-event span,
.day-view__event span {
  font-size: 0.72rem;
  opacity: 0.86;
  line-height: 1.2;
}

.timed-event.is-active,
.day-view__event.is-active {
  outline: 2px solid rgba(26, 115, 232, 0.35);
}

.day-view__header {
  justify-content: space-between;
  padding: 1.1rem 1.25rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.day-view__header span {
  color: #64748b;
  font-size: 0.84rem;
}

.day-view__body {
  grid-template-columns: 72px minmax(0, 1fr) 280px;
}

.day-view__timeline {
  position: relative;
  min-height: 1536px;
}

.day-view__agenda-panel {
  border-left: 1px solid rgba(15, 23, 42, 0.08);
  padding: 1rem;
  background: #fbfcff;
}

.day-view__agenda-panel h4 {
  margin: 0 0 0.8rem;
  font-size: 0.86rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
}

@media (max-width: 1180px) {
  .google-calendar-view {
    grid-template-columns: 1fr;
  }

  .calendar-sidebar {
    border-right: none;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  }

  .calendar-sidebar__panel {
    order: 2;
  }
}

@media (max-width: 920px) {
  .calendar-toolbar__main,
  .calendar-toolbar__filters,
  .day-view__body {
    grid-template-columns: 1fr;
  }

  .calendar-toolbar__main,
  .calendar-toolbar__filters {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-search {
    max-width: none;
  }

  .month-view__weekdays span,
  .month-cell {
    padding-inline: 0.45rem;
  }

  .month-cell {
    min-height: 128px;
  }

  .day-view__body {
    display: block;
  }

  .day-view__agenda-panel {
    border-left: none;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
  }
}

@media (max-width: 760px) {
  .calendar-stage {
    padding-inline: 0.75rem;
  }

  .time-grid-view__header,
  .time-grid-view__body {
    overflow-x: auto;
  }

  .time-grid-view__header {
    grid-template-columns: 56px repeat(7, 180px);
  }

  .time-grid-view__body {
    grid-template-columns: 56px minmax(1260px, 1fr);
  }

  .month-view__weekdays {
    display: none;
  }

  .month-view__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .google-calendar-view {
    border-radius: 0;
    border-inline: none;
  }

  .calendar-toolbar,
  .calendar-sidebar,
  .calendar-stage {
    padding-inline: 0.75rem;
  }

  .mini-calendar,
  .calendar-sidebar__panel,
  .month-view,
  .time-grid-view,
  .day-view {
    border-radius: 1rem;
  }

  .month-view__grid {
    grid-template-columns: 1fr;
  }
}
</style>

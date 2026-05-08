<!--
  src/component/event/UranusEventsCalendar.vue

  UranusEventsCalendar adapts public event list items to the reusable
  UranusCalendarBase day/week/month calendar views.
-->

<template>
  <UranusCalendarBase
      :entries="eventList"
      :adapter="calendarAdapter"
      :title="calendarTitle"
      :description="calendarDescription"
      :labels="calendarLabels"
      initial-view-mode="week"
      :search-enabled="false"
      class="uranus-events-calendar"
  >
    <template #agenda-entry="{ item, timeLabel, isActive }">
      <span class="agenda-card__dot" :style="{ backgroundColor: eventCalendarColor(item) }"></span>
      <div class="event-calendar-agenda-entry">
        <strong>{{ item.title }}</strong>
        <span>{{ timeLabel }} · {{ item.venue.name }}</span>
        <span>{{ item.venue.city }}</span>
        <span v-if="isActive" class="event-calendar-active-badge">{{ calendarLabels.details }}</span>
      </div>
    </template>

    <template #detail="{ item, rangeLabel }">
      <div class="event-calendar-detail">
        <h3>{{ item.title }}</h3>
        <p>{{ rangeLabel }}</p>
        <p>{{ item.venue.name }} · {{ item.venue.city }}</p>
        <router-link
            :to="{ name: 'event-details', params: { uuid: item.uuid, eventDateUuid: item.dateUuid } }"
            class="event-calendar-detail-link"
        >
          {{ calendarLabels.details }}
        </router-link>
      </div>
    </template>

    <template #month-entry="{ item, timeLabel }">
      <span class="month-event__time">{{ timeLabel }}</span>
      <span class="month-event__title">{{ item.title }}</span>
    </template>

    <template #week-entry="{ item, timeLabel }">
      <strong>{{ item.title }}</strong>
      <span>{{ timeLabel }}</span>
      <span>{{ item.venue.city }}</span>
    </template>

    <template #day-entry="{ item }">
      <strong>{{ item.title }}</strong>
    </template>

    <template #day-agenda-entry="{ item, timeLabel, isActive }">
      <span class="day-view__agenda-color" :style="{ backgroundColor: eventCalendarColor(item) }"></span>
      <div class="event-calendar-day-agenda-entry">
        <strong>{{ item.title }}</strong>
        <p>{{ timeLabel }} · {{ item.venue.name }}</p>
        <p>{{ item.venue.city }}</p>
        <span v-if="isActive" class="event-calendar-active-badge">{{ calendarLabels.details }}</span>
      </div>
    </template>
  </UranusCalendarBase>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusCalendarBase from '@/component/calendar/UranusCalendarBase.vue'
import type { CalendarLabels } from '@/component/calendar/uranusCalendar.ts'
import { createCalendarAdapter, defaultIsAllDayRange } from '@/component/calendar/uranusCalendar.ts'
import type { EventListItem } from '@/domain/event/eventListItem.model.ts'

const props = defineProps<{
  eventList: EventListItem[]
}>()

const { locale } = useI18n({ useScope: 'global' })

const isGermanLocale = computed(() => locale.value.startsWith('de'))

const calendarTitle = computed(() => isGermanLocale.value ? 'Kalender' : 'Calendar')
const calendarDescription = computed(() => {
  const count = props.eventList.length

  if (isGermanLocale.value) {
    return `${count} ${count === 1 ? 'geladene Veranstaltung' : 'geladene Veranstaltungen'}`
  }

  return `${count} loaded ${count === 1 ? 'event' : 'events'}`
})

const calendarLabels = computed<Partial<CalendarLabels>>(() => {
  const isGerman = isGermanLocale.value

  return {
    previous: isGerman ? 'Zurueck' : 'Previous',
    next: isGerman ? 'Weiter' : 'Next',
    details: isGerman ? 'Details' : 'Details',
    emptyDay: isGerman ? 'Keine Veranstaltungen an diesem Tag.' : 'No events scheduled for this day.',
    selectEntry: isGerman ? 'Veranstaltung auswaehlen.' : 'Select an event.',
    searchPlaceholder: isGerman ? 'Veranstaltungen suchen' : 'Search events',
    today: isGerman ? 'Heute' : 'Today',
    day: isGerman ? 'Tag' : 'Day',
    week: isGerman ? 'Woche' : 'Week',
    month: isGerman ? 'Monat' : 'Month',
    allDay: isGerman ? 'Ganztags' : 'All day',
    more: (count: number) => isGerman ? `+${count} weitere` : `+${count} more`,
    entries: (count: number) => isGerman
        ? `${count} ${count === 1 ? 'Veranstaltung' : 'Veranstaltungen'}`
        : `${count} ${count === 1 ? 'event' : 'events'}`,
  }
})

const calendarAdapter = createCalendarAdapter<EventListItem>({
  getId: (event) => event.dateUuid || event.uuid,
  getStart: (event) => eventStartDateTime(event),
  getEnd: (event) => eventEndDateTime(event),
  getTitle: (event) => event.title,
  getColor: (event) => eventCalendarColor(event),
  getTextColor: () => '#111827',
  getSearchText: (event) => [
    event.title,
    event.subtitle,
    event.venue.name,
    event.venue.city,
    event.space.name,
    event.organization.name,
    event.tags.join(' '),
  ].filter(Boolean).join(' '),
  isAllDay: (event, startDate, endDate) => !event.startTime || defaultIsAllDayRange(startDate, endDate),
})

function eventStartDateTime(event: EventListItem) {
  return combineDateAndTime(event.startDate, event.startTime)
}

function eventEndDateTime(event: EventListItem) {
  const start = eventStartDateTime(event)

  if (!event.startTime) {
    return new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999)
  }

  return new Date(start.getTime() + 60 * 60 * 1000)
}

function combineDateAndTime(dateValue: string, timeValue: string | null) {
  const [year, month, day] = dateValue.split('-').map(Number)
  const [hour = 0, minute = 0] = (timeValue ?? '00:00').split(':').map(Number)

  if (!year || !month || !day) {
    const fallback = new Date(dateValue)
    return Number.isNaN(fallback.getTime()) ? new Date() : fallback
  }

  return new Date(year, month - 1, day, hour, minute)
}

function eventCalendarColor(event: EventListItem) {
  const typeId = event.eventTypes[0]?.typeId ?? 0
  const fallbackColor = '#bfdbfe'
  const palette = ['#bfdbfe', '#bbf7d0', '#fde68a', '#fecaca', '#ddd6fe', '#bae6fd', '#fed7aa']

  return palette[typeId % palette.length] ?? fallbackColor
}
</script>

<style scoped lang="scss">
.uranus-events-calendar {
  width: 100%;
}

.event-calendar-agenda-entry,
.event-calendar-day-agenda-entry,
.event-calendar-detail {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.event-calendar-agenda-entry strong,
.event-calendar-day-agenda-entry strong,
.event-calendar-detail h3 {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.25;
}

.event-calendar-agenda-entry span,
.event-calendar-day-agenda-entry p,
.event-calendar-detail p {
  margin: 0;
  color: rgba(15, 23, 42, 0.68);
  font-size: 0.85rem;
}

.event-calendar-active-badge {
  justify-self: start;
  width: fit-content;
  padding: 0.15rem 0.45rem;
  border-radius: 999px;
  background: rgba(19, 49, 244, 0.1);
  color: #1331f4 !important;
  font-size: 0.75rem !important;
  font-weight: 700;
}

.event-calendar-detail-link {
  justify-self: start;
  width: fit-content;
  margin-top: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: 0.35rem;
  background: #1331f4;
  color: #ffffff;
  text-decoration: none;
  font-weight: 700;
}
</style>

<!--
  src/component/event/ui/UranusEventCalendarSheet.vue
-->

<template>
  <div v-if="activeViewMode === 'calendar'" class="calendar-sheet">
    <div class="calendar-sheet-controls">
      <button
          type="button"
          class="calendar-mode-button"
          :class="{ 'is-active': calendarMode === 'week' }"
          @click="setCalendarMode('week')"
      >
        <Rows3 :size="14" />
        {{ calendarLabels.week }}
      </button>
      <button
          type="button"
          class="calendar-mode-button"
          :class="{ 'is-active': calendarMode === 'month' }"
          @click="setCalendarMode('month')"
      >
        <CalendarDays :size="14" />
        {{ calendarLabels.month }}
      </button>
    </div>

    <section class="calendar-sheet-layout">
      <div v-if="calendarMode === 'week'" class="calendar-week-header">
        <UranusButton size="small" variant="tertiary" @click="emit('previous-week')">
          <template #icon>
            <ChevronLeft />
          </template>
          {{ calendarLabels.previous }}
        </UranusButton>

        <UranusButton size="small" variant="tertiary" @click="emit('go-today')">
          {{ calendarLabels.today }}
        </UranusButton>

        <div class="calendar-week-range">{{ weekRangeLabel }}</div>

        <UranusButton size="small" variant="tertiary" @click="emit('next-week')">
          {{ calendarLabels.next }}
          <template #icon>
            <ChevronRight />
          </template>
        </UranusButton>
      </div>

      <div v-if="calendarMode === 'week'" class="calendar-week-grid">
        <div
            v-for="day in weekDays"
            :key="day.dateKey"
            class="calendar-week-day"
            :class="{ 'calendar-week-day--today': day.dateKey === todayDateKey }"
        >
          <header class="calendar-week-day__header">
            <strong>{{ day.weekday }}</strong>
            <span
                class="calendar-week-day__date"
                :class="{ 'calendar-week-day__date--today': day.dateKey === todayDateKey }"
            >
              {{ day.dateLabel }}
            </span>
          </header>

          <ul v-if="day.events.length" class="calendar-week-day__events">
            <li
                v-for="event in day.events"
                :key="`${event.uuid}-${event.dateUuid}`"
                class="calendar-week-event"
            >
              <div
                  v-if="event.categories.length"
                  class="calendar-week-event__categories"
                  :style="{ gridTemplateColumns: `repeat(${event.categories.length}, minmax(0, 1fr))` }"
                  aria-hidden="true"
              >
                <span
                    v-for="(categoryId, index) in event.categories"
                    :key="`${event.uuid}-${event.dateUuid}-category-${index}`"
                    class="calendar-week-event__category"
                    :class="categoryClass(categoryId)"
                />
              </div>

              <router-link
                  class="calendar-week-event__link"
                  :to="{
                    name: 'event-details',
                    params: { uuid: event.uuid, eventDateUuid: event.dateUuid }
                  }"
              >
                <span class="calendar-week-event__time">{{ formatEventStartTime(event) }}</span>
                <span class="calendar-week-event__title">{{ event.title }}</span>
                <span class="calendar-week-event__venue">{{ event.venue.name }} · {{ event.venue.city }}</span>
              </router-link>
            </li>
          </ul>

          <p v-else class="calendar-week-day__empty">{{ calendarLabels.emptyDay }}</p>
        </div>
      </div>

      <div v-else class="calendar-month-placeholder">
        {{ calendarLabels.monthPlaceholder }}
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import { ChevronLeft, ChevronRight, Rows3, CalendarDays } from 'lucide-vue-next'
import type { EventListItem } from '@/domain/event/eventListItem.model.ts'
import type { EventViewMode } from '@/store/appStore.ts'
import { formatDateKey } from '@/component/calendar/uranusCalendar.ts'

interface CalendarLabels {
  week: string
  month: string
  previous: string
  next: string
  today: string
  emptyDay: string
  monthPlaceholder: string
}

interface CalendarWeekDay {
  dateKey: string
  weekday: string
  dateLabel: string
  events: EventListItem[]
}

const props = defineProps<{
  activeViewMode: EventViewMode
  calendarMode: 'week' | 'month'
  calendarLabels: CalendarLabels
  weekRangeLabel: string
  weekDays: CalendarWeekDay[]
  formatEventStartTime: (event: EventListItem) => string
}>()

const emit = defineEmits<{
  'update:calendarMode': [mode: 'week' | 'month']
  'previous-week': []
  'next-week': []
  'go-today': []
}>()

const todayDateKey = computed(() => formatDateKey(new Date()))

function setCalendarMode(mode: 'week' | 'month') {
  emit('update:calendarMode', mode)
}

function categoryClass(categoryId: number) {
  switch (categoryId) {
    case 1:
      return 'calendar-week-event__category--culture'
    case 2:
      return 'calendar-week-event__category--education'
    case 3:
      return 'calendar-week-event__category--sports'
    case 4:
      return 'calendar-week-event__category--leisure'
    case 5:
      return 'calendar-week-event__category--family'
    case 6:
      return 'calendar-week-event__category--society'
    default:
      return 'calendar-week-event__category--unknown'
  }
}
</script>

<style scoped lang="scss">
.calendar-sheet {
  display: grid;
  gap: 0.75rem;
}

.calendar-sheet-controls {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem;
}

.calendar-mode-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--uranus-color-6);
  background: transparent;
  color: var(--uranus-color);
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.calendar-mode-button.is-active {
  border-color: var(--uranus-select-bg);
  background: var(--uranus-select-bg);
  color: var(--uranus-select-color);
}

.calendar-sheet-layout {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
}

.calendar-week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.calendar-week-range {
  font-weight: 600;
  text-align: center;
}

.calendar-week-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;
}

.calendar-week-day {
  display: grid;
  align-content: start;
  gap: 0.2rem;
  min-height: 220px;
  padding: 0.75rem;
  border: 1px solid var(--uranus-color-7);
  background: var(--uranus-bg);
}

.calendar-week-day__header {
  display: grid;
  gap: 0.15rem;
}

.calendar-week-day__date {
  display: inline-flex;
  width: fit-content;
  padding: 0.05rem 0.35rem;
}

.calendar-week-day__date--today {
  background: var(--uranus-select-bg);
  color: var(--uranus-select-color);
}

.calendar-week-day__header strong {
  text-transform: capitalize;
}

.calendar-week-day__events {
  display: grid;
  gap: 0.2rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.calendar-week-event {
  display: block;
  width: 100%;
  min-width: 0;
}

.calendar-week-event__categories {
  display: grid;
  height: 10px;
  width: 100%;
  overflow: hidden;
}

.calendar-week-event__category {
  display: block;
  min-width: 0;
}

.calendar-week-event__category--culture {
  background: var(--uranus-event-category-culture-color);
}

.calendar-week-event__category--education {
  background: var(--uranus-event-category-education-color);
}

.calendar-week-event__category--sports {
  background: var(--uranus-event-category-sports-color);
}

.calendar-week-event__category--leisure {
  background: var(--uranus-event-category-leisure-color);
}

.calendar-week-event__category--family {
  background: var(--uranus-event-category-family-color);
}

.calendar-week-event__category--society {
  background: var(--uranus-event-category-society-color);
}

.calendar-week-event__category--unknown {
  background: var(--uranus-color-6);
}

.calendar-week-event__link {
  display: grid;
  gap: 0.15rem;
  padding: 0.45rem 0.5rem;
  background: #f2f2f2;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.15s ease;
  overflow: hidden;
}

.calendar-week-event__link:hover {
  background: #e8e8e8;
}

.calendar-week-event__link:focus-visible {
  outline: 2px solid var(--uranus-select-bg);
  outline-offset: 1px;
}

.calendar-week-event__time {
  font-size: 0.88rem;
  color: var(--uranus-color-4);
}

.calendar-week-event__title {
  font-weight: 600;
  line-height: 1.25;
}

.calendar-week-event__venue,
.calendar-week-day__empty {
  font-size: 0.9rem;
  color: var(--uranus-color-4);
}

.calendar-month-placeholder {
  min-height: 320px;
  display: grid;
  place-items: center;
  border: 1px dashed var(--uranus-color-7);
  background: var(--uranus-bg);
  color: var(--uranus-color-4);
}

@media (max-width: 768px) {
  .calendar-sheet-controls {
    padding: 0 0.75rem;
  }

  .calendar-sheet-layout {
    padding: 0.75rem;
  }

  .calendar-week-header {
    flex-wrap: wrap;
    justify-content: center;
  }

  .calendar-week-grid {
    grid-template-columns: 1fr;
  }
}
</style>

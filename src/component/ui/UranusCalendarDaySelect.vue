<template>
  <div class="uranus-calendar-day-select">
    <div class="uranus-calendar-day-select__toolbar">
      <button
          type="button"
          class="uranus-calendar-day-select__nav"
          :aria-label="previousMonthLabel"
          @click="changeMonth(-1)"
      >
        <ChevronLeft :size="16" />
      </button>

      <div class="uranus-calendar-day-select__summary">
        <span>{{ selectionSummary }}</span>
      </div>

      <button
          type="button"
          class="uranus-calendar-day-select__nav"
          :aria-label="nextMonthLabel"
          @click="changeMonth(1)"
      >
        <ChevronRight :size="16" />
      </button>
    </div>

    <div
        class="uranus-calendar-day-select__months"
        :class="{ 'has-two-months': visibleMonths.length > 1 }"
    >
      <section
          v-for="month in visibleMonths"
          :key="month.key"
          class="uranus-calendar-day-select__month"
          :aria-label="month.label"
      >
        <h3 class="uranus-calendar-day-select__month-title">
          {{ month.label }}
        </h3>

        <div class="uranus-calendar-day-select__weekdays" aria-hidden="true">
          <span v-for="weekday in weekdayLabels" :key="weekday">{{ weekday }}</span>
        </div>

        <div class="uranus-calendar-day-select__days">
          <button
              v-for="day in month.days"
              :key="day.key"
              type="button"
              class="uranus-calendar-day-select__day"
              :class="getDayClass(day)"
              :disabled="!day.inMonth || isDisabled(day.iso)"
              :aria-pressed="isSelected(day.iso)"
              :aria-label="getDayLabel(day)"
              @click="selectDay(day.iso)"
          >
            {{ day.date.getDate() }}
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ChevronLeft, ChevronRight } from 'lucide-vue-next'

export interface UranusCalendarDayRange {
  start: string | null
  end: string | null
}

type UranusCalendarDayValue = string | UranusCalendarDayRange | null

interface CalendarDay {
  key: string
  iso: string
  date: Date
  inMonth: boolean
}

interface CalendarMonth {
  key: string
  label: string
  days: CalendarDay[]
}

const props = withDefaults(defineProps<{
  modelValue?: UranusCalendarDayValue
  locale?: string
  minDate?: string | null
  maxDate?: string | null
}>(), {
  modelValue: null,
  locale: 'de-DE',
  minDate: null,
  maxDate: null
})

const emit = defineEmits<{
  'update:modelValue': [value: UranusCalendarDayValue]
  change: [value: UranusCalendarDayValue]
}>()

const today = new Date()
const viewedMonth = ref(startOfMonth(getInitialMonth()))

const weekdayLabels = computed(() => {
  const monday = new Date(2026, 0, 5)

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(monday, index)
    return new Intl.DateTimeFormat(props.locale, { weekday: 'short' }).format(date)
  })
})

const selectedStart = computed(() => {
  if (!props.modelValue) return null
  if (typeof props.modelValue === 'string') return props.modelValue
  return props.modelValue.start ?? null
})

const selectedEnd = computed(() => {
  if (!props.modelValue || typeof props.modelValue === 'string') return null
  return props.modelValue.end ?? null
})

const selectedRange = computed<UranusCalendarDayRange>(() => ({
  start: selectedStart.value,
  end: selectedEnd.value
}))

const shouldShowNextMonth = computed(() => {
  if (!selectedStart.value || !selectedEnd.value) return false

  const start = parseIsoDate(selectedStart.value)
  const end = parseIsoDate(selectedEnd.value)

  if (!start || !end) return false

  return monthKey(end) !== monthKey(start) && end > start
})

const visibleMonths = computed<CalendarMonth[]>(() => {
  const firstVisibleMonth = shouldShowNextMonth.value && selectedStart.value
      ? startOfMonth(parseIsoDate(selectedStart.value) ?? viewedMonth.value)
      : viewedMonth.value

  const firstMonth = createMonth(firstVisibleMonth)

  if (!shouldShowNextMonth.value) {
    return [firstMonth]
  }

  return [
    firstMonth,
    createMonth(addMonths(firstVisibleMonth, 1))
  ]
})

const previousMonthLabel = computed(() => {
  return new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' })
      .format(addMonths(viewedMonth.value, -1))
})

const nextMonthLabel = computed(() => {
  return new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' })
      .format(addMonths(viewedMonth.value, 1))
})

const selectionSummary = computed(() => {
  if (selectedRange.value.start && selectedRange.value.end) {
    return `${formatDisplayDate(selectedRange.value.start)} - ${formatDisplayDate(selectedRange.value.end)}`
  }

  return selectedStart.value ? formatDisplayDate(selectedStart.value) : 'Tag oder Zeitraum auswählen'
})

watch(
    () => selectedStart.value,
    (value) => {
      const date = parseIsoDate(value)
      if (date) viewedMonth.value = startOfMonth(date)
    },
    { immediate: true }
)

const selectDay = (iso: string) => {
  if (isDisabled(iso)) return

  const current = selectedRange.value

  if (!current.start) {
    updateValue(iso)
    return
  }

  if (!current.end) {
    if (iso === current.start) {
      updateValue(iso)
      return
    }

    updateRange(current.start, iso)
    return
  }

  if (iso === current.start || iso === current.end) {
    updateValue(iso)
    return
  }

  if (iso < current.start) {
    updateRange(iso, current.end)
    return
  }

  if (iso > current.end) {
    updateRange(current.start, iso)
    return
  }

  if (distanceInDays(iso, current.start) <= distanceInDays(current.end, iso)) {
    updateRange(iso, current.end)
    return
  }

  updateRange(current.start, iso)
}

const updateRange = (firstIso: string, secondIso: string) => {
  const start = firstIso <= secondIso ? firstIso : secondIso
  const end = firstIso <= secondIso ? secondIso : firstIso

  updateValue(start === end ? start : { start, end })
}

const updateValue = (value: UranusCalendarDayValue) => {
  emit('update:modelValue', value)
  emit('change', value)
}

const changeMonth = (offset: number) => {
  viewedMonth.value = addMonths(viewedMonth.value, offset)
}

const getDayClass = (day: CalendarDay) => {
  const selected = isSelected(day.iso)

  return {
    'is-muted': !day.inMonth,
    'is-today': day.iso === toIsoDate(today),
    'is-disabled': day.inMonth && isDisabled(day.iso),
    'is-selected': selected,
    'is-range-start': day.iso === selectedRange.value.start,
    'is-range-end': day.iso === selectedRange.value.end,
    'is-in-range': isInRange(day.iso)
  }
}

const getDayLabel = (day: CalendarDay) => {
  return new Intl.DateTimeFormat(props.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(day.date)
}

const isSelected = (iso: string) => {
  return selectedRange.value.start === iso || selectedRange.value.end === iso
}

const isInRange = (iso: string) => {
  const { start, end } = selectedRange.value
  if (!start || !end) return false
  return iso > start && iso < end
}

const isDisabled = (iso: string) => {
  if (props.minDate && iso < props.minDate) return true
  if (props.maxDate && iso > props.maxDate) return true
  return false
}

function getInitialMonth() {
  const selected = typeof props.modelValue === 'string'
      ? props.modelValue
      : props.modelValue?.start

  return parseIsoDate(selected) ?? today
}

function createMonth(monthDate: Date): CalendarMonth {
  const monthStart = startOfMonth(monthDate)
  const gridStart = addDays(monthStart, -getMondayBasedDay(monthStart))

  return {
    key: monthKey(monthStart),
    label: new Intl.DateTimeFormat(props.locale, { month: 'long', year: 'numeric' }).format(monthStart),
    days: Array.from({ length: 42 }, (_, index) => {
      const date = addDays(gridStart, index)
      const iso = toIsoDate(date)

      return {
        key: iso,
        iso,
        date,
        inMonth: date.getMonth() === monthStart.getMonth()
      }
    })
  }
}

function parseIsoDate(value?: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null

  const [year, month, day] = value.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function formatDisplayDate(iso: string) {
  const date = parseIsoDate(iso)
  if (!date) return iso

  return new Intl.DateTimeFormat(props.locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

function distanceInDays(firstIso: string, secondIso: string) {
  const firstDate = parseIsoDate(firstIso)
  const secondDate = parseIsoDate(secondIso)

  if (!firstDate || !secondDate) return Number.MAX_SAFE_INTEGER

  return Math.abs(firstDate.getTime() - secondDate.getTime()) / 86400000
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1)
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function getMondayBasedDay(date: Date) {
  return (date.getDay() + 6) % 7
}
</script>

<style scoped lang="scss">
.uranus-calendar-day-select {
  display: inline-flex;
  flex-direction: column;
  gap: 0.6rem;
  width: max-content;
  max-width: 100%;
  color: var(--uranus-card-color);
}

.uranus-calendar-day-select__toolbar {
  display: grid;
  grid-template-columns: 2rem minmax(9rem, 1fr) 2rem;
  align-items: center;
  gap: 0.35rem;
}

.uranus-calendar-day-select__summary {
  min-width: 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--uranus-card-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.uranus-calendar-day-select__nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--uranus-color-6);
  border-radius: 4px;
  background: var(--uranus-bg);
  color: var(--uranus-card-color);
  cursor: pointer;
  padding: 0;

  &:hover {
    color: var(--uranus-link-color-hover);
  }
}

.uranus-calendar-day-select__months {
  display: grid;
  grid-template-columns: minmax(14rem, 16rem);
  gap: 0.75rem;

  &.has-two-months {
    grid-template-columns: repeat(2, minmax(14rem, 16rem));
  }
}

.uranus-calendar-day-select__month {
  border: var(--uranus-card-border);
  border-radius: var(--uranus-card-border-radius);
  background: var(--uranus-card-bg);
  padding: 0.75rem;
}

.uranus-calendar-day-select__month-title {
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  font-weight: 600;
  text-align: center;
}

.uranus-calendar-day-select__weekdays,
.uranus-calendar-day-select__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.2rem;
}

.uranus-calendar-day-select__weekdays {
  margin-bottom: 0.25rem;
  color: var(--uranus-color-5);
  font-size: 0.68rem;
  text-align: center;
}

.uranus-calendar-day-select__day {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  min-width: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: var(--uranus-card-color);
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0;

  &:hover:not(:disabled) {
    border-color: var(--uranus-select-bg);
    color: var(--uranus-link-color-hover);
  }

  &.is-muted {
    visibility: hidden;
    pointer-events: none;
  }

  &.is-today {
    border-color: var(--uranus-color-6);
  }

  &.is-in-range {
    background: var(--uranus-select-bg);
    color: var(--uranus-select-color);
    opacity: 0.72;
  }

  &.is-selected,
  &.is-range-start,
  &.is-range-end {
    background: var(--uranus-select-bg-active);
    color: var(--uranus-select-color);
    border-color: var(--uranus-select-bg-active);
    opacity: 1;
  }

  &.is-disabled,
  &:disabled {
    cursor: not-allowed;
    opacity: 0.35;
  }
}

@media (max-width: 640px) {
  .uranus-calendar-day-select {
    width: 100%;
  }

  .uranus-calendar-day-select__months,
  .uranus-calendar-day-select__months.has-two-months {
    grid-template-columns: 1fr;
  }
}
</style>

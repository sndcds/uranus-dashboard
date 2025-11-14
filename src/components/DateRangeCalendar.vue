<template>
    <div class="date-range-calendar">
        <div class="date-range-calendar__nav">
            <button
                type="button"
                class="date-range-calendar__nav-btn"
                :aria-label="previousMonthLabel"
                @click="goToPreviousMonth"
            >
                ‹
            </button>
            <div class="date-range-calendar__nav-middle">
                <div class="date-range-calendar__nav-label">
                    {{ monthRangeLabel }}
                </div>
            </div>
            <button
                type="button"
                class="date-range-calendar__nav-btn"
                :aria-label="nextMonthLabel"
                @click="goToNextMonth"
            >
                ›
            </button>
        </div>

        <div class="date-range-calendar__months" @mouseleave="clearHover">
            <div v-for="month in months" :key="month.key" class="date-range-calendar__month">
                <div class="date-range-calendar__month-header">
                    <div class="date-range-calendar__month-label">{{ month.label }}</div>
                    <label class="date-range-calendar__month-select">
                        <span class="sr-only">Select year</span>
                        <select
                            class="date-range-calendar__year-select"
                            :value="month.year"
                            @change="onMonthYearChange(month.offset, $event)"
                        >
                            <option v-for="year in getYearOptionsFor(month.offset)" :key="year" :value="year">
                                {{ year }}
                            </option>
                        </select>
                    </label>
                </div>
                <div class="date-range-calendar__weekday-grid">
                    <span v-for="weekday in weekdayLabels" :key="weekday" class="date-range-calendar__weekday">
                        {{ weekday }}
                    </span>
                </div>
                <div class="date-range-calendar__day-grid">
                    <button
                        v-for="day in month.days"
                        :key="day.iso"
                        type="button"
                        class="date-range-calendar__day"
                        :class="dayClass(day)"
                        :data-date="day.iso"
                        @click="selectDay(day)"
                        @mouseenter="onHover(day.iso)"
                    >
                        {{ day.label }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Props {
    start: string | null
    end: string | null
    locale: string
    previousMonthLabel: string
    nextMonthLabel: string
}

interface CalendarDay {
    iso: string
    label: number
    isCurrentMonth: boolean
}

interface MonthView {
    key: string
    label: string
    heading: string
    days: CalendarDay[]
    year: number
    offset: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
    (e: 'update:start', value: string | null): void
    (e: 'update:end', value: string | null): void
}>()

const hoveredDate = ref<string | null>(null)
const selectionPhase = ref<'idle' | 'selecting-end'>('idle')

const today = new Date()
const initialStart = startOfMonth(parseISODate(props.start) ?? today)
const calendarMonths = ref<[Date, Date]>([
    initialStart,
    addMonths(initialStart, 1),
])
const minYear = 1970
const maxYear = 2100

const monthYearFormatter = computed(() => new Intl.DateTimeFormat(props.locale, {
    month: 'long',
    year: 'numeric',
}))

const monthNameFormatter = computed(() => new Intl.DateTimeFormat(props.locale, {
    month: 'long',
}))

const weekdayFormatter = computed(() => new Intl.DateTimeFormat(props.locale, {
    weekday: 'short',
}))

const weekdayLabels = computed(() => {
    const base = new Date(Date.UTC(2021, 0, 4)) // Monday
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(base)
        date.setDate(base.getDate() + index)
        return weekdayFormatter.value.format(date)
    })
})

const months = computed<MonthView[]>(() => {
    return calendarMonths.value.map((monthDate, index) => ({
        key: `${monthDate.getFullYear()}-${monthDate.getMonth()}-${index}`,
        label: capitalize(monthNameFormatter.value.format(monthDate)),
        heading: capitalize(monthYearFormatter.value.format(monthDate)),
        days: buildDaysForMonth(monthDate),
        year: monthDate.getFullYear(),
        offset: index,
    }))
})

const monthRangeLabel = computed(() => months.value.map((month) => month.heading).join(' – '))

const todayIso = formatISODate(today)

const yearOptions = computed(() => {
    return Array.from({ length: maxYear - minYear + 1 }, (_, index) => minYear + index)
})

const normalizedRange = computed(() => {
    if (props.start && props.end) {
        return props.start <= props.end
            ? { start: props.start, end: props.end }
            : { start: props.end, end: props.start }
    }
    return null
})

const previewRange = computed(() => {
    if (props.start && !props.end && hoveredDate.value) {
        if (hoveredDate.value === props.start) {
            return null
        }

        return hoveredDate.value > props.start
            ? { start: props.start, end: hoveredDate.value }
            : { start: hoveredDate.value, end: props.start }
    }
    return null
})

watch(
    () => [props.start, props.end],
    ([start, end]) => {
        const target = parseISODate(start ?? end)
        if (!target) {
            return
        }

        const monthTarget = startOfMonth(target)
        if (!isMonthVisible(monthTarget)) {
            alignMonthsToTarget(monthTarget)
        }

        if (!start || end) {
            selectionPhase.value = 'idle'
        }
    }
)

watch(() => props.end, () => {
    if (props.end) {
        hoveredDate.value = null
    }
})

const goToPreviousMonth = () => {
    shiftCalendarMonths(-1)
}

const goToNextMonth = () => {
    shiftCalendarMonths(1)
}

const onHover = (iso: string) => {
    hoveredDate.value = iso
}

const clearHover = () => {
    hoveredDate.value = null
}

const onMonthYearChange = (offset: number, event: Event) => {
    const target = event.target as HTMLSelectElement
    const selectedYear = Number(target.value)
    if (Number.isNaN(selectedYear)) return
    setCalendarMonthYear(offset, selectedYear)
}

const dayClass = (day: CalendarDay) => {
    const classes: string[] = []
    if (!day.isCurrentMonth) {
        classes.push('is-outside')
    }
    if (day.iso === todayIso) {
        classes.push('is-today')
    }
    if (day.iso === props.start) {
        classes.push('is-start')
    }
    if (day.iso === props.end) {
        classes.push('is-end')
    }
    if (isWithinSelectedRange(day.iso)) {
        classes.push('is-in-range')
    }
    if (isWithinPreviewRange(day.iso)) {
        classes.push('is-preview')
    }
    if (isRangeEdge(day.iso) || isPreviewEdge(day.iso)) {
        classes.push('is-range-edge')
    }
    return classes
}

const isWithinSelectedRange = (iso: string) => {
    if (!normalizedRange.value) return false
    return iso > normalizedRange.value.start && iso < normalizedRange.value.end
}

const isWithinPreviewRange = (iso: string) => {
    if (!previewRange.value) return false
    return iso > previewRange.value.start && iso < previewRange.value.end
}

const isRangeEdge = (iso: string) => {
    if (!normalizedRange.value) return false
    return iso === normalizedRange.value.start || iso === normalizedRange.value.end
}

const isPreviewEdge = (iso: string) => {
    if (!previewRange.value) return false
    return iso === previewRange.value.start || iso === previewRange.value.end
}

const selectDay = (day: CalendarDay) => {
    const iso = day.iso

    if (selectionPhase.value === 'idle') {
        startNewRange(iso)
        return
    }

    if (!props.start) {
        startNewRange(iso)
        return
    }

    if (iso <= props.start) {
        startNewRange(iso)
        return
    }

    emit('update:end', iso)
    selectionPhase.value = 'idle'
}

const startNewRange = (iso: string) => {
    emit('update:start', iso)
    emit('update:end', null)
    selectionPhase.value = 'selecting-end'
}

const buildDaysForMonth = (monthDate: Date) => {
    const start = startOfWeek(startOfMonth(monthDate))
    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(start)
        day.setDate(start.getDate() + index)
        return {
            iso: formatISODate(day),
            label: day.getDate(),
            isCurrentMonth: day.getMonth() === monthDate.getMonth(),
        }
    })
}

function startOfMonth(date: Date) {
    const next = new Date(date)
    next.setDate(1)
    next.setHours(0, 0, 0, 0)
    return next
}

function startOfWeek(date: Date) {
    const next = new Date(date)
    const day = (next.getDay() + 6) % 7 // Monday start
    next.setDate(next.getDate() - day)
    next.setHours(0, 0, 0, 0)
    return next
}

function addMonths(date: Date, amount: number) {
    const next = new Date(date)
    next.setMonth(next.getMonth() + amount, 1)
    return startOfMonth(next)
}

function formatISODate(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function parseISODate(value: string | null | undefined) {
    if (!value) return null
    const [year, month, day] = value.split('-').map(Number)
    if (!year || !month || !day) return null
    return new Date(year, month - 1, day)
}

const isMonthVisible = (monthDate: Date) => {
    return calendarMonths.value.some((date) => date.getFullYear() === monthDate.getFullYear() && date.getMonth() === monthDate.getMonth())
}

function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

const shiftCalendarMonths = (delta: number) => {
    calendarMonths.value = calendarMonths.value.map((date) => addMonths(date, delta)) as [Date, Date]
}

const alignMonthsToTarget = (target: Date) => {
    const normalized = startOfMonth(target)
    const [first, second] = calendarMonths.value

    if (normalized < first) {
        calendarMonths.value = [normalized, addMonths(normalized, 1)] as [Date, Date]
        return
    }

    if (normalized > second) {
        calendarMonths.value = [addMonths(normalized, -1), normalized] as [Date, Date]
    }
}

const setCalendarMonthYear = (index: number, year: number) => {
    const clampedYear = Math.min(Math.max(year, minYear), maxYear)
    const currentMonth = calendarMonths.value[index]
    const newDate = startOfMonth(new Date(clampedYear, currentMonth.getMonth(), 1))
    setCalendarMonth(index, newDate)
}

const setCalendarMonth = (index: number, date: Date) => {
    const next = [...calendarMonths.value] as [Date, Date]
    next[index] = startOfMonth(date)

    if (index === 0 && next[0] > next[1]) {
        next[0] = startOfMonth(next[1])
    } else if (index === 1 && next[1] < next[0]) {
        next[1] = startOfMonth(next[0])
    }

    calendarMonths.value = next
}

const getYearOptionsFor = (offset: number) => {
    if (offset === 0) {
        return yearOptions.value
    }

    const minAllowed = calendarMonths.value[0].getFullYear()
    return yearOptions.value.filter((year) => year >= minAllowed)
}
</script>

<style scoped lang="scss">
.date-range-calendar {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.date-range-calendar__nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.date-range-calendar__nav-middle {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    align-items: center;
}

.date-range-calendar__nav-label {
    text-align: center;
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--color-text);
}

.date-range-calendar__nav-btn {
    border: 1px solid var(--border-soft);
    background: var(--input-bg);
    color: var(--color-text);
    border-radius: 999px;
    width: 32px;
    height: 32px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    cursor: pointer;
}

.date-range-calendar__nav-btn:hover:not(:disabled) {
    border-color: var(--accent-primary);
}

.date-range-calendar__months {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

@media (min-width: 768px) {
    .date-range-calendar__months {
        flex-direction: row;
    }
}

.date-range-calendar__month {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding: 0.75rem;
    border-radius: 12px;
    border: 1px solid var(--border-soft);
    background: var(--card-bg, #fff);
    flex: 1;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.date-range-calendar__month-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
}

.date-range-calendar__month-label {
    text-transform: capitalize;
    font-weight: 600;
    color: var(--color-text);
}

.date-range-calendar__month-select {
    display: inline-flex;
    align-items: center;
}

.date-range-calendar__year-select {
    border-radius: 999px;
    border: 1px solid var(--border-soft);
    padding: 0.25rem 0.75rem;
    background: var(--input-bg);
    font-size: 0.85rem;
    color: var(--color-text);
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

.date-range-calendar__weekday-grid,
.date-range-calendar__day-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    gap: 0.2rem;
}

.date-range-calendar__weekday {
    font-size: 0.75rem;
    text-align: center;
    color: var(--muted-text);
    text-transform: capitalize;
}

.date-range-calendar__day {
    border: none;
    border-radius: 8px;
    padding: 0.4rem 0;
    background: transparent;
    color: var(--color-text);
    cursor: pointer;
    font-weight: 400;
    font-size: 0.9rem;
    transition: background 0.15s ease, color 0.15s ease;
}

@media (max-width: 520px) {
    .date-range-calendar__day {
        font-size: 0.85rem;
        padding: 0.35rem 0;
    }
}

.date-range-calendar__day.is-outside {
    color: var(--muted-text);
}

.date-range-calendar__day.is-today {
    border: 1px solid var(--accent-primary);
}

.date-range-calendar__day.is-in-range,
.date-range-calendar__day.is-preview {
    background: rgba(79, 70, 229, 0.15);
    color: var(--color-text);
}

.date-range-calendar__day.is-start,
.date-range-calendar__day.is-end,
.date-range-calendar__day.is-range-edge {
    background: var(--accent-primary);
    color: #fff;
}

.date-range-calendar__day:hover {
    background: rgba(79, 70, 229, 0.15);
}

@media (max-width: 520px) {
    .date-range-calendar__nav-label {
        font-size: 0.85rem;
    }
}
</style>
.date-range-calendar__month + .date-range-calendar__month {
    margin-top: 0.5rem;
}

@media (min-width: 768px) {
    .date-range-calendar__month + .date-range-calendar__month {
        margin-top: 0;
    }
}

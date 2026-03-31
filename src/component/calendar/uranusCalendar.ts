export type CalendarViewMode = 'day' | 'week' | 'month'

export interface CalendarAdapter<TItem> {
  getId: (item: TItem) => string | number
  getStart: (item: TItem) => Date | string | number
  getEnd: (item: TItem) => Date | string | number
  getTitle: (item: TItem) => string
  getColor?: (item: TItem) => string
  getTextColor?: (item: TItem) => string | undefined
  getSearchText?: (item: TItem) => string
  isAllDay?: (item: TItem, startDate: Date, endDate: Date) => boolean
}

export interface CalendarLabels {
  create: string
  previous: string
  next: string
  details: string
  emptyDay: string
  selectEntry: string
  searchPlaceholder: string
  today: string
  day: string
  week: string
  month: string
  allDay: string
  more: (count: number) => string
}

export interface CalendarNormalizedEntry<TItem> {
  id: string
  item: TItem
  title: string
  startDate: Date
  endDate: Date
  dateKey: string
  compactTime: string
  color: string
  textColor?: string
  isAllDay: boolean
}

export interface CalendarPositionedEntry<TItem> extends CalendarNormalizedEntry<TItem> {
  displayStartDate: Date
  displayEndDate: Date
  top: number
  height: number
  left: number
  width: number
}

export interface CalendarDayCell<TItem> {
  date: Date
  dateKey: string
  inCurrentMonth: boolean
  entries: CalendarNormalizedEntry<TItem>[]
}

export interface CalendarWeekDayColumn<TItem> {
  date: Date
  dateKey: string
  weekday: string
  dayNumber: string
  entries: CalendarNormalizedEntry<TItem>[]
}

export function createCalendarAdapter<TItem>(adapter: CalendarAdapter<TItem>) {
  return adapter
}

export function defaultIsAllDayRange(startDate: Date, endDate: Date) {
  const duration = endDate.getTime() - startDate.getTime()

  return (
    duration >= 24 * 60 * 60 * 1000 ||
    (startDate.getHours() === 0 && startDate.getMinutes() === 0 && endDate.getHours() >= 23)
  )
}

export function toValidDate(value: Date | string | number) {
  const date = value instanceof Date ? new Date(value) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999)
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function startOfWeek(date: Date) {
  const normalized = startOfDay(date)
  const day = normalized.getDay()
  const diff = day === 0 ? -6 : 1 - day
  return addDays(normalized, diff)
}

export function addDays(date: Date, amount: number) {
  const value = new Date(date)
  value.setDate(value.getDate() + amount)
  return startOfDay(value)
}

export function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function formatDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isSameDay(a: Date, b: Date) {
  return formatDateKey(a) === formatDateKey(b)
}

export function getWeekdayLabels(currentLocale: string, width: 'short' | 'narrow') {
  const start = startOfWeek(new Date(2026, 2, 30))
  return Array.from({ length: 7 }, (_, index) => {
    return new Intl.DateTimeFormat(currentLocale, { weekday: width }).format(addDays(start, index))
  })
}

export function formatCompactTime(startDate: Date, endDate: Date, currentLocale: string) {
  return new Intl.DateTimeFormat(currentLocale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(startDate)
    + ' - ' +
    new Intl.DateTimeFormat(currentLocale, {
      hour: 'numeric',
      minute: '2-digit',
    }).format(endDate)
}

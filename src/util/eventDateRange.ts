import type { UranusEventsDateRangeMode } from '@/store/eventsFilterStore.ts'

export type UranusPresetDateRangeMode = Exclude<UranusEventsDateRangeMode, 'custom'>

export const uranusPresetDateRangeModes: UranusPresetDateRangeMode[] = [
  'all_events',
  'today',
  'tomorrow',
  'weekend',
  'next_week',
  'following_weekend'
]

function formatDateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date)
  nextDate.setDate(nextDate.getDate() + days)
  return nextDate
}

export function resolveEventDateRange(mode: UranusPresetDateRangeMode) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (mode === 'all_events') {
    return {
      startDate: formatDateInputValue(today),
      endDate: ''
    }
  }

  if (mode === 'today') {
    return {
      startDate: formatDateInputValue(today),
      endDate: formatDateInputValue(today)
    }
  }

  if (mode === 'tomorrow') {
    const tomorrow = addDays(today, 1)
    return {
      startDate: formatDateInputValue(tomorrow),
      endDate: formatDateInputValue(tomorrow)
    }
  }

  if (mode === 'weekend') {
    const currentWeekday = today.getDay() // 0=Sun, 1=Mon ... 6=Sat

    let friday

    if (currentWeekday === 0) {
      // Sunday -> go back 2 days
      friday = addDays(today, -2)
    } else if (currentWeekday === 6) {
      // Saturday -> go back 1 day
      friday = addDays(today, -1)
    } else {
      // Mon-Fri -> upcoming/current Friday
      const daysUntilFriday = (5 - currentWeekday + 7) % 7
      friday = addDays(today, daysUntilFriday)
    }

    const sunday = addDays(friday, 2)

    return {
      startDate: formatDateInputValue(friday),
      endDate: formatDateInputValue(sunday)
    }
  }

  if (mode === 'following_weekend') {
    const currentWeekday = today.getDay() // 0=Sun ... 6=Sat

    // days until this week's Friday
    const daysUntilFriday = (5 - currentWeekday + 7) % 7

    // this week's Friday
    const thisFriday = addDays(today, daysUntilFriday)

    // following weekend = next week's Friday
    const friday = addDays(thisFriday, 7)
    const sunday = addDays(friday, 2)

    return {
      startDate: formatDateInputValue(friday),
      endDate: formatDateInputValue(sunday)
    }
  }

  const daysUntilNextMonday = ((8 - today.getDay()) % 7) || 7
  const nextMonday = addDays(today, daysUntilNextMonday)

  return {
    startDate: formatDateInputValue(nextMonday),
    endDate: formatDateInputValue(addDays(nextMonday, 6))
  }
}

export function inferEventDateRangeMode(startDate: string | null | undefined, endDate: string | null | undefined): UranusEventsDateRangeMode {
  const normalizedStartDate = startDate ?? ''
  const normalizedEndDate = endDate ?? ''
  if (!normalizedStartDate && !normalizedEndDate) return 'all_events'

  const matchingMode = uranusPresetDateRangeModes.find((mode) => {
    const range = resolveEventDateRange(mode)
    return range.startDate === normalizedStartDate && range.endDate === normalizedEndDate
  })

  return matchingMode ?? 'custom'
}

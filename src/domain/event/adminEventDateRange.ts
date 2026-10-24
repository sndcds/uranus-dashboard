import type { AdminEventListItem } from '@/domain/event/adminEventListItem'

export interface AdminEventDateRange {
    startDate: string
    endDate: string
}

export function formatLocalDate(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export function isCalendarDate(value: string | null | undefined): value is string {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
    const date = new Date(`${value}T12:00:00Z`)
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function monthDateRange(year: number, month: number, months = 1): AdminEventDateRange {
    return {
        startDate: formatLocalDate(new Date(year, month - 1, 1)),
        endDate: formatLocalDate(new Date(year, month + months - 1, 0)),
    }
}

export function isValidAdminEventDateRange(range: AdminEventDateRange): boolean {
    return (!range.startDate || isCalendarDate(range.startDate))
        && (!range.endDate || isCalendarDate(range.endDate))
        && (!range.startDate || !range.endDate || range.startDate <= range.endDate)
}

export function eventMatchesDateRange(event: AdminEventListItem, range: AdminEventDateRange): boolean {
    if (!isValidAdminEventDateRange(range)) return false
    if (!range.startDate && !range.endDate) return true
    if (!isCalendarDate(event.startDate)) return false
    const endDate = isCalendarDate(event.endDate) && event.endDate >= event.startDate ? event.endDate : event.startDate
    return (!range.startDate || endDate >= range.startDate) && (!range.endDate || event.startDate <= range.endDate)
}

// Dates and times are local civil values. Without an end time, retain the
// occurrence for the whole final day rather than assuming it ends at its start.
export function isPastAdminEvent(event: AdminEventListItem, now = new Date()): boolean {
    if (!isCalendarDate(event.startDate)) return false
    const endDate = isCalendarDate(event.endDate) && event.endDate >= event.startDate ? event.endDate : event.startDate
    const today = formatLocalDate(now)
    if (endDate !== today) return endDate < today
    if (event.allDay || !event.endTime || !/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(event.endTime)) return false
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    return `${event.endTime.slice(0, 5)}:${event.endTime.slice(6, 8) || '00'}` < currentTime
}

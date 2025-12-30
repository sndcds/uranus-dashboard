import {UranusEventDate, type UranusEventType} from "@/models/UranusEventModel.ts";

export function toNumberOrNull(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed.length) {
            return null
        }
        const parsed = Number(trimmed)
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

export const toString = (value: unknown, fallback = ''): string => {
    if (typeof value === 'string') return value
    if (value == null) return fallback
    return String(value)
}

export const toNullableString = (value: unknown): string | null => {
    if (typeof value === 'string') {
        const trimmed = value.trim()
        return trimmed.length ? trimmed : null
    }
    return null
}

export const toBoolean = (value: unknown): boolean => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value !== 0
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        if (!normalized) return false
        return normalized === 'true' || normalized === '1' || normalized === 'yes'
    }
    return false
}

export const buildPlutoPreviewImageUrl = (imageId: number) => {
    const params = new URLSearchParams({
        mode: 'cover',
        width: '480',
        ratio: '3:2',
        type: 'webp',
        quality: '80',
    })

    const apiBase = import.meta.env.VITE_API_URL
    return `${apiBase}/api/image/${imageId}?${params.toString()}`
}

export const buildPlutoEditImageUrl = (
    imageId: number,
    width: number = 1920,
    quality: number = 90,
    type: string = 'webp'
) => {
    if (imageId == null) return null

    const params = new URLSearchParams({
        width: String(width),
        type,
        quality: String(quality),
    })

    const apiBase = import.meta.env.VITE_API_URL
    return `${apiBase}/api/image/${imageId}?${params.toString()}`
}

export const uranusParseDate = (str: string): Date | null => {
    if (!str) return null

    // Trim and match YYYY-MM-DD exactly
    const match = str.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/)
    if (!match) return null

    const [, yearStr, monthStr, dayStr] = match
    const year = Number(yearStr)
    const month = Number(monthStr)
    const day = Number(dayStr)

    // Basic validation of month and day
    if (month < 1 || month > 12 || day < 1 || day > 31) return null

    return new Date(Date.UTC(year, month - 1, day))
}

/**
 * Formats ONLY the date ("YYYY-MM-DD") according to locale.
 */
export const uranusFormatDateOnly = (
    dateStr: string | null | undefined,
    locale = 'en'
): string => {
    if (!dateStr) return '' // handle null, undefined, or empty string

    const date = uranusParseDate(dateStr)
    if (!date) return '' // handle invalid date strings

    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(date)
}

export const uranusFormatTime = (
    timeStr: string | null | undefined,
    locale = 'en'
): string => {
    if (!timeStr) return ''

    const [hours, minutes] = timeStr.split(':').map(Number)

    const date = new Date()
    date.setHours(hours ?? 0, minutes ?? 0, 0, 0)

    // Create the formatter here
    const intlTime = new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
    })

    return intlTime.format(date)
}

export const uranusFormatEventDateTime = (
    startDate: string | null | undefined,
    startTime: string | null | undefined,
    endDate: string | null | undefined,
    endTime: string | null | undefined,
    locale: string = 'en'
): string => {
    if (!startDate) return ''

    const formatDateLocalized = (dateStr: string) => {
        const date = new Date(dateStr)
        if (isNaN(date.getTime())) return dateStr

        return new Intl.DateTimeFormat(locale, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date)
    }

    const formatTimeLocalized = (timeStr: string) => {
        const date = new Date(`1970-01-01T${timeStr}`)
        if (isNaN(date.getTime())) return timeStr

        return new Intl.DateTimeFormat(locale, {
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    const isSingleDay = !endDate || startDate === endDate

    if (isSingleDay) {
        const dateStr = formatDateLocalized(startDate)
        let timeStr = ''

        if (startTime && endTime) {
            timeStr = `${formatTimeLocalized(startTime)} - ${formatTimeLocalized(endTime)}`
        } else if (startTime) {
            timeStr = formatTimeLocalized(startTime)
        }

        return timeStr ? `${dateStr}, ${timeStr}` : dateStr
    } else {
        const startStr =
            `${formatDateLocalized(startDate)}${startTime ? ', ' + formatTimeLocalized(startTime) : ''}`

        const endStr =
            `${formatDateLocalized(endDate!)}${endTime ? ', ' + formatTimeLocalized(endTime) : ''}`

        return `${startStr} – ${endStr}`
    }
}

export const uranusEventTypeGenreString = (type: UranusEventType) => {
    if (type.genreName) {
        return `${type.typeName} / ${type.genreName}`
    }
    return type.typeName || ''
}


const formatDate = (dateStr: string, locale: string) => {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return dateStr

    return new Intl.DateTimeFormat(locale, {
        weekday: 'short',   // <--- ADD WEEKDAY
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(date)
}


export const formatTime = (timeStr: string | null, locale: string) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours ?? 0, minutes ?? 0, 0, 0)
    const intlTime = new Intl.DateTimeFormat(locale || 'de', {
        hour: '2-digit',
        minute: '2-digit',
    })
    return intlTime.format(date)
}

export const formatEventDateTime = (date: UranusEventDate, locale: string) => {
    if (!date || !date.startDate) return null

    // Local formatter that includes weekday
    const formatDateWithWeekday = (d: string) => formatDate(d, locale)

    const isSingleDay = !date.endDate || date.startDate === date.endDate

    if (isSingleDay) {
        const dateStr = formatDateWithWeekday(date.startDate)
        let timeStr = ''

        if (date.startTime && date.endTime) {
            timeStr = `${formatTime(date.startTime, locale)} - ${formatTime(date.endTime, locale)}`
        } else if (date.startTime) {
            timeStr = formatTime(date.startTime, locale)
        }

        return {
            date: dateStr,
            time: timeStr
        }
    } else {
        // Multi-day event
        return {
            startDate: formatDateWithWeekday(date.startDate),
            startTime: date.startTime ? formatTime(date.startTime, locale) : '',
            endDate: date.endDate ? formatDateWithWeekday(date.endDate) : '',
            endTime: date.endTime ? formatTime(date.endTime, locale) : ''
        }
    }
}

export function buildVenueSpaceKey(venue_id: number | null, space_id: number | null): string {
    if (venue_id === null || venue_id === undefined) return ""
    if (space_id === null || space_id === undefined) return `${venue_id}`
    return `${venue_id}_${space_id}`
}


export function urlParamsSetIfPresent(
    params: URLSearchParams,
    key: string,
    value: string | null | undefined
) {
    if (value?.trim()) {
        params.set(key, value)
    }
}

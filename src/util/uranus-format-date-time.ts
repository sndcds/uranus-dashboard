type DateFormatMode = 'long' | 'short'

// Format date using Intl API
export function formatDate(
    date: string,
    locale: string,
    mode: DateFormatMode = 'short'
) {
    const options: Intl.DateTimeFormatOptions =
        mode === 'long'
            ? { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
            : { weekday: 'short', year: '2-digit', month: '2-digit', day: '2-digit' }

    return new Intl.DateTimeFormat(locale, options).format(new Date(date))
}

// Format a single time (HH:mm) with leading zeros
export function formatTime(time: string, locale: string) {
    const [h, m] = time.split(':').map(Number)
    const d = new Date()
    d.setHours(h ?? 0, m ?? 0, 0, 0)
    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(d)
}

// Format a single time (HH:mm) with leading zeros
export function formatTimeForUI(time: string, locale: string) {
    const timeStr = formatTime(time, locale)
    if (locale.startsWith('de')) {
        return timeStr + ' Uhr'
    }
    if (locale.startsWith('da')) {
        return 'kl. ' + timeStr
    }
    return timeStr
}

// Format time range with localized prefix/postfix
export function formatTimeRangeForUI(startTime: string, locale: string, endTime?: string
) {
    let timeStr = ''
    const startStr = formatTime(startTime, locale)
    if (endTime) {
        const endStr = formatTime(endTime, locale)
        timeStr = `${startStr} – ${endStr}`
    }
    if (locale.startsWith('de')) {
        return timeStr + ' Uhr'
    }
    if (locale.startsWith('da')) {
        return 'kl.' + timeStr
    }
    return timeStr
}
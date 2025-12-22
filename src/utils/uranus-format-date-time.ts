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
export function formatTime(
    time: string,
    locale: string
) {
    const [h, m] = time.split(':').map(Number)

    const d = new Date()
    d.setHours(h ?? 0, m ?? 0, 0, 0)

    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(d)
}

// Format time range with localized prefix/postfix
export function formatTimeRange(
    start: string,
    locale: string,
    end?: string
) {
    if (locale.startsWith('de')) {
        return end ? `${start} – ${end} Uhr` : `${start} Uhr`
    }

    if (locale.startsWith('da')) {
        return end ? `kl. ${start} – ${end}` : `kl. ${start}`
    }

    return end ? `${start} – ${end}` : start
}
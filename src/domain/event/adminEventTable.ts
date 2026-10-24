import type { AdminEventListItem } from '@/domain/event/adminEventListItem'
import { eventMatchesDateRange, type AdminEventDateRange } from '@/domain/event/adminEventDateRange'

export type FieldState = 'present' | 'missing' | 'incomplete' | 'not_applicable' | 'unknown'
export const eventTableColumns = [
    'date', 'language', 'dates', 'subtitle', 'text', 'summary', 'images', 'categories',
    'types', 'genres', 'languageRelevant', 'tags', 'links', 'register', 'ticket', 'price', 'info',
] as const
export type EventTableColumn = typeof eventTableColumns[number]
export type MissingEventField = 'title' | 'date' | 'text' | 'categories' | 'images'
export const missingEventFields: MissingEventField[] = ['title', 'date', 'text', 'categories', 'images']
export type EventEditorTab = 'base' | 'dates' | 'tags' | 'register' | 'ticket' | 'images' | 'links'

export interface EventTableField {
    key: EventTableColumn
    state: FieldState
    value: string
    detail: string | null
    tab: EventEditorTab | null
    field: string | null
}

export type EventTableTranslate = (key: string, values?: Record<string, string | number>) => string

// SQL supplies civil dates and times separately. Use UTC only as a calendar for
// weekday calculation: never reinterpret these local values as UTC instants.
export function formatAdminEventDate(date: string | null | undefined, time: string | null | undefined, locale: string): string | null {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
    const calendar = new Date(`${date}T12:00:00Z`)
    if (!Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== date) return null
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' })
        .format(calendar).replace(/\.$/, '').toLocaleUpperCase(locale)
    const formattedDate = `${date.slice(8, 10)}.${date.slice(5, 7)}.${date.slice(2, 4)}`
    const formattedTime = time && /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(time) ? ` ${time.slice(0, 5)}` : ''
    return `${weekday} ${formattedDate}${formattedTime}`
}

export function countState(value: number | null | undefined, required = false): FieldState {
    if (value == null || !Number.isInteger(value) || value < 0) return 'unknown'
    return value > 0 ? 'present' : required ? 'missing' : 'not_applicable'
}

export function booleanState(value: boolean | null | undefined): FieldState {
    return value == null ? 'unknown' : value ? 'present' : 'not_applicable'
}

export function eventEditLocation(event: AdminEventListItem, tab: EventEditorTab = 'base', field: string | null = null) {
    return { path: `/admin/event/${event.uuid}`, query: { tab, ...(field ? { field } : {}) } }
}

export function hasMissingEventField(event: AdminEventListItem, field: MissingEventField): boolean {
    switch (field) {
        case 'title': return !event.title?.trim()
        case 'date': return !formatAdminEventDate(event.startDate, event.startTime, 'de')
        case 'text': return countState(event.descriptionLength, true) === 'missing'
        case 'categories': return event.categories !== undefined && !event.categories?.length
        case 'images': return event.imageCount === 0
    }
}

// Group only after filtering, and retain the first occurrence in API order.
// The list endpoint already orders occurrences chronologically.
export function filterAdminEvents(events: AdminEventListItem[], options: {
    search: string; status: string; missing: MissingEventField[]; grouped: boolean; descending: boolean
    dateRange?: AdminEventDateRange
}): AdminEventListItem[] {
    const search = options.search.trim().toLocaleLowerCase()
    const filtered = events.filter(event => {
        const canPreview = event.canViewEventInsights || event.canEditEvent || event.canDeleteEvent || !['draft', 'review'].includes(event.releaseStatus ?? '')
        return canPreview && (!options.status || event.releaseStatus === options.status)
            && (!options.dateRange || eventMatchesDateRange(event, options.dateRange))
            && (!search || [event.title, event.subtitle, event.venueName, event.venueCity, event.spaceName].some(value => value?.toLocaleLowerCase().includes(search)))
            && (!options.missing.length || options.missing.some(field => hasMissingEventField(event, field)))
    })
    const grouped = new Map<string, AdminEventListItem>()
    if (options.grouped) filtered.forEach(event => { if (!grouped.has(event.uuid)) grouped.set(event.uuid, event) })
    const result = options.grouped ? [...grouped.values()] : filtered
    // No sort by default: preserve the server's ordering (including undated drafts).
    return options.descending ? [...result].reverse() : result
}

export function mapAdminEventTableFields(event: AdminEventListItem, locale: string, t: EventTableTranslate,
    languageName: (code: string) => string, typeNames: string[], genreNames: string[]): EventTableField[] {
    const unknown = t('event_table_unknown')
    const fields: EventTableField[] = []
    function add(key: EventTableColumn, state: FieldState, value: string, detail: string | null, tab: EventEditorTab | null, field: string | null = null) {
        fields.push({ key, state, value, detail, tab, field })
    }
    const date = formatAdminEventDate(event.startDate, event.startTime, locale)
    const hasTime = !!event.startTime && /^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(event.startTime)
    add('date', date ? hasTime || event.allDay ? 'present' : 'incomplete' : 'missing', date ?? t('event_table_no_date'),
        date ? t(hasTime || event.allDay ? 'event_table_civil_date' : 'event_table_no_time') : null, 'dates')
    // languages are event languages; contentLanguage is the editorial language.
    // There is no primary event-language flag, so do not substitute contentLanguage.
    const languages = event.languages?.filter(Boolean)
    add('language', languages?.length ? 'present' : 'unknown', languages?.length ? `${languages[0]?.toUpperCase()}${languages.length > 1 ? ` +${languages.length - 1}` : ''}` : '–',
        languages?.length ? languages.map(languageName).join(', ') : unknown, 'tags')
    const total = event.seriesTotal
    const index = event.seriesIndex
    add('dates', total === 0 ? 'missing' : total == null ? 'unknown' : 'present',
        total == null ? '–' : index != null && total > 0 ? `${index}/${total}` : `${total}`,
        total == null ? unknown : index != null && total > 0 ? t('event_table_date_index', { index, total }) : t('event_table_date_count', { count: total }), 'dates')
    add('subtitle', event.subtitle === undefined ? 'unknown' : event.subtitle?.trim() ? 'present' : 'not_applicable', '', null, 'base', 'event-subtitle')
    add('text', countState(event.descriptionLength, true), '', event.descriptionLength == null ? unknown : t('event_table_characters', { count: event.descriptionLength }), 'base', 'event-description')
    add('summary', countState(event.summaryLength), '', event.summaryLength == null ? unknown : t('event_table_characters', { count: event.summaryLength }), 'base', 'event-summary')
    add('images', countState(event.imageCount), event.imageCount == null ? '–' : `${event.imageCount}`, event.imageCount == null ? unknown : t('event_table_count', { count: event.imageCount }), 'images')
    add('categories', event.categories === undefined ? 'unknown' : event.categories?.length ? 'present' : 'missing', '', null, 'base', 'event-categories')
    add('types', event.eventTypes === undefined ? 'unknown' : typeNames.length ? 'present' : 'not_applicable', event.eventTypes === undefined ? '–' : `${typeNames.length}`, typeNames.join(', ') || null, 'tags')
    add('genres', event.eventTypes === undefined ? 'unknown' : genreNames.length ? 'present' : 'not_applicable', event.eventTypes === undefined ? '–' : `${genreNames.length}`, genreNames.join(', ') || null, 'tags')
    // No language-relevance flag exists in the current domain. Do not infer it
    // from a language code, the content language, or the type of event.
    add('languageRelevant', 'unknown', '?', unknown, null)
    add('tags', countState(event.tagCount), event.tagCount == null ? '–' : `${event.tagCount}`, event.tagCount == null ? unknown : t('event_table_count', { count: event.tagCount }), 'tags')
    add('links', countState(event.linkCount), event.linkCount == null ? '–' : `${event.linkCount}`, event.linkCount == null ? unknown : t('event_table_count', { count: event.linkCount }), 'links')
    // False means no contact/link was found; it does not mean "not required".
    add('register', event.hasRegistration ? 'present' : 'unknown', event.hasRegistration ? '✓' : '–', event.hasRegistration ? null : t('event_table_requirement_unknown'), 'register')
    const ticketPresent = event.hasTicket || event.ticketFlags?.some(flag => ['advance_ticket', 'on_site_ticket_sales', 'presale_fee_applies', 'reduced_price_available'].includes(flag))
    add('ticket', ticketPresent ? 'present' : 'unknown', ticketPresent ? '✓' : '–', ticketPresent ? event.ticketFlags?.map(flag => t(`event_${flag}`)).join(', ') || null : t('event_table_requirement_unknown'), 'ticket')
    const priceKeys: Record<string, string> = { free: 'event_price_free', donation: 'event_price_donation', regular_price: 'event_price_regular', tiered_prices: 'event_price_tiered', not_specified: 'event_price_not_specified' }
    const priceKey = event.priceType ? priceKeys[event.priceType] : null
    const priced = event.priceType === 'regular_price' || event.priceType === 'tiered_prices'
    const amounts = [event.minPrice, event.maxPrice].filter((value): value is number => value != null)
    const priceState = !priceKey || event.priceType === 'not_specified' ? 'unknown' : priced && (!amounts.length || !event.currency) ? 'incomplete' : 'present'
    add('price', priceState, event.priceType === 'free' ? t('event_table_free') : priced ? amounts.length ? '✓' : '–' : '',
        priceKey ? [t(priceKey), amounts.map(amount => new Intl.NumberFormat(locale).format(amount)).join(' – '), event.currency].filter(Boolean).join(' · ') : unknown, 'ticket')
    add('info', 'present', '', null, null)
    return fields
}

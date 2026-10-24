import { describe, expect, it } from 'vitest'
import { booleanState, countState, eventEditLocation, eventTableColumns, filterAdminEvents, formatAdminEventDate, hasMissingEventField, mapAdminEventTableFields } from '@/domain/event/adminEventTable'
import { eventReleaseColor, eventReleaseStatuses } from '@/domain/event/eventReleaseStatus'
import { eventCategoryColor, eventCategoryLabelKey } from '@/domain/event/eventCategory'
import { uranusI18nEventTranslations } from '@/i18n/event'
import { makeAdminListEvent } from './fixtures/adminEventList'

const t = (key: string, values: Record<string, string | number> = {}) => {
    let text = uranusI18nEventTranslations[key]?.de ?? key
    Object.entries(values).forEach(([name, value]) => { text = text.replaceAll(`{${name}}`, `${value}`) })
    return text
}
const fields = (overrides: Parameters<typeof makeAdminListEvent>[0] = {}) => mapAdminEventTableFields(makeAdminListEvent(overrides), 'de', t, code => code === 'de' ? 'Deutsch' : 'Dänisch', ['Konzert', 'Show'], ['Gospel', 'Jazz'])

describe('admin event table data', () => {
    it.each([
        ['2026-10-19', 'MO'], ['2026-10-20', 'DI'], ['2026-10-21', 'MI'], ['2026-10-22', 'DO'],
        ['2026-10-23', 'FR'], ['2026-10-24', 'SA'], ['2026-10-25', 'SO'],
    ])('formats German weekdays for %s', (date, weekday) => {
        expect(formatAdminEventDate(date, '10:00:00', 'de')).toBe(`${weekday} ${date.slice(8)}.10.26 10:00`)
    })
    it('keeps civil dates stable across timezones and daylight saving boundaries', () => {
        const previous = process.env.TZ
        try {
            for (const zone of ['Pacific/Honolulu', 'Pacific/Kiritimati', 'Europe/Berlin', 'America/New_York']) {
                process.env.TZ = zone
                expect(formatAdminEventDate('2026-10-25', '00:30', 'de')).toBe('SO 25.10.26 00:30')
                expect(formatAdminEventDate('2026-03-29', '02:30', 'de')).toBe('SO 29.03.26 02:30')
            }
        } finally { if (previous === undefined) delete process.env.TZ; else process.env.TZ = previous }
    })
    it('uses the UI locale and handles absent or invalid dates and times', () => {
        expect(formatAdminEventDate('2026-10-25', '10:00', 'en')).toBe('SUN 25.10.26 10:00')
        for (const value of [null, undefined, '', '2026-02-30', '2026-13-01', '2026-10-25T00:00:00Z']) expect(formatAdminEventDate(value, null, 'de')).toBeNull()
        expect(formatAdminEventDate('2026-10-25', '25:30', 'de')).toBe('SO 25.10.26')
        expect(fields({ startDate: null })[0]?.state).toBe('missing')
        expect(fields({ startTime: null })[0]?.state).toBe('incomplete')
        expect(fields({ startTime: null, allDay: true })[0]?.state).toBe('present')
    })
    it('uses the existing release and category tokens, including safe unknown values', () => {
        for (const status of eventReleaseStatuses) expect(eventReleaseColor(status)).toBe(`var(--uranus-event-release-background-${status})`)
        expect(eventReleaseColor('published')).toBe('var(--uranus-color-4)')
        expect(eventReleaseColor(null)).toBe('var(--uranus-color-4)')
        expect(eventCategoryColor(1)).toBe('var(--uranus-event-category-culture-color)')
        expect(eventCategoryColor(8)).toBe('var(--uranus-event-category-food-and-drink-color)')
        expect(eventCategoryLabelKey(2)).toBe('event_filter_category_education')
        expect(eventCategoryColor(900)).toBe('var(--uranus-color-4)')
        expect(eventCategoryLabelKey(900)).toBeNull()
    })
    it('distinguishes optional, required, unknown and explicit false data', () => {
        expect(countState(undefined)).toBe('unknown')
        expect(countState(-1)).toBe('unknown')
        expect(countState(0)).toBe('not_applicable')
        expect(countState(0, true)).toBe('missing')
        expect(booleanState(false)).toBe('not_applicable')
        expect(booleanState(null)).toBe('unknown')
        const data = fields({ descriptionLength: 0, summaryLength: 0, subtitle: null, hasRegistration: false, hasTicket: false, ticketFlags: [], imageCount: 0, priceType: 'free', minPrice: 0 })
        expect(data.find(f => f.key === 'text')?.state).toBe('missing')
        expect(data.find(f => f.key === 'summary')?.state).toBe('not_applicable')
        expect(data.find(f => f.key === 'subtitle')?.state).toBe('not_applicable')
        expect(data.find(f => f.key === 'images')?.state).toBe('not_applicable')
        expect(data.find(f => f.key === 'register')?.state).toBe('unknown')
        expect(data.find(f => f.key === 'ticket')?.state).toBe('unknown')
        expect(data.find(f => f.key === 'languageRelevant')?.state).toBe('unknown')
        expect(data.find(f => f.key === 'price')?.value).toBe('Frei')
    })
    it('provides exactly 17 fixed fields and explains the actual series fraction', () => {
        const data = fields()
        expect(data.map(f => f.key)).toEqual(eventTableColumns)
        expect(data).toHaveLength(17)
        expect(data.find(f => f.key === 'dates')).toMatchObject({ value: '2/3', detail: expect.stringContaining('kein Bearbeitungsstand') })
        expect(data.find(f => f.key === 'language')).toMatchObject({ value: 'DE +1', detail: 'Deutsch, Dänisch' })
        expect(data.find(f => f.key === 'images')?.detail).toBe('Anzahl: 4')
        expect(data.find(f => f.key === 'text')?.detail).toBe('1284 Zeichen')
        expect(fields({ seriesTotal: 0, seriesIndex: 1 }).find(f => f.key === 'dates')?.value).toBe('0')
        expect(fields({ imageCount: undefined, descriptionLength: undefined } as any).find(f => f.key === 'images')?.state).toBe('unknown')
    })
    it('does not replace absent event languages with the editorial language', () => {
        expect(fields({ languages: [], contentLanguage: 'de' }).find(f => f.key === 'language')).toMatchObject({ state: 'unknown', value: '–' })
    })
    it('respects price types without treating zero as a ticket or registration exemption', () => {
        expect(fields({ priceType: 'donation' }).find(f => f.key === 'price')?.state).toBe('present')
        expect(fields({ priceType: 'regular_price', minPrice: null, maxPrice: null }).find(f => f.key === 'price')?.state).toBe('incomplete')
        expect(fields({ priceType: 'tiered_prices', currency: null }).find(f => f.key === 'price')?.state).toBe('incomplete')
        expect(fields({ priceType: 'not_specified' }).find(f => f.key === 'price')?.state).toBe('unknown')
        expect(fields({ hasTicket: false, ticketFlags: ['on_site_ticket_sales'] }).find(f => f.key === 'ticket')?.state).toBe('present')
    })
    it('filters missing fields with OR and composes them with search and status', () => {
        const events = [makeAdminListEvent({ uuid: 'a', title: '', releaseStatus: 'draft' }), makeAdminListEvent({ uuid: 'b', descriptionLength: 0 }), makeAdminListEvent({ uuid: 'c' })]
        const options = { search: '', status: '', missing: ['title', 'text'] as const, grouped: false, descending: false }
        expect(filterAdminEvents(events, { ...options, missing: [...options.missing] }).map(e => e.uuid)).toEqual(['a', 'b'])
        expect(filterAdminEvents(events, { ...options, missing: [...options.missing], status: 'released', search: 'Rendsburg' }).map(e => e.uuid)).toEqual(['b'])
        expect(hasMissingEventField(makeAdminListEvent({ descriptionLength: undefined } as any), 'text')).toBe(false)
        expect(hasMissingEventField(makeAdminListEvent({ imageCount: 0 }), 'images')).toBe(true)
        expect(hasMissingEventField(makeAdminListEvent({ categories: null }), 'categories')).toBe(true)
    })
    it('keeps the first relevant occurrence while grouping and retains API ordering', () => {
        const a = makeAdminListEvent({ uuid: 'a', dateUuid: 'a1', startDate: '2026-10-25' })
        const b = makeAdminListEvent({ uuid: 'b', dateUuid: 'b1', startDate: '2026-10-26' })
        const a2 = makeAdminListEvent({ uuid: 'a', dateUuid: 'a2', startDate: '2026-10-27' })
        const options = { search: '', status: '', missing: [], grouped: true, descending: false }
        expect(filterAdminEvents([a, b, a2], options)).toEqual([a, b])
        expect(filterAdminEvents([a, b, a2], { ...options, descending: true })).toEqual([b, a])
        expect(eventEditLocation(a, 'base', 'event-summary')).toEqual({ path: '/admin/event/a', query: { tab: 'base', field: 'event-summary' } })
    })
})

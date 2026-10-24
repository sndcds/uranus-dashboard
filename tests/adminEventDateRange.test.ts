import { describe, expect, it } from 'vitest'
import { eventMatchesDateRange, isPastAdminEvent, isValidAdminEventDateRange, monthDateRange } from '@/domain/event/adminEventDateRange'
import { filterAdminEvents } from '@/domain/event/adminEventTable'
import { makeAdminListEvent } from './fixtures/adminEventList'

describe('admin event date ranges', () => {
    it('resolves whole months and quarters, including leap years and year boundaries', () => {
        expect(monthDateRange(2024, 2)).toEqual({ startDate: '2024-02-01', endDate: '2024-02-29' })
        expect(monthDateRange(2026, 2)).toEqual({ startDate: '2026-02-01', endDate: '2026-02-28' })
        expect(monthDateRange(2026, 10, 3)).toEqual({ startDate: '2026-10-01', endDate: '2026-12-31' })
        expect(monthDateRange(2027, 1, 3)).toEqual({ startDate: '2027-01-01', endDate: '2027-03-31' })
    })
    it('includes overlapping events and both boundaries, with optional from/to limits', () => {
        const range = { startDate: '2026-10-01', endDate: '2026-10-31' }
        for (const startDate of ['2026-10-01', '2026-10-31']) expect(eventMatchesDateRange(makeAdminListEvent({ startDate }), range)).toBe(true)
        expect(eventMatchesDateRange(makeAdminListEvent({ startDate: '2026-09-30', endDate: '2026-10-01' }), range)).toBe(true)
        expect(eventMatchesDateRange(makeAdminListEvent({ startDate: '2026-09-30' }), range)).toBe(false)
        expect(eventMatchesDateRange(makeAdminListEvent({ startDate: '2026-11-01' }), range)).toBe(false)
        expect(eventMatchesDateRange(makeAdminListEvent({ startDate: '2027-01-01' }), { ...range, endDate: '' })).toBe(true)
        expect(eventMatchesDateRange(makeAdminListEvent({ startDate: '2025-01-01' }), { ...range, startDate: '' })).toBe(true)
        expect(eventMatchesDateRange(makeAdminListEvent({ startDate: null }), range)).toBe(false)
        expect(eventMatchesDateRange(makeAdminListEvent({ startDate: null }), { startDate: '', endDate: '' })).toBe(true)
    })
    it('rejects invalid and reversed ranges', () => {
        for (const range of [{ startDate: '2026-02-30', endDate: '' }, { startDate: '2026-11-01', endDate: '2026-10-31' }]) {
            expect(isValidAdminEventDateRange(range)).toBe(false)
            expect(eventMatchesDateRange(makeAdminListEvent(), range)).toBe(false)
        }
    })
    it('filters before grouping so a series retains the occurrence inside the range', () => {
        const outside = makeAdminListEvent({ dateUuid: 'september', startDate: '2026-09-30' })
        const inside = makeAdminListEvent({ dateUuid: 'october', startDate: '2026-10-01' })
        expect(filterAdminEvents([outside, inside], { search: '', status: '', missing: [], grouped: true, descending: false, dateRange: monthDateRange(2026, 10) })).toEqual([inside])
    })
    it('marks completed dates as past and retains ongoing, all-day and undated events', () => {
        const now = new Date(2026, 9, 24, 12, 0, 0)
        expect(isPastAdminEvent(makeAdminListEvent({ startDate: '2026-10-23' }), now)).toBe(true)
        expect(isPastAdminEvent(makeAdminListEvent({ startDate: '2026-10-23', endDate: '2026-10-24' }), now)).toBe(false)
        expect(isPastAdminEvent(makeAdminListEvent({ startDate: '2026-10-23', endDate: '2026-10-25', endTime: '10:00' }), now)).toBe(false)
        expect(isPastAdminEvent(makeAdminListEvent({ startDate: '2026-10-24', startTime: '10:00' }), now)).toBe(false)
        expect(isPastAdminEvent(makeAdminListEvent({ startDate: '2026-10-24', endTime: '11:59:59' }), now)).toBe(true)
        expect(isPastAdminEvent(makeAdminListEvent({ startDate: '2026-10-24', endTime: '12:00:00' }), now)).toBe(false)
        expect(isPastAdminEvent(makeAdminListEvent({ startDate: '2026-10-24', endTime: '13:00' }), now)).toBe(false)
        expect(isPastAdminEvent(makeAdminListEvent({ startDate: '2026-10-24', endTime: '10:00', allDay: true }), now)).toBe(false)
        for (const startDate of [null, '2026-02-30']) expect(isPastAdminEvent(makeAdminListEvent({ startDate }), now)).toBe(false)
    })
})

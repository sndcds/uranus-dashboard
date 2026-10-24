import type { AdminEventListItem } from '@/domain/event/adminEventListItem'

export function makeAdminListEvent(overrides: Partial<AdminEventListItem> = {}): AdminEventListItem {
    return {
        uuid: 'event-1', dateUuid: 'date-1', releaseStatus: 'released', title: 'Gospelkonzert mit Isaac Cates, Kansas (USA)',
        subtitle: 'Musik in der Christkirche', categories: [1, 2, 3, 4], canEditEvent: true, canDeleteEvent: true,
        canReleaseEvent: true, canViewEventInsights: true, isOnlineEvent: false, orgUuid: 'org-1', orgName: 'Kulturhaus Nord',
        venueUuid: 'venue-1', venueName: 'Christkirche', venueCity: 'Rendsburg', imageUrl: '/assets/event_placeholder.webp',
        startDate: '2026-10-25', startTime: '10:00', seriesIndex: 2, seriesTotal: 3,
        eventTypes: [{ typeId: 1, genreId: 1 }, { typeId: 1, genreId: 2 }, { typeId: 2, genreId: null }],
        languages: ['de', 'da'], contentLanguage: 'de', descriptionLength: 1284, summaryLength: 200,
        imageCount: 4, tagCount: 14, linkCount: 3, hasRegistration: true, hasTicket: true,
        ticketFlags: ['advance_ticket'], priceType: 'regular_price', minPrice: 10, maxPrice: 20, currency: 'EUR',
        ...overrides,
    }
}

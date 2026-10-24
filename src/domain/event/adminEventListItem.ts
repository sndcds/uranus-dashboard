/*
    src/domain/event/adminEventListItem.ts
 */

import { type EventTypePairModel } from '@/domain/event/eventTypePair.model.ts'

export interface AdminEventListItem {
    uuid: string
    dateUuid: string | null
    releaseStatus?: string | null
    releaseDate?: string | null
    categories: number[] | null
    canEditEvent: boolean
    canDeleteEvent: boolean
    canReleaseEvent: boolean
    canViewEventInsights: boolean
    isOnlineEvent: boolean
    onlineLink?: string | null
    orgUuid: string
    orgName?: string | null
    venueUuid?: string | null
    venueName?: string | null
    venueCity?: string | null
    spaceUuid?: string | null
    spaceName?: string | null
    imageUuid?: string | null
    imageUrl?: string | null
    seriesIndex?: number | null
    seriesTotal?: number | null
    startDate: string | null
    startTime: string | null
    allDay?: boolean | null
    endDate?: string | null
    endTime?: string | null
    title: string
    subtitle?: string | null
    eventTypes?: EventTypePairModel[] | null
    // Optional additions to the existing list response. Absent on older servers.
    contentLanguage?: string | null
    languages?: string[] | null
    descriptionLength?: number | null
    summaryLength?: number | null
    imageCount?: number | null
    tagCount?: number | null
    linkCount?: number | null
    hasRegistration?: boolean | null
    hasTicket?: boolean | null
    ticketFlags?: string[] | null
    priceType?: string | null
    minPrice?: number | null
    maxPrice?: number | null
    currency?: string | null
}

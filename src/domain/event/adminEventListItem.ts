/*
    src/domain/event/adminEventListItem.ts
 */

import { type EventTypePairModel } from '@/domain/event/eventTypePair.model.ts'

export interface AdminEventListItem {
    uuid: string
    dateUuid: string
    releaseStatus?: string | null
    releaseDate?: string | null
    categories: number[] | null
    canEditEvent: boolean
    canDeleteEvent: boolean
    canReleaseEvent: boolean
    canViewEventInsights: boolean
    isOnlineEvent: boolean
    orgUuid: string
    orgName?: string | null
    venueUuid?: string | null
    venueName?: string | null
    spaceUuid?: string | null
    spaceName?: string | null
    imageUuid?: string | null
    imageUrl?: string | null
    seriesIndex?: number | null
    seriesTotal?: number | null
    startDate: string
    startTime: string
    endDate?: string | null
    endTime?: string | null
    title: string
    subtitle?: string | null
    eventTypes?: EventTypePairModel[] | null
}
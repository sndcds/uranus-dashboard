import { type EventTypePairModel } from '@/domain/event/eventTypePair.model.ts'


// Used for event lists in admin dashboards
export interface AdminEventListItemModel {
    uuid: string
    dateUuid: string
    releaseStatus?: string | null
    releaseDate?: string | null
    categories: number[] | null
    canEditEvent: boolean
    canDeleteEvent: boolean
    canReleaseEvent: boolean
    canViewEventInsights: boolean
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
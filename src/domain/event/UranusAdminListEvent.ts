import { type UranusAdminEventTypePair } from '@/domain/event/UranusAdminEventTypePair.ts'


// Used for event lists in admin dashboards
export interface UranusAdminListEvent {
    id: number
    dateId: number
    releaseStatus?: string | null
    releaseDate?: string | null
    canEditEvent: boolean
    canDeleteEvent: boolean
    canReleaseEvent: boolean
    organizationId: number
    organizationName?: string | null
    venueId?: number | null
    venueName?: string | null
    spaceId?: number | null
    spaceName?: string | null
    imageId?: number | null
    imageUrl?: string | null
    seriesIndex?: number | null
    seriesTotal?: number | null
    startDate: string
    startTime: string
    endDate?: string | null
    endTime?: string | null
    title: string
    subtitle?: string | null
    eventTypes?: UranusAdminEventTypePair[] | null
}
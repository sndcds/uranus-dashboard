/*
    src/domain/event/basicVenueInfo.model.ts
 */

export type VenueRecordKind = 'standard' | 'provisional'

export interface BasicVenueInfo {
    venueUuid: string
    venueName: string
    recordKind?: VenueRecordKind | null
    spaceUuid: string | null
    spaceName: string | null
    city: string | null
    country: string| null
}

export interface BasicVenueSpacesInfo {
    venueUuid: string
    venueName: string
    recordKind?: VenueRecordKind | null
    city: string| null
    spaces: {
        spaceUuid: string | null
        spaceName: string | null
        city: string| null
    }[]
}
/*
    src/domain/event/basicVenueInfo.model.ts
 */

export type VenueScope = 'shared' | 'organization'

export interface BasicVenueInfo {
    venueUuid: string
    venueName: string
    scope?: VenueScope | null
    spaceUuid: string | null
    spaceName: string | null
    city: string | null
    country: string| null
}

export interface BasicVenueSpacesInfo {
    venueUuid: string
    venueName: string
    scope?: VenueScope | null
    city: string| null
    spaces: {
        spaceUuid: string | null
        spaceName: string | null
        city: string| null
    }[]
}
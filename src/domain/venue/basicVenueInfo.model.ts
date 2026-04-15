/*
    src/domain/event/basicVenueInfo.model.ts
 */

export interface BasicVenueInfo {
    venueUuid: string
    venueName: string
    spaceUuid: string | null
    spaceName: string | null
    city: string
    country: string
}

export interface BasicVenueSpacesInfo {
    venueUuid: string
    venueName: string
    city: string
    spaces: {
        spaceUuid: string | null
        spaceName: string | null
        city: string
    }[]
}
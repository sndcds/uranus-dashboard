/*
    src/api/dto/basicVenueInfo.dto.ts
 */

export interface BasicVenueInfoDTO {
    venue_uuid: string
    venue_name: string
    space_uuid: string | null
    space_name: string | null
    city: string
    country: string
}
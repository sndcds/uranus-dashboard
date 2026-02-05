import { type UranusVenueInfo } from '@/domain/venue/UranusVenueInfo.ts'

export interface UranusVenueInfoDTO {
    venue_id: number
    venue_name: string
    space_id: number | null
    space_name: string | null
}

export function mapVenueInfo(dto: UranusVenueInfoDTO): UranusVenueInfo {
    return {
        venueId: dto.venue_id,
        venueName: dto.venue_name,
        spaceId: dto.space_id,
        spaceName: dto.space_name,
    }
}
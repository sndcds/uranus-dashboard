import { type UranusVenueInfo } from './UranusVenueInfo.ts'

export type UranusGroupedVenue = {
    venueId: number
    venueName: string
    city: string
    venueInfos: UranusVenueInfo[]
}
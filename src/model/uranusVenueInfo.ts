// src/model/uranusVenueInfo.ts

export interface VenueInfoSpaceInfo {
    spaceId: number
    spaceName: string
    upcomingEventCount: number
}

export interface UranusVenueInfo {
    venueId: number
    venueName: string
    venueLogoImageId: number
    upcomingEventCount: number
    spaceInfos: VenueInfoSpaceInfo[]
    canEdit: boolean
    canEditVenue: boolean
    canDeleteVenue: boolean
    canAddSpace: boolean
    canEditSpace: boolean
    canDeleteSpace: boolean
    canAddEvent: boolean
    canEditEvent: boolean
    canDeleteEvent: boolean
    canReleaseEvent: boolean
}

export interface OrganizationVenueInfos {
    organizationId: number
    organizationName: string
    canEditOrganization?: boolean
    canDeleteOrganization?: boolean
    canAddVenue?: boolean
    canAddSpace?: boolean
    canAddEvent?: boolean
    totalUpcomingEvents: number
    venueInfos: UranusVenueInfo[]
}

export interface VenueInfoSpaceInfoApi {
    space_id: number
    space_name: string
    upcoming_event_count: number
}

export interface VenueInfoApi {
    venue_id: number
    venue_name: string
    venue_logo_image_id: number
    upcoming_event_count: number
    spaces: VenueInfoSpaceInfoApi[]

    can_edit_venue: boolean
    can_delete_venue: boolean
    can_add_space: boolean
    can_edit_space: boolean
    can_delete_space: boolean
    can_add_event: boolean
    can_edit_event: boolean
    can_delete_event: boolean
    can_release_event: boolean
}

export interface OrganizationVenueInfosApi {
    organization_id: number
    organization_name: string
    total_upcoming_events: number
    can_edit_organization?: boolean
    can_delete_organization?: boolean
    can_add_venue?: boolean
    can_add_space?: boolean
    can_add_event?: boolean
    venues: VenueInfoApi[]
}

function mapApiVenueInfosSpaceInfosToModel(space: VenueInfoSpaceInfoApi): VenueInfoSpaceInfo {
    return {
        spaceId: space.space_id,
        spaceName: space.space_name,
        upcomingEventCount: space.upcoming_event_count,
    }
}

function mapApiVenueInfosToModel(venue: VenueInfoApi): UranusVenueInfo {
    return {
        venueId: venue.venue_id,
        venueName: venue.venue_name,
        venueLogoImageId: venue.venue_logo_image_id,
        upcomingEventCount: venue.upcoming_event_count,
        spaceInfos: venue.spaces.map(mapApiVenueInfosSpaceInfosToModel),
        canEdit: venue.can_edit_venue,
        canEditVenue: venue.can_edit_venue,
        canDeleteVenue: venue.can_delete_venue,
        canAddSpace: venue.can_add_space,
        canEditSpace: venue.can_edit_space,
        canDeleteSpace: venue.can_delete_space,
        canAddEvent: venue.can_add_event,
        canEditEvent: venue.can_edit_event,
        canDeleteEvent: venue.can_delete_event,
        canReleaseEvent: venue.can_release_event,
    }
}

export function mapApiOrganizationVenueInfosToModel(apiData: OrganizationVenueInfosApi): OrganizationVenueInfos {
    return {
        organizationId: apiData.organization_id,
        organizationName: apiData.organization_name,
        totalUpcomingEvents: apiData.total_upcoming_events,
        canEditOrganization: apiData.can_edit_organization,
        canDeleteOrganization: apiData.can_delete_organization,
        canAddVenue: apiData.can_add_venue,
        canAddSpace: apiData.can_add_space,
        canAddEvent: apiData.can_add_event,
        venueInfos: apiData.venues.map(mapApiVenueInfosToModel),
    }
}
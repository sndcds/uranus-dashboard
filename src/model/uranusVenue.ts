// src/model/uranusVenueInfo.ts

export interface UranusVenueSpaceInfo {
    spaceUuid: string
    spaceName: string
    upcomingEventCount: number
}

export interface UranusVenue {
    venueUuid: string
    venueName: string
    venueLogoImageId: number
    upcomingEventCount: number
    spaceInfos: UranusVenueSpaceInfo[]
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
    mainLogoUuid: string | null
    lightThemeLogoUuid: string | null
    darkThemeLogoUuid: string | null
    avatarImageUuid: string | null
}

export interface UranusOrganizationVenueList {
    orgUuid: string
    orgName: string
    canEditOrg?: boolean
    canDeleteOrg?: boolean
    canAddVenue?: boolean
    canAddSpace?: boolean
    canAddEvent?: boolean
    totalUpcomingEvents: number
    venueInfos: UranusVenue[]
}

export interface UranusVenueSpaceInfoDTO {
    space_uuid: string
    space_name: string
    upcoming_event_count: number
}

export interface UranusVenueInfoDTO {
    venue_uuid: string
    venue_name: string
    venue_logo_image_id: number
    upcoming_event_count: number
    spaces: UranusVenueSpaceInfoDTO[]

    can_edit_venue: boolean
    can_delete_venue: boolean
    can_add_space: boolean
    can_edit_space: boolean
    can_delete_space: boolean
    can_add_event: boolean
    can_edit_event: boolean
    can_delete_event: boolean
    can_release_event: boolean

    mein_logo_uuid: string | null
    dark_theme_logo_uuid: string | null
    light_theme_logo_uuid: string | null
    avatar_image_uuid: string | null
}

export interface UranusOrgVenueInfosDTO {
    org_uuid: string
    org_name: string
    total_upcoming_events: number
    can_edit_organization?: boolean
    can_delete_organization?: boolean
    can_add_venue?: boolean
    can_add_space?: boolean
    can_add_event?: boolean
    venues: UranusVenueInfoDTO[]
}

function mapApiVenueInfosSpaceInfosToModel(space: UranusVenueSpaceInfoDTO): UranusVenueSpaceInfo {
    return {
        spaceUuid: space.space_uuid,
        spaceName: space.space_name,
        upcomingEventCount: space.upcoming_event_count,
    }
}

function mapApiVenueInfosToModel(venue: UranusVenueInfoDTO): UranusVenue {
    return {
        venueUuid: venue.venue_uuid,
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
        mainLogoUuid: venue.mein_logo_uuid,
        lightThemeLogoUuid: venue.light_theme_logo_uuid,
        darkThemeLogoUuid: venue.dark_theme_logo_uuid,
        avatarImageUuid: venue.avatar_image_uuid,
    }
}

export function mapApiOrganizationVenueInfosToModel(
    raw: UranusOrgVenueInfosDTO
): UranusOrganizationVenueList {
    return {
        orgUuid: raw.org_uuid,
        orgName: raw.org_name,
        totalUpcomingEvents: raw.total_upcoming_events,
        canEditOrg: raw.can_edit_organization ?? false,
        canDeleteOrg: raw.can_delete_organization ?? false,
        canAddVenue: raw.can_add_venue ?? false,
        canAddSpace: raw.can_add_space ?? false,
        canAddEvent: raw.can_add_event ?? false,
        venueInfos: raw.venues.map(mapApiVenueInfosToModel),
    }
}
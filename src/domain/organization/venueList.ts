/*
  src/domain/organization/venueList.ts
  2026-03-30, Roald
*/

import type { VenueListDto, VenueListItemDTO, VenueListSpaceDTO } from '@/api/dto/venueList.dto.ts'

export interface VenueListSpace {
    spaceUuid: string
    spaceName: string
    eventCount: number
    canEditSpace: boolean
    canDeleteSpace: boolean
}

export interface VenueListItem {
    venueUuid: string
    venueName: string
    eventCount: number
    spaces: VenueListSpace[]
    canAddEvent: boolean
    canAddSpace: boolean
    canDeleteEvent: boolean
    canDeleteSpace: boolean
    canDeleteVenue: boolean
    canEditEvent: boolean
    canEditSpace: boolean
    canEditVenue: boolean
    canReleaseEvent: boolean
    mainLogoUuid?: string | null
    lightThemeLogoUuid?: string | null
    darkThemeLogoUuid?: string | null
}

export interface VenueList {
    orgUuid: string
    orgName: string
    totalEventCount: number
    canAddEvent: boolean
    canAddSpace: boolean
    canAddVenue: boolean
    canDeleteOrg: boolean
    canEditOrg: boolean
    venues: VenueListItem[]
}


export function mapVenueListSpace(dto: VenueListSpaceDTO): VenueListSpace {
    return {
        spaceUuid: dto.space_uuid,
        spaceName: dto.space_name,
        eventCount: dto.event_count,
        canEditSpace: dto.can_edit_space,
        canDeleteSpace: dto.can_delete_space,
    }
}

export function mapVenueListItem(dto: VenueListItemDTO): VenueListItem {
    return {
        venueUuid: dto.venue_uuid,
        venueName: dto.venue_name,
        eventCount: dto.event_count,
        spaces: (dto.spaces ?? [])
            .map(space => ({
                spaceUuid: space.space_uuid,
                spaceName: space.space_name,
                eventCount: space.event_count,
                canEditSpace: space.can_edit_space,
                canDeleteSpace: space.can_delete_space,
            }))
            .sort((a, b) =>
                a.spaceName.localeCompare(b.spaceName, undefined, { sensitivity: 'base' })
            ),

        canAddEvent: dto.can_add_event,
        canAddSpace: dto.can_add_space,

        canDeleteEvent: dto.can_delete_event,
        canDeleteSpace: dto.can_delete_space,
        canDeleteVenue: dto.can_delete_venue,

        canEditEvent: dto.can_edit_event,
        canEditSpace: dto.can_edit_space,
        canEditVenue: dto.can_edit_venue,

        canReleaseEvent: dto.can_release_event,

        mainLogoUuid: dto.main_logo_uuid ?? null,
        lightThemeLogoUuid: dto.light_theme_logo_uuid ?? null,
        darkThemeLogoUuid: dto.dark_theme_logo_uuid ?? null,
    }
}

export function mapVenueList(dto: VenueListDto): VenueList {
    return {
        orgUuid: dto.org_uuid,
        orgName: dto.org_name,
        totalEventCount: dto.total_upcoming_events,
        canAddEvent: dto.can_add_event,
        canAddSpace: dto.can_add_space,
        canAddVenue: dto.can_add_venue,
        canDeleteOrg: dto.can_delete_org,
        canEditOrg: dto.can_edit_org,
        venues: (dto.venues ?? []).map(mapVenueListItem),
    }
}

export function toVenueListSpaceDTO(model: VenueListSpace): VenueListSpaceDTO {
    return {
        space_uuid: model.spaceUuid,
        space_name: model.spaceName,
        event_count: model.eventCount,
        can_edit_space: model.canEditSpace,
        can_delete_space: model.canDeleteSpace,
    }
}

export function toVenueItemDTO(model: VenueListItem): VenueListItemDTO {
    return {
        venue_uuid: model.venueUuid,
        venue_name: model.venueName,
        event_count: model.eventCount,
        spaces: model.spaces.map(toVenueListSpaceDTO),

        can_add_event: model.canAddEvent,
        can_add_space: model.canAddSpace,

        can_delete_event: model.canDeleteEvent,
        can_delete_space: model.canDeleteSpace,
        can_delete_venue: model.canDeleteVenue,

        can_edit_event: model.canEditEvent,
        can_edit_space: model.canEditSpace,
        can_edit_venue: model.canEditVenue,

        can_release_event: model.canReleaseEvent,

        main_logo_uuid: model.mainLogoUuid ?? null,
        light_theme_logo_uuid: model.lightThemeLogoUuid ?? null,
        dark_theme_logo_uuid: model.darkThemeLogoUuid ?? null,
    }
}

export function toVenueListDTO(model: VenueList): VenueListDto {
    return {
        org_uuid: model.orgUuid,
        org_name: model.orgName,
        total_upcoming_events: model.totalEventCount,
        can_add_event: model.canAddEvent,
        can_add_space: model.canAddSpace,
        can_add_venue: model.canAddVenue,
        can_delete_org: model.canDeleteOrg,
        can_edit_org: model.canEditOrg,
        venues: model.venues.map(toVenueItemDTO),
    }
}

/**
 * Factory for empty organization detail
 */
export function createEmptyOrganizationVenueList(): VenueList {
    return {
        orgUuid: '',
        orgName: '',
        totalEventCount: 0,
        canAddEvent: false,
        canAddSpace: false,
        canAddVenue: false,
        canDeleteOrg: false,
        canEditOrg: false,
        venues: [],
    }
}

/**
 * Factory for empty venue
 */
export function createEmptyVenue(): VenueListItem {
    return {
        venueUuid: '',
        venueName: '',
        eventCount: 0,
        spaces: [],
        canAddEvent: false,
        canAddSpace: false,
        canDeleteEvent: false,
        canDeleteSpace: false,
        canDeleteVenue: false,
        canEditEvent: false,
        canEditSpace: false,
        canEditVenue: false,
        canReleaseEvent: false,
        mainLogoUuid: null,
        lightThemeLogoUuid: null,
        darkThemeLogoUuid: null,
    }
}
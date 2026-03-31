/*
  src/domain/organization/venueList.ts
  2026-03-30, Roald
*/

import type { VenueListDTO, VenueListItemDTO, VenueListSpaceDTO } from '@/api/dto/venueListDTO.ts'

export interface VenueListSpace {
    uuid: string
    name: string
    upcomingEventCount: number
}

export interface VenueListItem {
    uuid: string
    name: string
    upcomingEventCount: number
    spaces: VenueListSpace[]
    canAddEvent: boolean
    canAddSpace: boolean
    canAddVenue: boolean
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
    uuid: string
    name: string
    totalUpcomingEvents: number
    canAddEvent: boolean
    canAddSpace: boolean
    canAddVenue: boolean
    canDeleteOrg: boolean
    canEditOrg: boolean
    venues: VenueListItem[]
}


export function mapVenueListSpace(dto: VenueListSpaceDTO): VenueListSpace {
    return {
        uuid: dto.uuid,
        name: dto.name,
        upcomingEventCount: dto.upcoming_event_count,
    }
}

export function mapVenueListItem(dto: VenueListItemDTO): VenueListItem {
    return {
        uuid: dto.uuid,
        name: dto.name,
        upcomingEventCount: dto.upcoming_event_count,
        spaces: (dto.spaces ?? [])
            .map(space => ({
                uuid: space.uuid,
                name: space.name,
                upcomingEventCount: space.upcoming_event_count,
            }))
            .sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
            ),

        canAddEvent: dto.can_add_event,
        canAddSpace: dto.can_add_space,
        canAddVenue: dto.can_add_venue,

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

export function mapVenueList(dto: VenueListDTO): VenueList {
    return {
        uuid: dto.org_uuid,
        name: dto.org_name,
        totalUpcomingEvents: dto.total_upcoming_events,
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
        uuid: model.uuid,
        name: model.name,
        upcoming_event_count: model.upcomingEventCount,
    }
}

export function toVenueItemDTO(model: VenueListItem): VenueListItemDTO {
    return {
        uuid: model.uuid,
        name: model.name,
        upcoming_event_count: model.upcomingEventCount,
        spaces: model.spaces.map(toVenueListSpaceDTO),

        can_add_event: model.canAddEvent,
        can_add_space: model.canAddSpace,
        can_add_venue: model.canAddVenue,

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

export function toVenueListDTO(model: VenueList): VenueListDTO {
    return {
        org_uuid: model.uuid,
        org_name: model.name,
        total_upcoming_events: model.totalUpcomingEvents,
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
        uuid: '',
        name: '',
        totalUpcomingEvents: 0,
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
        uuid: '',
        name: '',
        upcomingEventCount: 0,
        spaces: [],
        canAddEvent: false,
        canAddSpace: false,
        canAddVenue: false,
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
/*
    src/domain/organization/organizationListItem.model.ts
*/

import type { UranusOrganizationListItemDTO } from '@/api/dto/organizationListItem.dto.ts'

/**
 * Frontend-friendly model for organization list items
 * 1:1 mapping from DTO
 */
export interface OrganizationListItem {
    uuid: string
    name: string
    city: string | null
    countryCode: string | null
    totalUpcomingEvents: number
    venueCount: number
    spaceCount: number
    canEditOrg: boolean
    canDeleteOrg: boolean
    canManageTeam: boolean
    logoUrl?: string | null
    lightThemeLogoUrl?: string | null
    darkThemeLogoUrl?: string | null
}

/**
 * Convert DTO → frontend model
 */
export function mapOrganizationListItem(dto: UranusOrganizationListItemDTO): OrganizationListItem {
    return {
        uuid: dto.uuid,
        name: dto.name,
        city: dto.city ?? null,
        countryCode: dto.country_code ?? null,
        totalUpcomingEvents: dto.total_upcoming_events,
        venueCount: dto.venue_count,
        spaceCount: dto.space_count,
        canEditOrg: dto.can_edit_org,
        canDeleteOrg: dto.can_delete_org,
        canManageTeam: dto.can_manage_team,
        logoUrl: dto.logo_url ?? null,
        lightThemeLogoUrl: dto.light_theme_logo_url ?? null,
        darkThemeLogoUrl: dto.dark_theme_logo_url ?? null,
    }
}

/**
 * Convert frontend model → DTO
 */
export function toOrganizationListItemDTO(model: OrganizationListItem): UranusOrganizationListItemDTO {
    return {
        uuid: model.uuid,
        name: model.name,
        city: model.city ?? null,
        country_code: model.countryCode ?? null,
        total_upcoming_events: model.totalUpcomingEvents,
        venue_count: model.venueCount,
        space_count: model.spaceCount,
        can_edit_org: model.canEditOrg,
        can_delete_org: model.canDeleteOrg,
        can_manage_team: model.canManageTeam,
        logo_url: model.logoUrl ?? null,
        light_theme_logo_url: model.lightThemeLogoUrl ?? null,
        dark_theme_logo_url: model.darkThemeLogoUrl ?? null,
    }
}

/**
 * Factory for empty list item
 */
export function createEmptyOrganizationListItem(): OrganizationListItem {
    return {
        uuid: '',
        name: '',
        city: null,
        countryCode: null,
        totalUpcomingEvents: 0,
        venueCount: 0,
        spaceCount: 0,
        canEditOrg: false,
        canDeleteOrg: false,
        canManageTeam: false,
        logoUrl: null,
        lightThemeLogoUrl: null,
        darkThemeLogoUrl: null,
    }
}
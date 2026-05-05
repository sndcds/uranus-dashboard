/*
    src/domain/partner/partnerListItem.model.ts
*/

import type {PartnerDTO, PartnerRequestDTO} from '@/api/dto/partnerDTO.ts'

export type PartnerDirection = 'incoming' | 'outgoing'
export type PartnerStatus = 'pending' | 'accepted' | 'rejected'

/**
 * Frontend-friendly model for organization list items
 * 1:1 mapping from DTO
 */
export interface PartnerListItem {
    direction: PartnerDirection
    orgUuid: string
    orgName: string
    canChooseVenue: boolean
    canChoosePartner: boolean
    canChoosePromoter: boolean
    canSeeInsights: boolean
    logoUrl?: string | null
    lightThemeLogoUrl?: string | null
    darkThemeLogoUrl?: string | null
}

/**
 * Convert DTO → frontend model
 */
export function mapPartnerListItem(dto: PartnerDTO): PartnerListItem {
    return {
        direction: dto.direction,
        orgUuid: dto.org_uuid,
        orgName: dto.org_name,
        canChooseVenue: dto.can_choose_venue,
        canChoosePartner: dto.can_choose_partner,
        canChoosePromoter: dto.can_choose_promoter,
        canSeeInsights: dto.can_see_insights,
        logoUrl: dto.logo_url ?? null,
        lightThemeLogoUrl: dto.light_theme_logo_url ?? null,
        darkThemeLogoUrl: dto.dark_theme_logo_url ?? null,
    }
}

/**
 * Convert frontend model → DTO
 */
export function toOrgListItemDTO(model: PartnerListItem): PartnerDTO {
    return {
        direction: model.direction,
        org_uuid: model.orgUuid,
        org_name: model.orgName,
        can_choose_venue: model.canChooseVenue,
        can_choose_partner: model.canChoosePartner,
        can_choose_promoter: model.canChoosePromoter,
        can_see_insights: model.canSeeInsights,
        logo_url: model.logoUrl ?? null,
        light_theme_logo_url: model.lightThemeLogoUrl ?? null,
        dark_theme_logo_url: model.darkThemeLogoUrl ?? null,
    }
}

/**
 * Factory for empty list item
 */
export function createEmptyOrgListItem(): PartnerListItem {
    return {
        direction: 'outgoing',
        orgUuid: '',
        orgName: '',
        canChooseVenue: false,
        canChoosePartner: false,
        canChoosePromoter: false,
        canSeeInsights: false,
        logoUrl: null,
        lightThemeLogoUrl: null,
        darkThemeLogoUrl: null,
    }
}

export interface PartnerRequestItem {
    direction: PartnerDirection
    status: PartnerStatus
    createdAt: string
    orgUuid: string
    orgName: string
    message?: string | null
}

export function mapPartnerRequestItem(dto: PartnerRequestDTO): PartnerRequestItem {
    return {
        direction: dto.direction,
        status: dto.status,
        createdAt: dto.created_at,
        orgUuid: dto.org_uuid,
        orgName: dto.org_name,
        message: dto.message ?? null,
    }
}
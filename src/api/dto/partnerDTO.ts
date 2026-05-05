/*
    src/api/dto/partner.dto.ts
 */

import type { PartnerDirection, PartnerStatus } from '@/domain/partner/partner.model.ts'


export interface PartnerDTO {
    direction: PartnerDirection
    org_uuid: string
    org_name: string
    can_choose_venue: boolean
    can_choose_partner: boolean
    can_choose_promoter: boolean
    can_see_insights: boolean
    logo_url?: string | null
    light_theme_logo_url?: string | null
    dark_theme_logo_url?: string | null
}

export interface PartnerRequestDTO {
    direction: PartnerDirection
    status: PartnerStatus
    created_at: string
    org_uuid: string
    org_name: string
    message?: string
}


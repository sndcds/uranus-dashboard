/*
    src/domain/venue/venue.model.ts
    2026-04-02, refactored
*/

import type { VenueDto } from '@/api/dto/venue.dto.ts'

/**
 * Frontend-friendly venue model
 * safe for reactive usage in Vue 3
 */
export interface VenueModel {
    uuid: string | null
    orgUuid: string | null
    name: string
    type: string | null

    street: string | null
    houseNumber: string | null
    postalCode: string | null
    city: string | null
    state: string | null
    country: string | null
    lat: number | null
    lon: number | null

    openedAt: string | null
    closedAt: string | null
    description: string | null

    contactEmail: string | null
    contactPhone: string | null
    webLink: string | null

    createdAt: string | null
    modifiedAt: string | null
    createdBy: number | null
    modifiedBy: number | null
}

/**
 * Convert DTO → frontend model
 */
export function mapVenue(dto: VenueDto): VenueModel {
    return {
        uuid: dto.uuid ?? null,
        orgUuid: dto.org_uuid ?? null,
        name: dto.name ?? '',
        type: dto.type ?? null,

        street: dto.street ?? null,
        houseNumber: dto.house_number ?? null,
        postalCode: dto.postal_code ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        country: dto.country ?? null,
        lat: dto.lat ?? null,
        lon: dto.lon ?? null,

        openedAt: dto.opened_at ?? null,
        closedAt: dto.closed_at ?? null,
        description: dto.description ?? null,

        contactEmail: dto.contact_email ?? null,
        contactPhone: dto.contact_phone ?? null,
        webLink: dto.web_link ?? null,

        createdAt: dto.created_at ?? null,
        modifiedAt: dto.modified_at ?? null,
        createdBy: dto.created_by ?? null,
        modifiedBy: dto.modified_by ?? null,
    }
}

/**
 * Convert frontend model → DTO
 */
export function toVenueDTO(model: VenueModel): VenueDto {
    return {
        uuid: model.uuid,
        org_uuid: model.orgUuid ?? null,
        name: model.name,
        type: model.type ?? null,

        street: model.street ?? null,
        house_number: model.houseNumber ?? null,
        postal_code: model.postalCode ?? null,
        city: model.city ?? null,
        state: model.state ?? null,
        country: model.country ?? null,
        lat: model.lat ?? null,
        lon: model.lon ?? null,

        opened_at: model.openedAt ?? null,
        closed_at: model.closedAt ?? null,
        description: model.description ?? null,

        contact_email: model.contactEmail ?? null,
        contact_phone: model.contactPhone ?? null,
        web_link: model.webLink ?? null,

        created_at: model.createdAt ?? '',
        modified_at: model.modifiedAt ?? null,
        created_by: model.createdBy ?? null,
        modified_by: model.modifiedBy ?? null,
    }
}

/**
 * Factory for empty model
 */
export function createEmptyVenue(): VenueModel {
    return {
        uuid: null,
        orgUuid: null,
        name: '',
        type: null,

        street: null,
        houseNumber: null,
        postalCode: null,
        city: null,
        state: null,
        country: null,
        lat: null,
        lon: null,

        openedAt: null,
        closedAt: null,
        description: null,

        contactEmail: null,
        contactPhone: null,
        webLink: null,

        createdAt: null,
        modifiedAt: null,
        createdBy: null,
        modifiedBy: null,
    }
}

/**
 * Convert API raw → frontend model
 */
export function fromApi(raw: any): VenueModel | null {
    if (!raw) return null
    return mapVenue(raw as VenueDto)
}
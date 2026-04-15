/*
    src/domain/organization/organization.model.ts
*/

import type { OrganizationDTO } from '@/api/dto/organization.dto.ts'

/**
 * Frontend-friendly organization model
 * safe for reactive usage in Vue 3
 */
export interface OrganizationModel {
    uuid: string | null
    name: string
    description: string | null

    contactEmail: string | null
    contactPhone: string | null
    webLink: string | null

    street: string | null
    houseNumber: string | null
    addressAddition: string | null
    postalCode: string | null
    city: string | null
    state: string | null
    country: string | null
    lat: number | null
    lon: number | null

    nonprofit: boolean | null
    legalForm: string | null
    holdingOrganizationUuid: string | null

    mainLogoUuid: string | null
    lightModeLogoUuid: string | null
    darkModeLogoUuid: string | null

    apiKey: string | null
}

/**
 * Convert DTO → frontend model
 */
export function mapOrganization(dto: OrganizationDTO): OrganizationModel {
    return {
        uuid: dto.uuid ?? null,
        name: dto.name ?? '',

        description: dto.description ?? null,

        contactEmail: dto.contact_email ?? null,
        contactPhone: dto.contact_phone ?? null,
        webLink: dto.web_link ?? null,

        street: dto.street ?? null,
        houseNumber: dto.house_number ?? null,
        addressAddition: dto.address_addition ?? null,
        postalCode: dto.postal_code ?? null,
        city: dto.city ?? null,
        state: dto.state ?? null,
        country: dto.country ?? null,
        lat: dto.lat ?? null,
        lon: dto.lon ?? null,

        nonprofit: dto.nonprofit ?? null,
        legalForm: dto.legal_form ?? null,
        holdingOrganizationUuid: dto.holding_org_uuid ?? null,

        mainLogoUuid: dto.main_logo_uuid ?? null,
        lightModeLogoUuid: dto.light_mode_logo_uuid ?? null,
        darkModeLogoUuid: dto.dark_mode_logo_uuid ?? null,

        apiKey: dto.api_key ?? null,
    }
}

/**
 * Convert frontend model → DTO
 * suitable for API calls
 */
export function toOrganizationDTO(model: OrganizationModel): OrganizationDTO {
    return {
        uuid: model.uuid,
        name: model.name,
        description: model.description ?? null,

        contact_email: model.contactEmail ?? null,
        contact_phone: model.contactPhone ?? null,
        web_link: model.webLink ?? null,

        street: model.street ?? null,
        house_number: model.houseNumber ?? null,
        address_addition: model.addressAddition ?? null,
        postal_code: model.postalCode ?? null,
        city: model.city ?? null,
        state: model.state ?? null,
        country: model.country ?? null,
        lat: model.lat ?? null,
        lon: model.lon ?? null,

        nonprofit: model.nonprofit ?? null,
        legal_form: model.legalForm ?? null,
        holding_org_uuid: model.holdingOrganizationUuid ?? null,

        main_logo_uuid: model.mainLogoUuid ?? null,
        light_mode_logo_uuid: model.lightModeLogoUuid ?? null,
        dark_mode_logo_uuid: model.darkModeLogoUuid ?? null,

        api_key: model.apiKey ?? null,
        created_at: '', // optional / required by backend if needed
        modified_at: null,
        created_by: null,
        modified_by: null,
        geo_pos: null,
    }
}

/**
 * Factory for empty model
 */
export function createEmptyOrganization(): OrganizationModel {
    return {
        uuid: null,
        name: '',
        description: null,

        contactEmail: null,
        contactPhone: null,
        webLink: null,

        street: null,
        houseNumber: null,
        addressAddition: null,
        postalCode: null,
        city: null,
        state: null,
        country: null,
        lat: null,
        lon: null,

        nonprofit: null,
        legalForm: null,
        holdingOrganizationUuid: null,

        mainLogoUuid: null,
        lightModeLogoUuid: null,
        darkModeLogoUuid: null,

        apiKey: null,
    }
}
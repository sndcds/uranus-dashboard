/*
    src/domain/organization/UranusOrganization.ts

    2026-02-08, Roald
 */

import type { UranusOrganizationDTO } from '@/api/dto/UranusOrganizationDTO.ts'

export class UranusOrganization {
    id: number | null = null
    name: string = ''

    description: string | null = null
    contactEmail: string | null = null
    contactPhone: string | null = null
    websiteLink: string | null = null

    street: string | null = null
    houseNumber: string | null = null
    addressAddition: string | null = null
    postalCode: string | null = null
    city: string | null = null
    state: string | null = null
    country: string | null = null
    lat: number | null = null
    lon: number | null = null

    nonprofit: boolean | null = null
    legalForm: string | null = null
    holdingOrganizationId: number | null = null

    imageMainLogoId: number | null = null
    imageLightModeLogoId: number | null = null
    imageDarkModeLogoId: number | null = null

    apiKey: string | null = null

    constructor(props: Partial<UranusOrganization>) {
        Object.assign(this, props)
    }

    static fromDTO(dto: UranusOrganizationDTO): UranusOrganization {
        return new UranusOrganization({
            id: dto.id,
            name: dto.name ?? null,
            description: dto.description ?? null,
            contactEmail: dto.contact_email ?? null,
            contactPhone: dto.contact_phone ?? null,
            websiteLink: dto.website_link ?? null,

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
            holdingOrganizationId: dto.holding_organization_id ?? null,

            imageMainLogoId: dto.image_main_logo_id ?? null,
            imageLightModeLogoId: dto.image_light_mode_logo_id ?? null,
            imageDarkModeLogoId: dto.image_dark_mode_logo_id ?? null,
        })
    }

    static empty(): UranusOrganization {
        const emptyDto: UranusOrganizationDTO = {
            id: -1,
            name: '',
            created_at: new Date(0).toISOString(), // required field
        }

        return UranusOrganization.fromDTO(emptyDto)
    }

    /**
     * Convert instance to a plain props object
     * suitable for forms, reactive state, or v-model bindings
     */
    toDTO(): UranusOrganizationDTO {
        return {
            id: this.id,
            name: this.name,
            description: this.description ?? '',

            contact_email: this.contactEmail ?? '',
            contact_phone: this.contactPhone ?? '',
            website_link: this.websiteLink ?? '',

            street: this.street ?? '',
            house_number: this.houseNumber ?? '',
            address_addition: this.addressAddition ?? '',
            postal_code: this.postalCode ?? '',
            city: this.city ?? '',
            state: this.state ?? '',
            country: this.country ?? '',
            lat: this.lat ?? null,
            lon: this.lon ?? null,

            nonprofit: this.nonprofit ?? false,
            legal_form: this.legalForm ?? null,
            holding_organization_id: this.holdingOrganizationId ?? null,

            image_main_logo_id: this.imageMainLogoId ?? null,
            image_light_mode_logo_id: this.imageLightModeLogoId ?? null,
            image_dark_mode_logo_id: this.imageDarkModeLogoId ?? null,

            api_key: this.apiKey ?? '',
            created_at: ''
        }
    }

    static fromApi(raw: any): UranusOrganization | null {
        if (!raw) return null
        return UranusOrganization.fromDTO(raw as UranusOrganizationDTO)
    }
}
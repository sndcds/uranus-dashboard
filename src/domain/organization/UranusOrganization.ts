/*
    src/domain/organization/UranusOrganization.ts

    2026-02-08, Roald
 */

import type { UranusOrganizationDTO } from '@/api/dto/UranusOrganizationDTO.ts'

export class UranusOrganization {
    uuid: string | null = null
    name: string = ''

    description: string | null = null
    contactEmail: string | null = null
    contactPhone: string | null = null
    webLink: string | null = null

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
    holdingOrganizationUuid: string | null = null

    imageMainLogoUuid: string | null = null
    imageLightModeLogoUuid: string | null = null
    imageDarkModeLogoUuid: string | null = null

    apiKey: string | null = null

    constructor(props: Partial<UranusOrganization>) {
        Object.assign(this, props)
    }

    static fromDTO(dto: UranusOrganizationDTO): UranusOrganization {
        return new UranusOrganization({
            uuid: dto.uuid,
            name: dto.name ?? null,
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

            imageMainLogoUuid: dto.main_logo_uuid ?? null,
            imageLightModeLogoUuid: dto.light_mode_logo_uuid ?? null,
            imageDarkModeLogoUuid: dto.dark_mode_logo_uuid ?? null,
        })
    }

    static empty(): UranusOrganization {
        const emptyDto: UranusOrganizationDTO = {
            uuid: null,
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
            uuid: this.uuid,
            name: this.name,
            description: this.description ?? '',

            contact_email: this.contactEmail ?? '',
            contact_phone: this.contactPhone ?? '',
            web_link: this.webLink ?? '',

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
            holding_org_uuid: this.holdingOrganizationUuid ?? null,

            main_logo_uuid: this.imageMainLogoUuid ?? null,
            light_mode_logo_uuid: this.imageLightModeLogoUuid ?? null,
            dark_mode_logo_uuid: this.imageDarkModeLogoUuid ?? null,

            api_key: this.apiKey ?? '',
            created_at: ''
        }
    }

    static fromApi(raw: any): UranusOrganization | null {
        if (!raw) return null
        return UranusOrganization.fromDTO(raw as UranusOrganizationDTO)
    }
}
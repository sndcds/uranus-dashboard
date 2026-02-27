/*
    src/domain/venue/UranusVenue.ts

    2026-02-10, Roald
*/

import type { UranusVenueDTO } from '@/api/dto/UranusVenueDTO.ts'

export interface UranusVenueSelectItemInfo {
    id: number
    name: string
    city?: string
}

export class UranusVenue {
    id: number | null = null
    organizationId: number | null = null
    name: string = ''
    type: string | null = null

    street: string | null = null
    houseNumber: string | null = null
    postalCode: string | null = null
    city: string | null = null
    state: string | null = null
    country: string | null = null
    lat: number | null = null
    lon: number | null = null

    openedAt: string | null = null
    closedAt: string | null = null
    description: string | null = null

    contactEmail: string | null = null
    contactPhone: string | null = null
    websiteLink: string | null = null

    createdAt: string | null = null
    modifiedAt: string | null = null
    createdBy: number | null = null
    modifiedBy: number | null = null

    constructor(props: Partial<UranusVenue>) {
        Object.assign(this, props)
    }

    static fromDTO(dto: UranusVenueDTO): UranusVenue {
        return new UranusVenue({
            id: dto.id,
            organizationId: dto.organization_id ?? null,
            name: dto.name ?? '',
            type: dto.type ?? '',

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
            websiteLink: dto.website_link ?? null,

            createdAt: dto.created_at ?? null,
            modifiedAt: dto.modified_at ?? null,
            createdBy: dto.created_by ?? null,
            modifiedBy: dto.modified_by ?? null,
        })
    }

    static empty(): UranusVenue {
        const emptyDto: UranusVenueDTO = {
            id: -1,
            organization_id: null,
            name: '',
            type: null,
            created_at: new Date(0).toISOString(), // required
        }
        return UranusVenue.fromDTO(emptyDto)
    }

    toDTO(): UranusVenueDTO {
        return {
            id: this.id,
            organization_id: this.organizationId ?? null,
            name: this.name,
            type: this.type,

            street: this.street ?? '',
            house_number: this.houseNumber ?? '',
            postal_code: this.postalCode ?? '',
            city: this.city ?? '',
            state: this.state ?? '',
            country: this.country ?? '',
            lat: this.lat ?? null,
            lon: this.lon ?? null,

            opened_at: this.openedAt ?? null,
            closed_at: this.closedAt ?? null,
            description: this.description ?? '',

            contact_email: this.contactEmail ?? '',
            contact_phone: this.contactPhone ?? '',
            website_link: this.websiteLink ?? '',

            created_at: this.createdAt ?? '',
            modified_at: this.modifiedAt ?? null,
            created_by: this.createdBy ?? null,
            modified_by: this.modifiedBy ?? null,
        }
    }

    static fromApi(raw: any): UranusVenue | null {
        if (!raw) return null
        return UranusVenue.fromDTO(raw as UranusVenueDTO)
    }
}
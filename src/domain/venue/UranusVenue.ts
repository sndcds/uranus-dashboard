/*
    src/domain/venue/UranusVenue.ts

    2026-02-10, Roald
*/

import type { UranusVenueDTO } from '@/api/dto/UranusVenueDTO.ts'

export interface UranusVenueSelectItemInfo {
    uuid: string | null
    name: string
    city?: string
}

export class UranusVenue {
    uuid: string | null = null
    orgUuid: string | null = null
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
    webLink: string | null = null

    createdAt: string | null = null
    modifiedAt: string | null = null
    createdBy: number | null = null
    modifiedBy: number | null = null

    constructor(props: Partial<UranusVenue>) {
        Object.assign(this, props)
    }

    static fromDTO(dto: UranusVenueDTO): UranusVenue {
        return new UranusVenue({
            uuid: dto.uuid,
            orgUuid: dto.org_uuid ?? null,
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
            webLink: dto.web_link ?? null,

            createdAt: dto.created_at ?? null,
            modifiedAt: dto.modified_at ?? null,
            createdBy: dto.created_by ?? null,
            modifiedBy: dto.modified_by ?? null,
        })
    }

    static empty(): UranusVenue {
        const emptyDto: UranusVenueDTO = {
            uuid: null,
            org_uuid: null,
            name: '',
            type: null,
            created_at: new Date(0).toISOString(), // required
        }
        return UranusVenue.fromDTO(emptyDto)
    }

    toDTO(): UranusVenueDTO {
        return {
            uuid: this.uuid,
            org_uuid: this.orgUuid ?? null,
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
            web_link: this.webLink ?? '',

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
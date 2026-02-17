/*
    src/domain/space/UranusSpace.ts

    2026-02-13, Roald
*/

import type { UranusSpaceDTO } from '@/api/dto/UranusSpaceDTO.ts'

export class UranusSpace {
    id: number | null = null
    venueId: number | null = null
    name: string = ''

    totalCapacity: number | null = null
    seatingCapacity: number | null = null
    spaceType: string | null = null
    buildingLevel: number | null = null
    websiteLink: string | null = null

    accessibilitySummary: string | null = null
    accessibilityFlags: bigint | null = null

    description: string | null = null
    areaSqm: number | null = null

    environmentalFeatures: number | null = null
    audioFeatures: number | null = null
    presentationFeatures: number | null = null
    lightingFeatures: number | null = null
    climateFeatures: number | null = null
    miscFeatures: number | null = null

    createdAt: string | null = null
    modifiedAt: string | null = null

    constructor(props: Partial<UranusSpace>) {
        Object.assign(this, props)
    }

    static fromDTO(dto: UranusSpaceDTO): UranusSpace {
        let accessibilityFlags: bigint = 0n
        try {
            if (dto.accessibility_flags != null && dto.accessibility_flags !== '') {
                accessibilityFlags = BigInt(dto.accessibility_flags)
            }
        } catch (err) {
            console.error('Invalid accessibility_flags:', dto.accessibility_flags, err)
            accessibilityFlags = 0n
        }

        const space = new UranusSpace({
            id: dto.id,
            venueId: dto.venue_id ?? null,
            name: dto.name ?? '',

            totalCapacity: dto.total_capacity ?? null,
            seatingCapacity: dto.seating_capacity ?? null,
            spaceType: dto.space_type ?? null,
            buildingLevel: dto.building_level ?? null,
            websiteLink: dto.website_link ?? null,

            accessibilitySummary: dto.accessibility_summary ?? null,

            description: dto.description ?? null,
            areaSqm: dto.area_sqm ?? null,

            environmentalFeatures: dto.environmental_features ?? null,
            audioFeatures: dto.audio_features ?? null,
            presentationFeatures: dto.presentation_features ?? null,
            lightingFeatures: dto.lighting_features ?? null,
            climateFeatures: dto.climate_features ?? null,
            miscFeatures: dto.misc_features ?? null,

            createdAt: dto.created_at ?? null,
            modifiedAt: dto.modified_at ?? null,
        })

        space.accessibilityFlags = accessibilityFlags // bigint

        return space
    }

    static empty(): UranusSpace {
        const emptyDto: UranusSpaceDTO = {
            id: -1,
            venue_id: null,
            name: '',
            created_at: new Date(0).toISOString(), // required
        }

        return UranusSpace.fromDTO(emptyDto)
    }

    toDTO(): UranusSpaceDTO {
        return {
            id: this.id,
            venue_id: this.venueId ?? null,
            name: this.name,

            total_capacity: this.totalCapacity ?? null,
            seating_capacity: this.seatingCapacity ?? null,
            space_type: this.spaceType ?? null,
            building_level: this.buildingLevel ?? null,
            website_link: this.websiteLink ?? null,

            accessibility_summary: this.accessibilitySummary ?? null,
            accessibility_flags: this.accessibilityFlags != null
                ? this.accessibilityFlags.toString()
                : null,

            description: this.description ?? null,
            area_sqm: this.areaSqm ?? null,

            environmental_features: this.environmentalFeatures ?? null,
            audio_features: this.audioFeatures ?? null,
            presentation_features: this.presentationFeatures ?? null,
            lighting_features: this.lightingFeatures ?? null,
            climate_features: this.climateFeatures ?? null,
            misc_features: this.miscFeatures ?? null,

            created_at: this.createdAt ?? '',
            modified_at: this.modifiedAt ?? null,
        }
    }

    static fromApi(raw: any): UranusSpace | null {
        if (!raw) return null
        return UranusSpace.fromDTO(raw as UranusSpaceDTO)
    }
}
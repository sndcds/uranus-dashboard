/*
    src/domain/space/space.model.ts
*/

import type { SpaceDto } from '@/api/dto/space.dto.ts'

/**
 * Frontend-friendly space model
 * safe for reactive usage in Vue 3
 */
export interface SpaceModel {
    uuid: string | null
    venueUuid: string | null
    name: string

    totalCapacity: number | null
    seatingCapacity: number | null
    spaceType: string | null
    buildingLevel: number | null
    webLink: string | null

    accessibilitySummary: string | null
    accessibilityFlags: bigint | null

    description: string | null
    areaSqm: number | null

    createdAt: string | null
    modifiedAt: string | null
}

/**
 * Convert DTO → frontend model
 */
export function mapSpace(dto: SpaceDto): SpaceModel {
    let accessibilityFlags: bigint | null = 0n
    try {
        if (dto.accessibility_flags != null && dto.accessibility_flags !== '') {
            accessibilityFlags = BigInt(dto.accessibility_flags)
        }
    } catch (err) {
        console.error('Invalid accessibility_flags:', dto.accessibility_flags, err)
        accessibilityFlags = 0n
    }

    return {
        uuid: dto.uuid ?? null,
        venueUuid: dto.venue_uuid ?? null,
        name: dto.name ?? '',

        totalCapacity: dto.total_capacity ?? null,
        seatingCapacity: dto.seating_capacity ?? null,
        spaceType: dto.space_type ?? null,
        buildingLevel: dto.building_level ?? null,
        webLink: dto.web_link ?? null,

        accessibilitySummary: dto.accessibility_summary ?? null,
        accessibilityFlags,

        description: dto.description ?? null,
        areaSqm: dto.area_sqm ?? null,

        createdAt: dto.created_at ?? null,
        modifiedAt: dto.modified_at ?? null,
    }
}

/**
 * Convert frontend model → DTO
 * suitable for API calls
 */
export function toSpaceDTO(model: SpaceModel): SpaceDto {
    return {
        uuid: model.uuid,
        venue_uuid: model.venueUuid ?? null,
        name: model.name,

        total_capacity: model.totalCapacity ?? null,
        seating_capacity: model.seatingCapacity ?? null,
        space_type: model.spaceType ?? null,
        building_level: model.buildingLevel ?? null,
        web_link: model.webLink ?? null,

        accessibility_summary: model.accessibilitySummary ?? null,
        accessibility_flags: model.accessibilityFlags != null
            ? model.accessibilityFlags.toString()
            : null,

        description: model.description ?? null,
        area_sqm: model.areaSqm ?? null,

        created_at: model.createdAt ?? '',
        modified_at: model.modifiedAt ?? null,
    }
}

/**
 * Factory for empty model
 */
export function createEmptySpace(): SpaceModel {
    return {
        uuid: null,
        venueUuid: null,
        name: '',

        totalCapacity: null,
        seatingCapacity: null,
        spaceType: null,
        buildingLevel: null,
        webLink: null,

        accessibilitySummary: null,
        accessibilityFlags: 0n,

        description: null,
        areaSqm: null,

        createdAt: null,
        modifiedAt: null,
    }
}

/**
 * Convert API raw → frontend model
 */
export function fromApi(raw: any): SpaceModel | null {
    if (!raw) return null
    return mapSpace(raw as SpaceDto)
}
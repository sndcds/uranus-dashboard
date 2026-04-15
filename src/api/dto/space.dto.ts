/*
    src/api/dto/space.dto.ts
*/

export interface SpaceDTO {
    uuid: string | null

    venue_uuid: string | null
    name: string

    total_capacity?: number | null
    seating_capacity?: number | null
    space_type?: string | null
    building_level?: number | null
    web_link?: string | null

    accessibility_summary?: string | null
    accessibility_flags?: string | null

    description?: string | null
    area_sqm?: number | null

    created_at: string
    modified_at?: string | null
}
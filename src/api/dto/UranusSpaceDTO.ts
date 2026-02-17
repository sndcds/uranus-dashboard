/*
    src/api/dto/UranusSpaceDTO.ts

    2026-02-13, Roald
*/

export interface UranusSpaceDTO {
    id: number | null

    venue_id: number | null
    name: string

    total_capacity?: number | null
    seating_capacity?: number | null
    space_type?: string | null
    building_level?: number | null
    website_link?: string | null

    accessibility_summary?: string | null
    accessibility_flags?: string | null

    description?: string | null
    area_sqm?: number | null

    environmental_features?: number | null
    audio_features?: number | null
    presentation_features?: number | null
    lighting_features?: number | null
    climate_features?: number | null
    misc_features?: number | null

    created_at: string
    modified_at?: string | null
}
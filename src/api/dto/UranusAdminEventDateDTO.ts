/*
    src/api/dto/UranusAdminEventDateDTO.ts

    2026-02-05, Roald
 */

export interface UranusAdminEventDateDTO {
    id: number
    event_id: number
    start_date?: string | null
    start_time?: string | null
    end_date?: string | null
    end_time?: string | null
    entry_time?: string | null
    duration?: number | null
    accessibility_info?: string | null
    venue_id?: number | null
    space_id?: number | null
}

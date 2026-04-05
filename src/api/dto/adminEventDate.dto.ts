/*
    src/api/dto/UranusAdminEventDateDTO.ts
 */

export interface AdminEventDateDTO {
    uuid: string
    event_uuid: string
    start_date?: string | null
    start_time?: string | null
    end_date?: string | null
    end_time?: string | null
    entry_time?: string | null
    duration?: number | null
    accessibility_info?: string | null
    venue_uuid?: string | null
    space_uuid?: string | null
    all_day?: boolean | null
}

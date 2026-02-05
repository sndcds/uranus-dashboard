import type { UranusAdminEventDateDTO } from '@/api/dto/UranusAdminEventDateDTO.ts'
import type { UranusAdminEventDate } from '@/domain/event/UranusAdminEventDate.ts'

export function mapAdminEventDateFromApi(
    json: UranusAdminEventDateDTO
): UranusAdminEventDate {
    return {
        id: json.id,
        eventId: json.event_id,

        startDate: json.start_date ?? undefined,
        startTime: json.start_time ?? undefined,
        endDate: json.end_date ?? undefined,
        endTime: json.end_time ?? undefined,
        entryTime: json.entry_time ?? undefined,

        duration: json.duration ?? undefined,
        accessibilityInfo: json.accessibility_info ?? undefined,

        venueId: json.venue_id ?? undefined,
        spaceId: json.space_id ?? undefined,
    }
}

export function mapAdminEventDatesFromApi(
    jsonArray: UranusAdminEventDateDTO[] | null | undefined
): UranusAdminEventDate[] {
    if (!jsonArray) return []
    return jsonArray.map(mapAdminEventDateFromApi)
}

export function mapAdminEventDateToApi(
    date: UranusAdminEventDate
): UranusAdminEventDateDTO {
    return {
        id: date.id,
        event_id: date.eventId,

        start_date: date.startDate ?? null,
        start_time: date.startTime ?? null,
        end_date: date.endDate ?? null,
        end_time: date.endTime ?? null,
        entry_time: date.entryTime ?? null,

        duration: date.duration ?? null,
        accessibility_info: date.accessibilityInfo ?? null,

        venue_id: date.venueId ?? null,
        space_id: date.spaceId ?? null,
    }
}

export function mapAdminEventDatesToApi(
    dates: UranusAdminEventDate[] | null | undefined
): UranusAdminEventDateDTO[] {
    if (!dates) return []
    return dates.map(mapAdminEventDateToApi)
}
import { UranusAdminEvent } from '@/domain/event/UranusAdminEvent.ts'
import { type UranusAdminEventDTO } from '@/api/dto/UranusAdminEventDTO.ts'
import type { UranusAdminEventDateDTO } from "@/api/dto/UranusAdminEventDateDTO.ts";
import type { UranusAdminEventDate } from "@/domain/event/UranusAdminEventDate.ts";


export function mapUranusAdminEvent(raw: any): UranusAdminEvent | null {
    if (!raw || typeof raw !== 'object') return null

    const dto: UranusAdminEventDTO = {
        id: raw.id,
        release_status: raw.release_status ?? null,
        release_date: raw.release_date ?? null,
        external_id: raw.external_id ?? null,
        source_url: raw.source_url ?? null,
        custom: raw.custom ?? null,
        style: raw.style ?? null,
        content_language: raw.content_language ?? null,
        title: raw.title ?? '',
        subtitle: raw.subtitle ?? null,
        organization_id: raw.organization_id ?? 0,
        venue_id: raw.venue_id ?? null,
        space_id: raw.space_id ?? null,
        event_types: raw.event_types ?? [],
        tags: raw.tags ?? [],
        description: raw.description ?? null,
        summary: raw.summary ?? null,
        participation_info: raw.participation_info ?? null,
        meeting_point: raw.meeting_point ?? null,
        min_age: raw.min_age ?? null,
        max_age: raw.max_age ?? null,
        max_attendees: raw.max_attendees ?? null,
        price_type: raw.price_type ?? null,
        min_price: raw.min_price ?? null,
        max_price: raw.max_price ?? null,
        ticket_flags: raw.ticket_flags ?? null,
        currency: raw.currency ?? null,
        occasion_type_id: raw.occasion_type_id ?? null,
        online_link: raw.online_link ?? null,
        languages: raw.languages ?? [],
        event_dates: raw.dates ?? [],
        event_links: raw.event_links ?? [],
    }

    return new UranusAdminEvent(dto)
}

export function mapAdminEventDateFromApi(
    json: UranusAdminEventDateDTO
): UranusAdminEventDate {
    return {
        id: json.id,
        eventId: json.event_id,

        startDate: json.start_date ?? null,
        startTime: json.start_time ?? null,
        endDate: json.end_date ?? null,
        endTime: json.end_time ?? null,
        entryTime: json.entry_time ?? null,

        duration: json.duration ?? null,
        accessibilityInfo: json.accessibility_info ?? null,

        venueId: json.venue_id ?? null,
        spaceId: json.space_id ?? null,
        allDay: json.all_day ?? null
    }
}

export function mapAdminEventDatesFromApi(
    raw: UranusAdminEventDateDTO[] | null | undefined
): UranusAdminEventDate[] {
    if (!raw) return []
    return raw.map(mapAdminEventDateFromApi)
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
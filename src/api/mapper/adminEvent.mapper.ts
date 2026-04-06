import {type AdminEvent, createAdminEvent} from '@/domain/event/adminEvent.ts'
import { type AdminEventDTO } from '@/api/dto/adminEvent.dto.ts'
import type { AdminEventDateDTO } from "@/api/dto/adminEventDate.dto.ts";
import type { AdminEventDate } from "@/domain/event/adminEventDate.ts";
import { EventLinkModel } from "@/domain/event/eventLink.model.ts";
import { createEventTypePair } from "@/domain/event/eventTypePair.model.ts";


export function mapAdminEventFromDTO(dto: AdminEventDTO): AdminEvent {
    let visitorInfoFlags: bigint = 0n
    try {
        if (dto.visitor_info_flags && dto.visitor_info_flags !== '') {
            visitorInfoFlags = BigInt(dto.visitor_info_flags)
        }
    } catch (err) {
        visitorInfoFlags = 0n
    }

    return createAdminEvent({
        uuid: dto.uuid,
        releaseStatus: dto.release_status,
        releaseDate: dto.release_date,
        categories: dto.categories ? [...dto.categories] : null,
        externalId: dto.external_id,
        sourceUrl: dto.source_url ?? null,
        custom: dto.custom ?? null,
        style: dto.style ?? null,
        contentLanguage: dto.content_language,
        title: dto.title,
        subtitle: dto.subtitle,
        description: dto.description ?? null,
        summary: dto.summary ?? null,
        eventLinks: (dto.event_links ?? []).map(e => new EventLinkModel(e.label, e.type, e.url)),
        occasionTypeId: dto.occasion_type_id ?? null,
        eventTypes: (dto.event_types ?? []).map(e => createEventTypePair(e.type_id, e.genre_id)),
        tags: dto.tags ?? null,
        eventDates: mapAdminEventDatesFromApi(dto.event_dates),
        orgUuid: dto.org_uuid,
        venueUuid: dto.venue_uuid,
        spaceUuid: dto.space_uuid,
        meetingPoint: dto.meeting_point ?? null,
        onlineLink: dto.online_link ?? null,
        participationInfo: dto.participation_info ?? null,
        languages: dto.languages ?? [],
        minAge: dto.min_age ?? null,
        maxAge: dto.max_age ?? null,
        maxAttendees: dto.max_attendees ?? null,
        visitorInfoFlags,
        priceType: dto.price_type ?? null,
        currency: dto.currency ?? null,
        minPrice: dto.min_price ?? null,
        maxPrice: dto.max_price ?? null,
        ticketFlags: dto.ticket_flags ?? null,
    })
}

export function mapAdminEventDateFromApi( // TODO: !!!!
    json: AdminEventDateDTO
): AdminEventDate {
    return {
        uuid: json.uuid,
        eventUuid: json.event_uuid,

        startDate: json.start_date ?? null,
        startTime: json.start_time ?? null,
        endDate: json.end_date ?? null,
        endTime: json.end_time ?? null,
        entryTime: json.entry_time ?? null,

        duration: json.duration ?? null,
        accessibilityInfo: json.accessibility_info ?? null,

        venueUuid: json.venue_uuid ?? null,
        spaceUuid: json.space_uuid ?? null,
        allDay: json.all_day ?? false
    }
}

export function mapAdminEventDatesFromApi(
    raw: AdminEventDateDTO[] | null | undefined
): AdminEventDate[] {
    if (!raw) return []
    return raw.map(mapAdminEventDateFromApi)
}

export function mapAdminEventDateToApi( // TODO: !!!!
    date: AdminEventDate
): AdminEventDateDTO {
    return {
        uuid: date.uuid,
        event_uuid: date.eventUuid,

        start_date: date.startDate ?? null,
        start_time: date.startTime ?? null,
        end_date: date.endDate ?? null,
        end_time: date.endTime ?? null,
        entry_time: date.entryTime ?? null,

        duration: date.duration ?? null,
        accessibility_info: date.accessibilityInfo ?? null,

        venue_uuid: date.venueUuid ?? null,
        space_uuid: date.spaceUuid ?? null,
    }
}

export function mapAdminEventDatesToApi( // TODO: !!!!
    dates: AdminEventDate[] | null | undefined
): AdminEventDateDTO[] {
    if (!dates) return []
    return dates.map(mapAdminEventDateToApi)
}

export function mapAdminEventToDTO(event: AdminEvent): AdminEventDTO {
    return {
        uuid: event.uuid!,
        release_status: event.releaseStatus,
        release_date: event.releaseDate,
        categories: event.categories ?? null,
        external_id: event.externalId,
        content_language: event.contentLanguage,
        title: event.title!,
        subtitle: event.subtitle,
        org_uuid: event.orgUuid!,
        venue_uuid: event.venueUuid,
        space_uuid: event.spaceUuid,
        event_types: event.eventTypes?.map(e => ({ type_id: e.typeId, genre_id: e.genreId })) ?? [],
        description: event.description,
        summary: event.summary,
        participation_info: event.participationInfo,
        meeting_point: event.meetingPoint,
        min_age: event.minAge,
        max_age: event.maxAge,
        max_attendees: event.maxAttendees,
        price_type: event.priceType,
        min_price: event.minPrice,
        max_price: event.maxPrice,
        ticket_flags: event.ticketFlags,
        currency: event.currency,
        visitor_info_flags: event.visitorInfoFlags?.toString() ?? null,
        occasion_type_id: event.occasionTypeId,
        online_link: event.onlineLink,
        source_url: event.sourceUrl,
        custom: event.custom,
        style: event.style,
        languages: event.languages ?? [],
        event_dates: mapAdminEventDatesToApi(event.eventDates),
        event_links: event.eventLinks,
        tags: event.tags,
    }
}
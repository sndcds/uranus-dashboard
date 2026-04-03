/*
    src/domain/event/UranusAdminEvent.ts
    2026-02-05, Roald
*/

import { UranusEventLink } from './UranusEventLink.ts'
import { createEventTypePair, type EventTypePairModel } from '@/domain/event/eventTypePair.model.ts'
import { type AdminEventDTO } from '@/api/dto/adminEvent.dto.ts'
import { type AdminEventDateModel } from '@/domain/event/adminEventDate.model.ts'
import {
    mapUranusAdminEvent,
    mapAdminEventDatesFromApi,
    mapAdminEventDatesToApi
} from '@/api/mapper/adminEvent.mapper.ts'

export type AdminEventModel = {
    uuid: string | null
    releaseStatus: string | null
    releaseDate: string | null
    externalId: string | null
    sourceUrl: string | null
    custom: string | null
    style: string | null

    contentLanguage: string | null
    title: string | null
    subtitle: string | null
    description: string | null
    summary: string | null
    eventLinks: UranusEventLink[] | null

    occasionTypeId: number | null
    categories: number[] | null
    eventTypes: EventTypePairModel[] | null
    tags: string[] | null

    eventDates: AdminEventDateModel[] | null

    orgUuid: string | null
    venueUuid: string | null
    spaceUuid: string | null
    meetingPoint: string | null
    onlineLink: string | null

    participationInfo: string | null
    languages: string[] | null
    minAge: number | null
    maxAge: number | null
    maxAttendees: number | null
    visitorInfoFlags: bigint | null

    priceType: string | null
    currency: string | null
    minPrice: number | null
    maxPrice: number | null
    ticketFlags: string[] | null
}

// Factory function to create a plain UranusAdminEvent object
export function createUranusAdminEvent(props: Partial<AdminEventModel> = {}): AdminEventModel {
    return {
        uuid: null,
        releaseStatus: null,
        releaseDate: null,
        externalId: null,
        sourceUrl: null,
        custom: null,
        style: null,

        contentLanguage: null,
        title: null,
        subtitle: null,
        description: null,
        summary: null,
        eventLinks: null,

        occasionTypeId: null,
        categories: null,
        eventTypes: null,
        tags: null,

        eventDates: null,

        orgUuid: null,
        venueUuid: null,
        spaceUuid: null,
        meetingPoint: null,
        onlineLink: null,

        participationInfo: null,
        languages: null,
        minAge: null,
        maxAge: null,
        maxAttendees: null,
        visitorInfoFlags: null,

        priceType: null,
        currency: null,
        minPrice: null,
        maxPrice: null,
        ticketFlags: null,

        ...props
    }
}

// Mapping from DTO to plain object
export function fromDTO(dto: AdminEventDTO): AdminEventModel {
    let visitorInfoFlags: bigint = 0n
    try {
        if (dto.visitor_info_flags != null && dto.visitor_info_flags !== '') {
            visitorInfoFlags = BigInt(dto.visitor_info_flags)
        }
    } catch (err) {
        console.error('Invalid visitor_info_flags:', dto.visitor_info_flags, err)
        visitorInfoFlags = 0n
    }

    return createUranusAdminEvent({
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
        eventLinks: (dto.event_links ?? []).map(e => new UranusEventLink(e.label, e.type, e.url)),
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

// Mapping from plain object to DTO
export function toDTO(event: AdminEventModel): AdminEventDTO {
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

// Optional helper to map raw API object
export function fromApi(raw: any): AdminEventModel | null {
    return mapUranusAdminEvent(raw)
}
/*
    src/domain/event/UranusAdminEvent.ts

    2026-02-05, Roald
 */

import { UranusEventLink } from './UranusEventLink.ts'
import { UranusAdminEventTypePair } from './UranusAdminEventTypePair.ts'
import { type UranusAdminEventDTO } from '@/api/dto/UranusAdminEventDTO.ts'
import { type UranusAdminEventDate } from '@/domain/event/UranusAdminEventDate.ts'
import {
    mapUranusAdminEvent,
    mapAdminEventDatesFromApi,
    mapAdminEventDatesToApi
} from '@/api/mapper/UranusAdminEvent.mapper.ts'


export class UranusAdminEvent {
    id: number | null = null
    releaseStatus: string | null = null
    releaseDate: string | null = null
    externalId: string | null = null
    sourceUrl: string | null = null
    custom: string | null = null
    style: string | null = null

    contentLanguage: string | null = null
    title: string | null = null
    subtitle: string | null = null
    description: string | null = null
    summary: string | null = null
    eventLinks: UranusEventLink[] | null = null

    occasionTypeId: number | null = null
    eventTypes: UranusAdminEventTypePair[] | null = null
    tags: string[] | null = null

    eventDates: UranusAdminEventDate[] | null = null

    organizationId: number | null = null
    venueId: number | null = null
    spaceId: number | null = null
    meetingPoint: string | null = null
    onlineLink: string | null = null

    participationInfo: string | null = null
    languages: string[] | null  = null
    minAge: number | null = null
    maxAge: number | null = null
    maxAttendees: number | null = null
    visitorInfoFlags: bigint | null = null

    priceType: string | null = null
    currency: string | null = null
    minPrice: number | null = null
    maxPrice: number | null = null
    ticketFlags: string[] | null = null

    constructor(props: Partial<UranusAdminEvent>) {
        Object.assign(this, props)
    }

    static fromDTO(dto: UranusAdminEventDTO): UranusAdminEvent {
        let visitorInfoFlags: bigint = 0n
        try {
            if (dto.visitor_info_flags != null && dto.visitor_info_flags !== '') {
                visitorInfoFlags = BigInt(dto.visitor_info_flags)
            }
        } catch (err) {
            console.error('Invalid accessibility_flags:', dto.visitor_info_flags, err)
            visitorInfoFlags = 0n
        }

        const event = new UranusAdminEvent({
            id: dto.id,
            releaseStatus: dto.release_status,
            releaseDate: dto.release_date,
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
            eventTypes: (dto.event_types ?? []).map(e => new UranusAdminEventTypePair(e.type_id, e.genre_id)),
            tags: dto.tags ?? null,
            eventDates: mapAdminEventDatesFromApi(dto.event_dates),
            organizationId: dto.organization_id,
            venueId: dto.venue_id,
            spaceId: dto.space_id,
            meetingPoint: dto.meeting_point ?? null,
            onlineLink: dto.online_link ?? null,
            participationInfo: dto.participation_info ?? null,
            languages: dto.languages ?? [],
            minAge: dto.min_age ?? null,
            maxAge: dto.max_age ?? null,
            maxAttendees: dto.max_attendees ?? null,
            visitorInfoFlags: visitorInfoFlags,
            priceType: dto.price_type ?? null,
            currency: dto.currency ?? null,
            minPrice: dto.min_price ?? null,
            maxPrice: dto.max_price ?? null,
            ticketFlags: dto.ticket_flags ?? null
        })

        return event
    }

    toDTO(): UranusAdminEventDTO {
        return {
            id: this.id!,
            release_status: this.releaseStatus,
            release_date: this.releaseDate,
            external_id: this.externalId,
            content_language: this.contentLanguage,
            title: this.title!,
            subtitle: this.subtitle,
            organization_id: this.organizationId!,
            venue_id: this.venueId,
            space_id: this.spaceId,
            event_types: this.eventTypes?.map(e => ({ type_id: e.typeId, genre_id: e.genreId })) ?? [],
            description: this.description,
            summary: this.summary,
            participation_info: this.participationInfo,
            meeting_point: this.meetingPoint,
            min_age: this.minAge,
            max_age: this.maxAge,
            max_attendees: this.maxAttendees,
            price_type: this.priceType,
            min_price: this.minPrice,
            max_price: this.maxPrice,
            ticket_flags: this.ticketFlags,
            currency: this.currency,
            visitor_info_flags: this.visitorInfoFlags != null
                ? this.visitorInfoFlags.toString()
                : null,
            occasion_type_id: this.occasionTypeId,
            online_link: this.onlineLink,
            source_url: this.sourceUrl,
            custom: this.custom,
            style: this.style,
            languages: this.languages ?? [],
            event_dates: mapAdminEventDatesToApi(this.eventDates),
            event_links: this.eventLinks,
            tags: this.tags,
        }
    }



    static fromApi(raw: any): UranusAdminEvent | null {
        return mapUranusAdminEvent(raw)
    }
}
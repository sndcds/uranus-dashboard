/*
    src/domain/event/UranusAdminEvent.ts

    2026-02-05, Roald
 */
import { type UranusEventReleaseStatus } from './UranusEventReleaseStatus.ts'
import { UranusEventLink } from './UranusEventLink.ts'
import { UranusEventTypePair } from './UranusEventTypePair.ts'
import { type UranusAdminEventDTO } from '@/api/dto/UranusAdminEventDTO.ts'
import { type UranusAdminEventDate } from '@/domain/event/UranusAdminEventDate.ts'
import { mapUranusAdminEvent } from "@/api/mapper/UranusAdminEvent.mapper.ts";
import {
    mapAdminEventDatesFromApi,
    mapAdminEventDatesToApi
} from "@/api/mapper/UranusEventDate.mapper.ts";

export class UranusAdminEvent {
    id: number
    releaseStatus: UranusEventReleaseStatus | null
    releaseDate: string | null
    externalId: string | null
    sourceUrl: string | null
    custom: string | null
    style: string | null

    contentLanguage: string | null
    title: string
    subtitle: string | null
    description: string | null
    summary: string | null
    eventLinks: UranusEventLink[]

    occasionTypeId: number | null
    eventTypes: UranusEventTypePair[] | null
    tags: string[] | null

    eventDates: UranusAdminEventDate[] | null

    organizationId: number | null
    venueId: number | null
    spaceId: number | null
    meetingPoint: string | null
    onlineLink: string | null

    participationInfo: string | null
    languages: string[]
    minAge: number | null
    maxAge: number | null
    maxAttendees: number | null

    priceType: string | null
    currency: string | null
    minPrice: number | null
    maxPrice: number | null
    ticketFlags: string[] | null

    constructor(props: UranusAdminEventDTO) {
        this.id = props.id
        this.releaseStatus = props.release_status
        this.releaseDate = props.release_date
        this.externalId = props.external_id
        this.sourceUrl = props.source_url ?? null
        this.custom = props.custom ?? null
        this.style = props.style ?? null
        this.contentLanguage = props.content_language
        this.title = props.title
        this.subtitle = props.subtitle
        this.description = props.description ?? null
        this.summary = props.summary ?? null
        this.eventLinks = (props.event_links ?? []).map(e => new UranusEventLink(e.label, e.type, e.url))
        this.occasionTypeId = props.occasion_type_id ?? null
        this.eventTypes = (props.event_types ?? []).map(e => new UranusEventTypePair(e.type_id, e.genre_id))
        this.tags = props.tags ?? null
        this.eventDates = mapAdminEventDatesFromApi(props.event_dates)
        this.organizationId = props.organization_id
        this.venueId = props.venue_id
        this.spaceId = props.space_id
        this.meetingPoint = props.meeting_point ?? null
        this.onlineLink = props.online_link ?? null
        this.participationInfo = props.participation_info ?? null
        this.languages = props.languages ?? []
        this.minAge = props.min_age ?? null
        this.maxAge = props.max_age ?? null
        this.maxAttendees = props.max_attendees ?? null
        this.priceType = props.price_type ?? null
        this.currency = props.currency ?? null
        this.minPrice = props.min_price ?? null
        this.maxPrice = props.max_price ?? null
        this.ticketFlags = props.ticket_flags ?? null
    }

    toProps(): UranusAdminEventDTO {
        return {
            id: this.id,
            release_status: this.releaseStatus,
            release_date: this.releaseDate,
            external_id: this.externalId,
            content_language: this.contentLanguage,
            title: this.title,
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
            occasion_type_id: this.occasionTypeId,
            online_link: this.onlineLink,
            source_url: this.sourceUrl,
            custom: this.custom,
            style: this.style,
            languages: this.languages,
            event_dates: mapAdminEventDatesToApi(this.eventDates),
            event_links: this.eventLinks,
            tags: this.tags,
        }
    }

    static fromApi(raw: any): UranusAdminEvent | null {
        return mapUranusAdminEvent(raw)
    }
}
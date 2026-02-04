/*
    src/model/uranusAdminEventModel.ts

    UranusAdminEvent and its helper classes describes an event for the admin API.
*/

import {
    UranusEventTypePair,
    UranusEventLink,
} from '@/model/uranusEventModel.ts'

import { mapAdminEventDetail } from '@/util/UranusAdminEventMapper.ts'


export interface UranusAdminListEvent {
    id: number
    dateId: number
    releaseStatus?: number | null
    releaseDate?: string | null
    canEditEvent: boolean
    canDeleteEvent: boolean
    canReleaseEvent: boolean
    organizationId: number
    organizationName?: string | null
    venueId?: number | null
    venueName?: string | null
    spaceId?: number | null
    spaceName?: string | null
    imageId?: number | null
    imageUrl?: string | null
    seriesIndex?: number | null
    seriesTotal?: number | null
    startDate: string
    startTime: string
    endDate?: string | null
    endTime?: string | null
    title: string
    subtitle?: string | null
    eventTypes?: UranusEventTypePair[] | null
}

export class UranusVenueSpaceSelection {
    constructor(
        public dateVenueId: number | null = null,
        public venueId: number | null = null,
        public spaceId: number | null = null,
        public venueName: string | null = null,
        public spaceName: string | null = null,
    ) {}
}

export class UranusAdminEventDate {
    constructor(
        public id: number | null = null,
        public eventId: number | null = null,
        public venueId: number | null = null,
        public spaceId: number | null = null,
        public startDate: string | null = null,
        public startTime: string | null = null,
        public endDate: string | null = null,
        public endTime: string | null = null,
        public entryTime: string | null = null,
        public allDay: boolean = false,
        public duration: number | null = null,
    ) {}
}


// UranusEventDetailProps → data shape / input contract
export interface UranusEventDetailProps {
    id: number
    release_status: number | null
    release_date: string | null
    external_id: string | null
    source_url?: string | null
    custom?: string | null
    style?: string | null

    content_language: string | null

    title: string
    subtitle: string | null

    organization_id: number
    venue_id: number | null
    space_id: number | null

    event_types: { type_id: number | null; genre_id: number | null }[] | null
    tags?: string[] | null

    description?: string | null
    summary?: string | null
    participation_info?: string | null
    meeting_point?: string | null

    min_age?: number | null
    max_age?: number | null
    max_attendees?: number | null

    price_type?: string | null
    min_price?: number | null
    max_price?: number | null

    ticket_flags?: string[] | null

    currency?: string | null
    occasion_type_id?: number | null

    online_link?: string | null


    languages?: string[]
    event_dates?: UranusAdminEventDate[] | null
    event_links: { label: string | null; type: number | null; url: string | null }[] | null
}

// UranusEventDetail → domain model / invariant holder
export class UranusEventDetail {
    id: number  // TODO:
    releaseStatus: number | null
    releaseDate: string | null
    externalId: string | null   // TODO:
    sourceUrl: string | null    // TODO:
    custom: string | null   // TODO:
    style: string | null    // TODO:

    // What
    contentLanguage: string | null
    title: string
    subtitle: string | null
    description: string | null
    summary: string | null
    eventLinks: UranusEventLink[]

    occasionTypeId: number | null   // TODO:
    eventTypes: UranusEventTypePair[] | null | undefined
    tags: string[] | null

    // Wenn
    eventDates: UranusAdminEventDate[] | null

    organizationId: number | null   // TODO:
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

    // images?: UranusImageMap | null   // TODO:

    constructor(props: UranusEventDetailProps & { eventTypes?: { type_id: number | null; genre_id: number | null }[] }) {
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

        this.eventLinks = (props.event_links ?? []).map(e => {
            return new UranusEventLink(
                e.label ?? null,
                e.type != null ? Number(e.type) : null, // Ensure number
                e.url ?? null
            )
        })

        this.occasionTypeId = props.occasion_type_id ?? null

        this.eventTypes = (props.event_types ?? []).map(e => {
            return new UranusEventTypePair(
                e.type_id ?? null,
                e.genre_id != null ? Number(e.genre_id) : null, // Ensure number
            )
        })


        this.tags = props.tags ?? null

        // When
        this.eventDates = props.event_dates ?? null

        // Where
        this.organizationId = props.organization_id
        this.venueId = props.venue_id
        this.spaceId = props.space_id
        this.meetingPoint = props.meeting_point ?? null
        this.onlineLink = props.online_link ?? null

        // Info
        this.participationInfo = props.participation_info ?? null
        this.languages = props.languages ?? []
        this.minAge = props.min_age ?? null
        this.maxAge = props.max_age ?? null
        this.maxAttendees = props.max_attendees ?? null

        // Price / Register
        this.priceType = props.price_type ?? null
        this.currency = props.currency ?? null
        this.minPrice = props.min_price ?? null
        this.maxPrice = props.max_price ?? null
        this.ticketFlags = props.ticket_flags ?? null
    }

    toProps(): UranusEventDetailProps {
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

            event_types: this.eventTypes?.map(e => ({
                type_id: e.typeId,
                genre_id: e.genreId,
            })) ?? [],

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
            event_dates: this.eventDates ?? [],
            event_links: this.eventLinks,
            tags: this.tags,
        }
    }

    static fromApi(raw: any): UranusEventDetail | null {
        return mapAdminEventDetail(raw)
    }
}

export interface UranusEventVenueInfoProp {
    venue_id: number
    venue_name: string
    space_id: number | null
    space_name: string | null
    city: string
    country: string
}

export type UranusGroupedVenue = {
    venueId: number
    venueName: string
    city: string
    venueInfos: UranusEventVenueInfoProp[]
}
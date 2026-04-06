// src/domain/event/event.model.ts
import { type PlutoImage, mapPlutoImageFromDTO } from '@/domain/image/plutoImage.model.ts'
import { type EventDateModel, mapEventDate } from './eventDate.model.ts'
import { type EventTypeModel, mapEventTypeFromDTO } from './eventType.model.ts'
import { type EventLinkModel } from './eventLink.model.ts'

export interface PublicEvent {
    eventId: number | null
    releaseStatus: string | null
    lang: string | null

    organizationId: number | null
    organizationName: string | null
    organizationUrl: string | null

    title: string | null
    subtitle: string | null
    description: string | null
    summary: string | null
    types: EventTypeModel[]
    tags: string[]

    minAge: number | null
    maxAge: number | null
    languages: string[]

    meetingPoint: string | null
    participationInfo: string | null
    onlineUrl: string | null

    maxAttendees: number | null
    priceType: number | null
    ticketAdvance: number | null
    ticketRequired: boolean | null
    registrationRequired: boolean | null
    currency: string | null
    minPrice: number | null
    maxPrice: number | null

    image: PlutoImage | null
    eventUrls: EventLinkModel[]

    date: EventDateModel
    furtherDates: EventDateModel[]
}

/**
 * Map API → frontend model
 */
export function mapEventFromApi(raw: any, dateUuid?: string): PublicEvent | null {
    if (!raw || typeof raw !== 'object') return null

    const mapDate = (d: any): EventDateModel => mapEventDate(d)

    const image: PlutoImage | null = raw.image
        ? mapPlutoImageFromDTO({
            uuid: raw.image.id ?? null,
            url: raw.image.url ?? null,
            alt: raw.image.alt ?? null,
            creator: raw.image.creator ?? null,
            copyright: raw.image.copyright ?? null,
            description: raw.image.description ?? null,
            license: raw.image.license ?? null,
        })
        : null

    const furtherDates: EventDateModel[] = Array.isArray(raw.further_dates)
        ? raw.further_dates.map(mapDate)
        : []

    const date: EventDateModel = dateUuid
        ? furtherDates.find(fd => fd.uuid === dateUuid) ?? mapDate(raw.date)
        : mapDate(raw.date)

    const types: EventTypeModel[] = Array.isArray(raw.event_types)
        ? (raw.event_types as any[]).map(mapEventTypeFromDTO)
        : []

    const urls: EventLinkModel[] = Array.isArray(raw.event_links)
        ? raw.event_links.map((u: any) => ({
            label: u.label ?? null,
            url: u.url ?? null,
            urlType: u.url_type ?? null,
        }))
        : []

    return {
        eventId: raw.event_id ?? null,
        releaseStatus: raw.release_status ?? null,
        lang: raw.lang ?? null,

        organizationId: raw.organization_id ?? null,
        organizationName: raw.organization_name ?? null,
        organizationUrl: raw.organization_website ?? null,

        title: raw.title ?? null,
        subtitle: raw.subtitle ?? null,
        description: raw.description ?? null,
        summary: raw.summary ?? null,
        types,
        tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],

        minAge: raw.min_age ?? null,
        maxAge: raw.max_age ?? null,
        participationInfo: raw.participation_info ?? null,
        languages: Array.isArray(raw.languages) ? raw.languages.map(String) : [],

        meetingPoint: raw.meeting_point ?? null,
        onlineUrl: raw.online_url ?? null,

        maxAttendees: raw.max_attendees ?? null,
        priceType: raw.price_type ?? null,
        ticketAdvance: raw.ticket_advance ?? null,
        ticketRequired: raw.ticket_required ?? null,
        registrationRequired: raw.registration_required ?? null,
        currency: raw.currency ?? null,
        minPrice: raw.min_price ?? null,
        maxPrice: raw.max_price ?? null,

        image,
        eventUrls: urls,
        date,
        furtherDates,
    }
}

/**
 * Helper for release status chip
 */
export function showReleaseStatusChip(releaseStatus: string): boolean {
    switch (releaseStatus) {
        case 'draft':
        case 'review':
        case 'released':
            return false
    }
    return true
}
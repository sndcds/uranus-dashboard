/*
    src/domain/event/publicEvent.model.ts
 */

import { type PlutoImage, mapPlutoImageFromDTO, type PlutoLogoImageRef } from '@/domain/image/plutoImage.model.ts'
import { type PublicEventDate, mapEventDate } from './publicEventDate.model.ts'
import { type EventTypeModel, mapEventTypeFromDTO } from './eventType.model.ts'
import { type EventLink } from './eventLink.model.ts'
import { type PublicEventDTO } from '@/api/dto/publicEvent.dto.ts'


export type OrgLogos = Record<string, PlutoLogoImageRef>

export interface PublicEvent {
    uuid: string | null
    releaseStatus: string | null
    contentLanguage: string | null

    orgUuid: string | null
    orgName: string | null
    orgWebLink: string | null
    orgLogos: OrgLogos

    title: string | null
    subtitle: string | null
    description: string | null
    summary: string | null
    types: EventTypeModel[] // TODO: !!!!!
    tags: string[]

    minAge: number | null
    maxAge: number | null
    languages: string[]

    meetingPoint: string | null
    participationInfo: string | null
    onlineLink: string | null

    maxAttendees: number | null
    priceType: string | null
    ticketFlags: string[] | []
    ticketLink: string | null
    currency: string | null
    minPrice: number | null
    maxPrice: number | null

    image: PlutoImage | null
    eventLinks: EventLink[] // TODO: !!!!

    date: PublicEventDate    // TODO: !!!!
    furtherDates: PublicEventDate[]  // TODO: !!!!
}

export function mapPublicEventFromDTO(dto: PublicEventDTO, dateUuid?: string): PublicEvent | null {
    if (!dto || typeof dto !== 'object') return null

    const mapDate = (d: any): PublicEventDate => mapEventDate(d)

    const image: PlutoImage | null = dto.image
        ? mapPlutoImageFromDTO(dto.image)
        : null

    const furtherDates: PublicEventDate[] = Array.isArray(dto.further_dates)
        ? dto.further_dates.map(mapDate)
        : []

    const date: PublicEventDate = dateUuid
        ? furtherDates.find(fd => fd.uuid === dateUuid) ?? mapDate(dto.date)
        : mapDate(dto.date)

    const types: EventTypeModel[] = Array.isArray(dto.event_types)
        ? (dto.event_types as any[]).map(mapEventTypeFromDTO)
        : []

    const eventLinks: EventLink[] = Array.isArray(dto.event_links)
        ? dto.event_links.map((u: any) => ({
            label: u.label ?? null,
            url: u.url ?? null,
            type: u.type ?? null,
        }))
        : []

    const orgLogos: OrgLogos = dto.org_logos && typeof dto.org_logos === 'object'
        ? dto.org_logos
        : {}

    return {
        uuid: dto.uuid ?? null,
        releaseStatus: dto.release_status ?? null,
        contentLanguage: dto.content_language ?? null,

        orgUuid: dto.org_uuid ?? null,
        orgName: dto.org_name ?? null,
        orgWebLink: dto.org_web_link ?? null,
        orgLogos,

        title: dto.title ?? null,
        subtitle: dto.subtitle ?? null,
        description: dto.description ?? null,
        summary: dto.summary ?? null,
        types,
        tags: Array.isArray(dto.tags) ? dto.tags.map(String) : [],

        minAge: dto.min_age ?? null,
        maxAge: dto.max_age ?? null,
        participationInfo: dto.participation_info ?? null,
        languages: Array.isArray(dto.languages) ? dto.languages.map(String) : [],

        meetingPoint: dto.meeting_point ?? null,
        onlineLink: dto.online_link ?? null,

        maxAttendees: dto.max_attendees ?? null,
        priceType: dto.price_type ?? null,
        ticketFlags: dto.ticket_flags ?? [],
        ticketLink: dto.ticket_link ?? null,
        currency: dto.currency ?? null,
        minPrice: dto.min_price ?? null,
        maxPrice: dto.max_price ?? null,

        image,
        eventLinks,
        date,
        furtherDates,
    }
}

export function showReleaseStatusChip(releaseStatus: string): boolean {
    switch (releaseStatus) {
        case 'draft':
        case 'review':
        case 'released':
            return false
    }
    return true
}
/*
    src/domain/event/adminEvent.model.ts
*/

import { EventLink } from './eventLink.model.ts'
import { type AdminEventDate } from '@/domain/event/adminEventDate.model.ts'
import { mapAdminEventFromDTO } from '@/api/mapper/adminEvent.mapper.ts'
import { type EventTypePairModel } from '@/domain/event/eventTypePair.model.ts'

export type AdminEvent = {
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
    eventLinks: EventLink[] | null

    occasionTypeId: number | null
    categories: number[] | null
    eventTypes: EventTypePairModel[] | null
    tags: string[] | null

    eventDates: AdminEventDate[] | null

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
    ticketLink: string | null
}

export function createAdminEvent(props: Partial<AdminEvent> = {}): AdminEvent {
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
        ticketLink: null,

        ...props
    }
}

export function fromApi(raw: any): AdminEvent | null {
    return mapAdminEventFromDTO(raw)
}
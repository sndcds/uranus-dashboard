import { UranusEventLocation } from '@/domain/event/UranusEventLocation.ts'
import { UranusEvent } from '@/domain/event/UranusEvent.ts'
import { UranusEventDate } from '@/domain/event/UranusEventDate.ts'
import { UranusEventTypePair } from '@/domain/event/UranusEventTypePair.ts'
import { UranusEventLink } from '@/domain/event/UranusEventLink.ts'

import { PlutoImageMeta } from '@/model/plutoImageModel.ts'
import { toNumberOrNull, toString, toNullableString } from '@/util/UranusUtils.ts'
import { mapEventTypeFromDTO, type UranusEventTypeDTO }  from "@/api/dto/UranusEventTypeDTO.ts";
import type { UranusEventType } from "@/domain/event/UranusEventType.ts";

type MapResult<T> = { data: T } | { error: string }

export const mapEventData = (raw: unknown): MapResult<UranusEvent> => {
    if (!raw || typeof raw !== 'object') return { error: 'Invalid input: expected an object' }
    const r = raw as Record<string, unknown>

    // --- Required fields ---
    const eventId = toNumberOrNull(r.event_id)
    if (eventId === null) return { error: 'Missing or invalid field: event_id' }

    const title = toString(r.title)
    if (!title) return { error: 'Missing field: title' }

    const organizationId = toNumberOrNull(r.organization_id)
    if (organizationId === null) return { error: 'Missing or invalid field: organization_id' }

    const organizationName = toString(r.organization_name)
    if (!organizationName) return { error: 'Missing field: organization_name' }

    // --- Event type ---
    const eventTypes: UranusEventType[] = Array.isArray(r.event_types)
        ? (r.event_types as UranusEventTypeDTO[])
            .map(mapEventTypeFromDTO)
        : []

    // --- Event dates ---
    const eventDates: UranusEventDate[] = Array.isArray(r.event_dates)
        ? r.event_dates.map(mapEventDate).filter((d): d is UranusEventDate => d !== null)
        : []

    const firstEventDate = eventDates[0] ?? null
    const eventDateId = firstEventDate?.id ?? null

    const toBooleanOrNull = (v: unknown): boolean | null => (v != null ? Boolean(v) : null)
    const subtitle = toNullableString(r.subtitle)

    const startDate = firstEventDate?.startDate ?? toNullableString(r.date)
    if (!startDate) return { error: 'Missing required field: startDate' }

    const startTime = firstEventDate?.startTime ?? toNullableString(r.start_time)
    if (!startTime) return { error: 'Missing required field: startTime' }

    const endDate = firstEventDate?.endDate ?? toNullableString(r.end_date)
    const endTime = firstEventDate?.endTime ?? toNullableString(r.end_time)

    const venueId = toNumberOrNull(r.venue_id)
    const venueName = toNullableString(r.venue_name)
    const venueLon = toNumberOrNull(r.venue_lon)
    const venueLat = toNumberOrNull(r.venue_lat)

    const spaceId = toNumberOrNull(r.space_id)
    const spaceName = toNullableString(r.space_name)
    const spaceBuildingLevel = toNumberOrNull(r.space_building_level)
    const spaceSeatingCapacity = toNumberOrNull(r.space_seating_capacity)
    const spaceTotalCapacity = toNumberOrNull(r.space_total_capacity)

    // --- Images mapping ---
    const rawImages = r.images as Record<string, unknown> | undefined
    const images: Record<string, PlutoImageMeta> = {}

    if (rawImages) {
        for (const [key, val] of Object.entries(rawImages)) {
            if (val && typeof val === 'object') {
                const v = val as Record<string, unknown>
                images[key] = new PlutoImageMeta(
                    toNumberOrNull(v.id),
                    null, // url can be generated later from ID
                    toNullableString(v.alt),
                    toNullableString(v.description),
                    toNullableString(v.copyright),
                    toNullableString(v.creator),
                    toNumberOrNull(v.license),
                    v.focus_x != null ? Number(v.focus_x) : null,
                    v.focus_y != null ? Number(v.focus_y) : null
                )
            }
        }
    }

    const data = new UranusEvent(
        eventId,                          // eventId
        toNullableString(r.release_status), // releaseStatus
        toNullableString(r.lang),           // lang

        organizationId,                   // organizationId
        organizationName,                 // organizationName
        toNullableString(r.organization_url), // organizationUrl

        title,                             // title
        subtitle,                          // subtitle
        toNullableString(r.description),   // description
        toNullableString(r.summary),       // summary
        eventTypes,                        // types
        Array.isArray(r.tags) ? r.tags.map(String) : [], // tags

        toNumberOrNull(r.min_age),         // minAge
        toNumberOrNull(r.max_age),         // maxAge
        Array.isArray(r.languages) ? r.languages.map(String) : [], // languages

        toNullableString(r.meeting_point), // meetingPoint
        toNullableString(r.participation_info), // participationInfo
        toNullableString(r.online_url),    // onlineUrl

        toNumberOrNull(r.max_attendees),   // maxAttendees
        toNumberOrNull(r.price_type),      // priceType
        toNumberOrNull(r.ticket_advance),  // ticketAdvance
        toBooleanOrNull(r.ticket_required), // ticketRequired
        toBooleanOrNull(r.registration_required), // registrationRequired
        toNullableString(r.currency),      // currency
        toNumberOrNull(r.min_price),       // minPrice
        toNumberOrNull(r.max_price),       // maxPrice

        images['main'] ?? null,            // image (example: pick a key from images)
        Array.isArray(r.event_links)
            ? (r.event_links as any[]).map(mapEventUrl).filter((u): u is UranusEventLink => u !== null)
            : [],                            // eventUrls

        firstEventDate ?? new UranusEventDate(), // date
        eventDates.filter(d => d !== firstEventDate) // furtherDates
    )
    return { data }

}

// --- Helper functions ---
const mapEventType = (raw: unknown): UranusEventTypePair | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    const typeId = toNumberOrNull(r.type_id)
    if (typeId === null) return null
    return { // TODO: !!!
        typeId,
        genreId: toNumberOrNull(r.genre_id),
    }
}

export const mapEventDate = (raw: unknown): UranusEventDate | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>

    // Build location object
    const location = new UranusEventLocation({
        id: null,
        name: toNullableString(r.location),
        street: toNullableString(r.street),
        houseNumber: toNullableString(r.house_number),
        postalCode: toNullableString(r.postal_code),
        city: toNullableString(r.city),
        country: toNullableString(r.country),
        state: toNullableString(r.state),
        lon: toNumberOrNull(r.lon),
        lat: toNumberOrNull(r.lat),
        description: undefined, // optional, if raw has a description field, map it here
    })

    return new UranusEventDate(
        toNumberOrNull(r.id),
        toNumberOrNull(r.event_id),
        toNullableString(r.release_status),
        toNullableString(r.start_date),
        toNullableString(r.start_time),
        toNullableString(r.end_date),
        toNullableString(r.end_time),
        toNullableString(r.entry_time),
        toNumberOrNull(r.duration),
        Boolean(r.all_day),
        toNullableString(r.accessibility_flags),
        toNullableString(r.accessibility_summary),
        toNullableString(r.accessibility_info),
        toNullableString(r.visitor_flags),
        location, // <--- pass the location object here
        toNumberOrNull(r.total_capacity),
        toNumberOrNull(r.seating_capacity),
        toNumberOrNull(r.building_level),
        toNumberOrNull(r.venue_id),
        toNullableString(r.venue_name),
        toNullableString(r.venue_website),
        toNumberOrNull(r.venue_logo_id),
        toNullableString(r.venue_logo_url),
        toNumberOrNull(r.space_id),
        toNullableString(r.space_name),
        toNullableString(r.space_website)
    )
}

const mapEventUrl = (raw: unknown): UranusEventLink | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    return new UranusEventLink(
        toNullableString(r.label),
        toNullableString(r.url_type), // TODO: !!!
        toNullableString(r.url)
    )
}

export const mapEventLocation = (raw: Record<string, unknown> | null | undefined): UranusEventLocation | null => {
    if (!raw) return null
    return new UranusEventLocation({
        id: null,
        name: toNullableString(raw.name),
        street: toNullableString(raw.street),
        houseNumber: toNullableString(raw.house_number),
        postalCode: toNullableString(raw.postal_code),
        city: toNullableString(raw.city),
        country: toNullableString(raw.country),
        state: toNullableString(raw.state),
        lon: raw.venue_lat != null ? Number(raw.lon) : null,
        lat: raw.venue_lon != null ? Number(raw.lat) : null,
        description: toNullableString(raw.location_description),
    })
}
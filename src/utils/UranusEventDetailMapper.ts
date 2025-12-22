import {
    UranusEventDetail,
    UranusEventType,
    UranusEventDate,
    UranusEventUrl,
    UranusEventLocation,
} from '@/models/UranusEventModel.ts'
import { toNumberOrNull, toString, toNullableString } from './UranusUtils.ts'

export const mapEventDetailData = (raw: unknown): UranusEventDetail | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>

    // Event ID
    const eventId = toNumberOrNull(r.event_id)
    if (eventId === null) return null

    // First event date ID (if multiple dates exist)
    const firstEventDate = Array.isArray(r.event_dates) && r.event_dates[0] ? r.event_dates[0] : null
    const eventDateId = firstEventDate ? toNumberOrNull(firstEventDate.event_date_id) : null

    // Event types
    const eventTypes: UranusEventType[] | null = Array.isArray(r.event_types)
        ? r.event_types.map(mapEventType).filter((et): et is UranusEventType => et !== null)
        : []

    // Image IDs (always 8 slots)
    const imageIds: (number | null)[] = [
        r.image1_id, r.image2_id, r.image3_id, r.image4_id,
        r.image_some_16_9_id, r.image_some_1_1_id,
        r.image_some_4_5_id, r.image_some_9_16_id,
    ].map(toNumberOrNull)

    const toBooleanOrNull = (v: unknown): boolean | null => v != null ? Boolean(v) : null

    // Title / subtitle
    const title = toString(r.title)
    const subtitle = toNullableString(r.subtitle)

    // Organization
    const organizationId = toNumberOrNull(r.organization_id) ?? 0
    const organizationName = toString(r.organization_name)

    // Dates / times
    const startDate = firstEventDate ? toString(firstEventDate.start_date) : toString(r.start_date)
    const startTime = firstEventDate ? toString(firstEventDate.start_time) : toString(r.start_time)
    const endDate = firstEventDate ? toNullableString(firstEventDate.end_date) : toNullableString(r.end_date)
    const endTime = firstEventDate ? toNullableString(firstEventDate.end_time) : toNullableString(r.end_time)

    // Venue & space (fall back to firstEventDate)
    /*
    const venueId = toNumberOrNull(r.venue_id ?? firstEventDate?.venue_id)
    const venueName = toNullableString(r.venue_name ?? firstEventDate?.venue_name)
    const venueLon = toNumberOrNull(r.venue_lon ?? firstEventDate?.venue_lon)
    const venueLat = toNumberOrNull(r.venue_lat ?? firstEventDate?.venue_lat)
    const spaceId = toNumberOrNull(r.space_id ?? firstEventDate?.space_id)
    const spaceName = toNullableString(r.space_name ?? firstEventDate?.space_name)
    const spaceBuildingLevel = toNumberOrNull(r.space_building_level ?? firstEventDate?.space_building_level)
    const spaceSeatingCapacity = toNumberOrNull(r.space_seating_capacity ?? firstEventDate?.space_seating_capacity)
    const spaceTotalCapacity = toNumberOrNull(r.space_total_capacity ?? firstEventDate?.space_total_capacity)
     */

    const venueId = toNumberOrNull(r.venue_id)
    const venueName = toNullableString(r.venue_name)
    const venueLon = toNumberOrNull(r.venue_lon)
    const venueLat = toNumberOrNull(r.venue_lat)
    const spaceId = toNumberOrNull(r.space_id)
    const spaceName = toNullableString(r.space_name)
    const spaceBuildingLevel = toNumberOrNull(r.space_building_level)
    const spaceSeatingCapacity = toNumberOrNull(r.space_seating_capacity)
    const spaceTotalCapacity = toNumberOrNull(r.space_total_capacity)

    // Construct UranusEventDetail
    return new UranusEventDetail({
        eventId,
        eventDateId,
        title,
        subtitle,
        organizationId,
        organizationName,
        startDate,
        startTime,
        endDate,
        endTime,
        venueId,
        venueName,
        venueLon,
        venueLat,
        spaceId,
        spaceName,
        spaceBuildingLevel,
        spaceSeatingCapacity,
        spaceTotalCapacity,
        eventTypes,
        imageIds,
        releaseStatusId: toNumberOrNull(r.release_status_id),
        releaseStatusName: toNullableString(r.release_status_name),
        releaseDate: toNullableString(r.release_date),
        canEditEvent: Boolean(r.can_edit_event),
        canDeleteEvent: Boolean(r.can_delete_event),
        canReleaseEvent: Boolean(r.can_release_event),
        timeSeriesIndex: toNumberOrNull(r.time_series_index) ?? 0,
        timeSeries: toNumberOrNull(r.time_series) ?? 0,
        description: toNullableString(r.description),
        teaserText: toNullableString(r.teaser_text),
        participationInfo: toNullableString(r.participation_info),
        meetingPoint: toNullableString(r.meeting_point),
        minAge: toNumberOrNull(r.min_age),
        maxAge: toNumberOrNull(r.max_age),
        maxAttendees: toNumberOrNull(r.max_attendees),
        priceTypeId: toNumberOrNull(r.price_type_id),
        minPrice: toNumberOrNull(r.min_price),
        maxPrice: toNumberOrNull(r.max_price),
        ticketAdvance: toBooleanOrNull(r.ticket_advance),
        ticketRequired: toBooleanOrNull(r.ticket_required),
        registrationRequired: toBooleanOrNull(r.registration_required),
        currencyCode: toNullableString(r.currency_code),
        currencyName: toNullableString(r.currency_name),
        occasionTypeId: toNumberOrNull(r.occasion_type_id),
        onlineEventUrl: toNullableString(r.online_event_url),
        sourceUrl: toNullableString(r.source_url),
        custom: toNullableString(r.custom),
        style: toNullableString(r.style),
        languages: Array.isArray(r.languages) ? r.languages.map(String) : [],
        eventDates: Array.isArray(r.event_dates)
            ? r.event_dates.map(mapEventDate).filter((d): d is UranusEventDate => d !== null)
            : [],
        eventUrls: Array.isArray(r.event_urls)
            ? r.event_urls.map(mapEventUrl).filter((u): u is UranusEventUrl => u !== null)
            : [],
        venueStreet: toNullableString(r.venue_street),
        venueHouseNumber: toNullableString(r.venue_house_number),
        venuePostalCode: toNullableString(r.venue_postal_code),
        venueCity: toNullableString(r.venue_city),
        releaseStatusOverrideId: toNumberOrNull(r.release_status_override_id),
        releaseDateOverride: toNullableString(r.release_date_override),
        location: mapEventLocation(r),
        entryTime: toNullableString(r.entry_time),
        tags: Array.isArray(r.tags) ? r.tags.map(String) : [],
    })
}

/** Helper functions */
const mapEventType = (raw: unknown): UranusEventType | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    const typeId = toNumberOrNull(r.type_id)
    if (typeId === null) return null
    return {
        typeId,
        typeName: toString(r.type_name),
        genreId: toNumberOrNull(r.genre_id),
        genreName: toNullableString(r.genre_name),
    }
}

const mapEventDate = (raw: unknown): UranusEventDate | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    return new UranusEventDate(
        toNumberOrNull(r.event_id),
        toNumberOrNull(r.event_date_id),
        toNumberOrNull(r.date_venue_id),
        toNumberOrNull(r.venue_id),
        toNullableString(r.venue_name),
        toNumberOrNull(r.space_id),
        toNullableString(r.space_name),
        toNumberOrNull(r.location_id),
        toNullableString(r.start_date),
        toNullableString(r.start_time),
        toNullableString(r.end_date),
        toNullableString(r.end_time),
        toNullableString(r.entry_time),
        Boolean(r.all_day),
        toNumberOrNull(r.duration),
        toNumberOrNull(r.visitor_info_flags),
    )
}

const mapEventUrl = (raw: unknown): UranusEventUrl | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>
    return new UranusEventUrl(
        toNumberOrNull(r.id),
        toNullableString(r.title),
        toNullableString(r.url),
        toNumberOrNull(r.url_type),
    )
}

export const mapEventLocation = (raw: Record<string, unknown> | null | undefined): UranusEventLocation | null => {
    if (!raw) return null

    return new UranusEventLocation({
        id: null,
        name: toNullableString(raw.location_name),
        street: toNullableString(raw.location_street),
        houseNumber: toNullableString(raw.location_house_number),
        postalCode: toNullableString(raw.location_postal_code),
        city: toNullableString(raw.location_city),
        countryCode: toNullableString(raw.location_country_code),
        stateCode: toNullableString(raw.location_state_code),
        latitude: raw.venue_lat != null ? Number(raw.venue_lat) : null,
        longitude: raw.venue_lon != null ? Number(raw.venue_lon) : null,
        description: toNullableString(raw.location_description),
    })
}
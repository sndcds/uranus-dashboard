import { UranusEventBase, UranusEventType } from '@/models/UranusEventModel.ts'
import { toNumberOrNull, toString, toNullableString } from './UranusUtils.ts'

export const mapDashboardEventData = (raw: unknown): UranusEventBase | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>

    const eventId = toNumberOrNull(r.event_id)
    if (eventId === null) return null

    const eventDateId = toNumberOrNull(r.event_date_id)

    // Map event types strictly
    const eventTypes: UranusEventType[] | null = Array.isArray(r.event_types)
        ? (r.event_types as unknown[])
            .map(mapEventType)
            .filter((et): et is UranusEventType => et !== null)
        : null

    // Normalize image IDs (always 8 slots)
    const imageIds: (number | null)[] = Array.isArray(r.image_ids)
        ? (r.image_ids as unknown[])
            .map(toNumberOrNull)
            .concat(Array(8).fill(null))
            .slice(0, 8)
        : [toNumberOrNull(r.image_id)]
            .concat(Array(8).fill(null))
            .slice(0, 8)

    // Required fields get defaults
    const title = toString(r.event_title)
    const organizationId = toNumberOrNull(r.event_organization_id) ?? 0
    const organizationName = toString(r.event_organization_name)
    const startDate = toString(r.start_date)
    const startTime = toString(r.start_time)

    // Optional / nullable fields
    const subtitle = toNullableString(r.event_subtitle)
    const endDate = toNullableString(r.end_date)
    const endTime = toNullableString(r.end_time)
    const venueId = toNumberOrNull(r.venue_id)
    const venueName = toNullableString(r.venue_name)
    const spaceId = toNumberOrNull(r.space_id)
    const spaceName = toNullableString(r.space_name)
    const locationId = toNumberOrNull(r.location_id)
    const locationName = toNullableString(r.location_name)
    // const venueLon = toNumberOrNull(r.venue_lon)
    // const venueLat = toNumberOrNull(r.venue_lat)
    const releaseStatusId = toNumberOrNull(r.release_status_id)
    const releaseStatusName = toNullableString(r.release_status_name)
    const releaseDate = toNullableString(r.release_date)

    return new UranusEventBase({
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
        spaceId,
        spaceName,
        locationId,
        locationName,
        eventTypes,
        imageIds,
        releaseStatusId,
        releaseStatusName,
        releaseDate,
        canEditEvent: Boolean(r.can_edit_event),
        canDeleteEvent: Boolean(r.can_delete_event),
        canReleaseEvent: Boolean(r.can_release_event),
        timeSeriesIndex: toNumberOrNull(r.time_series_index) ?? 0,
        timeSeries: toNumberOrNull(r.time_series) ?? 0,
    })
}

/**
 * Maps raw event type object to UranusEventType
 */
const mapEventType = (raw: unknown): UranusEventType | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>

    const typeId = toNumberOrNull(r.type_id)
    if (typeId === null) return null

    return new UranusEventType(
        typeId,
        toNumberOrNull(r.genre_id),
    )
}
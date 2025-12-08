import { toNumberOrNull, toNullableString, toString } from "@/utils/UranusUtils.ts";
import type { UranusEventBase, UranusEventType } from "@/models/UranusEventModel.ts";

export const mapDashboardEventData = (raw: unknown): UranusEventBase | null => {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;

    const eventId = toNumberOrNull(r.event_id);
    if (eventId === null) return null;

    const eventDateId = toNumberOrNull(r.event_date_id);
    const eventTypes = Array.isArray(r.event_types)
        ? (r.event_types as unknown[]).map(mapEventType).filter(Boolean) as UranusEventType[]
        : null;

    return {
        eventId,
        eventDateId,
        eventTitle: toString(r.event_title),
        eventSubtitle: toNullableString(r.event_subtitle),
        eventOrganizerId: toNumberOrNull(r.event_organizer_id) ?? 0,
        eventOrganizerName: toString(r.event_organizer_name),
        startDate: toString(r.start_date),
        startTime: toString(r.start_time),
        endDate: toNullableString(r.end_date),
        endTime: toNullableString(r.end_time),
        venueId: toNumberOrNull(r.venue_id),
        venueName: toNullableString(r.venue_name),
        venueLon: toNumberOrNull(r.venue_lon),
        venueLat: toNumberOrNull(r.venue_lat),
        spaceName: toNullableString(r.space_name),
        eventTypes,
        imageId: toNumberOrNull(r.image_id),
        focusX: toNumberOrNull(r.focus_x),
        focusY: toNumberOrNull(r.focus_y),
        releaseStatusId: toNumberOrNull(r.release_status_id),
        releaseStatusName: toNullableString(r.release_status_name),
        releaseDate: toNullableString(r.release_dates),
        canEditEvent: Boolean(r.can_edit_event),
        canDeleteEvent: Boolean(r.can_delete_event),
        canReleaseEvent: Boolean(r.can_release_event),
        timeSeriesIndex: toNumberOrNull(r.time_series_index) ?? 0,
        timeSeries: toNumberOrNull(r.time_series) ?? 0,
    };
};

/**
 * Maps raw event type object to UranusEventType
 */
const mapEventType = (raw: unknown): UranusEventType | null => {
    if (!raw || typeof raw !== 'object') return null;
    const r = raw as Record<string, unknown>;

    const typeId = toNumberOrNull(r.type_id);
    if (typeId === null) return null;

    return {
        typeId,
        typeName: toString(r.type_name),
        genreId: toNumberOrNull(r.genre_id),
        genreName: toNullableString(r.genre_name),
    };
};
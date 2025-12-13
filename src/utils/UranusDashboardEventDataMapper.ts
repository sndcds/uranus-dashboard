import { UranusEventBase, UranusEventType } from '@/models/UranusEventModel.ts'
import { toNumberOrNull, toString, toNullableString } from './UranusUtils.ts'

export const mapDashboardEventData = (raw: unknown): UranusEventBase | null => {
    if (!raw || typeof raw !== 'object') return null
    const r = raw as Record<string, unknown>

    const eventId = toNumberOrNull(r.event_id)
    if (eventId === null) return null

    const eventDateId = toNumberOrNull(r.event_date_id)
    const eventTypes: UranusEventType[] | null = Array.isArray(r.event_types)
        ? (r.event_types as unknown[])
            .map(mapEventType)
            .filter((et): et is UranusEventType => et !== null)
        : null

    const imageIds: (number | null)[] = Array.isArray(r.image_ids)
        ? (r.image_ids as unknown[])
            .map(toNumberOrNull)
            .slice(0, 8)
            .concat(Array(8).fill(null))
            .slice(0, 8)
        : [toNumberOrNull(r.image_id)]
            .concat(Array(8).fill(null))
            .slice(0, 8)

    return new UranusEventBase(
        eventId,
        eventDateId,
        toString(r.event_title),
        toNullableString(r.event_subtitle),
        toNumberOrNull(r.event_organizer_id) ?? 0,
        toString(r.event_organizer_name),
        toString(r.start_date),
        toString(r.start_time),
        toNullableString(r.end_date),
        toNullableString(r.end_time),
        toNumberOrNull(r.venue_id),
        toNullableString(r.venue_name),
        toNumberOrNull(r.venue_lon),
        toNumberOrNull(r.venue_lat),
        toNullableString(r.space_name),
        eventTypes,
        imageIds,
        toNumberOrNull(r.release_status_id),
        toNullableString(r.release_status_name),
        toNullableString(r.release_dates),
        Boolean(r.can_edit_event),
        Boolean(r.can_delete_event),
        Boolean(r.can_release_event),
        toNumberOrNull(r.time_series_index) ?? 0,
        toNumberOrNull(r.time_series) ?? 0
    )
}

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
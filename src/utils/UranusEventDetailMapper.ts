import {
    toNumberOrNull,
    toNullableString,
    toBoolean
} from "@/utils/UranusUtils.ts";
import {
    UranusEventDetail,
    UranusEventType,
    UranusEventDate,
    UranusEventUrl,
    UranusEventLocation
} from "@/models/UranusEventModel.ts";

/** Map a single raw event type */
function mapEventType(raw: unknown): UranusEventType | null {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    return new UranusEventType(
        toNumberOrNull(r.type_id),
        toNullableString(r.type_name),
        toNumberOrNull(r.genre_id),
        toNullableString(r.genre_name)
    );
}

/** Map a single raw event date */
function mapEventDate(raw: unknown): UranusEventDate | null {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    return new UranusEventDate(
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
        toBoolean(r.all_day),
        toNumberOrNull(r.duration),
        toNumberOrNull(r.visitor_info_flags)
    );
}

/** Map a single raw event URL */
function mapEventUrl(raw: unknown): UranusEventUrl | null {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    const url = toNullableString(r.url);
    if (!url) return null;
    return new UranusEventUrl(
        toNumberOrNull(r.id),
        toNullableString(r.title),
        url,
        toNullableString(r.url_type)
    );
}

/** Map language codes to string array */
function mapLanguageCodes(raw: unknown): string[] {
    if (!raw) return [];
    const source = Array.isArray(raw) ? raw : [];
    return source
        .map((item) => {
            if (typeof item === "string") return item.trim() || null;
            if (item && typeof item === "object") {
                const r = item as Record<string, unknown>;
                const candidate =
                    r.code ?? r.id ?? r.language_code ?? r.language ?? null;
                return typeof candidate === "string" ? candidate.trim() : null;
            }
            return null;
        })
        .filter((v): v is string => v !== null);
}

/** Map raw API data to UranusEventDetail */
export function mapEventData(raw: unknown): UranusEventDetail | null {
    if (!raw || typeof raw !== "object") return null;
    const record = raw as Record<string, unknown>;

    const eventId = toNumberOrNull(record.event_id);
    if (eventId === null) return null;

    // Map arrays
    const eventTypes: UranusEventType[] = Array.isArray(record.event_types)
        ? (record.event_types as unknown[])
            .map(mapEventType)
            .filter((v): v is UranusEventType => v !== null)
        : [];

    const eventDates: UranusEventDate[] = Array.isArray(record.event_dates)
        ? (record.event_dates as unknown[])
            .map(mapEventDate)
            .filter((v): v is UranusEventDate => v !== null)
        : [];

    const eventUrls: UranusEventUrl[] = Array.isArray(record.event_urls)
        ? (record.event_urls as unknown[])
            .map(mapEventUrl)
            .filter((v): v is UranusEventUrl => v !== null)
        : [];

    const languageCodes: string[] = mapLanguageCodes(
        record.languages ?? record.language_codes ?? record.event_languages
    );

    // Location
    const location = new UranusEventLocation(
        toNumberOrNull(record.location_id),
        toNullableString(record.location_name),
        toNullableString(record.location_street),
        toNullableString(record.location_house_number),
        toNullableString(record.location_postal_code),
        toNullableString(record.location_city),
        toNullableString(record.location_country_code),
        toNullableString(record.location_state_code),
        toNumberOrNull(record.location_latitude),
        toNumberOrNull(record.location_longitude)
    );

    // Build 8 image IDs array
    const imageIds: (number | null)[] = Array.from({ length: 8 }, (_, i) =>
        toNumberOrNull(record[`image${i + 1}_id`])
    );

    // Corrected constructor argument order (matches UranusEventBase)
    return new UranusEventDetail(
        eventId,
        toNumberOrNull(record.organizer_id) ?? 0,
        toNullableString(record.organizer_name) ?? '',
        toNumberOrNull(record.event_date_id) ?? 0,
        toNullableString(record.title) ?? '',
        toNullableString(record.subtitle),
        toNullableString(record.start_date) ?? "",
        toNullableString(record.start_time) ?? "",
        toNullableString(record.end_date),
        toNullableString(record.end_time),
        toNumberOrNull(record.venue_id),
        toNullableString(record.venue_name),
        toNumberOrNull(record.venue_lon),
        toNumberOrNull(record.venue_lat),
        toNullableString(record.space_name),
        eventTypes,
        imageIds,
        toNumberOrNull(record.release_status_id),
        toNullableString(record.release_status_name),
        toNullableString(record.release_date),
        toBoolean(record.can_edit_event),
        toBoolean(record.can_delete_event),
        toBoolean(record.can_release_event),
        toNumberOrNull(record.time_series_index) ?? 0,
        toNumberOrNull(record.time_series) ?? 0,
        // Extra UranusEventDetail fields
        toNullableString(record.description),
        toNullableString(record.teaser_text),
        toNullableString(record.participation_info),
        toNullableString(record.meeting_point),
        toNumberOrNull(record.min_age),
        toNumberOrNull(record.max_age),
        toNumberOrNull(record.max_attendees),
        toNumberOrNull(record.price_type_id),
        toNumberOrNull(record.min_price),
        toNumberOrNull(record.max_price),
        toBoolean(record.ticket_advance),
        toBoolean(record.ticket_required),
        toBoolean(record.registration_required),
        toNullableString(record.currency_code),
        toNullableString(record.currency_name),
        toNumberOrNull(record.occasion_type_id),
        toNullableString(record.online_event_url),
        toNullableString(record.source_url),
        toNullableString(record.custom),
        toNullableString(record.style),
        languageCodes,
        eventDates,
        eventUrls,
        toNullableString(record.venue_street),
        toNullableString(record.venue_house_number),
        toNullableString(record.venue_postal_code),
        toNullableString(record.venue_city),
        toNumberOrNull(record.space_building_level),
        toNumberOrNull(record.space_seating_capacity),
        toNumberOrNull(record.space_total_capacity),
        location,
        toNullableString(record.entry_time),
        Array.isArray(record.tags) ? (record.tags as string[]) : [],
        toNumberOrNull(record.release_status_override_id),
        toNullableString(record.release_date_override)
    );
}
import {
    UranusEventDetail,
    UranusAdminEventDate
} from '@/model/uranusAdminEventModel.ts'


export function mapAdminEventDetail(raw: any): UranusEventDetail | null {
    if (!raw || typeof raw !== 'object') return null

    return new UranusEventDetail({
        id: raw.id,
        release_status: raw.release_status ?? null,
        release_date: raw.release_date ?? null,
        external_id: raw.external_id ?? null,
        source_url: raw.source_url ?? null,
        custom: raw.custom ?? null,
        style: raw.style ?? null,
        content_language: raw.content_language ?? null,

        title: raw.title ?? '',
        subtitle: raw.subtitle ?? null,
        description: raw.description ?? null,
        summary: raw.summary ?? null,
        event_links: Array.isArray(raw.event_links) ? raw.event_links : [],

        organization_id: raw.organization_id ?? 0,

        venue_id: raw.venue_id ?? null,
        space_id: raw.space_id ?? null,
        meeting_point: raw.meeting_point ?? null,
        online_link: raw.online_link ?? null,

        participation_info: raw.participation_info ?? null,
        languages: Array.isArray(raw.languages) ? raw.languages : [],
        min_age: raw.min_age ?? null,
        max_age: raw.max_age ?? null,
        max_attendees: raw.max_attendees ?? null,

        price_type: raw.price_type ?? null,
        currency: raw.currency ?? null,
        min_price: raw.min_price ?? null,
        max_price: raw.max_price ?? null,
        ticket_flags: raw.ticket_flags ?? null,

        occasion_type_id: raw.occasion_type_id ?? null,
        event_types: Array.isArray(raw.event_types) ? raw.event_types : null,
        tags: raw.tags ?? null,

        // Dates
        event_dates: Array.isArray(raw.dates)
            ? raw.dates.map((d: any) => new UranusAdminEventDate(
                d.id ?? null,
                d.event_id ?? null,
                d.venue_id ?? null,
                d.space_id ?? null,
                d.start_date ?? null,
                d.start_time ?? null,
                d.end_date ?? null,
                d.end_time ?? null,
                d.entry_time ?? null,
                !!d.all_day,
                d.duration ?? null
            ))
            : []
    })
}
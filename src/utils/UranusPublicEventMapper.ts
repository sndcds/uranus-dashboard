import {
    UranusPublicEventDetail,
    UranusPublicEventDate
} from '@/models/UranusPublicEventModel.ts'

export const mapPublicEvent = (raw: any): UranusPublicEventDetail | null => {
    if (!raw || typeof raw !== 'object') return null

    const mainDate = raw.date
    if (!mainDate) return null

    const furtherDates: UranusPublicEventDate[] = Array.isArray(raw.further_dates)
        ? raw.further_dates.map((fd: any) => new UranusPublicEventDate(
            fd.event_id ?? null,
            fd.event_date_id ?? null,
            fd.start_date ?? null,
            fd.start_time ?? null,
            fd.end_date ?? null,
            fd.end_time ?? null,
            fd.entry_time ?? null,
            fd.venue_id ?? null,
            fd.venue_name ?? null,
            fd.venue_street ?? null,
            fd.venue_house_number ?? null,
            fd.venue_postal_code ?? null,
            fd.venue_city ?? null,
            fd.venue_country_code ?? null,
            fd.venue_state_code ?? null,
            fd.venue_lat ?? null,
            fd.venue_lon ?? null,
            fd.venue_url ?? null,
            fd.space_id ?? null,
            fd.space_name ?? null,
            fd.location_id ?? null,
            fd.location_name ?? null,
            fd.location_street ?? null,
            fd.location_house_number ?? null,
            fd.location_postal_code ?? null,
            fd.location_city ?? null,
            fd.location_country_code ?? null,
            fd.location_state_code ?? null,
            fd.location_lat ?? null,
            fd.location_lon ?? null,
        )) : []

    const eventTypes = Array.isArray(raw.event_types)
        ? raw.event_types.map((et: any) => ({
            typeId: et.type_id,
            typeName: et.type_name,
            genreId: et.genre_id,
            genreName: et.genre_name ?? null
        }))
        : []

    const eventUrls = Array.isArray(raw.event_urls)
        ? raw.event_urls.map((url: any) => ({
            id: url.id,
            title: url.title ?? null,
            url: url.url,
            urlType: url.url_type ?? null
        }))
        : []

    return new UranusPublicEventDetail(
        raw.event_id ?? null,
        raw.title ?? null,
        raw.subtitle ?? null,
        raw.description ?? null,
        raw.image_path ?? null,
        raw.image_alt_text ?? null,
        raw.image_creator_name ?? null,
        raw.image_copyright ?? null,
        raw.image_license_id ?? null,
        mainDate.start_date ?? null,
        mainDate.start_time ?? null,
        mainDate.end_date ?? null,
        mainDate.end_time ?? null,
        mainDate.venue_id ?? null,
        mainDate.venue_name ?? null,
        mainDate.venue_street ?? null,
        mainDate.venue_house_number ?? null,
        mainDate.venue_postal_code ?? null,
        mainDate.venue_city ?? null,
        mainDate.venue_country_code ?? null,
        mainDate.venue_state_code ?? null,
        mainDate.venue_lat ?? null,
        mainDate.venue_lon ?? null,
        mainDate.venue_url ?? null,
        mainDate.space_id ?? null,
        mainDate.space_name ?? null,
        mainDate.space_total_capacity ?? null,
        mainDate.space_seating_capacity ?? null,
        mainDate.space_building_level ?? null,
        mainDate.space_url ?? null,
        raw.location_id ?? null,
        raw.location_name ?? null,
        raw.location_street ?? null,
        raw.location_house_number ?? null,
        raw.location_postal_code ?? null,
        raw.location_city ?? null,
        raw.location_country_code ?? null,
        raw.location_state_code ?? null,
        raw.location_lat ?? null,
        raw.location_lon ?? null,
        raw.organization_id ?? null,
        raw.organization_name ?? null,
        raw.organization_url ?? null,
        raw.meeting_point ?? null,
        Array.isArray(raw.languages) ? raw.languages.map(String) : [],
        Array.isArray(raw.tags) ? raw.tags.map(String) : [],
        eventTypes,
        furtherDates,
        eventUrls
    )
}
// src/domain/event/UranusEvent.ts
import { UranusEventDate } from './UranusEventDate.ts'
import { UranusEventType } from './UranusEventType.ts'
import { UranusEventLink } from './UranusEventLink.ts'
import { UranusImage } from '../image/UranusImage.ts'


export class UranusEvent {
    constructor(
        public eventId: number | null = null,
        public releaseStatus: string | null = null,
        public lang: string | null = null,

        public organizationId: number | null = null,
        public organizationName: string | null = null,
        public organizationUrl: string | null = null,

        public title: string | null = null,
        public subtitle: string | null = null,
        public description: string | null = null,
        public summary: string | null = null,
        public types: UranusEventType[] = [],
        public tags: string[] = [],

        public minAge: number | null = null,
        public maxAge: number | null = null,
        public participationInfos: string | null = null,
        public languages: string[] = [],

        public meetingPoint: string | null = null,
        public onlineUrl: string | null = null,

        public maxAttendees: number | null = null,
        public priceType: number | null = null,
        public ticketAdvance: number | null = null,
        public ticketRequired: boolean | null = null,
        public registrationRequired: boolean | null = null,
        public currency: string | null = null,
        public minPrice: number | null = null,
        public maxPrice: number | null = null,

        public image: UranusImage | null = null,

        public eventUrls: UranusEventLink[] = [],

        public date: UranusEventDate = new UranusEventDate(),
        public furtherDates: UranusEventDate[] = []
    ) {}

    /** Static mapper from API JSON → domain object */
    static fromApi(raw: any, dateId?: number): UranusEvent | null {
        if (!raw || typeof raw !== 'object') return null

        // Map a raw date object to UranusEventDate
        const mapDate = (d: any): UranusEventDate =>
            new UranusEventDate(
                d.date_id ?? null,
                d.event_id ?? null,
                d.release_status ?? null,
                d.start_date ?? null,
                d.start_time ?? null,
                d.end_date ?? null,
                d.end_time ?? null,
                d.entry_time ?? null,
                d.duration ?? null,
                d.all_day ?? false,
                d.accessibility_flags ?? null,
                d.accessibility_summary ?? null,
                d.accessibility_info ?? null,
                d.visitor_flags ?? null,
                d.location ?? null,
                d.street ?? null,
                d.house_number ?? null,
                d.postal_code ?? null,
                d.city ?? null,
                d.country ?? null,
                d.state ?? null,
                d.lon ?? null,
                d.lat ?? null,
                d.total_capacity ?? null,
                d.seating_capacity ?? null,
                d.building_level ?? null,
                d.venue_id ?? null,
                d.venue_name ?? null,
                d.venue_web_url ?? null,
                d.venue_logo_id ?? null,
                d.venue_logo_url ?? null,
                d.space_id ?? null,
                d.space_name ?? null,
                d.space_web_url ?? null
            )

        // Map image if present
        const image: UranusImage | null = raw.image
            ? new UranusImage(
                raw.image.id ?? null,
                raw.image.url ?? null,
                raw.image.alt ?? null,
                raw.image.creator ?? null,
                raw.image.copyright ?? null,
                raw.image.description ?? null,
                raw.image.license ?? null
            )
            : null

        // Map further dates
        const furtherDates: UranusEventDate[] = Array.isArray(raw.further_dates)
            ? raw.further_dates.map(mapDate)
            : []

        // Determine selected date
        const date: UranusEventDate = dateId
            ? furtherDates.find(fd => fd.id === dateId) ?? mapDate(raw.date)
            : mapDate(raw.date)

        // Map event types
        const types: UranusEventType[] = Array.isArray(raw.types)
            ? raw.types.map((et: any) => ({
                typeId: et.type_id ?? null,
                typeName: et.type_name ?? '',
                genreId: et.genre_id ?? null,
                genreName: et.genre_name ?? null,
            }))
            : []

        // Map event URLs
        const urls: UranusEventLink[] = Array.isArray(raw.event_links)
            ? raw.event_links.map((u: any) => ({
                label: u.label ?? null,
                url: u.url ?? null,
                urlType: u.url_type ?? null,
            }))
            : []

        return new UranusEvent(
            raw.event_id ?? null,
            raw.release_status ?? null,
            raw.lang ?? null,

            raw.org_id ?? null,
            raw.org_name ?? null,
            raw.org_web_url ?? null,

            raw.title ?? null,
            raw.subtitle ?? null,
            raw.description ?? null,
            raw.summary ?? null,
            types,
            Array.isArray(raw.tags) ? raw.tags.map(String) : [],

            raw.min_age ?? null,
            raw.max_age ?? null,
            raw.participation_infos ?? null,
            Array.isArray(raw.languages) ? raw.languages.map(String) : [],

            raw.meeting_point ?? null,
            raw.online_url ?? null,

            raw.max_attendees ?? null,
            raw.price_type ?? null,
            raw.ticket_advance ?? null,
            raw.ticket_required ?? null,
            raw.registration_required ?? null,
            raw.currency ?? null,
            raw.min_price ?? null,
            raw.max_price ?? null,

            image,
            urls,
            date,
            furtherDates
        )
    }
}
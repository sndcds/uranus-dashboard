// src/domain/event/UranusEvent.ts
import { UranusEventDate } from './UranusEventDate.ts'
import { UranusEventType } from './UranusEventType.ts'
import { UranusEventLink } from './UranusEventLink.ts'
import { UranusImage } from '../image/UranusImage.ts'
import { mapEventTypeFromDTO, type UranusEventTypeDTO } from '@/api/dto/UranusEventTypeDTO.ts'

export class UranusEvent {
    public eventId: number | null = null
    public releaseStatus: string | null = null
    public lang: string | null = null

    public organizationId: number | null = null
    public organizationName: string | null = null
    public organizationUrl: string | null = null

    public title: string | null = null
    public subtitle: string | null = null
    public description: string | null = null
    public summary: string | null = null
    public types: UranusEventType[] = []
    public tags: string[] = []

    public minAge: number | null = null
    public maxAge: number | null = null
    public languages: string[] = []

    public meetingPoint: string | null = null
    public participationInfo: string | null = null
    public onlineUrl: string | null = null

    public maxAttendees: number | null = null
    public priceType: number | null = null
    public ticketAdvance: number | null = null
    public ticketRequired: boolean | null = null
    public registrationRequired: boolean | null = null
    public currency: string | null = null
    public minPrice: number | null = null
    public maxPrice: number | null = null

    public image: UranusImage | null = null
    public eventUrls: UranusEventLink[] = []

    public date: UranusEventDate = new UranusEventDate()
    public furtherDates: UranusEventDate[] = []

    /** Static mapper from API JSON → domain object */
    static fromApi(raw: any, dateId?: number): UranusEvent | null {
        if (!raw || typeof raw !== 'object') return null

        const mapDate = (d: any): UranusEventDate =>
            new UranusEventDate(
                d.id ?? null,
                d.event_id ?? null,
                d.release_status ?? null,
                d.start_date ?? null,
                d.start_time ?? null,
                d.end_date ?? null,
                d.end_time ?? null,
                d.entry_time ?? null,
                d.duration ?? null,
                Boolean(d.all_day),
                d.accessibility_flags ?? null,
                d.accessibility_summary ?? null,
                d.accessibility_info ?? null,
                d.visitor_flags ?? null,
                d.total_capacity ?? null,
                d.seating_capacity ?? null,
                d.building_level ?? null,
                d.venue_id ?? null,
                d.venue_name ?? null,
                d.venue_street ?? null,
                d.venue_house_number ?? null,
                d.venue_postal_code ?? null,
                d.venue_city ?? null,
                d.venue_state ?? null,
                d.venue_country ?? null,
                d.venue_lon ?? null,
                d.venue_lat ?? null,
                d.venue_website ?? null,
                d.venue_logo_id ?? null,
                d.venue_light_theme_logo_id ?? null,
                d.venue_dark_theme_logo_id ?? null,
                d.venue_logo_url ?? null,
                d.venue_light_theme_logo_url ?? null,
                d.venue_dark_theme_logo_url ?? null,

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
        const types: UranusEventType[] = Array.isArray(raw.event_types)
            ? (raw.event_types as UranusEventTypeDTO[]).map(mapEventTypeFromDTO)
            : []

        // Map event URLs
        const urls: UranusEventLink[] = Array.isArray(raw.event_links)
            ? raw.event_links.map((u: any) => ({
                label: u.label ?? null,
                url: u.url ?? null,
                urlType: u.url_type ?? null,
            }))
            : []

        const e = new UranusEvent()
        e.eventId = raw.event_id ?? null
        e.releaseStatus = raw.release_status ?? null
        e.lang = raw.lang ?? null

        e.organizationId = raw.organization_id ?? null
        e.organizationName = raw.organization_name ?? null
        e.organizationUrl = raw.organization_website ?? null

        e.title = raw.title ?? null
        e.subtitle = raw.subtitle ?? null
        e.description = raw.description ?? null
        e.summary = raw.summary ?? null
        e.types = types
        e.tags = Array.isArray(raw.tags) ? raw.tags.map(String) : []

        e.minAge = raw.min_age ?? null
        e.maxAge = raw.max_age ?? null
        e.participationInfo = raw.participation_info ?? null
        e.languages = Array.isArray(raw.languages) ? raw.languages.map(String) : []

        e.meetingPoint = raw.meeting_point ?? null
        e.onlineUrl = raw.online_url ?? null

        e.maxAttendees = raw.max_attendees ?? null
        e.priceType = raw.price_type ?? null
        e.ticketAdvance = raw.ticket_advance ?? null
        e.ticketRequired = raw.ticket_required ?? null
        e.registrationRequired = raw.registration_required ?? null
        e.currency = raw.currency ?? null
        e.minPrice = raw.min_price ?? null
        e.maxPrice = raw.max_price ?? null

        e.image = image
        e.eventUrls = urls
        e.date = date
        e.furtherDates = furtherDates

        return e
    }

    static showReleaseStatusChip(releaseStatus: string): boolean {
        switch (releaseStatus) {
            case 'draft':
            case 'review':
            case 'released':
                return false
        }
        return true
    }
}
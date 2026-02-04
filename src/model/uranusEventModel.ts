/*
    src/model/uranusEventModel.ts

    UranusEvent and its helper classes describes an event for the public API.
    The admin API uses classes which name starts with UranusAdminEvent.
*/

export class UranusEventTypePair {
    constructor(
        public typeId: number | null = null,
        public genreId: number | null = null
    ) {}
}

export interface UranusEventType {
    typeId: number | null
    typeName: string
    genreId?: number | null
    genreName?: string | null
}

export class UranusEventLink {
    constructor(
        public label: string | null = null,
        public type: number | null = null,
        public url: string | null = null,
    ) {}
}

export class UranusEventLocation {
    id: number | null
    name: string | null
    street: string | null
    houseNumber: string | null
    postalCode: string | null
    city: string | null
    country: string | null
    state: string | null
    lon: number | null
    lat: number | null
    description: string | null

    constructor(props: Partial<UranusEventLocation> = {}) {
        this.id = props.id ?? null
        this.name = props.name ?? null
        this.street = props.street ?? null
        this.houseNumber = props.houseNumber ?? null
        this.postalCode = props.postalCode ?? null
        this.city = props.city ?? null
        this.country = props.country ?? null
        this.state = props.state ?? null
        this.lon = props.lon ?? null
        this.lat = props.lat ?? null
        this.description = props.description ?? null
    }
}

export class UranusImage {
    constructor(
        public id: number | null = null,
        public url: string | null = null,
        public alt: string | null = null,
        public creator: string | null = null,
        public copyright: string | null = null,
        public description: string | null = null,
        public license: number | null = null,
    ) {}
}


export type UranusImageMap = Record<string, UranusImage>

export class UranusEventDate {
    constructor(
        public id: number | null = null,
        public eventId: number | null = null,
        public releaseStatus: number | null = null,
        public startDate: string | null = null,
        public startTime: string | null = null,
        public endDate: string | null = null,
        public endTime: string | null = null,
        public entryTime: string | null = null,
        public duration: number | null = null,
        public allDay: boolean = false,
        public accessibilityFlags: string | null = null,
        public accessibilitySummary: string | null = null,
        public accessibilityInfo: string | null = null,
        public visitorFlags: string | null = null,
        public location: string | null = null,
        public street: string | null = null,
        public houseNumber: string | null = null,
        public postalCode: string | null = null,
        public city: string | null = null,
        public country: string | null = null,
        public state: string | null = null,
        public lon: number | null = null,
        public lat: number | null = null,
        public totalCapacity: number | null = null,
        public seatingCapacity: number | null = null,
        public buildingLevel: number | null = null,
        public venueId: number | null = null,
        public venueName: string | null = null,
        public venueWebsite: string | null = null,
        public venueLogoId: number | null = null,
        public venueLogoUrl: string | null = null,
        public spaceId: number | null = null,
        public spaceName: string | null = null,
        public spaceWebsite: string | null = null,
    ) {}
}

export class UranusEvent {
    constructor(
        public eventId: number | null = null,
        public releaseStatus: number | null = null,
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

        public image?: UranusImage | null,

        public eventUrls: UranusEventLink[] = [],

        public date: UranusEventDate = new UranusEventDate(),
        public furtherDates: UranusEventDate[] = []
    ) {}

    // Static mapper
    static fromApi(raw: any, dateId?: number): UranusEvent | null {
        if (!raw || typeof raw !== "object") return null;

        // Helper to map a raw date object to UranusPublicEventDate
        const mapDate = (d: any): UranusEventDate =>
            new UranusEventDate(
                d.date_id ?? null,
                d.event_id ?? null,
                d.start_date ?? null,
                d.start_time ?? null,
                d.end_date ?? null,
                d.end_time ?? null,
                d.entry_time ?? null,
                d.venue_id ?? null,
                d.venue_name ?? null,
                d.venue_web_url ?? null,
                d.venue_logo_url ?? null,
                d.street ?? null,
                d.house_number ?? null,
                d.postal_code ?? null,
                d.city ?? null,
                d.country ?? null,
                d.state ?? null,
                d.lon ?? null,
                d.lat ?? null,
                d.space_id ?? null,
                d.space_name ?? null,
                d.space_total_capacity ?? null,
                d.space_seating_capacity ?? null,
                d.space_building_level ?? null,
                d.space_web_url ?? null,
                d.space_acc_flags ?? null,
                d.space_acc_summary ?? null
            );

        const image: UranusImage | null = mapEventImage(raw.image)

        // Map further dates
        const furtherDates: UranusEventDate[] = Array.isArray(raw.further_dates)
            ? raw.further_dates.map(mapDate)
            : [];

        // Determine selected date
        const date: UranusEventDate = dateId
            ? furtherDates.find((fd) => fd.id === dateId) ?? mapDate(raw.date)
            : mapDate(raw.date);

        // Map event type
        const types: UranusEventType[] = Array.isArray(raw.types)
            ? raw.types.map((et: any) => ({
                typeId: et.type_id,
                typeName: et.type_name,
                genreId: et.genre_id ?? null,
                genreName: et.genre_name ?? null,
            }))
            : [];

        // Map event URLs
        const urls: UranusEventLink[] = Array.isArray(raw.event_links)
            ? raw.event_links.map((u: any) => ({
                label: u.label ?? null,
                url: u.url,
                urlType: u.url_type ?? null,
            }))
            : [];

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
        );
    }
}

function mapEventImage(raw: any): UranusImage | null {
    if (!raw || typeof raw !== 'object') return null

    return {
        id: Number(raw.id),
        url: raw.url ?? null,
        alt: raw.alt ?? null,
        description: raw.description ?? null, // ← add this line
        creator: raw.creator ?? null,
        copyright: raw.copyright ?? null,
        license: Number(raw.licence),
    }
}

export function uranusSortEventTypes(types: UranusEventTypePair[]): UranusEventTypePair[] {
    return [...types].sort((a, b) => {
        const ta = a.typeId ?? -1
        const tb = b.typeId ?? -1
        const ga = a.genreId ?? -1
        const gb = b.genreId ?? -1

        // Combine comparisons using subtraction
        return (ta - tb) || (ga - gb)
    })
}
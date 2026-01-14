// src/types/UranusEventModel.ts

export class UranusImageMeta {
    constructor(
        public id: number | null = null,
        public url: string | null = null,
        public altText: string | null = null,
        public description: string | null = null,
        public copyright: string | null = null,
        public creatorName: string | null = null,
        public licenseId: number | null = null,
        public focusX: number | null = null,
        public focusY: number | null = null,
    ) {}
}

/**
 * Represents a Event Type used in an Event.
 */
export class UranusEventType {
    constructor(
        public typeId: number | null = null,
        public genreId: number | null = null,
    ) {}
}

/**
 * Represents a Venue/Space combination used in an Event or an Event Date.
 */
export class UranusVenueSpaceSelection {
    constructor(
        public dateVenueId: number | null = null,
        public venueId: number | null = null,
        public spaceId: number | null = null,
        public venueName: string | null = null,
        public spaceName: string | null = null,
    ) {}
}

/**
 * Represents a single Event Date used in an Event.
 */
export class UranusEventDate {
    constructor(
        public eventId: number | null = null,
        public eventDateId: number | null = null,
        public dateVenueId: number | null = null,
        public venueId: number | null = null,
        public venueName: string | null = null,
        public spaceId: number | null = null,
        public spaceName: string | null = null,
        public locationId: number | null = null,
        public startDate: string | null = null,
        public startTime: string | null = null,
        public endDate: string | null = null,
        public endTime: string | null = null,
        public entryTime: string | null = null,
        public allDay: boolean = false,
        public duration: number | null = null,
        public visitorInfoFlags: number | null = null,
    ) {}
}

/**
 * Represents a single URL used in an Event.
 */
export class UranusEventUrl {
    constructor(
        public id: number | null = null,
        public title: string | null = null,
        public url: string | null = null,
        public urlType: number | null = null,
    ) {}
}

/**
 * Represents a single Location used in an Event.
 */
export class UranusEventLocation {
    id: number | null
    name: string | null
    street: string | null
    houseNumber: string | null
    postalCode: string | null
    city: string | null
    countryCode: string | null
    stateCode: string | null
    latitude: number | null
    longitude: number | null
    description: string | null

    constructor(props: Partial<UranusEventLocation> = {}) {
        this.id = props.id ?? null
        this.name = props.name ?? null
        this.street = props.street ?? null
        this.houseNumber = props.houseNumber ?? null
        this.postalCode = props.postalCode ?? null
        this.city = props.city ?? null
        this.countryCode = props.countryCode ?? null
        this.stateCode = props.stateCode ?? null
        this.latitude = props.latitude ?? null
        this.longitude = props.longitude ?? null
        this.description = props.description ?? null
    }
}

export interface UranusEventBaseProps {
    eventId: number
    eventDateId?: number | null

    title: string
    subtitle?: string | null

    organizationId: number
    organizationName: string

    startDate: string
    startTime: string
    endDate?: string | null
    endTime?: string | null

    venueId?: number | null
    venueName?: string | null
    spaceId?: number | null
    spaceName?: string | null
    locationId?: number | null
    locationName?: string | null

    venueLon?: number | null
    venueLat?: number | null

    eventTypes?: UranusEventType[] | null
    imageIds?: (number | null)[]

    releaseStatusId?: number | null
    releaseStatusName?: string | null
    releaseDate?: string | null

    canEditEvent?: boolean
    canDeleteEvent?: boolean
    canReleaseEvent?: boolean

    timeSeriesIndex?: number
    timeSeries?: number
}

/**
 * Represents the details of an Event in the Uranus Dashboard.
 */
export class UranusEventBase {
    eventId: number
    eventDateId: number | null

    title: string
    subtitle: string | null

    organizationId: number
    organizationName: string

    startDate: string
    startTime: string
    endDate: string | null
    endTime: string | null

    venueId: number | null
    venueName: string | null
    spaceId: number | null
    spaceName: string | null
    locationId: number | null
    locationName: string | null

    venueLon: number | null
    venueLat: number | null

    eventTypes: UranusEventType[] | null
    imageIds: (number | null)[]

    releaseStatusId: number | null
    releaseStatusName: string | null
    releaseDate: string | null

    canEditEvent: boolean
    canDeleteEvent: boolean
    canReleaseEvent: boolean

    timeSeriesIndex: number
    timeSeries: number

    constructor(props: UranusEventBaseProps) {
        this.eventId = props.eventId
        this.eventDateId = props.eventDateId ?? null

        this.title = props.title
        this.subtitle = props.subtitle ?? null

        this.organizationId = props.organizationId
        this.organizationName = props.organizationName

        this.startDate = props.startDate
        this.startTime = props.startTime
        this.endDate = props.endDate ?? null
        this.endTime = props.endTime ?? null

        this.venueId = props.venueId ?? null
        this.venueName = props.venueName ?? null
        this.spaceId = props.spaceId ?? null
        this.spaceName = props.spaceName ?? null
        this.locationId = props.locationId ?? null
        this.locationName = props.locationName ?? null

        this.venueLon = props.venueLon ?? null
        this.venueLat = props.venueLat ?? null

        this.eventTypes = props.eventTypes ?? null
        this.imageIds = props.imageIds ?? Array(8).fill(null)

        this.releaseStatusId = props.releaseStatusId ?? null
        this.releaseStatusName = props.releaseStatusName ?? null
        this.releaseDate = props.releaseDate ?? null

        this.canEditEvent = props.canEditEvent ?? false
        this.canDeleteEvent = props.canDeleteEvent ?? false
        this.canReleaseEvent = props.canReleaseEvent ?? false

        this.timeSeriesIndex = props.timeSeriesIndex ?? 0
        this.timeSeries = props.timeSeries ?? 0
    }
}

export interface UranusEventDetailProps extends UranusEventBaseProps {
    description?: string | null
    summary?: string | null
    participationInfo?: string | null
    meetingPoint?: string | null

    minAge?: number | null
    maxAge?: number | null
    maxAttendees?: number | null

    priceTypeId?: number | null
    minPrice?: number | null
    maxPrice?: number | null

    ticketAdvance?: boolean | null
    ticketRequired?: boolean | null
    registrationRequired?: boolean | null

    currencyCode?: string | null
    currencyName?: string | null
    occasionTypeId?: number | null

    onlineEventUrl?: string | null
    sourceUrl?: string | null

    custom?: string | null
    style?: string | null

    languages?: string[]
    eventDates?: UranusEventDate[]
    eventUrls?: UranusEventUrl[]

    venueStreet?: string | null
    venueHouseNumber?: string | null
    venuePostalCode?: string | null
    venueCity?: string | null

    spaceBuildingLevel?: number | null
    spaceSeatingCapacity?: number | null
    spaceTotalCapacity?: number | null

    location?: UranusEventLocation | null
    entryTime?: string | null

    tags?: string[] | null
    releaseStatusOverrideId?: number | null
    releaseDateOverride?: string | null
}



export class UranusEventDetail extends UranusEventBase {
    description: string | null
    summary: string | null
    participationInfo: string | null
    meetingPoint: string | null

    minAge: number | null
    maxAge: number | null
    maxAttendees: number | null

    priceTypeId: number | null
    minPrice: number | null
    maxPrice: number | null

    ticketAdvance: boolean | null
    ticketRequired: boolean | null
    registrationRequired: boolean | null

    currencyCode: string | null
    currencyName: string | null
    occasionTypeId: number | null

    onlineEventUrl: string | null
    sourceUrl: string | null

    custom: string | null
    style: string | null

    languages: string[]
    eventDates: UranusEventDate[]
    eventUrls: UranusEventUrl[]

    venueStreet: string | null
    venueHouseNumber: string | null
    venuePostalCode: string | null
    venueCity: string | null

    spaceBuildingLevel: number | null
    spaceSeatingCapacity: number | null
    spaceTotalCapacity: number | null

    location: UranusEventLocation | null
    entryTime: string | null

    tags: string[] | null
    releaseStatusOverrideId: number | null
    releaseDateOverride: string | null

    constructor(props: UranusEventDetailProps) {
        super(props)

        this.description = props.description ?? null
        this.summary = props.summary ?? null
        this.participationInfo = props.participationInfo ?? null
        this.meetingPoint = props.meetingPoint ?? null

        this.minAge = props.minAge ?? null
        this.maxAge = props.maxAge ?? null
        this.maxAttendees = props.maxAttendees ?? null

        this.priceTypeId = props.priceTypeId ?? null
        this.minPrice = props.minPrice ?? null
        this.maxPrice = props.maxPrice ?? null

        this.ticketAdvance = props.ticketAdvance ?? null
        this.ticketRequired = props.ticketRequired ?? null
        this.registrationRequired = props.registrationRequired ?? null

        this.currencyCode = props.currencyCode ?? null
        this.currencyName = props.currencyName ?? null
        this.occasionTypeId = props.occasionTypeId ?? null

        this.onlineEventUrl = props.onlineEventUrl ?? null
        this.sourceUrl = props.sourceUrl ?? null

        this.custom = props.custom ?? null
        this.style = props.style ?? null

        this.languages = props.languages ?? []
        this.eventDates = props.eventDates ?? []
        this.eventUrls = props.eventUrls ?? []

        this.venueStreet = props.venueStreet ?? null
        this.venueHouseNumber = props.venueHouseNumber ?? null
        this.venuePostalCode = props.venuePostalCode ?? null
        this.venueCity = props.venueCity ?? null

        this.spaceBuildingLevel = props.spaceBuildingLevel ?? null
        this.spaceSeatingCapacity = props.spaceSeatingCapacity ?? null
        this.spaceTotalCapacity = props.spaceTotalCapacity ?? null

        this.location = props.location ?? null
        this.entryTime = props.entryTime ?? null

        this.tags = props.tags ?? null
        this.releaseStatusOverrideId = props.releaseStatusOverrideId ?? null
        this.releaseDateOverride = props.releaseDateOverride ?? null
    }
}

// Sorting function
export function uranusSortEventTypes(types: UranusEventType[]): UranusEventType[] {
    return [...types].sort((a, b) => {
        const typeA = a.typeId ?? -1
        const typeB = b.typeId ?? -1
        const genreA = a.genreId ?? -1
        const genreB = b.genreId ?? -1

        // Combine comparisons using subtraction
        return (typeA - typeB) || (genreA - genreB)
    })
}

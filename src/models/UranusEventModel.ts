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
        public typeName: string | null = null,
        public genreId: number | null = null,
        public genreName: string | null = null,
    ) {}
}

/**
 * Represents a Venue/Space combination used in an Event or an Event Date.
 */
export class UranusVenueSpaceSelection {
    constructor(
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
        public eventDateId: number | null = null,
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
        public urlType: string | null = null,
    ) {}
}

/**
 * Represents a single URL used in an Event.
 */
export class UranusEventLocation {
    constructor(
        public id: number | null = null,
        public name: string | null = null,
        public street: string | null = null,
        public houseNumber: string | null = null,
        public postalCode: string | null = null,
        public city: string | null = null,
        public countryCode: string | null = null,
        public stateCode: string | null = null,
        public latitude: number | null = null,
        public longitude: number | null = null,
    ) {}
}

/**
 * Represents the details of an Event in the Uranus Dashboard.
 */
export class UranusEventBase {
    constructor(
        public eventId: number,
        public eventDateId: number | null = null,
        public title: string,
        public subtitle: string | null = null,
        public organizerId: number,
        public organizerName: string,
        public startDate: string,
        public startTime: string,
        public endDate: string | null = null,
        public endTime: string | null = null,
        public venueId: number | null = null,
        public venueName: string | null = null,
        public venueLon: number | null = null,
        public venueLat: number | null = null,
        public spaceName?: string | null,
        public eventTypes: UranusEventType[] | null = null,
        public imageIds: (number | null)[] = Array(8).fill(null),
        public releaseStatusId: number | null = null,
        public releaseStatusName: string | null = null,
        public releaseDate: string | null = null,
        public canEditEvent: boolean = false,
        public canDeleteEvent: boolean = false,
        public canReleaseEvent: boolean = false,
        public timeSeriesIndex: number = 0,
        public timeSeries: number = 0,
    ) {}
}

/**
 * Represents full details of an event for the Event Editor.
 */
export class UranusEventDetail extends UranusEventBase {
    constructor(
        // Base class properties
        eventId: number,
        organizerId: number,
        organizerName: string,
        eventDateId: number | null,
        title: string,
        subtitle: string | null,
        startDate: string,
        startTime: string,
        endDate: string | null,
        endTime: string | null,
        venueId: number | null,
        venueName: string | null,
        venueLon: number | null,
        venueLat: number | null,
        spaceName?: string | null,
        eventTypes: UranusEventType[] | null = null,
        imageIds: (number | null)[] = Array(8).fill(null),
        releaseStatusId: number | null = null,
        releaseStatusName: string | null = null,
        releaseDate: string | null = null,
        canEditEvent: boolean = false,
        canDeleteEvent: boolean = false,
        canReleaseEvent: boolean = false,
        timeSeriesIndex: number = 0,
        timeSeries: number = 0,

        // Extra properties for detail
        public description: string | null = null,
        public teaserText: string | null = null,
        public participationInfo: string | null = null,
        public meetingPoint: string | null = null,
        public minAge: number | null = null,
        public maxAge: number | null = null,
        public maxAttendees: number | null = null,
        public priceTypeId: number | null = null,
        public minPrice: number | null = null,
        public maxPrice: number | null = null,
        public ticketAdvance: boolean | null = null,
        public ticketRequired: boolean | null = null,
        public registrationRequired: boolean | null = null,
        public currencyCode: string | null = null,
        public currencyName: string | null = null,
        public occasionTypeId: number | null = null,
        public onlineEventUrl: string | null = null,
        public sourceUrl: string | null = null,
        public custom: string | null = null,
        public style: string | null = null,
        public languages: string[] = [],
        public eventDates: UranusEventDate[] = [],
        public eventUrls: UranusEventUrl[] = [],
        public venueStreet: string | null = null,
        public venueHouseNumber: string | null = null,
        public venuePostalCode: string | null = null,
        public venueCity: string | null = null,
        public spaceBuildingLevel: number | null = null,
        public spaceSeatingCapacity: number | null = null,
        public spaceTotalCapacity: number | null = null,
        public location: UranusEventLocation | null = null,
        public entryTime: string | null = null,
        public tags?: string[] | null,
        public releaseStatusOverrideId?: number | null,
        public releaseDateOverride?: string | null,
    ) {
        super(
            eventId,
            eventDateId,
            title,
            subtitle,
            organizerId,
            organizerName,
            startDate,
            startTime,
            endDate,
            endTime,
            venueId,
            venueName,
            venueLon,
            venueLat,
            spaceName,
            eventTypes,
            imageIds,
            releaseStatusId,
            releaseStatusName,
            releaseDate,
            canEditEvent,
            canDeleteEvent,
            canReleaseEvent,
            timeSeriesIndex,
            timeSeries
        )
    }
}

// Sorting function
export function uranusSortEventTypes(types: UranusEventType[]): UranusEventType[] {
    return [...types].sort((a, b) => {
        const typeA = a.typeName ?? ""
        const typeB = b.typeName ?? ""
        const genreA = a.genreName ?? ""
        const genreB = b.genreName ?? ""

        if (typeA < typeB) return -1
        if (typeA > typeB) return 1
        if (genreA < genreB) return -1
        if (genreA > genreB) return 1
        return 0
    })
}
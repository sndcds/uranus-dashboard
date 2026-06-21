// src/domain/event.ts

export interface EventListTypeSummary {
    typeId: number
    count: number
}

export interface EventListItemEventType {
    typeId: number
    genreId: number
}

export interface EventListItem {
    uuid: string
    dateUuid: string

    title: string
    subtitle: string | null

    startDate: string
    startTime: string | null
    endDate: string | null
    endTime: string | null
    entryTime: string | null

    space: {
        id: string
        name: string
    }

    venue: {
        uuid: string
        name: string
        city: string
        address: string
        lat: number | null
        lon: number | null
    }

    organization: {
        uuid: string
        name: string
    }

    imageUrl: string | null
    priceType?: string | null

    categories: number[]
    eventTypes: EventListItemEventType[]

    languages: string[]
    tags: string[]

    age: {
        min: number | null
        max: number | null
    }

    visitorInfoFlags: string | null
    releaseStatus: string
}

export interface EventCalendarDay {
    eventDay: string
    events: EventListItem[]
    moreCount: number
}
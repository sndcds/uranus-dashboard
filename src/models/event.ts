// src/models/event.ts

export interface EventTypeGenrePair {
    typeId: number | null
    genreId: number | null
}

export interface EventBasicInfoModel {
    title: string
    subtitle: string
    organizationId: number | null
    venueId: number | null
    spaceId: number | null
    typeGenrePairs: EventTypeGenrePair[]
}

export interface EventDateModel {
    startDate: string
    endDate: string | null
    startTime: string
    endTime: string | null
    entryTime: string | null
    spaceId: number | null
    allDayEvent: boolean
}

export interface EventDetailsModel {
    description: string
    summary: string
    languages: string[] | null
    minAge: number | null
    maxAge: number | null
    participationInfo: string
    presenter: string
}
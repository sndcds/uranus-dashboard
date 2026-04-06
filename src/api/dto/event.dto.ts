/*
    src/api/dto/event.dto.ts
 */

import { type EventTypeModel } from '@/domain/event/eventType.model.ts'

export interface EventListTypeSummaryDTO {
    type_id: number
    count: number
}

export interface EventTypeDTO {
    type_id: number
    type_name: string
    genre_id?: number | null
    genre_name?: string | null
}

export interface EventListItemDTO {
    uuid: string
    date_uuid: string
    title: string
    subtitle?: string
    start_date: string
    start_time: string
    entry_time?: string
    space_uuid: string
    space_name: string
    space_accessibility_flags?: string
    venue_uuid: string
    venue_name: string
    venue_city: string
    venue_street: string
    venue_house_number: string
    venue_postal_code: string
    venue_state: string
    venue_country: string
    venue_lat: number
    venue_lon: number
    image_uuid: string
    image_path: string
    org_uuid: string
    org_name: string
    categories: number[]
    event_types: EventTypeDTO[]
    languages: string[]
    tags: string[]
    min_age?: number
    max_age?: number
    visitor_info_flags?: string
    release_status: string
}

export interface EventListItemsApiData { // TODO: !!!!!
    events: EventListItemDTO[]
    last_event_start_at?: string
    last_event_date_uuid?: string
}

export function mapEventTypeFromDTO(dto: EventTypeDTO): EventTypeModel { // TODO: !!!!!
    return {
        typeId: dto.type_id,
        typeName: dto.type_name,
        genreId: dto.genre_id ?? null,
        genreName: dto.genre_name ?? null
    }
}
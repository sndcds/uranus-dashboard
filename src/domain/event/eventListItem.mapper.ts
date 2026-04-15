// src/domain/mappers/event.mapper.ts

import type { EventListItemDTO } from '@/api/dto/event.dto'
import type { EventListItem } from '@/domain/event/eventListItem.model.ts'

export function mapEventDTO(dto: EventListItemDTO): EventListItem {
    return {
        uuid: dto.uuid,
        dateUuid: dto.date_uuid,

        title: dto.title,
        subtitle: dto.subtitle ?? null,

        startDate: dto.start_date,
        startTime: dto.start_time ?? null,
        entryTime: dto.entry_time ?? null,

        space: {
            id: dto.space_uuid,
            name: dto.space_name
        },

        venue: {
            uuid: dto.venue_uuid,
            name: dto.venue_name,
            city: dto.venue_city,
            address: buildAddress(dto),
            lat: dto.venue_lat ?? null,
            lon: dto.venue_lon ?? null
        },

        organization: {
            uuid: dto.org_uuid,
            name: dto.org_name
        },

        imageUrl: dto.image_path ?? null,

        categories: dto.categories ?? [],

        eventTypes: dto.event_types?.map(et => ({
            typeId: et.type_id,
            genreId: et.genre_id ?? 0 // default to 0 if null/undefined
        })) ?? [],

        languages: dto.languages ?? [],
        tags: dto.tags ?? [],

        age: {
            min: dto.min_age ?? null,
            max: dto.max_age ?? null
        },

        visitorInfoFlags: dto.visitor_info_flags ?? null,
        releaseStatus: dto.release_status
    }
}

function buildAddress(dto: EventListItemDTO): string {
    const parts = [
        dto.venue_street,
        dto.venue_house_number,
        dto.venue_postal_code,
        dto.venue_city
    ].filter(Boolean)

    return parts.join(' ')
}
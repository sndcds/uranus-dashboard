// src/domain/event/UranusEventType.ts

export interface EventTypeModel {
    typeId: number
    typeName: string
    genreId?: number | null
    genreName?: string | null
}

/**
 * Map API DTO → frontend model
 */
export function mapEventTypeFromDTO(dto: any): EventTypeModel {
    return {
        typeId: dto.type_id,
        typeName: dto.type_name,
        genreId: dto.genre_id ?? null,
        genreName: dto.genre_name ?? null,
    }
}

/**
 * Helper to check if the type has a genre
 */
export function hasGenre(eventType: EventTypeModel): boolean {
    return eventType.genreId != null
}
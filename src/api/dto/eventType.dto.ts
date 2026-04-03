import { type EventTypeModel } from '@/domain/event/eventType.model.ts'

export interface EventTypeDTO {
    type_id: number
    type_name: string
    genre_id?: number | null
    genre_name?: string | null
}


export function mapEventTypeFromDTO(dto: EventTypeDTO): EventTypeModel {
    return {
        typeId: dto.type_id,
        typeName: dto.type_name,
        genreId: dto.genre_id ?? null,
        genreName: dto.genre_name ?? null
    }
}
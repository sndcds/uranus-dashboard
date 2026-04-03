import { createEventTypePair, type EventTypePairModel } from '@/domain/event/eventTypePair.model.ts'


export interface EventTypePairDTO {
    type_id: number | null
    genre_id: number | null
}


export function mapEventTypePairFromDTO(dto: EventTypePairDTO): EventTypePairModel {
    return createEventTypePair(dto.type_id, dto.genre_id)
}

export function mapEventTypePairToDTO(pair: EventTypePairModel): EventTypePairDTO {
    return {
        type_id: pair.typeId,
        genre_id: pair.genreId,
    }
}

export function mapEventTypePairsFromDTO(dtos: EventTypePairDTO[]): EventTypePairModel[] {
    return dtos.map(mapEventTypePairFromDTO)
}

export function mapEventTypePairsToDTO(pairs: EventTypePairModel[]): EventTypePairDTO[] {
    return pairs.map(mapEventTypePairToDTO)
}
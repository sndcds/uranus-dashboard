import { EventTypePairModel } from '@/domain/event/eventTypePair.model.ts'


export interface UranusEventTypePairDTO {
    type_id: number | null
    genre_id: number | null
}


export function mapEventTypePairFromDTO(dto: UranusEventTypePairDTO): EventTypePairModel {
    return new EventTypePairModel(dto.type_id, dto.genre_id)
}

export function mapEventTypePairToDTO(pair: EventTypePairModel): UranusEventTypePairDTO {
    return {
        type_id: pair.typeId,
        genre_id: pair.genreId,
    }
}

export function mapEventTypePairsFromDTO(dtos: UranusEventTypePairDTO[]): EventTypePairModel[] {
    return dtos.map(mapEventTypePairFromDTO)
}

export function mapEventTypePairsToDTO(pairs: EventTypePairModel[]): UranusEventTypePairDTO[] {
    return pairs.map(mapEventTypePairToDTO)
}
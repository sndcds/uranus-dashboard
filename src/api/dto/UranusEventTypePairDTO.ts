import { UranusEventTypePair } from '@/domain/event/UranusEventTypePair.ts'


export interface UranusEventTypePairDTO {
    type_id: number | null
    genre_id: number | null
}


export function mapEventTypePairFromDTO(dto: UranusEventTypePairDTO): UranusEventTypePair {
    return new UranusEventTypePair(dto.type_id, dto.genre_id)
}

export function mapEventTypePairToDTO(pair: UranusEventTypePair): UranusEventTypePairDTO {
    return {
        type_id: pair.typeId,
        genre_id: pair.genreId,
    }
}

export function mapEventTypePairsFromDTO(dtos: UranusEventTypePairDTO[]): UranusEventTypePair[] {
    return dtos.map(mapEventTypePairFromDTO)
}

export function mapEventTypePairsToDTO(pairs: UranusEventTypePair[]): UranusEventTypePairDTO[] {
    return pairs.map(mapEventTypePairToDTO)
}
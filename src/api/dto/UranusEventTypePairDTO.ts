import { UranusAdminEventTypePair } from '@/domain/event/UranusAdminEventTypePair.ts'


export interface UranusEventTypePairDTO {
    type_id: number | null
    genre_id: number | null
}


export function mapEventTypePairFromDTO(dto: UranusEventTypePairDTO): UranusAdminEventTypePair {
    return new UranusAdminEventTypePair(dto.type_id, dto.genre_id)
}

export function mapEventTypePairToDTO(pair: UranusAdminEventTypePair): UranusEventTypePairDTO {
    return {
        type_id: pair.typeId,
        genre_id: pair.genreId,
    }
}

export function mapEventTypePairsFromDTO(dtos: UranusEventTypePairDTO[]): UranusAdminEventTypePair[] {
    return dtos.map(mapEventTypePairFromDTO)
}

export function mapEventTypePairsToDTO(pairs: UranusAdminEventTypePair[]): UranusEventTypePairDTO[] {
    return pairs.map(mapEventTypePairToDTO)
}
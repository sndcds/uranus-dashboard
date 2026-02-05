import { UranusEventType } from '@/domain/event/UranusEventType.ts'

export interface UranusEventTypeDTO {
    type_id: number
    type_name: string
    genre_id?: number | null
    genre_name?: string | null
}


export function mapEventTypeFromDTO(dto: UranusEventTypeDTO): UranusEventType {
    return new UranusEventType(
        dto.type_id,
        dto.type_name,
        dto.genre_id ?? null,
        dto.genre_name ?? null
    )
}
import { UranusImage } from '@/domain/image/UranusImage.ts'

export interface UranusImageDTO {
    id?: number
    url?: string
    alt?: string
    creator?: string
    copyright?: string
    description?: string
    license?: number
}

export function mapUranusImageFromApi(dto: UranusImageDTO): UranusImage {
    return new UranusImage(
        dto.id ?? null,
        dto.url ?? null,
        dto.alt ?? null,
        dto.creator ?? null,
        dto.copyright ?? null,
        dto.description ?? null,
        dto.license ?? null
    )
}
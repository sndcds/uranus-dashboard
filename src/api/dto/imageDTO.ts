import { type ImageModel, mapImage } from '@/domain/image/image.model.ts'

export interface ImageDTO {
    id?: number
    url?: string
    alt?: string
    creator?: string
    copyright?: string
    description?: string
    license?: number
}

/**
 * Map API DTO → frontend model
 */
export function mapUranusImageFromApi(dto: ImageDTO): ImageModel {
    return mapImage({
        id: dto.id ?? null,
        url: dto.url ?? null,
        alt: dto.alt ?? null,
        creator: dto.creator ?? null,
        copyright: dto.copyright ?? null,
        description: dto.description ?? null,
        license: dto.license ?? null,
    })
}
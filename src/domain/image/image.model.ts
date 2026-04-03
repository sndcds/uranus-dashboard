/*
    src/domain/image/image.model.ts
    2026-04-02, refactored
*/

export enum ImageLicense {
    CC_BY = 1,
    CC_BY_SA,
    CC0,
    AllRightsReserved,
    // etc.
}

/**
 * Frontend-friendly image model
 * safe for reactive usage in Vue 3
 */
export interface ImageModel {
    id: number | null
    url: string | null
    alt: string | null
    creator: string | null
    copyright: string | null
    description: string | null
    license: ImageLicense | null
}

/**
 * Convert raw / DTO → frontend model
 */
export function mapImage(raw: Partial<ImageModel>): ImageModel {
    return {
        id: raw.id ?? null,
        url: raw.url ?? null,
        alt: raw.alt ?? null,
        creator: raw.creator ?? null,
        copyright: raw.copyright ?? null,
        description: raw.description ?? null,
        license: raw.license ?? null,
    }
}

/**
 * Convert frontend model → DTO / API-ready
 */
export function toImageDTO(model: ImageModel): Partial<ImageModel> {
    return { ...model }
}

/**
 * Factory for empty model
 */
export function createEmptyImage(): ImageModel {
    return {
        id: null,
        url: null,
        alt: null,
        creator: null,
        copyright: null,
        description: null,
        license: null,
    }
}

/**
 * Helper methods
 */
export function hasLicense(image: ImageModel): boolean {
    return image.license != null
}

export function displayName(image: ImageModel): string {
    return image.alt ?? 'Untitled image'
}
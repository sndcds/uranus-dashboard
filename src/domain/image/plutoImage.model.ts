/*
   src/domain/image/plutoImage.model.ts
*/

import type { PlutoImageDTO } from '@/api/dto/plutoImage.dto.ts'
import { apiFetch, ApiError } from '@/api.ts'

export interface PlutoLogoImageRef {
    uuid: string
    url: string
}

export type PlutoLogoImage = Record<string, PlutoLogoImageRef>

export interface PlutoImage {
    uuid: string | null
    url: string | null
    altText: string | null
    description: string | null
    copyright: string | null
    creator: string | null
    licenseType: string | null
    aiLabel: string | null
    focusX: number | null
    focusY: number | null
}

export function createPlutoImage(): PlutoImage {
    return {
        uuid: null,
        url: null,
        altText: null,
        description: null,
        copyright: null,
        creator: null,
        licenseType: null,
        aiLabel: null,
        focusX: null,
        focusY: null,
    }
}

export function mapPlutoImageFromDTO(dto: PlutoImageDTO): PlutoImage {
    return {
        uuid: dto.uuid ?? null,
        url: dto.url ?? null,
        altText: dto.alt_text ?? null,
        description: dto.description ?? null,
        copyright: dto.copyright ?? null,
        creator: dto.creator ?? null,
        licenseType: dto.license ?? null,
        aiLabel: dto.ai_label ?? null,
        focusX: dto.focus_x ?? null,
        focusY: dto.focus_y ?? null,
    }
}

export async function loadPlutoImage(
    apiPath: string
): Promise<PlutoImage | null> {
    try {
        const apiResponse = await apiFetch<PlutoImageDTO>(apiPath)
        const dto = apiResponse.data

        if (!dto) {
            return null
        }

        return mapPlutoImageFromDTO(dto)

    } catch (err) {
        // A missing image is an expected state for an empty image slot.
        if (err instanceof ApiError && err.status === 404) {
            return null
        }

        // Only unexpected errors should be logged.
        console.error('Failed to load pluto image:', err)
        return null
    }
}
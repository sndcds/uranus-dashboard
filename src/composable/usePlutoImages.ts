/*
    src/composable/usePlutoImages.ts
 */

import { PlutoImageMeta } from '@/model/plutoImageModel.ts'
import type { PlutoImageDTO } from '@/model/plutoImageModel.ts'
import {apiFetch} from '@/api.ts'

export async function plutoOnImageSave(
    meta: PlutoImageMeta,
    file: File | null,
    context: string,
    contextId: number,
    identifier: string
): Promise<PlutoImageDTO> { // <-- must return PlutoImageRaw
    const formData = new FormData()
    if (file) formData.append('image', file)
    if (meta.alt_text) formData.append('alt', meta.alt_text)
    if (meta.description) formData.append('description', meta.description)
    if (meta.copyright) formData.append('copyright', meta.copyright)
    if (meta.creator) formData.append('creator', meta.creator)
    if (meta.licenseType !== null) formData.append('license', String(meta.licenseType))
    if (meta.focusX !== null) formData.append('focus_x', String(meta.focusX))
    if (meta.focusY !== null) formData.append('focus_y', String(meta.focusY))

    const endpoint = `/api/admin/${context}/${contextId}/image/${identifier}`
    const { data } = await apiFetch<PlutoImageDTO>(endpoint, {
        method: 'POST',
        body: formData,
    })

    return data
}

/**
 * Convert raw API image object into PlutoImageMeta
 */
export function plutoNormalizeImage(raw?: PlutoImageDTO | null): PlutoImageMeta | null {
    if (!raw) return null

    return new PlutoImageMeta(
        raw.id ?? null,
        raw.url ?? (raw.id ? `/api/image/${raw.id}` : null),
        raw.alt ?? null,
        raw.description ?? null,
        raw.copyright ?? null,
        raw.creator ?? null,
        raw.license ?? null,
        raw.focus_x ?? null,
        raw.focus_y ?? null
    )
}
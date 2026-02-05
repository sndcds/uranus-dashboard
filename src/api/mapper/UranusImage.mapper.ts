// src/domain/event/mappers/eventMappers.ts
import { UranusImage } from '@/domain/image/UranusImage.ts'

export function mapEventImage(raw: any): UranusImage | null {
    if (!raw || typeof raw !== 'object') return null

    return new UranusImage(
        raw.id != null ? Number(raw.id) : null,
        raw.url ?? null,
        raw.alt ?? null,
        raw.creator ?? null,
        raw.copyright ?? null,
        raw.description ?? null,
        raw.license != null ? Number(raw.license) : null
    )
}
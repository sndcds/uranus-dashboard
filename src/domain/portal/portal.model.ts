export interface PortalDTO {
    uuid: string
    name: string
    description?: string | null
    org_uuid: string
    spatial_filter_mode?: string | null
    prefilter?: Record<string, unknown> | string | null
    filter?: Record<string, unknown> | string | null
    geometry?: Record<string, unknown> | null
    style?: Record<string, unknown> | string | null
}

export interface PortalModel {
    uuid: string | null
    orgUuid: string | null
    name: string
    description: string | null
    spatialFilterMode: string | null
    prefilter: Record<string, unknown> | null
    filter: Record<string, unknown> | null
    geometry: Record<string, unknown> | null
    style: Record<string, unknown> | null
}

function parseJsonObject(value: Record<string, unknown> | string | null | undefined): Record<string, unknown> | null {
    if (!value) return null
    if (typeof value === 'object') return value

    try {
        const parsed = JSON.parse(value)
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? parsed
            : null
    } catch {
        return null
    }
}

export function mapPortal(dto: PortalDTO): PortalModel {
    return {
        uuid: dto.uuid ?? null,
        orgUuid: dto.org_uuid ?? null,
        name: dto.name ?? '',
        description: dto.description ?? null,
        spatialFilterMode: dto.spatial_filter_mode ?? null,
        prefilter: parseJsonObject(dto.prefilter),
        filter: parseJsonObject(dto.filter),
        geometry: dto.geometry ?? null,
        style: parseJsonObject(dto.style),
    }
}

export function createEmptyPortal(): PortalModel {
    return {
        uuid: null,
        orgUuid: null,
        name: '',
        description: null,
        spatialFilterMode: null,
        prefilter: null,
        filter: null,
        geometry: null,
        style: null,
    }
}

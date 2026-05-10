export interface PortalDTO {
    uuid: string
    name: string
    description?: string | null
    org_uuid: string
    spatial_filter_mode?: string | null
    prefilter?: Record<string, unknown> | null
    style?: Record<string, unknown> | null
}

export interface PortalModel {
    uuid: string | null
    orgUuid: string | null
    name: string
    description: string | null
    spatialFilterMode: string | null
    prefilter: Record<string, unknown> | null
    style: Record<string, unknown> | null
}

export function mapPortal(dto: PortalDTO): PortalModel {
    return {
        uuid: dto.uuid ?? null,
        orgUuid: dto.org_uuid ?? null,
        name: dto.name ?? '',
        description: dto.description ?? null,
        spatialFilterMode: dto.spatial_filter_mode ?? null,
        prefilter: dto.prefilter ?? null,
        style: dto.style ?? null,
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
        style: null,
    }
}

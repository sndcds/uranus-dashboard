export interface PortalListItemDTO {
    uuid?: string
    portal_uuid?: string
    name?: string
    portal_name?: string
    description?: string | null
    can_edit_portal?: boolean
    can_delete_portal?: boolean
}

export interface PortalListDTO {
    org_uuid?: string
    org_name?: string
    portals?: PortalListItemDTO[]
    can_add_portal?: boolean
}

export interface PortalListItem {
    portalUuid: string
    portalName: string
    description: string | null
    canEditPortal: boolean
    canDeletePortal: boolean
}

export interface PortalListModel {
    orgUuid: string
    orgName: string
    canAddPortal: boolean
    portals: PortalListItem[]
}

export function mapPortalListItem(dto: PortalListItemDTO): PortalListItem {
    return {
        portalUuid: dto.portal_uuid ?? dto.uuid ?? '',
        portalName: dto.portal_name ?? dto.name ?? '',
        description: dto.description ?? null,
        canEditPortal: dto.can_edit_portal ?? true,
        canDeletePortal: dto.can_delete_portal ?? true,
    }
}

export function mapPortalList(data: PortalListDTO | PortalListItemDTO[] | null | undefined): PortalListModel {
    const dto = Array.isArray(data) ? { portals: data } : (data ?? {})

    return {
        orgUuid: dto.org_uuid ?? '',
        orgName: dto.org_name ?? '',
        canAddPortal: dto.can_add_portal ?? false,
        portals: (dto.portals ?? []).map(mapPortalListItem),
    }
}

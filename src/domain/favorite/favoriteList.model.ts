export interface FavoriteList {
    uuid: string
    orgUuid: string | null
    name: string
    description: string | null
    itemCount: number
    canEdit: boolean
    canDelete: boolean
}

export function mapFavoriteList(raw: any): FavoriteList | null {
    if (!raw || typeof raw !== 'object') return null

    const uuid = String(raw.uuid ?? raw.favorite_list_uuid ?? '')
    if (!uuid) return null

    return {
        uuid,
        orgUuid: normalizeString(raw.org_uuid ?? raw.orgUuid),
        name: String(raw.name ?? raw.title ?? ''),
        description: normalizeString(raw.description),
        itemCount: Number(raw.item_count ?? raw.itemCount ?? raw.entries_count ?? raw.event_count ?? 0),
        canEdit: raw.can_edit ?? raw.canEdit ?? true,
        canDelete: raw.can_delete ?? raw.canDelete ?? true,
    }
}

export function createEmptyFavoriteList(orgUuid: string | null = null): FavoriteList {
    return {
        uuid: '',
        orgUuid,
        name: '',
        description: null,
        itemCount: 0,
        canEdit: true,
        canDelete: true,
    }
}

function normalizeString(value: unknown) {
    if (value === null || value === undefined || value === '') return null
    return String(value)
}

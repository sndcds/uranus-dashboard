/*
    src/api/dto/organizationListItem.dto.ts
 */

export interface UranusOrganizationListItemDTO {
    uuid: string
    name: string
    city: string | null
    country_code: string | null
    total_upcoming_events: number
    venue_count: number
    space_count: number
    can_edit_org: boolean
    can_delete_org: boolean
    can_manage_team: boolean
    logo_url?: string | null
    light_theme_logo_url?: string | null
    dark_theme_logo_url?: string | null
}

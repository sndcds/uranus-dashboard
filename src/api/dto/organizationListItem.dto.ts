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
    main_logo_uuid?: string | null
    light_theme_logo_uuid?: string | null
    dark_theme_logo_uuid?: string | null
}

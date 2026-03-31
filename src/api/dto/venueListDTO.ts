/*
  src/api/dto/organizationVenueList.dto.ts
  2026-03-30, Roald
*/

export interface VenueListSpaceDTO {
    uuid: string
    name: string
    upcoming_event_count: number
}

export interface VenueListItemDTO {
    uuid: string
    name: string
    upcoming_event_count: number
    spaces?: VenueListSpaceDTO[]
    can_add_event: boolean
    can_add_space: boolean
    can_add_venue: boolean
    can_delete_event: boolean
    can_delete_space: boolean
    can_delete_venue: boolean
    can_edit_event: boolean
    can_edit_space: boolean
    can_edit_venue: boolean
    can_release_event: boolean
    main_logo_uuid?: string | null
    light_theme_logo_uuid?: string | null
    dark_theme_logo_uuid?: string | null
}

export interface VenueListDTO {
    org_uuid: string
    org_name: string
    total_upcoming_events: number
    can_add_event: boolean
    can_add_space: boolean
    can_add_venue: boolean
    can_delete_org: boolean
    can_edit_org: boolean
    venues?: VenueListItemDTO[]
}
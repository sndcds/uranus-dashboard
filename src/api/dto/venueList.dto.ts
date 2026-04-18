/*
  src/api/dto/venueList.dto.ts
*/

export interface VenueListSpaceDTO {
    space_uuid: string
    space_name: string
    event_count: number
    can_edit_space: boolean
    can_delete_space: boolean
}

export interface VenueListItemDTO {
    venue_uuid: string
    venue_name: string
    event_count: number
    spaces?: VenueListSpaceDTO[]
    can_add_event: boolean
    can_add_space: boolean
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

export interface VenueListDto {
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
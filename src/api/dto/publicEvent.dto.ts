/*
    src/api/dto/publicEvent.dto.ts
 */

import type { EventTypeDTO } from "@/api/dto/event.dto.ts";
import type { PlutoImageDTO } from '@/api/dto/plutoImage.dto.ts'

export interface EventLinkDTO {
    label?: string | null
    type?: string | null
    url: string | null
}

export interface PublicEventDateDTO {
    uuid: string
    event_uuid: string
    release_status: string
    start_date?: string
    start_time?: string
    end_date?: string
    end_time?: string
    entry_time?: string
    duration?: number
    all_day?: boolean

    venue_uuid?: string
    venue_name?: string
    venue_street?: string
    venue_house_number?: string
    venue_postal_code?: string
    venue_city?: string
    venue_country?: string
    venue_state?: string
    venue_lon?: number
    venue_lat?: number
    venue_web_link?: string
    venue_logo_url?: string
    venue_light_theme_logo_url?: string
    venue_dark_theme_logo_url?: string

    space_uuid?: string
    space_name?: string
    space_web_link?: string

    total_capacity?: number
    seating_capacity?: number
    building_level?: number

    accessibility_flags?: string
    accessibility_info?: string
    accessibility_summary?: string
}

export interface PublicEventDTO {
    uuid: string
    release_status: string

    content_language?: string
    title: string
    subtitle?: string
    description?: string
    summary?: string
    image: PlutoImageDTO | null

    event_types: EventTypeDTO[]
    languages: string[]
    tags: string[]
    event_links: EventLinkDTO[]
    online_link: string | null

    max_attendees?: number
    min_age?: number
    max_age?: number
    currency?: string
    price_type?: string
    min_price?: number
    max_price?: number

    org_uuid: string
    org_name?: string
    org_web_link?: string
    org_logos?: any

    visitor_info_flag: string
    participation_info?: string
    meeting_point?: string

    ticket_flags?: string[]
    ticket_link?: string

    date: PublicEventDateDTO
    further_dates: PublicEventDateDTO[]
}

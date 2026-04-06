/*
    src/api/dto/adminEvent.dto.ts
 */

import { type AdminEventDateDTO } from '@/api/dto/adminEventDate.dto.ts'

export interface AdminEventDTO {
    uuid: string
    release_status: string | null
    release_date: string | null
    external_id: string | null
    source_url?: string | null
    custom?: string | null
    style?: string | null

    content_language: string | null

    title: string
    subtitle: string | null

    org_uuid: string
    venue_uuid: string | null
    space_uuid: string | null

    categories?: number[] | null
    event_types: { type_id: number | null; genre_id: number | null }[] | null
    tags?: string[] | null

    description?: string | null
    summary?: string | null
    participation_info?: string | null
    meeting_point?: string | null

    min_age?: number | null
    max_age?: number | null
    max_attendees?: number | null
    visitor_info_flags?: string | null

    price_type?: string | null
    min_price?: number | null
    max_price?: number | null

    ticket_flags?: string[] | null

    currency?: string | null
    occasion_type_id?: number | null

    online_link?: string | null

    languages?: string[]
    event_dates?: AdminEventDateDTO[] | null
    event_links: { label: string | null; type: string | null; url: string | null }[] | null
}
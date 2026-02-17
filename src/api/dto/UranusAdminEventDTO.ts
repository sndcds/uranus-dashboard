/*
    src/api/dto/UranusAdminEventDTO.ts

    2026-02-05, Roald
 */

import { type UranusAdminEventDateDTO } from '@/api/dto/UranusAdminEventDateDTO.ts'
import { type UranusEventReleaseStatus } from '@/domain/event/UranusEventReleaseStatus.ts'


export interface UranusAdminEventDTO {
    id: number
    release_status: UranusEventReleaseStatus | null
    release_date: string | null
    external_id: string | null
    source_url?: string | null
    custom?: string | null
    style?: string | null

    content_language: string | null

    title: string
    subtitle: string | null

    organization_id: number
    venue_id: number | null
    space_id: number | null

    event_types: { type_id: number | null; genre_id: number | null }[] | null
    tags?: string[] | null

    description?: string | null
    summary?: string | null
    participation_info?: string | null
    meeting_point?: string | null

    min_age?: number | null
    max_age?: number | null
    max_attendees?: number | null

    price_type?: string | null
    min_price?: number | null
    max_price?: number | null

    ticket_flags?: string[] | null

    currency?: string | null
    occasion_type_id?: number | null

    online_link?: string | null

    languages?: string[]
    event_dates?: UranusAdminEventDateDTO[] | null
    event_links: { label: string | null; type: string | null; url: string | null }[] | null
}
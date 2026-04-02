/*
    src/api/dto/UranusVenueDTO.ts

    2026-02-10, Roald
*/

export interface VenueDto {
    uuid: string | null
    org_uuid: string | null
    name: string
    type: string | null

    street?: string | null
    house_number?: string | null
    postal_code?: string | null
    city?: string | null
    state?: string | null
    country?: string | null
    lat?: number | null
    lon?: number | null

    opened_at?: string | null
    closed_at?: string | null
    description?: string | null

    contact_email?: string | null
    contact_phone?: string | null
    web_link?: string | null

    created_at: string
    modified_at?: string | null
    created_by?: number | null
    modified_by?: number | null
}
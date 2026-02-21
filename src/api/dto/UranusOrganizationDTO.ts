export interface UranusOrganizationDTO {
    id: number | null
    name: string
    description?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    website_link?: string | null

    street?: string | null
    house_number?: string | null
    address_addition?: string | null
    postal_code?: string | null
    city?: string | null
    state?: string | null
    country?: string | null
    lat?: number | null
    lon?: number | null

    created_at: string
    modified_at?: string | null

    holding_organization_id?: number | null
    legal_form?: string | null
    nonprofit?: boolean | null

    created_by?: number | null
    modified_by?: number | null

    geo_pos?: string | null // or a geometry type depending on how you handle it in TS

    image_main_logo_id?: number | null
    image_light_mode_logo_id?: number | null
    image_dark_mode_logo_id?: number | null

    api_key?: string | null
}
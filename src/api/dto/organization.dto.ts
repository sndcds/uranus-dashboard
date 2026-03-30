export interface OrganizationDto {
    uuid: string | null
    name: string
    description?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    web_link?: string | null

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

    holding_org_uuid?: string | null
    legal_form?: string | null
    nonprofit?: boolean | null

    created_by?: number | null
    modified_by?: number | null

    geo_pos?: string | null

    main_logo_uuid?: string | null
    light_mode_logo_uuid?: string | null
    dark_mode_logo_uuid?: string | null

    api_key?: string | null
}


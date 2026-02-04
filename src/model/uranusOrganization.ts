// src/model/uranusOrganization.ts

export interface OrganizationResponse {
    organization_id?: number | null
    name?: string | null
    organization_name?: string | null
    address_addition?: string | null
    street?: string | null
    house_number?: string | null
    postal_code?: string | null
    city?: string | null
    state_code?: string | null
    country_code?: string | null
    description?: string | null
    holding_organization_id?: number | string | null
    legal_form_id?: number | string | null
    nonprofit?: boolean | null
    contact_email?: string | null
    website_url?: string | null
    contact_phone?: string | null
    latitude?: number | string | null
    longitude?: number | string | null
    lat?: number | string | null
    lon?: number | string | null
}
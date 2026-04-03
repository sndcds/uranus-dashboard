/*
    src/api/dto/country.dto.ts
 */

export interface CountryDTO {
    country_code: string
    country_name?: string | null
}

export interface CountryStateDTO {
    state_code: string
    state_name?: string | null
}
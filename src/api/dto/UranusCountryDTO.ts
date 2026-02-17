// src/api/dto/UranusCountryDTO.ts

export interface UranusCountryDTO {
    country_code: string
    country_name?: string | null
}

export interface UranusStateDTO {
    state_code: string
    state_name?: string | null
}
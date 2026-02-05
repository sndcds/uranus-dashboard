/*
    src/store/uranusEventTypeGenreLookup.ts
*/

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/api.ts'

/** Single Type object from API, including nested genres */
export interface TypeWithGenres {
    name: string
    genres?: Record<string, string>
}

/** Per-locale lookup: typeId -> TypeWithGenres */
export interface LanguageLookup {
    types: Record<string, TypeWithGenres>
}

/** API response wrapper */
export interface EventTypesGenresAPIResponse {
    data: Record<string, LanguageLookup> // locale -> LanguageLookup
}

export const useEventTypeLookupStore = defineStore('eventTypesLookup', () => {
    const data = ref<Record<string, LanguageLookup>>({})
    const loaded = ref(false)
    const locale = ref('en') // can be set dynamically

    /** Load types/genres from API */
    async function load(languages: string[] = ['de', 'da', 'en']) {
        if (loaded.value) return

        const params = new URLSearchParams()
        params.append('lang', languages.join(','))

        const endpoint = `/api/event/type-genre-lookup?${params.toString()}`
        const res = await apiFetch<EventTypesGenresAPIResponse>(endpoint)

        // JSON now matches the new nested structure: typeObj -> genres
        data.value = res.data?.data ?? {}
        loaded.value = true
    }

    /** Get type name by ID and locale */
    const getTypeName = (typeId: number | null, localeStr: string): string => {
        if (!typeId) return 'Unknown'
        const typeObj = data.value[localeStr]?.types?.[typeId.toString()]
        return typeObj?.name ?? 'Unknown'
    }

    /** Get genre name by typeId, genreId, and locale */
    const getGenreName = (typeId: number | null, genreId: number | null, localeStr: string): string => {
        if (typeId == null || genreId == null) return ''
        const typeObj = data.value[localeStr]?.types?.[typeId.toString()]
        if (!typeObj || !typeObj.genres) return ''
        const genreName =
            genreId != null
                ? typeObj.genres[String(genreId)] ?? ''
                : '11111'
        return genreName
    }

    /** Combined type / genre label */
    const getTypeGenreName = (typeId: number | null, genreId: number | null, localeStr: string): string => {
        const typeName = getTypeName(typeId, localeStr)
        const genreName = getGenreName(typeId, genreId, localeStr)
        return genreName ? `${typeName} / ${genreName}` : typeName
    }

    return {
        data,
        loaded,
        locale,
        load,
        getTypeName,
        getGenreName,
        getTypeGenreName
    }
})
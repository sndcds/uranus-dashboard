/*
    src/store/eventTypeGenreLookup.ts
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/api.ts'

export interface TypeWithGenres {
    name: string
    genres?: Record<string, string>
}

export interface LanguageLookup {
    types: Record<string, TypeWithGenres>
}

export interface EventTypesGenresAPIResponse {
    [locale: string]: LanguageLookup
}

export const useEventTypeLookupStore = defineStore('eventTypesLookup', () => {
    const data = ref<Record<string, LanguageLookup>>({})
    const loaded = ref(false)
    const locale = ref('en')

    /** Load types/genres from API */
    async function initialize(languages: string[] = ['de', 'da', 'en']) {
        if (loaded.value) return

        const params = new URLSearchParams()
        params.append('lang', languages.join(','))

        const apiPath = `/api/event/type-genre-lookup?${params.toString()}`
        const apiResponse = await apiFetch<Record<string, LanguageLookup>>(apiPath)
        // @ts-ignore
        data.value = apiResponse.data ?? {}
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
        return typeObj?.genres?.[genreId.toString()] ?? ''
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
        initialize,
        getTypeName,
        getGenreName,
        getTypeGenreName
    }
})
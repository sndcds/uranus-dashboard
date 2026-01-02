// eventTypesLookup.ts

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/api.ts'
import type {UranusEventType} from "@/models/UranusEventModel.ts";

export interface TypeLookup {
    id: number
    name: string
}

export interface GenreLookup {
    [genreID: number]: string
}

export interface LanguageLookup {
    types: Record<number, TypeLookup>
    genres: Record<number, GenreLookup>
}

export const useEventTypeLookupStore = defineStore('eventTypesLookup', () => {
    const data = ref<Record<string, LanguageLookup>>({})
    const loaded = ref(false)
    const locale = ref('en') // you can set this dynamically

    async function load(languages: string[] = ['de', 'da', 'en']) {
        if (loaded.value) return

        const params = new URLSearchParams()
        params.append('lang', languages.join(','))

        const res = await apiFetch<Record<string, LanguageLookup>>(
            `/api/event/types-genres-lookup?${params.toString()}`
        )

        data.value = res.data || {}
        loaded.value = true
    }

    // Lookup methods
    const getTypeName = (typeId: number | null, locale: string) => {
        if (!typeId) { return 'Unknown'}
        return data.value[locale]?.types?.[typeId]?.name ?? 'Unknown'
    }

    const getGenreName = (typeId: number | null, genreId: number | null, locale: string) => {
        if (!typeId || genreId == null) return ''
        return data.value[locale]?.genres?.[typeId]?.[genreId] ?? ''
    }

    const getTypeGenreName = (typeId: number | null, genreId: number | null, locale: string) => {
        const typeName = getTypeName(typeId, locale)
        const genreName = getGenreName(typeId, genreId, locale)
        if (genreName != '') {
            return `${typeName} / ${genreName}`
        }
        return `${typeName}`
    }

    return { data, loaded, locale, load, getTypeName, getGenreName, getTypeGenreName }
})
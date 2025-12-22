// eventTypesLookup.ts

import { defineStore } from 'pinia'
import { apiFetch } from '@/api'

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

export const useEventTypeLookupStore = defineStore('eventTypesLookup', {
    state: () => ({
        data: {} as Record<string, LanguageLookup>,
        loaded: false
    }),
    actions: {
        async load(languages: string[] = ['de', 'da', 'en']) {
            if (this.loaded) return

            const params = new URLSearchParams()
            params.append('lang', languages.join(','))

            const res = await apiFetch<Record<string, LanguageLookup>>(
                `/api/event/types-genres-lookup?${params.toString()}`
            )

            this.data = res.data || {}
            this.loaded = true
        }
    }
})
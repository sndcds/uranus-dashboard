/*
    src/store/uranusCountryLookupStore.ts

    2026-02-08, Roald
 */

import { defineStore } from 'pinia'
import { apiFetch } from '@/api.ts'
import type { UranusApiResponse } from '@/model/uranusApiResponse.ts'
import { type UranusCountryDTO } from '@/api/dto/UranusCountryDTO.ts'


// Map of code → name
export type CountryMap = Record<string, string>

export const useCountryLookupStore = defineStore('countryLookup', {
    state: () => ({
        data: {} as Record<string, CountryMap>, // per UI language
        loaded: false,
        loading: false
    }),

    actions: {
        /**
         * Load all countries for the given UI languages
         * @param languages array of UI language codes
         */
        async load(languages: string[] = ['de', 'da', 'en']) {
            if (this.loaded || this.loading) return
            this.loading = true

            try {
                const results = await Promise.all(
                    languages.map(async (uiLang) => {
                        const rawData = await apiFetch<UranusApiResponse<UranusCountryDTO[]>>(
                            `/api/choosable-countries?lang=${uiLang}`
                        )
                        const list = rawData.data?.data ?? []
                        return [uiLang, list] as const
                    })
                )

                const mapped: Record<string, CountryMap> = {}

                for (const [uiLang, list] of results) {
                    mapped[uiLang] = {}
                    for (const country of list) {
                        const code = (country.country_code ?? '').trim()
                        if (!code) continue
                        mapped[uiLang][code] = (country.country_name ?? code).trim()
                    }
                }

                this.data = mapped
                this.loaded = true
            } finally {
                this.loading = false
            }
        },

        /**
         * Get the country name for a code and a UI language
         * Defaults to the code if not found
         */
        getName(code: string, uiLang?: string) {
            if (!uiLang) return code
            return this.data[uiLang]?.[code] ?? code
        }
    }
})
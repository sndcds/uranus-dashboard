/*
    src/store/currencyLookupStore.ts
 */

import { defineStore } from 'pinia'
import { apiFetch } from '@/api.ts'

export interface CurrencyEntry {
    id: string
    name: string
}

export type CurrencyMap = Record<string, string>

export const useCurrencyLookupStore = defineStore('currencyLookup', {
    state: () => ({
        data: {} as Record<string, CurrencyMap>,
        loaded: false,
        loading: false,
    }),

    actions: {
        async load(languages: string[] = ['de', 'da', 'en']) {
            if (this.loaded || this.loading) return
            this.loading = true

            try {
                // Fetch all languages concurrently
                const results = await Promise.all(
                    languages.map(async (uiLang) => {
                        const apiPath = `/api/choosable-currencies?lang=${uiLang}`
                        const apiResponse = await apiFetch<CurrencyEntry[]>(apiPath)
                        const list: CurrencyEntry[] = Array.isArray(apiResponse.data) ? apiResponse.data : []
                        return [uiLang, list] as const
                    })
                )

                // Map data by language
                const mapped: Record<string, CurrencyMap> = {}

                for (const [uiLang, list] of results) {
                    mapped[uiLang] = {}
                    for (const currency of list) {
                        const id = (currency.id ?? '').trim()
                        if (!id) continue
                        mapped[uiLang][id] = (currency.name ?? id).trim()
                    }
                }

                this.data = mapped
                this.loaded = true
            } finally {
                this.loading = false
            }
        }
    },
})
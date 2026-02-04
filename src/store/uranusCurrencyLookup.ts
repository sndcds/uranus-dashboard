import { defineStore } from 'pinia'
import { apiFetch } from '@/api.ts'
import type { UranusAPIResponse } from '@/model/uranusAPIResponse.ts'

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
                const results = await Promise.all(
                    languages.map(async (uiLang) => {
                        const res = await apiFetch<UranusAPIResponse<CurrencyEntry[]>>(
                            `/api/choosable-currencies?lang=${uiLang}`
                        )
                        // Access the actual array inside 'data'
                        const list = res.data?.data ?? []
                        return [uiLang, list] as const
                    })
                )

                const mapped: Record<string, CurrencyMap> = {}

                for (const [uiLang, list] of results) {
                    mapped[uiLang] = {}
                    for (const currency of list) {
                        mapped[uiLang][currency.id] = currency.name
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
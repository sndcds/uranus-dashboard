import { defineStore } from 'pinia'
import { apiFetch } from '@/api.ts'

/** One entry returned by the API */
export interface UrlTypeEntry {
    id: number
    name: string
}

/** id → label */
export type UrlTypeMap = Record<number, string>

/**
 * data[context][uiLang][id] = label
 * data.event.de[1] = "Website"
 */
export const useUrlTypeLookupStore = defineStore('urlTypeLookup', {
    state: () => ({
        data: {} as Record<string, Record<string, UrlTypeMap>>,
        loaded: false,
        loading: false
    }),

    getters: {
        getLabel: (state) => {
            return (
                context: string,
                uiLang: string,
                typeId: number | null
            ): string => {
                if (!typeId) return ''
                return state.data[context]?.[uiLang]?.[typeId] ?? ''
            }
        }
    },

    actions: {
        async load(
            context = 'event',
            languages: string[] = ['de', 'da', 'en']
        ) {
            if (this.loaded || this.loading) return

            this.loading = true

            try {
                const results = await Promise.all(
                    languages.map(async (uiLang) => {
                        const res = await apiFetch<UrlTypeEntry[]>(
                            `/api/choosable-url-types/${context}?lang=${uiLang}`
                        )
                        return [uiLang, res.data ?? []] as const
                    })
                )

                if (!this.data[context]) {
                    this.data[context] = {}
                }

                for (const [uiLang, list] of results) {
                    const map: UrlTypeMap = {}

                    for (const item of list) {
                        map[item.id] = item.name
                    }

                    this.data[context][uiLang] = map
                }

                this.loaded = true
            } finally {
                this.loading = false
            }
        }
    }
})
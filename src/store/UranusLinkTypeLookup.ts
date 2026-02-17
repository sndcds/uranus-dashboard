import { defineStore } from 'pinia'
import { apiFetch } from '@/api.ts'

export interface LinkTypeEntry {
    key: string
    name: string
}

export type LinkTypeMap = Record<string, string> // key → name

export const useLinkTypeLookupStore = defineStore('linkTypeLookup', {
    state: () => ({
        data: {} as Record<string, LinkTypeMap>,
        loaded: false,
        loading: false
    }),

    getters: {
        getLabel: (state) => {
            return (uiLang: string, typeKey: string | null): string => {
                if (!typeKey) return ''
                return state.data[uiLang]?.[typeKey] ?? ''
            }
        }
    },

    actions: {
        async load(languages: string[] = ['de', 'da', 'en']) {
            if (this.loaded || this.loading) return

            this.loading = true
            try {
                // fetch for all languages
                const results = await Promise.all(
                    languages.map(async (lang) => {
                        const res = await apiFetch<{
                            service: string
                            api_version: string
                            response_type: string
                            status: string
                            timestamp: string
                            metadata: Record<string, any>
                            data: LinkTypeEntry[]
                            message: string
                        }>(`/api/choosable-link-types?lang=${lang}`)

                        return {
                            lang,
                            list: Array.isArray(res?.data?.data) ? res.data.data : []
                        }
                    })
                )

                for (const { lang, list } of results) {
                    const map: LinkTypeMap = {}
                    for (const item of list) {
                        map[item.key] = item.name
                    }
                    this.data[lang] = map
                }

                this.loaded = true
            } finally {
                this.loading = false
            }
        }
    }
})
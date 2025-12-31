import { defineStore } from 'pinia'
import { apiFetch } from '@/api.ts'

export interface LanguageEntry {
    id: string   // e.g. "de"
    name: string // e.g. "German"
}

export type LanguageMap = Record<string, string>
// { en: "English", de: "Deutsch", ... }

export const useLanguageLookupStore = defineStore('languageLookup', {
    state: () => ({
        data: {} as Record<string, LanguageMap>, // per UI language
        loaded: false,
        loading: false
    }),

    actions: {
        async load(languages: string[] = ['de', 'da', 'en']) {
            if (this.loaded || this.loading) return

            this.loading = true

            try {
                const results = await Promise.all(
                    languages.map(async (uiLang) => {
                        const res = await apiFetch<LanguageEntry[]>(
                            `/api/choosable-languages?lang=${uiLang}`
                        )
                        return [uiLang, res.data ?? []] as const
                    })
                )

                const mapped: Record<string, LanguageMap> = {}

                for (const [uiLang, list] of results) {
                    mapped[uiLang] = {}
                    for (const lang of list) {
                        mapped[uiLang][lang.id] = lang.name
                    }
                }

                this.data = mapped
                this.loaded = true
            } finally {
                this.loading = false
            }
        }
    }
})
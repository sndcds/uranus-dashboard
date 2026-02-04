import { defineStore } from 'pinia'
import { apiFetch } from '@/api.ts'

/** One entry returned by the API */
export interface SpaceTypeEntry {
    id: number
    name: string
}

/** id → label */
export type SpaceTypeMap = Record<number, string>

/**
 * data[uiLang][id] = label
 * data.de[1] = "Sal"
 */
export const useSpaceTypeLookupStore = defineStore('spaceType', {
    state: () => ({
        data: {} as Record<string, SpaceTypeMap>,
        loaded: false,
        loading: false
    }),

    getters: {
        getLabel: (state) => {
            return (uiLang: string, typeId: number | null): string => {
                if (!typeId) return ''
                return state.data[uiLang]?.[typeId] ?? ''
            }
        },
        getAll: (state) => {
            return (uiLang: string): SpaceTypeEntry[] => {
                const map = state.data[uiLang] ?? {}
                return Object.entries(map).map(([id, name]) => ({ id: Number(id), name }))
            }
        }
    },

    actions: {
        async load(languages: string[] = ['de', 'da', 'en']) {
            if (this.loaded || this.loading) return

            this.loading = true
            try {
                const results = await Promise.all(
                    languages.map(async (uiLang) => {
                        const res = await apiFetch<SpaceTypeEntry[]>(
                            `/api/choosable-space-types?lang=${uiLang}`
                        )
                        return [uiLang, res.data ?? []] as const
                    })
                )

                for (const [uiLang, list] of results) {
                    const map: SpaceTypeMap = {}
                    for (const item of list) {
                        map[item.id] = item.name
                    }
                    this.data[uiLang] = map
                }

                this.loaded = true
            } finally {
                this.loading = false
            }
        }
    }
})
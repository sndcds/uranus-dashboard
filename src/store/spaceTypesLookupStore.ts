/*
    src/store/spaceTypeLookupStore.ts
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/api.ts'

/** Single space type entry from API */
export interface UranusSpaceTypeEntry {
    label: string | null
    description: string | null
}

/** Per-locale lookup: key -> UranusSpaceTypeEntry */
export interface LanguageLookup {
    types: Record<string, UranusSpaceTypeEntry>
}

export const useSpaceTypeLookupStore = defineStore('spaceTypesLookup', () => {
    const data = ref<Record<string, LanguageLookup>>({})
    const loaded = ref<Record<string, boolean>>({})
    const loading = ref<Record<string, boolean>>({})
    const locale = ref('en')

    /** Load a specific language */
    async function fetchLang(lang: string) {
        if (loaded.value[lang] || loading.value[lang]) return
        loading.value[lang] = true

        try {
            const apiPath = `/api/choosable-space-types?lang=${lang}`
            const apiResponse = await apiFetch<UranusSpaceTypeEntry[]>(apiPath)

            const map: Record<string, UranusSpaceTypeEntry> = {}
            const items: UranusSpaceTypeEntry | any = apiResponse.data ?? []
            for (const item of items) {
                map[item.key] = {
                    label: item.name ?? null,
                    description: item.description ?? null
                }
            }

            data.value[lang] = { types: map }
            loaded.value[lang] = true
        } catch (err) {
            console.error(`Error fetching space types for lang=${lang}`, err)
            data.value[lang] = { types: {} }
        } finally {
            loading.value[lang] = false
        }
    }

    /** Load multiple languages */
    async function initialize(languages: string[] = ['de', 'da', 'en']) {
        await Promise.all(languages.map(lang => fetchLang(lang)))
    }

    /** Get a space type by key and locale */
    function getType(key: string, lang: string): UranusSpaceTypeEntry | null {
        return data.value[lang]?.types?.[key] ?? null
    }

    /** Get label only */
    function getLabel(key: string, lang: string): string {
        return getType(key, lang)?.label ?? ''
    }

    /** Get description only */
    function getDescription(key: string, lang: string): string {
        return getType(key, lang)?.description ?? ''
    }

    function getLocalizedTypes(lang: string) {
        const map = data.value[lang]?.types ?? {}

        return Object.entries(map).map(([key, entry]) => ({
            key,
            label: entry.label,
            description: entry.description
        }))
    }

    return {
        data,
        loaded,
        loading,
        locale,
        fetchLang,
        initialize,
        getLocalizedTypes,
        getType,
        getLabel,
        getDescription
    }
})
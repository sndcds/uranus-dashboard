import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UranusSpaceTypeEntry {
    label: string | null
    description: string | null
}

export type UranusSpaceTypeMap = Record<string, UranusSpaceTypeEntry>

export const useSpaceTypeLookupStore = defineStore('spaceType', () => {
    // Store structure: data[lang][key] => { label, description }
    const data = ref<Record<string, UranusSpaceTypeMap>>({})
    const loaded = ref<Record<string, boolean>>({})
    const loading = ref<Record<string, boolean>>({})

    /**
     * Fetch space types for a given language
     */
    async function fetchLang(lang: string) {
        if (loaded.value[lang] || loading.value[lang]) return
        loading.value[lang] = true

        try {
            const res = await fetch(`/api/choosable-space-types?lang=${lang}`)
            if (!res.ok) throw new Error(`Failed to load space types for lang=${lang}`)
            const json = await res.json()

            const map: UranusSpaceTypeMap = {}
            for (const item of json.data ?? []) {
                map[item.key] = {
                    label: item.name ?? null,
                    description: item.description ?? null
                }
            }

            data.value[lang] = map
            loaded.value[lang] = true
        } catch (err) {
            console.error(`Error fetching space types for lang=${lang}`, err)
            data.value[lang] = {}
        } finally {
            loading.value[lang] = false
        }
    }

    /**
     * Initialize multiple languages at once
     */
    async function initialize(languages: string[] = ['en']) {
        await Promise.all(languages.map(lang => fetchLang(lang)))
    }

    /**
     * Get label for a key in a given language
     */
    function getLabel(key: string, lang?: string): string {
        const uiLang = lang || 'en'
        return data.value[uiLang]?.[key]?.label ?? ''
    }

    /**
     * Get full entry for a key
     */
    function getEntry(key: string, lang?: string): UranusSpaceTypeEntry | null {
        const uiLang = lang || 'en'
        return data.value[uiLang]?.[key] ?? null
    }

    /**
     * Get all space types for a given language
     */
    function getAll(lang?: string): UranusSpaceTypeEntry[] {
        const uiLang = lang || 'en'
        return Object.values(data.value[uiLang] ?? [])
    }

    return { data, loaded, loading, fetchLang, initialize, getLabel, getEntry, getAll }
})
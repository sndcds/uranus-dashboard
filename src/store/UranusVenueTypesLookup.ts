import { ref } from 'vue'
import { defineStore } from 'pinia'

export interface UranusVenueTypeEntry {
    label: string | null
    description: string | null
}

export type UranusVenueTypeMap = Record<string, UranusVenueTypeEntry>

export const useVenueTypeLookupStore = defineStore('venueType', () => {
    // data[lang][key] => { label, description }
    const data = ref<Record<string, UranusVenueTypeMap>>({})
    const loaded = ref<Record<string, boolean>>({})
    const loading = ref<Record<string, boolean>>({})

    async function fetchLang(lang: string) {
        if (loaded.value[lang] || loading.value[lang]) return
        loading.value[lang] = true

        try {
            const res = await fetch(`/api/choosable-venue-types?lang=${lang}`)
            if (!res.ok) throw new Error(`Failed to fetch venue types for lang=${lang}`)
            const json = await res.json()

            const map: UranusVenueTypeMap = {}
            for (const item of json.data ?? []) {
                map[item.key] = {
                    label: item.name ?? null,
                    description: item.description ?? null
                }
            }
            data.value[lang] = map
            loaded.value[lang] = true
        } catch (err) {
            console.error(`Error fetching venue types for lang=${lang}:`, err)
            data.value[lang] = {}
        } finally {
            loading.value[lang] = false
        }
    }

    async function initialize(languages: string[] = ['en']) {
        await Promise.all(languages.map(lang => fetchLang(lang)))
    }

    function getLabel(key: string, lang?: string): string {
        const uiLang = lang || 'en'
        return data.value[uiLang]?.[key]?.label ?? ''
    }

    function getEntry(key: string, lang?: string): UranusVenueTypeEntry | null {
        const uiLang = lang || 'en'
        return data.value[uiLang]?.[key] ?? null
    }

    function getAll(lang?: string): UranusVenueTypeEntry[] {
        const uiLang = lang || 'en'
        return Object.values(data.value[uiLang] ?? [])
    }

    return { data, loaded, loading, fetchLang, initialize, getLabel, getEntry, getAll }
})
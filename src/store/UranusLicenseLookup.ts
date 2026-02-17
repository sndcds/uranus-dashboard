/*
    src/store/UranusLicenseLookup.ts

    2026-02-15, Roald
*/

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UranusLicenseEntry {
    label: string | null
    description: string | null
}

export type UranusLicenseMap = Record<string, UranusLicenseEntry>

export const useLicenseLookup = defineStore('license', () => {
    // Store structure: data[lang][key] => { label, description }
    const data = ref<Record<string, UranusLicenseMap>>({})
    const loaded = ref<Record<string, boolean>>({})
    const loading = ref<Record<string, boolean>>({})

    /**
     * Fetch licenses for a given language
     */
    async function fetchLang(lang: string) {
        if (loaded.value[lang] || loading.value[lang]) return
        loading.value[lang] = true

        try {
            const res = await fetch(`/api/choosable-license-types?lang=${lang}`)
            if (!res.ok) throw new Error(`Failed to load licenses for lang=${lang}`)
            const json = await res.json()

            const map: UranusLicenseMap = {}
            for (const item of json.data ?? []) {
                map[item.key] = {
                    label: item.name ?? null,
                    description: item.description ?? null
                }
            }

            data.value[lang] = map
            loaded.value[lang] = true
        } catch (err) {
            console.error(`Error fetching licenses for lang=${lang}`, err)
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
    function getEntry(key: string, lang?: string): UranusLicenseEntry | null {
        const uiLang = lang || 'en'
        return data.value[uiLang]?.[key] ?? null
    }

    /**
     * Get all licenses for a given language
     */
    function getAll(lang?: string): UranusLicenseEntry[] {
        const uiLang = lang || 'en'
        return Object.values(data.value[uiLang] ?? [])
    }

    return { data, loaded, loading, fetchLang, initialize, getLabel, getEntry, getAll }
})
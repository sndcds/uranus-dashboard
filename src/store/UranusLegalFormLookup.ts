/*
    src/store/uranusLegalFormStore.ts

    2026-02-15, Roald
*/

import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UranusLegalFormEntry {
    label: string | null
    description: string | null
}

export type UranusLegalFormMap = Record<string, UranusLegalFormEntry>

export const useLegalFormLookupStore = defineStore('legalForm', () => {
    // Store structure: data[lang][key] => { label, description }
    const data = ref<Record<string, UranusLegalFormMap>>({})
    const loaded = ref<Record<string, boolean>>({})
    const loading = ref<Record<string, boolean>>({})

    /**
     * Fetch legal forms for a given language
     */
    async function fetchLang(lang: string) {
        if (loaded.value[lang] || loading.value[lang]) return
        loading.value[lang] = true

        try {
            const res = await fetch(`/api/choosable-legal-forms?lang=${lang}`)
            if (!res.ok) throw new Error(`Failed to load legal forms for lang=${lang}`)
            const json = await res.json()

            const map: UranusLegalFormMap = {}
            for (const item of json.data ?? []) {
                map[item.key] = {
                    label: item.name ?? null,
                    description: item.description ?? null
                }
            }

            data.value[lang] = map
            loaded.value[lang] = true
        } catch (err) {
            console.error(`Error fetching legal forms for lang=${lang}`, err)
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
    function getEntry(key: string, lang?: string): UranusLegalFormEntry | null {
        const uiLang = lang || 'en'
        return data.value[uiLang]?.[key] ?? null
    }

    /**
     * Get all legal forms for a given language
     */
    function getAll(lang?: string): UranusLegalFormEntry[] {
        const uiLang = lang || 'en'
        return Object.values(data.value[uiLang] ?? [])
    }

    return { data, loaded, loading, fetchLang, initialize, getLabel, getEntry, getAll }
})
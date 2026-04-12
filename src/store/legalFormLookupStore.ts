/*
    src/store/legalFormStore.ts
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { apiFetch } from '@/api.ts'

export interface LegalFormEntryDTO {
    label: string | null
    description: string | null
}

export type UranusLegalFormMap = Record<string, LegalFormEntryDTO>

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
            // Use apiFetch instead of fetch
            const res = await apiFetch<{ data: Array<{ key: string, name?: string, description?: string }> }>(
                `/api/choosable-legal-forms?lang=${lang}`
            )

            const map: UranusLegalFormMap = {}
            const items: LegalFormEntryDTO[] | any = res.data ?? []

            for (const item of items) {
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
    function getEntry(key: string, lang?: string): LegalFormEntryDTO | null {
        const uiLang = lang || 'en'
        return data.value[uiLang]?.[key] ?? null
    }

    /**
     * Get all legal forms for a given language
     */
    function getAll(lang?: string): LegalFormEntryDTO[] {
        const uiLang = lang || 'en'
        return Object.values(data.value[uiLang] ?? [])
    }

    return { data, loaded, loading, fetchLang, initialize, getLabel, getEntry, getAll }
})
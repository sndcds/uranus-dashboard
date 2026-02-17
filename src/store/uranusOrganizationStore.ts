/*
    src/store/uranusOrganizationStore.ts

    2026-02-07, Roald
*/

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UranusOrganization } from '@/domain/organization/UranusOrganization.ts'

export const useUranusOrganizationStore = defineStore('uranusOrganization', () => {
    // State
    const original = ref<UranusOrganization | null>(null)
    const draft = ref<UranusOrganization | null>(null)

    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    // Helpers
    function cloneOrganization(org: UranusOrganization): UranusOrganization {
        return new UranusOrganization(JSON.parse(JSON.stringify(org)))
    }

    // Getters
    const isLoaded = computed(() => !!draft.value)

    const isDirty = computed(() => {
        if (!original.value || !draft.value) return false
        return JSON.stringify(original.value) !== JSON.stringify(draft.value)
    })

    const hasAddress = computed(() => {
        if (!draft.value) return false
        return !!(
            draft.value.street ||
            draft.value.postalCode ||
            draft.value.city
        )
    })

    // Actions
    function loadFromApi(raw: any) {
        const org = UranusOrganization.fromApi(raw)
        if (!org) {
            error.value = 'Failed to map organization'
            return
        }
        original.value = org
        draft.value = cloneOrganization(org)
    }

    function clear() {
        original.value = null
        draft.value = null
        error.value = null
    }

    // Domain mutations
    function setAddress(data: {
        street?: string
        houseNumber?: string
        addressAddition?: string
        postalCode?: string
        city?: string
        state?: string
        country?: string
    }) {
        if (!draft.value) return
        Object.assign(draft.value, data)
    }

    function setContact(data: {
        email?: string
        phone?: string
        website?: string
    }) {
        if (!draft.value) return
        if (data.email !== undefined) { draft.value.contactEmail = data.email }
        if (data.phone !== undefined) { draft.value.contactPhone = data.phone }
        if (data.website !== undefined) { draft.value.websiteLink = data.website }
    }

    function setLogos(data: {
        main?: number
        light?: number
        dark?: number
    }) {
        if (!draft.value) return
        if (data.main !== undefined) draft.value.imageMainLogoId = data.main
        if (data.light !== undefined) draft.value.imageLightModeLogoId = data.light
        if (data.dark !== undefined) draft.value.imageDarkModeLogoId = data.dark
    }

    function resetToEmpty() {
        const empty = UranusOrganization.empty()
        original.value = empty
        draft.value = cloneOrganization(empty)
        error.value = null
    }

    return {
        // State
        original,
        draft,
        loading,
        saving,
        error,

        // Getters
        isLoaded,
        isDirty,
        hasAddress,

        // Actions
        loadFromApi,
        clear,
        resetToEmpty,

        // Domain mutations
        setAddress,
        setContact,
        setLogos,
    }
})
/*
    src/store/uranusVenueStore.ts

    2026-02-10, Roald
*/

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UranusVenue } from '@/domain/venue/UranusVenue.ts'

export const useUranusVenueStore = defineStore('uranusVenue', () => {
    // State
    const original = ref<UranusVenue | null>(null)
    const draft = ref<UranusVenue | null>(null)

    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    // Helpers
    function cloneVenue(venue: UranusVenue): UranusVenue {
        return new UranusVenue(JSON.parse(JSON.stringify(venue)))
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
            draft.value.houseNumber ||
            draft.value.postalCode ||
            draft.value.city
        )
    })

    // Actions
    function loadFromApi(raw: any) {
        const venue = UranusVenue.fromApi(raw)
        if (!venue) {
            error.value = 'Failed to map venue'
            return
        }
        original.value = venue
        draft.value = cloneVenue(venue)
    }

    function clear() {
        original.value = null
        draft.value = null
        error.value = null
    }

    function resetToEmpty() {
        const empty = UranusVenue.empty()
        original.value = empty
        draft.value = cloneVenue(empty)
        error.value = null
    }

    // Domain mutations
    function setAddress(data: {
        street?: string
        houseNumber?: string
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
        if (data.email !== undefined) draft.value.contactEmail = data.email
        if (data.phone !== undefined) draft.value.contactPhone = data.phone
        if (data.website !== undefined) draft.value.websiteLink = data.website
    }

    function setDescription(desc: string) {
        if (!draft.value) return
        draft.value.description = desc
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
        setDescription,
    }
})
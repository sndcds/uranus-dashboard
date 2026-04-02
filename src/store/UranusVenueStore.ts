/*
    src/store/uranusVenueStore.ts
    2026-04-02, refactored
*/

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { type VenueModel, fromApi, createEmptyVenue } from '@/domain/venue/venue.model.ts'

export const useUranusVenueStore = defineStore('uranusVenue', () => {
    // State
    const original = ref<VenueModel | null>(null)
    const draft = ref<VenueModel | null>(null)

    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    // Helpers
    /** Safe deep clone for reactive objects */
    function cloneVenue(venue: VenueModel): VenueModel {
        return JSON.parse(JSON.stringify(venue))
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
        const venue = fromApi(raw)
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
        const empty = createEmptyVenue()
        original.value = empty
        draft.value = cloneVenue(empty)
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
    }
})
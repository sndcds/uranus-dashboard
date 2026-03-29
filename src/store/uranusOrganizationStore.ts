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

    function resetToEmpty() {
        const empty = UranusOrganization.empty()
        original.value = empty
        draft.value = cloneOrganization(empty)
        error.value = null
    }

    return {
        original,
        draft,
        loading,
        saving,
        error,

        isLoaded,
        isDirty,
        hasAddress,

        loadFromApi,
        clear,
        resetToEmpty,
    }
})
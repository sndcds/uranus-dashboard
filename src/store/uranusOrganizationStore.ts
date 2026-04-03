/*
    src/store/uranusOrganizationStore.ts
    2026-03-30, Roald
*/

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OrganizationModel } from '@/domain/organization/organization.model'
import { mapOrganization, createEmptyOrganization } from '@/domain/organization/organization.model'
import type { OrganizationDTO } from '@/api/dto/organization.dto.ts'

export const useUranusOrganizationStore = defineStore('uranusOrganization', () => {
    // State
    const original = ref<OrganizationModel | null>(null)
    const draft = ref<OrganizationModel | null>(null)

    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    // Helpers
    function cloneOrganization(org: OrganizationModel): OrganizationModel {
        // simple shallow clone works for a flat interface
        return { ...org }
    }

    // Getters
    const isLoaded = computed(() => !!draft.value)

    const isDirty = computed(() => {
        if (!original.value || !draft.value) return false
        // compare JSON of the objects for simplicity
        return JSON.stringify(original.value) !== JSON.stringify(draft.value)
    })

    const hasAddress = computed(() => {
        if (!draft.value) return false
        return !!(draft.value.street || draft.value.postalCode || draft.value.city)
    })

    // Actions
    function loadFromApi(raw: OrganizationDTO) {
        const org = mapOrganization(raw)
        original.value = org
        draft.value = cloneOrganization(org)
    }

    function clear() {
        original.value = null
        draft.value = null
        error.value = null
    }

    function resetToEmpty() {
        const empty = createEmptyOrganization()
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
        cloneOrganization,
    }
})
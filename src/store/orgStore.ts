/*
    src/store/orgStore.ts
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { OrgModel } from '@/domain/org/org.model.ts'
import { mapOrg, createEmptyOrg } from '@/domain/org/org.model.ts'
import type { OrgDTO } from '@/api/dto/orgDTO.ts'

export const useOrgStore = defineStore('org', () => {
    // State
    const original = ref<OrgModel | null>(null)
    const draft = ref<OrgModel | null>(null)

    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    // Helpers
    function cloneOrg(org: OrgModel): OrgModel {
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
    function loadFromApi(raw: OrgDTO) {
        const org = mapOrg(raw)
        original.value = org
        draft.value = cloneOrg(org)
    }

    function clear() {
        original.value = null
        draft.value = null
        error.value = null
    }

    function resetToEmpty() {
        const empty = createEmptyOrg()
        original.value = empty
        draft.value = cloneOrg(empty)
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
        cloneOrg: cloneOrg,
    }
})
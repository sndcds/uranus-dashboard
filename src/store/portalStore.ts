import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { createEmptyPortal, mapPortal, type PortalDTO, type PortalModel } from '@/domain/portal/portal.model.ts'

export const useUranusPortalStore = defineStore('uranusPortal', () => {
    const original = ref<PortalModel | null>(null)
    const draft = ref<PortalModel | null>(null)
    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    function clonePortal(portal: PortalModel): PortalModel {
        return JSON.parse(JSON.stringify(portal))
    }

    const isLoaded = computed(() => !!draft.value)

    function loadFromApi(raw: PortalDTO) {
        const portal = mapPortal(raw)
        original.value = portal
        draft.value = clonePortal(portal)
        error.value = null
    }

    function clear() {
        original.value = null
        draft.value = null
        error.value = null
    }

    function resetToEmpty() {
        const empty = createEmptyPortal()
        original.value = empty
        draft.value = clonePortal(empty)
        error.value = null
    }

    return {
        original,
        draft,
        loading,
        saving,
        error,
        isLoaded,
        loadFromApi,
        clear,
        resetToEmpty,
    }
})

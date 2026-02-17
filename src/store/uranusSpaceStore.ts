/*
    src/store/uranusSpaceStore.ts
    2026-02-15, Roald
*/

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UranusSpace } from '@/domain/space/UranusSpace.ts'

export const useUranusSpaceStore = defineStore('uranusSpace', () => {
    const original = ref<UranusSpace | null>(null)
    const draft = ref<UranusSpace | null>(null)

    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    // Helpers

    /** Safe deep clone that preserves BigInt */
    function cloneSpace(space: UranusSpace): UranusSpace {
        return new UranusSpace({ ...space })
    }

    // Getters

    const isLoaded = computed(() => !!draft.value)

    const isDirty = computed(() => {
        if (!original.value || !draft.value) return false
        const o = original.value
        const d = draft.value

        return (
            o.name !== d.name ||
            o.spaceType !== d.spaceType ||
            o.buildingLevel !== d.buildingLevel ||
            o.description !== d.description ||
            o.websiteLink !== d.websiteLink ||
            o.totalCapacity !== d.totalCapacity ||
            o.seatingCapacity !== d.seatingCapacity ||
            o.areaSqm !== d.areaSqm ||
            (o.accessibilityFlags ?? 0n) !== (d.accessibilityFlags ?? 0n) ||
            o.accessibilitySummary !== d.accessibilitySummary
        )
    })

    const hasCapacity = computed(() => {
        if (!draft.value) return false
        return !!(draft.value.totalCapacity || draft.value.seatingCapacity)
    })

    const hasArea = computed(() => {
        if (!draft.value) return false
        return draft.value.areaSqm != null
    })

    // Actions

    function loadFromApi(raw: any) {
        const space = UranusSpace.fromApi(raw)
        if (!space) {
            error.value = 'Failed to map space'
            return
        }
        original.value = space
        draft.value = cloneSpace(space)
    }

    function clear() {
        original.value = null
        draft.value = null
        error.value = null
    }

    function resetToEmpty(venueId: number) {
        const empty = UranusSpace.empty()
        empty.venueId = venueId
        original.value = empty
        draft.value = cloneSpace(empty)
        error.value = null
    }

    // Domain mutations

    function setBasicInfo(data: {
        name?: string
        spaceType?: string | null
        buildingLevel?: number | null
        description?: string | null
        websiteLink?: string | null
    }) {
        if (!draft.value) return
        Object.assign(draft.value, data)
    }

    function setCapacity(data: { totalCapacity?: number | null; seatingCapacity?: number | null }) {
        if (!draft.value) return
        if (data.totalCapacity !== undefined) draft.value.totalCapacity = data.totalCapacity
        if (data.seatingCapacity !== undefined) draft.value.seatingCapacity = data.seatingCapacity
    }

    function setArea(areaSqm: number | null) {
        if (!draft.value) return
        draft.value.areaSqm = areaSqm
    }

    function setAccessibility(data: { accessibilitySummary?: string | null; accessibilityFlags?: bigint | null }) {
        if (!draft.value) return
        if (data.accessibilitySummary !== undefined) draft.value.accessibilitySummary = data.accessibilitySummary
        if (data.accessibilityFlags !== undefined) draft.value.accessibilityFlags = data.accessibilityFlags
    }

    function setFeatures(data: {
        environmentalFeatures?: number | null
        audioFeatures?: number | null
        presentationFeatures?: number | null
        lightingFeatures?: number | null
        climateFeatures?: number | null
        miscFeatures?: number | null
    }) {
        if (!draft.value) return
        Object.assign(draft.value, data)
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
        hasCapacity,
        hasArea,

        // Actions
        loadFromApi,
        clear,
        resetToEmpty,

        // Domain mutations
        setBasicInfo,
        setCapacity,
        setArea,
        setAccessibility,
        setFeatures,
    }
})
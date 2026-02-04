/*
    src/store/uranusAdminEventStore.ts
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { UranusEventDetail } from '@/model/uranusAdminEventModel.ts'

export const useUranusAdminEventStore = defineStore('uranusEvent', () => {
    // State
    const original = ref<UranusEventDetail | null>(null)
    const draft = ref<UranusEventDetail | null>(null)

    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)

    const baseTabFields = ['title', 'subtitle', 'description', 'summary'] as const
    type BaseTabField = (typeof baseTabFields)[number]


    // Helpers
    function cloneEvent(event: UranusEventDetail): UranusEventDetail {
        // safest clone for class-based models
        return new UranusEventDetail(structuredClone(event.toProps()))
    }

    // Getters
    const isLoaded = computed(() => !!draft.value)

    const isDirty = computed(() => {
        if (!original.value || !draft.value) return false
        return JSON.stringify(original.value) !== JSON.stringify(draft.value)
    })

    const hasMultipleDates = computed(() =>
        (draft.value?.eventDates?.length ?? 0) > 1
    )

    const primaryDate = computed(() =>
        draft.value?.eventDates?.[0] ?? null
    )

    // Example: derived release state
    const effectiveReleaseDate = computed(() => {
        return (
            draft.value?.releaseDate ??
            null
        )
    })

    // Actions
    function loadFromApi(raw: any) {
        const event = UranusEventDetail.fromApi(raw)
        if (!event) {
            error.value = 'Failed to map event'
            return
        }

        original.value = event
        draft.value = cloneEvent(event)
    }

    function resetDraft() {
        if (!original.value) return
        draft.value = cloneEvent(original.value)
    }

    function commitDraft() {
        if (!draft.value) return
        original.value = cloneEvent(draft.value)
    }

    function commitBaseTab() {
        if (!draft.value || !original.value) return

        const keys: BaseTabField[] = ['title', 'subtitle', 'description', 'summary']

        keys.forEach(key => {
            // fallback to empty string if null
            original.value![key] = structuredClone(draft.value![key] ?? '')
        })
    }

    function resetBaseTab() {
        if (!draft.value || !original.value) return

        const keys: BaseTabField[] = ['title', 'subtitle', 'description', 'summary']

        keys.forEach(key => {
            draft.value![key] = structuredClone(original.value![key] ?? '')
        })
    }


    function clear() {
        original.value = null
        draft.value = null
        error.value = null
    }

    // Domain-specific mutations

    function updateBase<K extends keyof UranusEventDetail>(
        key: K,
        value: UranusEventDetail[K]
    ) {
        if (!draft.value) return
            ;(draft.value[key] as any) = value
    }

    function addEventDate() {
        if (!draft.value) return
        draft.value.eventDates?.push(
            new (draft.value.eventDates[0]?.constructor ?? Object)()
        )
    }

    function removeEventDate(index: number) {
        if (!draft.value) return
        draft.value.eventDates?.splice(index, 1)
    }

    function addTag(tag: string) {
        if (!draft.value) return
        if (!draft.value.tags) draft.value.tags = []
        if (!draft.value.tags.includes(tag)) {
            draft.value.tags.push(tag)
        }
    }

    function removeTag(tag: string) {
        if (!draft.value?.tags) return
        draft.value.tags = draft.value.tags.filter(t => t !== tag)
    }

    return {
        // state
        original,
        draft,
        loading,
        saving,
        error,

        // getters
        isLoaded,
        isDirty,
        hasMultipleDates,
        primaryDate,
        effectiveReleaseDate,

        // actions
        loadFromApi,
        commitBaseTab,
        resetBaseTab,
        resetDraft,
        commitDraft,
        clear,

        // domain mutations
        updateBase,
        addEventDate,
        removeEventDate,
        addTag,
        removeTag
    }
})
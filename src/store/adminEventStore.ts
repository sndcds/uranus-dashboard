/*
    src/store/adminEventStore.ts
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { type AdminEvent } from '@/domain/event/adminEvent.model.ts'
import { fromApi } from '@/domain/event/adminEvent.model.ts'

export const useAdminEventStore = defineStore('uranusAdminEvent', () => {
    // State
    const original = ref<AdminEvent | null>(null)
    const draft = ref<AdminEvent | null>(null)

    const loading = ref(false)
    const saving = ref(false)
    const error = ref<string | null>(null)


    // Helpers
    function cloneEvent(event: AdminEvent): AdminEvent {
        return structuredClone(event)
    }

    // Getters
    const isLoaded = computed(() => !!draft.value)

    const isDirty = computed(() => {
        if (!original.value || !draft.value) return false
        return JSON.stringify(original.value) !== JSON.stringify(draft.value)
    })

    function isVenueTabEqual() {
        const a = draft.value
        const b = original.value
        if (a === b) return true
        if (!a || !b) return false
        return (
            a.venueUuid === b.venueUuid &&
            a.spaceUuid === b.spaceUuid &&
            a.meetingPoint === b.meetingPoint &&
            a.onlineLink === b.onlineLink
        )
    }

    function isRegisterTabEqual() {
        const a = draft.value
        const b = original.value
        if (a === b) return true
        if (!a || !b) return false
        return (
            a.registrationLink === b.registrationLink &&
            a.registrationEmail === b.registrationEmail &&
            a.registrationPhone === b.registrationPhone &&
            a.registrationDeadline === b.registrationDeadline
        )
    }

    function normalizeArray<T>(arr: T[] | null | undefined): T[] {
        return Array.isArray(arr) ? arr : []
    }


    function isEventLinksEqual() {
        const a = draft.value
        const b = original.value

        if (a === b) return true
        if (!a || !b) return false

        const normalize = (v: any) => (v ?? '').trim()

        const draftLinks = a.eventLinks ?? []
        const originalLinks = b.eventLinks ?? []

        if (draftLinks.length !== originalLinks.length) return false
        if (normalize(a.sourceUrl) !== normalize(b.sourceUrl)) return false

        const isEqual = (x: any, y: any) =>
            x.label === y.label &&
            x.type === y.type &&
            normalize(x.url) === normalize(y.url)

        const allMatch = draftLinks.every(d =>
            originalLinks.some(o => isEqual(d, o))
        )

        const allOriginalMatch = originalLinks.every(o =>
            draftLinks.some(d => isEqual(d, o))
        )

        return allMatch && allOriginalMatch
    }

    function isTicketTabEqual() {
        const a = draft.value
        const b = original.value
        if (a === b) return true
        if (!a || !b) return false

        const aFlags = normalizeArray(a.ticketFlags)
        const bFlags = normalizeArray(b.ticketFlags)

        const sameTicketFlags =
            aFlags.length === bFlags.length &&
            new Set(aFlags).size === new Set(bFlags).size &&
            [...aFlags].every(v => bFlags.includes(v))

        return (
            a.priceType === b.priceType &&
            a.minPrice === b.minPrice &&
            a.maxPrice === b.maxPrice &&
            a.currency === b.currency &&
            sameTicketFlags &&
            a.ticketLink === b.ticketLink
        )
    }

    const hasDates = computed(() =>
        (draft.value?.eventDates?.length ?? 0) > 0
    )

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

    function loadFromApi(raw: any) {
        const event = fromApi(raw)
        if (!event) {
            error.value = 'Failed to map event'
            return
        }

        // Keep arrays valid in case they are null or undefined
        event.eventTypes ??= []
        event.languages ??= []
        event.tags ??= []

        original.value = event
        draft.value = cloneEvent(event)
        draft.value.visitorInfoFlags = original.value.visitorInfoFlags
    }

    function clear() {
        original.value = null
        draft.value = null
        error.value = null
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
        // State
        original,
        draft,
        loading,
        saving,
        error,

        // Getters
        isLoaded,
        isDirty,
        isVenueTabEqual,
        isRegisterTabEqual,
        isEventLinksEqual,
        isTicketTabEqual,
        hasDates,
        hasMultipleDates,
        primaryDate,
        effectiveReleaseDate,

        // Actions
        loadFromApi,
        clear,

        // Domain mutations
        addEventDate,
        removeEventDate,
        addTag,
        removeTag
    }
})
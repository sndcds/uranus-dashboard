/*
    src/store/uranusEventsFilterStore.ts
*/

import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { UranusVenueSelectItemInfo } from '@/domain/venue/UranusVenue'

export interface UranusEventsFilter {
    search: string | null
    city: string | null
    startDate?: string | null
    endDate?: string | null
    venue: UranusVenueSelectItemInfo | null
    useCurrentLocation: boolean
    radiusKm: number
    latitude?: number | null
    longitude?: number | null
    minAge?: number | null
    maxAge?: number | null
    priceType?: string,
    maxPrice?: number | null
    priceCurrency?: string
    eventTypeIds: number[]
}

const defaultFilter: UranusEventsFilter = {
    search: "",
    city: "",
    startDate: "",
    endDate: "",
    venue: { id: -1, name: "" },
    useCurrentLocation: false,
    radiusKm: 10.0,
    latitude: null,
    longitude: null,
    minAge: null,
    maxAge: null,
    priceType: 'not_specified',
    maxPrice: null,
    priceCurrency: 'EUR',
    eventTypeIds: []
}

export const useEventsFilterStore = defineStore("calendarFilter", () => {

    const filter = ref<UranusEventsFilter>({ ...defaultFilter })
    const eventTypeIds = computed(() => filter.value.eventTypeIds)

    // Load saved filter from localStorage
    const saved = localStorage.getItem("calendar-filter")
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            filter.value = { ...defaultFilter, ...parsed }
        } catch {
            filter.value = { ...defaultFilter }
        }
    }

    // Persist automatically whenever filter changes
    watch(
        filter,
        (value) => {
            localStorage.setItem("calendar-filter", JSON.stringify(value))
        },
        { deep: true }
    )

    function setFilter(newFilter: Partial<UranusEventsFilter>) {
        Object.assign(filter.value, newFilter)
    }

    function resetFilter() {
        filter.value = { ...defaultFilter }
    }

    // NEW: toggle event type
    function toggleEventType(typeId: number) {
        const list = filter.value.eventTypeIds

        if (list.includes(typeId)) {
            filter.value.eventTypeIds = list.filter(id => id !== typeId)
        } else {
            filter.value.eventTypeIds.push(typeId)
        }
    }

    return {
        filter,
        eventTypeIds,
        setFilter,
        resetFilter,
        toggleEventType
    }
})
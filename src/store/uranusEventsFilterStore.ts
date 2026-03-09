/*
    src/store/uranusEventsFilterStore.ts
*/

import { defineStore } from "pinia"
import { ref, watch } from "vue"
import type { UranusVenueSelectItemInfo } from "@/domain/venue/UranusVenue"

export interface UranusEventsFilter {
    search: string | null
    city: string | null
    startDate?: string | null
    endDate?: string | null
    venue: UranusVenueSelectItemInfo | null

    // Location-specific fields
    useCurrentLocation?: boolean
    radiusKm: number
}

const defaultFilter: UranusEventsFilter = {
    search: "",
    city: "",
    startDate: "",
    endDate: "",
    venue: { id: -1, name: "" },
    useCurrentLocation: false,
    radiusKm: 10.0
}

export const useEventsFilterStore = defineStore("calendarFilter", () => {

    const filter = ref<UranusEventsFilter>({ ...defaultFilter })

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

    return {
        filter,
        setFilter,
        resetFilter
    }
})
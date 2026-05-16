/*
    src/store/eventsFilterStore.ts
 */

import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { type VenueSelectInfo } from '@/domain/venue/venueSelectInfo.model.ts'

export interface UranusEventsFilter {
    categories: number[] | null
    search: string | null
    city: string | null
    dateRangeMode?: UranusEventsDateRangeMode
    startDate?: string | null
    endDate?: string | null
    venue: VenueSelectInfo | null
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
    portalUuid?: string | null
    portalPrefilter?: {
        age?: string | number | null
        venues?: string | number | null
    } | null
}

export type UranusEventsFilterScope = 'default' | 'venue' | 'portal'
export type UranusEventsDateRangeMode = 'all_events' | 'today' | 'tomorrow' | 'weekend' | 'next_week' | 'custom'

const defaultFilter: UranusEventsFilter = {
    categories: null,
    search: '',
    city: '',
    dateRangeMode: 'today',
    startDate: '',
    endDate: '',
    venue: { uuid: '', name: '' },
    useCurrentLocation: false,
    radiusKm: 10.0,
    latitude: null,
    longitude: null,
    minAge: null,
    maxAge: null,
    priceType: 'not_specified',
    maxPrice: null,
    priceCurrency: 'EUR',
    eventTypeIds: [],
    portalUuid: null,
    portalPrefilter: null
}

function createDefaultFilter(): UranusEventsFilter {
    return {
        categories: null,
        search: '',
        city: '',
        dateRangeMode: 'today',
        startDate: '',
        endDate: '',
        venue: { uuid: '', name: '' },
        useCurrentLocation: false,
        radiusKm: 10.0,
        latitude: null,
        longitude: null,
        minAge: null,
        maxAge: null,
        priceType: 'not_specified',
        maxPrice: null,
        priceCurrency: 'EUR',
        eventTypeIds: [],
        portalUuid: null,
        portalPrefilter: null
    }
}

function cloneFilter(filter: Partial<UranusEventsFilter> = {}): UranusEventsFilter {
    return {
        ...createDefaultFilter(),
        ...filter,
        categories: filter.categories ? [...filter.categories] : null,
        venue: filter.venue ? { ...filter.venue } : null,
        eventTypeIds: filter.eventTypeIds ? [...filter.eventTypeIds] : [],
        portalPrefilter: filter.portalPrefilter ? { ...filter.portalPrefilter } : null
    }
}

function normalizeLegacyDateRangeMode(filter: Partial<UranusEventsFilter>): Partial<UranusEventsFilter> {
    if (filter.dateRangeMode) return filter

    const hasStartDate = Boolean(filter.startDate)
    const hasEndDate = Boolean(filter.endDate)
    if (!hasStartDate && !hasEndDate) {
        return {
            ...filter,
            dateRangeMode: 'all_events'
        }
    }

    return {
        ...filter,
        dateRangeMode: 'custom'
    }
}

export const useEventsFilterStore = defineStore("calendarFilter", () => {
    const filters = ref<Record<UranusEventsFilterScope, UranusEventsFilter>>({
        default: createDefaultFilter(),
        venue: createDefaultFilter(),
        portal: createDefaultFilter()
    })
    const filter = computed({
        get: () => filters.value.default,
        set: (value: UranusEventsFilter) => {
            filters.value.default = cloneFilter(value)
        }
    })
    const eventTypeIds = computed(() => filters.value.default.eventTypeIds)

    // Load saved filter from localStorage
    const saved = localStorage.getItem("calendar-filter")
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            filters.value.default = cloneFilter(normalizeLegacyDateRangeMode(parsed))
        } catch {
            filters.value.default = cloneFilter(defaultFilter)
        }
    }

    // Persist only the default scope. Route-local scopes are derived at runtime.
    watch(
        () => filters.value.default,
        (value) => {
            localStorage.setItem("calendar-filter", JSON.stringify(value))
        },
        { deep: true }
    )

    function getFilter(scope: UranusEventsFilterScope = 'default') {
        return filters.value[scope]
    }

    function setFilter(
        newFilter: Partial<UranusEventsFilter>,
        scope: UranusEventsFilterScope = 'default'
    ) {
        Object.assign(filters.value[scope], newFilter)
    }

    function resetFilter(scope: UranusEventsFilterScope = 'default') {
        filters.value[scope] = createDefaultFilter()
    }

    function copyFilter(
        fromScope: UranusEventsFilterScope,
        toScope: UranusEventsFilterScope
    ) {
        filters.value[toScope] = cloneFilter(filters.value[fromScope])
    }

    // Toggle event type
    function toggleEventType(typeId: number, scope: UranusEventsFilterScope = 'default') {
        const list = filters.value[scope].eventTypeIds

        if (list.includes(typeId)) {
            filters.value[scope].eventTypeIds = list.filter(id => id !== typeId)
        } else {
            filters.value[scope].eventTypeIds.push(typeId)
        }
    }

    return {
        filters,
        filter,
        eventTypeIds,
        getFilter,
        setFilter,
        resetFilter,
        copyFilter,
        toggleEventType
    }
})

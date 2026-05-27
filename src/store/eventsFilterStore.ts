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
        venues?: string | number | string[] | null
    } | null
}

export type UranusEventsFilterScope = 'default' | 'venue' | 'portal'
export type UranusEventsDateRangeMode = 'all_events' | 'today' | 'tomorrow' | 'weekend' | 'next_week' | 'following_weekend' | 'custom'
export type UranusPortalEventsDateRangeMode = Exclude<UranusEventsDateRangeMode, 'custom'>

const PORTAL_DATE_RANGE_STORAGE_KEY = 'portal-date-range-mode'
const portalDateRangeModes: UranusPortalEventsDateRangeMode[] = [
    'all_events',
    'today',
    'tomorrow',
    'weekend',
    'next_week',
    'following_weekend'
]

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
        dateRangeMode: 'all_events',
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

function isPortalDateRangeMode(value: unknown): value is UranusPortalEventsDateRangeMode {
    return portalDateRangeModes.includes(value as UranusPortalEventsDateRangeMode)
}

export const useEventsFilterStore = defineStore("calendarFilter", () => {
    const filters = ref<Record<UranusEventsFilterScope, UranusEventsFilter>>({
        default: createDefaultFilter(),
        venue: createDefaultFilter(),
        portal: createDefaultFilter()
    })
    const portalDateRangeMode = ref<UranusPortalEventsDateRangeMode>('all_events')
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

    const savedPortalDateRangeMode = localStorage.getItem(PORTAL_DATE_RANGE_STORAGE_KEY)
    if (isPortalDateRangeMode(savedPortalDateRangeMode)) {
        portalDateRangeMode.value = savedPortalDateRangeMode
    }

    // Persist only the default scope. Route-local scopes are derived at runtime.
    watch(
        () => filters.value.default,
        (value) => {
            localStorage.setItem("calendar-filter", JSON.stringify(value))
        },
        { deep: true }
    )

    watch(portalDateRangeMode, (value) => {
        localStorage.setItem(PORTAL_DATE_RANGE_STORAGE_KEY, value)
    })

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

    function setPortalDateRangeMode(mode: UranusPortalEventsDateRangeMode) {
        portalDateRangeMode.value = mode
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
        portalDateRangeMode,
        getFilter,
        setFilter,
        resetFilter,
        setPortalDateRangeMode,
        copyFilter,
        toggleEventType
    }
})

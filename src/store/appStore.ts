import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CalendarFiltersState {
    searchQuery: string
    selectedDate: string | null
    selectedEndDate: string | null
    selectedType: string
    activeSelectedType: number | string | null
    selectedVenue: EventVenueSummary | null
    selectedOrganization: EventOrganizationSummary | null
    showMyLocation: boolean
    userLatitude: number | null
    userLongitude: number | null
    locationRadius: number
}

export interface EventVenueSummary {
    id: number
    name: string
    city: string
    eventDateCount: number
}

export interface EventOrganizationSummary {
    id: number
    name: string
    city?: string
    eventDateCount: number
}

const getDefaultCalendarFilters = (): CalendarFiltersState => ({
    searchQuery: '',
    selectedDate: null,
    selectedEndDate: null,
    selectedType: 'all',
    activeSelectedType: 'all',
    selectedVenue: null,
    selectedOrganization: null,
    showMyLocation: false,
    userLatitude: null,
    userLongitude: null,
    locationRadius: 25,
})

export const useAppStore = defineStore('app', () => {
    // State
    const organizationId = ref<number | null>(null)
    const organizationName = ref<string | null>(null)
    const eventViewMode = ref<'detailed' | 'compact' | 'tiles' | 'map'>('detailed')
    const eventGroupingMode = ref<'daily' | 'monthly'>('daily')
    const calendarFilters = ref<CalendarFiltersState>(getDefaultCalendarFilters())

    // Actions
    function setOrganizationId(id: number | null) {
        organizationId.value = id
    }

    function setOrganizationName(name: string | null) {
        organizationName.value = name
    }

    function setViewMode(mode: 'detailed' | 'compact' | 'tiles' | 'map') {
        eventViewMode.value = mode
    }

    function setGroupingMode(mode: 'daily' | 'monthly') {
        eventGroupingMode.value = mode
    }

    function updateCalendarFilters(filters: Partial<CalendarFiltersState>) {
        calendarFilters.value = {
            ...calendarFilters.value,
            ...filters,
        }
    }

    function resetCalendarFilters() {
        calendarFilters.value = getDefaultCalendarFilters()
    }

    function clearOrganizationId() {
        organizationId.value = null
        organizationName.value = null
    }

    return {
        organizationId,
        organizationName,
        eventViewMode,
        eventGroupingMode,
        calendarFilters,
        setOrganizationId,
        setOrganizationName,
        setViewMode,
        setGroupingMode,
        updateCalendarFilters,
        resetCalendarFilters,
        clearOrganizationId
    }
}, {
    persist: true
})

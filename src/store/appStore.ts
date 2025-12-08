import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface CalendarFiltersState {
    searchQuery: string
    selectedDate: string | null
    selectedEndDate: string | null
    selectedType: string
    activeSelectedType: number | string | null
    selectedVenue: EventVenueSummary | null
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

const getDefaultCalendarFilters = (): CalendarFiltersState => ({
    searchQuery: '',
    selectedDate: null,
    selectedEndDate: null,
    selectedType: 'all',
    activeSelectedType: 'all',
    selectedVenue: null,
    showMyLocation: false,
    userLatitude: null,
    userLongitude: null,
    locationRadius: 25,
})

export const useAppStore = defineStore('app', () => {
    // State
    const organizerId = ref<number | null>(null)
    const organizerName = ref<string | null>(null)
    const eventViewMode = ref<'detailed' | 'compact' | 'tiles' | 'map'>('detailed')
    const eventGroupingMode = ref<'daily' | 'monthly'>('daily')
    const calendarFilters = ref<CalendarFiltersState>(getDefaultCalendarFilters())

    // Actions
    function setOrganizerId(id: number | null) {
        organizerId.value = id
    }

    function setOrganizerName(name: string | null) {
        organizerName.value = name
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

    function clearOrganizerId() {
        organizerId.value = null
        organizerName.value = null
    }

    return {
        organizerId,
        organizerName,
        eventViewMode,
        eventGroupingMode,
        calendarFilters,
        setOrganizerId,
        setOrganizerName,
        setViewMode,
        setGroupingMode,
        updateCalendarFilters,
        resetCalendarFilters,
        clearOrganizerId
    }
}, {
    persist: true
})

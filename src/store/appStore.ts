import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
    // State
    const organizerId = ref<number | null>(null)
    const eventViewMode = ref<'detailed' | 'compact' | 'tiles'>('detailed')
    const eventGroupingMode = ref<'daily' | 'monthly'>('daily')

    // Actions
    function setOrganizerId(id: number | null) {
        organizerId.value = id
    }

    function setViewMode(mode: 'detailed' | 'compact' | 'tiles') {
        eventViewMode.value = mode
    }

    function setGroupingMode(mode: 'daily' | 'monthly') {
        eventGroupingMode.value = mode
    }

    function clearOrganizerId() {
        organizerId.value = null
    }

    return {
        organizerId,
        eventViewMode,
        eventGroupingMode,
        setOrganizerId,
        setViewMode,
        setGroupingMode,
        clearOrganizerId
    }
}, {
    persist: true
})
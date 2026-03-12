import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
    // State
    const organizationId = ref<number | null>(null)
    const organizationName = ref<string | null>(null)
    const eventViewMode = ref<'detailed' | 'compact' | 'tiles' | 'map'>('detailed')
    const eventGroupingMode = ref<'daily' | 'monthly'>('daily')

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

    function clearOrganizationId() {
        organizationId.value = null
        organizationName.value = null
    }

    return {
        organizationId,
        organizationName,
        eventViewMode,
        eventGroupingMode,
        setOrganizationId,
        setOrganizationName,
        setViewMode,
        setGroupingMode,
        clearOrganizationId
    }
}, {
    persist: true
})

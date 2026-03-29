import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
    // State
    const orgUuid = ref<string | null>(null)
    const orgName = ref<string | null>(null)
    const eventViewMode = ref<'detailed' | 'compact' | 'tiles' | 'map'>('detailed')
    const eventGroupingMode = ref<'daily' | 'monthly'>('daily')

    // Actions
    function setOrganizationUuid(uuid: string | null) {
        orgUuid.value = uuid
    }

    function setOrganizationName(name: string | null) {
        orgName.value = name
    }

    function clearOrganization() {
        orgUuid.value = null
        orgName.value = null
    }

    function setViewMode(mode: 'detailed' | 'compact' | 'tiles' | 'map') {
        eventViewMode.value = mode
    }

    function setGroupingMode(mode: 'daily' | 'monthly') {
        eventGroupingMode.value = mode
    }


    return {
        orgUuid,
        orgName,
        eventViewMode,
        eventGroupingMode,
        setOrganizationUuid,
        setOrganizationName,
        clearOrganization,
        setViewMode,
        setGroupingMode,
    }
}, {
    persist: true
})

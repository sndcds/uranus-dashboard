/*
    src/store/appStore.ts
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
    const orgUuid = ref<string | null>(null)
    const orgName = ref<string | null>(null)
    const orgLogoUrl = ref<string | null>(null)
    const orgLightThemeLogoUrl = ref<string | null>(null)
    const orgDarkThemeLogoUrl = ref<string | null>(null)
    const eventViewMode = ref<'detailed' | 'compact' | 'tiles' | 'map'>('detailed')
    const eventGroupingMode = ref<'daily' | 'monthly'>('daily')

    function setOrgValues(uuid: string, name: string, logoUrl: string | null, LightThemeLogoUrl: string | null, darkThemeLogoUrl: string | null) {
        orgUuid.value = uuid
        orgName.value = name
        orgLogoUrl.value = logoUrl
        orgLightThemeLogoUrl.value = LightThemeLogoUrl
        orgDarkThemeLogoUrl.value = darkThemeLogoUrl
    }

    function setOrgUuid(uuid: string | null) {
        orgUuid.value = uuid
    }

    function setOrgName(name: string | null) {
        orgName.value = name
    }

    function clearOrg() {
        orgUuid.value = null
        orgName.value = null
        orgLogoUrl.value = null
        orgLightThemeLogoUrl.value = null
        orgDarkThemeLogoUrl.value = null
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
        orgLogoUrl,
        orgLightThemeLogoUrl,
        orgDarkThemeLogoUrl,
        eventViewMode,
        eventGroupingMode,
        setOrgValues,
        setOrgUuid,
        setOrgName,
        clearOrg,
        setViewMode,
        setGroupingMode,
    }
}, {
    persist: true
})

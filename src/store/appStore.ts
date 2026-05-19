/*
    src/store/appStore.ts
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export type EventViewMode = 'cards' | 'compact' | 'list' | 'calendar' | 'map'
export type EventGroupingMode = 'daily' | 'monthly'

export function isEventViewMode(value: unknown): value is EventViewMode {
    return value === 'cards'
        || value === 'compact'
        || value === 'list'
        || value === 'calendar'
        || value === 'map'
}

export const useAppStore = defineStore('app', () => {
    const orgUuid = ref<string | null>(null)
    const orgName = ref<string | null>(null)
    const orgLogoUrl = ref<string | null>(null)
    const orgLightThemeLogoUrl = ref<string | null>(null)
    const orgDarkThemeLogoUrl = ref<string | null>(null)
    const favoriteListUuid = ref<string | null>(null)
    const favoriteListName = ref<string | null>(null)
    const eventViewMode = ref<EventViewMode>('compact')
    const eventGroupingMode = ref<EventGroupingMode>('daily')

    function setOrgValues(uuid: string, name: string, logoUrl: string | null, lightThemeLogoUrl: string | null, darkThemeLogoUrl: string | null) {
        if (orgUuid.value !== uuid) {
            clearFavoriteList()
        }
        orgUuid.value = uuid
        orgName.value = name
        orgLogoUrl.value = logoUrl
        orgLightThemeLogoUrl.value = lightThemeLogoUrl
        orgDarkThemeLogoUrl.value = darkThemeLogoUrl
    }

    function setOrgUuid(uuid: string | null) {
        if (orgUuid.value !== uuid) {
            clearFavoriteList()
        }
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
        clearFavoriteList()
    }

    function setFavoriteList(uuid: string, name: string) {
        favoriteListUuid.value = uuid
        favoriteListName.value = name
    }

    function clearFavoriteList() {
        favoriteListUuid.value = null
        favoriteListName.value = null
    }

    function setEventViewMode(mode: EventViewMode) {
        eventViewMode.value = mode
    }

    function setViewMode(mode: EventViewMode) {
        setEventViewMode(mode)
    }

    function normalizeEventViewMode() {
        if (!isEventViewMode(eventViewMode.value)) {
            eventViewMode.value = 'compact'
        }
    }

    function setGroupingMode(mode: EventGroupingMode) {
        eventGroupingMode.value = mode
    }

    return {
        orgUuid,
        orgName,
        orgLogoUrl,
        orgLightThemeLogoUrl,
        orgDarkThemeLogoUrl,
        favoriteListUuid,
        favoriteListName,
        eventViewMode,
        eventGroupingMode,
        setOrgValues,
        setOrgUuid,
        setOrgName,
        clearOrg,
        setFavoriteList,
        clearFavoriteList,
        setEventViewMode,
        setViewMode,
        normalizeEventViewMode,
        setGroupingMode,
    }
}, {
    persist: true
})

/*
    src/store/uranusUserStore.ts
*/

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface UranusUserState {
    displayName: string | null
    userUuid: string | null
    avatarVersion: number | null,
    userAvatarUrl: string | null
}

const defaultUserState: UranusUserState = {
    displayName: null,
    userUuid: null,
    avatarVersion: null,
    userAvatarUrl: null
}

export const useUserStore = defineStore("user-state", () => {
    const displayName = ref<UranusUserState['displayName']>(defaultUserState.displayName)
    const userUuid = ref<UranusUserState['userUuid']>(defaultUserState.userUuid)
    const avatarVersion = ref<UranusUserState['avatarVersion']>(defaultUserState.avatarVersion)
    const userAvatarUrl = ref<UranusUserState['userAvatarUrl']>(defaultUserState.userAvatarUrl)

    const userState = computed<UranusUserState>(() => ({
        displayName: displayName.value,
        userUuid: userUuid.value,
        avatarVersion: avatarVersion.value,
        userAvatarUrl: userAvatarUrl.value,
    }))

    function setUserState(newState: Partial<UranusUserState>) {
        if ('displayName' in newState) {
            displayName.value = newState.displayName ?? null
        }
        if ('userUuid' in newState) {
            userUuid.value = newState.userUuid ?? null
        }
        if ('avatarVersion' in newState) {
            avatarVersion.value = newState.avatarVersion ?? null
        }
        if ('userAvatarUrl' in newState) {
            userAvatarUrl.value = newState.userAvatarUrl ?? null
        }
    }

    function resetUserState() {
        setUserState(defaultUserState)
    }

    function setUserUuid(uuid: string | null) {
        userUuid.value = uuid
    }
    function setDisplayName(name: string | null) {
        displayName.value = name
    }
    function setUserAvatarUrl(url: string | null) {
        userAvatarUrl.value = url
    }
    function bumpAvatarVersion() {
        avatarVersion.value = Date.now()
    }

    function clearUserUuid() {
        userUuid.value = null
    }

    function clearDisplayName() {
        displayName.value = null
    }

    return {
        displayName,
        userUuid,
        avatarVersion,
        userAvatarUrl,
        userState,
        setUserState,
        resetUserState,
        setUserUuid,
        setDisplayName,
        setUserAvatarUrl,
        bumpAvatarVersion,
        clearUserUuid,
        clearDisplayName
    }
}, {
    persist: true
})
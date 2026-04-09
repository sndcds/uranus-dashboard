/*
    src/store/userStore.ts
*/

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface UserState {
    uuid: string | null
    displayName: string | null
    avatarVersion: number | null,
    userAvatarUrl: string | null
}

const defaultUserState: UserState = {
    uuid: null,
    displayName: null,
    avatarVersion: null,
    userAvatarUrl: null
}

export const useUserStore = defineStore("user-state", () => {
    const uuid = ref<UserState['uuid']>(defaultUserState.uuid)
    const displayName = ref<UserState['displayName']>(defaultUserState.displayName)
    const avatarVersion = ref<UserState['avatarVersion']>(defaultUserState.avatarVersion)
    const userAvatarUrl = ref<UserState['userAvatarUrl']>(defaultUserState.userAvatarUrl)

    const userState = computed<UserState>(() => ({
        uuid: uuid.value,
        displayName: displayName.value,
        avatarVersion: avatarVersion.value,
        userAvatarUrl: userAvatarUrl.value,
    }))

    function setUserState(newState: Partial<UserState>) {
        if ('displayName' in newState) {
            displayName.value = newState.displayName ?? null
        }
        if ('uuid' in newState) {
            uuid.value = newState.uuid ?? null
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

    function setUserUuid(newUuid: string | null) {
        uuid.value = newUuid
    }
    function setDisplayName(newDisplayName: string | null) {
        displayName.value = newDisplayName
    }
    function setUserAvatarUrl(url: string | null) {
        userAvatarUrl.value = url
    }
    function bumpAvatarVersion() {
        avatarVersion.value = Date.now()
    }

    function clearUserUuid() {
        uuid.value = null
    }

    function clearDisplayName() {
        displayName.value = null
    }

    return {
        displayName,
        userUuid: uuid,
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
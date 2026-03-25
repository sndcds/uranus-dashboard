/*
    src/store/uranusUserStore.ts
*/

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface UranusUserState {
    emailAddress: string | null
    displayName: string | null
    userUuid: string | null
    avatarVersion: number | null,
    userAvatar: string | null
}

const defaultUserState: UranusUserState = {
    emailAddress: null,
    displayName: null,
    userUuid: null,
    avatarVersion: null,
    userAvatar: null
}

export const useUserStore = defineStore("user-state", () => {
    const userState = ref<UranusUserState>({ ...defaultUserState })

    // Load saved state from localStorage
    const saved = localStorage.getItem("user-state")
    if (saved) {
        try {
            const parsed = JSON.parse(saved)
            userState.value = { ...defaultUserState, ...parsed }
        } catch {
            userState.value = { ...defaultUserState }
        }
    }

    // Persist automatically whenever state changes
    watch(
        userState,
        (value) => {
            localStorage.setItem("user-state", JSON.stringify(value))
        },
        { deep: true }
    )

    function setUserState(newState: Partial<UranusUserState>) {
        Object.assign(userState.value, newState)
    }

    function resetUserState() {
        userState.value = { ...defaultUserState }
    }

    // helper shortcuts
    function setUserUuid(uuid: string | null) {
        userState.value.userUuid = uuid;
    }
    function setDisplayName(name: string | null) {
        userState.value.displayName = name;
    }
    function setEmailAddress(email: string | null) {
        userState.value.emailAddress = email;
    }
    function setUserAvatar(url: string | null) {
        userState.value.userAvatar = url;
    }
    function bumpAvatarVersion() {
        userState.value.avatarVersion = Date.now();
    }

    return {
        userState,
        setUserState,
        resetUserState,
        setUserUuid,
        setDisplayName,
        setEmailAddress,
        setUserAvatar,
        bumpAvatarVersion
    }
})
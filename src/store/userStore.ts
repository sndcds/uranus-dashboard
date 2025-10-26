import { defineStore } from 'pinia'

const DISPLAY_NAME_STORAGE_KEY = 'user_display_name'
const USER_ID_STORAGE_KEY = 'user_id'

const getStoredDisplayName = (): string => {
    if (typeof window === 'undefined') {
        return ''
    }
    return window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) || ''
}

const storeDisplayName = (displayName: string) => {
    if (typeof window === 'undefined') return
    if (displayName) {
        window.localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, displayName)
    } else {
        window.localStorage.removeItem(DISPLAY_NAME_STORAGE_KEY)
    }
}

const getStoredUserId = (): string => {
    if (typeof window === 'undefined') {
        return ''
    }
    return window.localStorage.getItem(USER_ID_STORAGE_KEY) || ''
}

const storeUserId = (userId: string) => {
    if (typeof window === 'undefined') return
    if (userId) {
        window.localStorage.setItem(USER_ID_STORAGE_KEY, userId)
    } else {
        window.localStorage.removeItem(USER_ID_STORAGE_KEY)
    }
}

export const useUserStore = defineStore('user', {
    state: () => ({
        displayName: getStoredDisplayName(),
        userId: getStoredUserId(),
        avatarVersion: 0,
    }),

    actions: {
        setUserId(userId: string) {
            this.userId = userId
            storeUserId(userId)
        },

        clearUserId() {
            this.userId = ''
            this.avatarVersion = 0
            storeUserId('')
        },

        loadUserIdFromStorage() {
            if (typeof window === 'undefined') return
            this.userId = window.localStorage.getItem(USER_ID_STORAGE_KEY) || ''
        },

        setDisplayName(displayName: string) {
            this.displayName = displayName
            storeDisplayName(displayName)
        },

        clearDisplayName() {
            this.displayName = ''
            storeDisplayName('')
        },

        loadDisplayNameFromStorage() {
            if (typeof window === 'undefined') return
            this.displayName = window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) || ''
        },

        bumpAvatarVersion() {
            this.avatarVersion = Date.now()
        }
    },
})

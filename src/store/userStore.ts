import { defineStore } from 'pinia'

const DISPLAY_NAME_STORAGE_KEY = 'user_display_name'

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

export const useUserStore = defineStore('user', {
    state: () => ({
        displayName: getStoredDisplayName(),
    }),

    actions: {
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
        }
    },
})
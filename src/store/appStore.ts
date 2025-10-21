import { defineStore } from 'pinia'

const ORGANIZER_STORAGE_KEY = 'active_organizer_id'

const getStoredOrganizerId = (): number | null => {
    if (typeof window === 'undefined') {
        return null
    }
    const raw = window.localStorage.getItem(ORGANIZER_STORAGE_KEY)
    if (!raw) return null
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : null
}

export const useAppStore = defineStore('app', {
    state: () => ({
        organizerId: null as number | null,
    }),

    actions: {
        setOrganizerId(id: number | null) {
            this.organizerId = id
            if (typeof window === 'undefined') return // SSR safety
            if (id === null) {
                window.localStorage.removeItem(ORGANIZER_STORAGE_KEY)
            } else {
                window.localStorage.setItem(ORGANIZER_STORAGE_KEY, String(id))
            }
        },

        loadOrganizerIdFromStorage() {
            if (typeof window === 'undefined') return
            const stored = window.localStorage.getItem(ORGANIZER_STORAGE_KEY)
            this.organizerId = stored ? Number(stored) : null
        }
    },
})
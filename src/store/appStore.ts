import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
    state: () => ({
        organizerId: null as number | null,
    }),
    actions: {
        setOrganizerId(id: number) {
            this.organizerId = id
        },
    },
})
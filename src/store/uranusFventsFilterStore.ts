// src/store/eventsFilterStore.ts
import { defineStore } from 'pinia'
import { type Component } from 'vue'

export const useEventsFilterStore = defineStore('filter', {
    state: () => ({
        // a dynamic component to render inside the header filter area
        content: null as Component | null
    }),
    actions: {
        setFilterContent(component: Component | null) {
            this.content = component
        }
    }
})
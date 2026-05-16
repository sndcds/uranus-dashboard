/*
    src/store/mapViewStore.ts
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'

export type MapViewKey = 'events' | 'venues'

export type UranusMapViewState = {
    center: [number, number]
    zoom: number
    bearing: number
    pitch: number
    bbox: [number, number, number, number]
}

export const useMapViewStore = defineStore('mapView', () => {
    const views = ref<Partial<Record<MapViewKey, UranusMapViewState>>>({})

    function getView(key: MapViewKey) {
        return views.value[key] ?? null
    }

    function setView(key: MapViewKey, view: UranusMapViewState) {
        views.value[key] = view
    }

    return {
        views,
        getView,
        setView,
    }
}, {
    persist: true,
})

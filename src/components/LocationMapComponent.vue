<template>
    <div class="map-wrapper">
        <div ref="mapContainer" class="leaflet-map"></div>
        <footer class="map-footer">
            <slot name="footer" />
        </footer>
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { LatLngLiteral, Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png?url'
import markerIcon from 'leaflet/dist/images/marker-icon.png?url'
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url'

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

L.Marker.prototype.options.icon = defaultIcon

const props = defineProps<{
    modelValue: LatLngLiteral | null
    zoom?: number
    minZoom?: number
    maxZoom?: number
}>()

const emit = defineEmits<{
    (event: 'update:modelValue', value: LatLngLiteral | null): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const mapInstance = ref<LeafletMap | null>(null)
const markerInstance = ref<LeafletMarker | null>(null)

const initialCenter: LatLngLiteral = props.modelValue || { lat: 52.52, lng: 13.405 } // defaults to Berlin
const defaultZoom = props.zoom ?? 12

const mountTileLayer = (map: LeafletMap) => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: props.minZoom ?? 2,
        maxZoom: props.maxZoom ?? 19,
    }).addTo(map)
}

const setMarker = (coords: LatLngLiteral) => {
    if (!mapInstance.value) return

    if (!markerInstance.value) {
        markerInstance.value = L.marker(coords, { draggable: false }).addTo(mapInstance.value)
    } else {
        markerInstance.value.setLatLng(coords)
    }
}

const clearMarker = () => {
    if (markerInstance.value) {
        markerInstance.value.remove()
        markerInstance.value = null
    }
}

const handleClick = (event: L.LeafletMouseEvent) => {
    const coords = event.latlng
    setMarker(coords)
    emit('update:modelValue', { lat: coords.lat, lng: coords.lng })
}

onMounted(() => {
    if (!mapContainer.value) return

    mapInstance.value = L.map(mapContainer.value, {
        center: initialCenter,
        zoom: defaultZoom,
        attributionControl: true,
    })

    mountTileLayer(mapInstance.value)

    if (props.modelValue) {
        setMarker(props.modelValue)
    }

    mapInstance.value.on('click', handleClick)
})

onBeforeUnmount(() => {
    if (mapInstance.value) {
        mapInstance.value.off('click', handleClick)
        mapInstance.value.remove()
    }
    markerInstance.value = null
})

watch(
    () => props.modelValue,
    (coords) => {
        if (!mapInstance.value) return

        if (!coords) {
            clearMarker()
            return
        }

        setMarker(coords)
        mapInstance.value.setView(coords, mapInstance.value.getZoom(), { animate: true })
    }
)
</script>

<style scoped lang="scss">
.map-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: 100%;
}

.leaflet-map {
    flex: 1;
    width: 100%;
    min-height: 280px;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 16px 32px rgba(15, 23, 42, 0.2);
    cursor: crosshair;

    :global(.leaflet-control-container .leaflet-top, .leaflet-control-container .leaflet-bottom) {
        padding: 0.75rem;
    }
}

.map-footer {
    font-size: 0.85rem;
    color: rgba(55, 65, 81, 0.75);
}
</style>

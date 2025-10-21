<template>
    <div class="map-wrapper">
        <div ref="mapContainer" class="leaflet-map"></div>
        <footer class="map-footer">
            <slot name="footer" />
        </footer>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { LatLngLiteral, LeafletEvent, Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
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
    modelValue?: LatLngLiteral | null
    latitude?: number | null
    longitude?: number | null
    zoom?: number
    minZoom?: number
    maxZoom?: number
    selectable?: boolean
}>()

const emit = defineEmits<{
    (event: 'update:modelValue', value: LatLngLiteral | null): void
}>()

const mapContainer = ref<HTMLDivElement | null>(null)
const mapInstance = ref<LeafletMap | null>(null)
const markerInstance = ref<LeafletMarker | null>(null)

const resolvedCoords = computed<LatLngLiteral | null>(() => {
    if (props.modelValue) {
        return props.modelValue
    }
    if (props.latitude != null && props.longitude != null) {
        return { lat: props.latitude, lng: props.longitude }
    }
    return null
})

const initialCenter: LatLngLiteral = resolvedCoords.value || { lat: 52.52, lng: 13.405 } // defaults to Berlin
const defaultZoom = props.zoom ?? 12
const isSelectable = computed(() => props.selectable !== false)

const mountTileLayer = (map: LeafletMap) => {
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        minZoom: props.minZoom ?? 2,
        maxZoom: props.maxZoom ?? 19,
    }).addTo(map)
}

const handleMarkerDragEnd = (event: LeafletEvent) => {
    const marker = event.target as LeafletMarker
    const { lat, lng } = marker.getLatLng()
    emit('update:modelValue', { lat, lng })
}

const syncMarkerDraggable = () => {
    const marker = markerInstance.value
    if (!marker) return

    marker.off('dragend', handleMarkerDragEnd)

    if (isSelectable.value) {
        marker.dragging?.enable()
        marker.on('dragend', handleMarkerDragEnd)
    } else {
        marker.dragging?.disable()
    }
}

const setMarker = (coords: LatLngLiteral) => {
    if (!mapInstance.value) return

    if (!markerInstance.value) {
        markerInstance.value = L.marker(coords, { draggable: isSelectable.value }).addTo(mapInstance.value)
    } else {
        markerInstance.value.setLatLng(coords)
    }
    syncMarkerDraggable()
}

const clearMarker = () => {
    if (markerInstance.value) {
        markerInstance.value.off('dragend', handleMarkerDragEnd)
        markerInstance.value.remove()
        markerInstance.value = null
    }
}

const handleClick = (event: L.LeafletMouseEvent) => {
    if (!isSelectable.value) return
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
        dragging: true,
    })

    mountTileLayer(mapInstance.value)
    mapInstance.value.dragging.enable()
    mapInstance.value.scrollWheelZoom.enable()
    mapInstance.value.touchZoom.enable()
    mapInstance.value.boxZoom.enable()

    const initialCoords = resolvedCoords.value
    if (initialCoords) {
        setMarker(initialCoords)
    }

    if (isSelectable.value) {
        mapInstance.value.on('click', handleClick)
    }
})

onBeforeUnmount(() => {
    if (mapInstance.value) {
        mapInstance.value.off('click', handleClick)
        mapInstance.value.remove()
    }
    clearMarker()
})

watch(
    () => resolvedCoords.value,
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

watch(
    () => props.selectable,
    () => {
        if (!mapInstance.value) return
        mapInstance.value.off('click', handleClick)
        if (isSelectable.value) {
            mapInstance.value.on('click', handleClick)
        }
        mapInstance.value.dragging.enable()
        syncMarkerDraggable()
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
    cursor: grab;

    &:active {
        cursor: grabbing;
    }

    :global(.leaflet-control-container .leaflet-top, .leaflet-control-container .leaflet-bottom) {
        padding: 0.75rem;
    }

    :global(.leaflet-dragging &) {
        cursor: grabbing;
    }
}

.map-footer {
    font-size: 0.85rem;
    color: rgba(55, 65, 81, 0.75);
}
</style>

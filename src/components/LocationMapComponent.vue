<template>
    <div ref="mapContainer" class="leaflet-map"></div>
    <footer class="map-footer">
      <!--slot name="footer" /-->
    </footer>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { LatLngLiteral, Map as LeafletMap, Marker as LeafletMarker } from 'leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Import your custom marker images
import markerIcon from '@/assets/marker.png'
import markerIconRetina from '@/assets/marker-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png?url'

// Configure Leaflet default icon
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
  if (props.modelValue) return props.modelValue
  if (props.latitude != null && props.longitude != null) return { lat: props.latitude, lng: props.longitude }
  return null
})

const initialCenter: LatLngLiteral = resolvedCoords.value || { lat: 52.52, lng: 13.405 } // Berlin default
const defaultZoom = props.zoom ?? 12
const isSelectable = computed(() => props.selectable !== false)

const mountTileLayer = (map: LeafletMap) => {
  L.tileLayer('https://tiles.oklabflensburg.de/sgm/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    minZoom: props.minZoom ?? 2,
    maxZoom: props.maxZoom ?? 19
  }).addTo(map)
}

const setMarker = (coords: LatLngLiteral) => {
  if (!mapInstance.value) return

  if (!markerInstance.value) {
    markerInstance.value = L.marker(coords, { draggable: isSelectable.value }).addTo(mapInstance.value)
  } else {
    markerInstance.value.setLatLng(coords)
  }

  // Enable/disable dragging based on selectable prop
  if (isSelectable.value) {
    markerInstance.value.dragging?.enable()
    markerInstance.value.on('dragend', handleMarkerDragEnd)
  } else {
    markerInstance.value.dragging?.disable()
    markerInstance.value.off('dragend', handleMarkerDragEnd)
  }
}

const clearMarker = () => {
  if (markerInstance.value) {
    markerInstance.value.off('dragend', handleMarkerDragEnd)
    markerInstance.value.remove()
    markerInstance.value = null
  }
}

const handleMarkerDragEnd = (event: L.LeafletEvent) => {
  const marker = event.target as LeafletMarker
  const { lat, lng } = marker.getLatLng()
  emit('update:modelValue', { lat, lng })
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
    dragging: true
  })

  mountTileLayer(mapInstance.value)

  if (resolvedCoords.value) setMarker(resolvedCoords.value)

  if (isSelectable.value) mapInstance.value.on('click', handleClick)
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
      if (!markerInstance.value) return
      if (isSelectable.value) {
        markerInstance.value.dragging?.enable()
        markerInstance.value.on('dragend', handleMarkerDragEnd)
      } else {
        markerInstance.value.dragging?.disable()
        markerInstance.value.off('dragend', handleMarkerDragEnd)
      }
    }
)
</script>

<style scoped lang="scss">
.map-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%; /* ensure it can shrink/grow */
}

.leaflet-map {
  width: 100%;         /* take full width of wrapper */
  height: 400px;
  border-radius: var(--uranus-tiny-border-radius);
  overflow: hidden;
  cursor: grab;
  max-width: 100%;     /* prevent overflowing parent */

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
  color: var(--muted-text);
}
</style>
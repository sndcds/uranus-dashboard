<!--
  src/component/uranus/UranusMapLocationPicker.vue
-->

<template>
  <div class="map-wrapper" v-bind="attrs">
    <UranusMapRenderer
        :layers="layers"
        :center="computedCenter"
        :zoom="props.zoom ?? 12"
        :mapStyle="mapStyle"
        @loaded="onMapLoaded"
    />

    <footer class="map-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  useAttrs
} from 'vue'
import type { FeatureCollection } from 'geojson'
import type { Map as MapLibreMap, MapMouseEvent } from 'maplibre-gl'
import UranusMapRenderer, { type MapLayer } from '@/component/map/UranusMapRenderer.vue'
import markerIcon from '@/assets/map/marker.png'
import { useThemeStore } from '@/store/themeStore.ts'


const themeStore = useThemeStore()
const attrs = useAttrs()

/* ------------------------------------------------------------------
 * Props / Emits
 * ------------------------------------------------------------------ */
const props = defineProps<{
  modelValue?: { lat: number; lng: number } | null
  zoom?: number
  selectable?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { lat: number; lng: number } | null): void
}>()

/* ------------------------------------------------------------------
 * State
 * ------------------------------------------------------------------ */
const map = ref<MapLibreMap | null>(null)
const isDragging = ref(false)

const isSelectable = computed(() => props.selectable !== false)

/* ------------------------------------------------------------------
 * Map Style
 * ------------------------------------------------------------------ */
const mapStyle = computed(() =>
    themeStore.theme === 'dark'
        ? '/versatiles/versatiles-dark-style.json'
        : '/versatiles/versatiles-style.json'
)

/* ------------------------------------------------------------------
 * Marker Data (GeoJSON)
 * ------------------------------------------------------------------ */
const markerData = ref<FeatureCollection>(
    props.modelValue
        ? {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [
                  props.modelValue.lng,
                  props.modelValue.lat
                ]
              },
              properties: {}
            }
          ]
        }
        : {
          type: 'FeatureCollection',
          features: []
        }
)

const setMarker = (lng: number, lat: number) => {
  markerData.value = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {}
      }
    ]
  }
}

const clearMarker = () => {
  markerData.value = {
    type: 'FeatureCollection',
    features: []
  }
}

/* ------------------------------------------------------------------
 * Modifier key helper
 * ------------------------------------------------------------------ */
const isModifierPressed = (e: MouseEvent) =>
    e.ctrlKey || e.metaKey

/* ------------------------------------------------------------------
 * Layer Definition
 * ------------------------------------------------------------------ */
const layers = computed<MapLayer[]>(() => [
  {
    id: 'marker-layer',
    sourceId: 'marker',
    type: 'symbol',
    data: markerData.value,
    layout: {
      'icon-image': 'marker',
      'icon-size': 0.8,
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true
    },
    events: {
      mousedown: onMarkerMouseDown,
      mouseenter: () => {
        if (isSelectable.value && map.value) {
          map.value.getCanvas().style.cursor = 'grab'
        }
      },
      mouseleave: () => {
        if (!isDragging.value && map.value) {
          map.value.getCanvas().style.cursor = ''
        }
      }
    }
  }
])

/* ------------------------------------------------------------------
 * Map Loaded
 * ------------------------------------------------------------------ */
const onMapLoaded = (m: MapLibreMap) => {
  map.value = m

  // Load marker image
  const img = new Image()
  img.src = markerIcon
  img.onload = () => {
    if (!m.hasImage('marker')) {
      m.addImage('marker', img)
    }
  }

  // Map-level events
  m.on('mousemove', onMapMouseMove)
  m.on('mouseup', onMapMouseUp)
  m.on('click', onMapClick)
}

/* ------------------------------------------------------------------
 * Drag Logic
 * ------------------------------------------------------------------ */
const onMarkerMouseDown = (e: MapMouseEvent) => {
  if (!isSelectable.value || !map.value) return

  const original = e.originalEvent as MouseEvent
  if (!isModifierPressed(original)) return

  e.preventDefault()
  isDragging.value = true
  map.value.getCanvas().style.cursor = 'grabbing'
}

const onMapMouseMove = (e: MapMouseEvent) => {
  if (!isDragging.value || !isSelectable.value) return
  setMarker(e.lngLat.lng, e.lngLat.lat)
}

const onMapMouseUp = (e: MapMouseEvent) => {
  if (!isDragging.value || !isSelectable.value) return

  isDragging.value = false
  map.value!.getCanvas().style.cursor = ''

  emit('update:modelValue', {
    lat: e.lngLat.lat,
    lng: e.lngLat.lng
  })
}

/* ------------------------------------------------------------------
 * Click to place marker
 * ------------------------------------------------------------------ */
const onMapClick = (e: MapMouseEvent) => {
  if (!isSelectable.value || isDragging.value) return

  const original = e.originalEvent as MouseEvent
  if (!isModifierPressed(original)) return

  setMarker(e.lngLat.lng, e.lngLat.lat)

  emit('update:modelValue', {
    lat: e.lngLat.lat,
    lng: e.lngLat.lng
  })
}

/* ------------------------------------------------------------------
 * Center handling
 * ------------------------------------------------------------------ */
const computedCenter = computed(() => {
  return props.modelValue
      ? [props.modelValue.lng, props.modelValue.lat]
      : [13.405, 52.52]
})

/* ------------------------------------------------------------------
 * External model updates
 * ------------------------------------------------------------------ */
watch(
    () => props.modelValue,
    (val) => {
      if (!map.value) return

      if (!val) {
        clearMarker()
        return
      }

      setMarker(val.lng, val.lat)

      map.value.easeTo({
        center: [val.lng, val.lat]
      })
    }
)
</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.map-footer {
  flex-shrink: 0;
}
</style>
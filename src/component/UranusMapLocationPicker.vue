<!--
  UranusMapLocationPicker.vue

  2026-02-08, Roald
-->

<template>
  <div class="map-wrapper" v-bind="attrs">
    <div ref="mapContainer" class="maplibre-map"></div>
    <footer class="map-footer">
      <slot name="footer" />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, useAttrs } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { LngLatLike, MapMouseEvent } from 'maplibre-gl'
import markerIcon from '@/assets/marker.png'

const attrs = useAttrs()

/* ------------------------------------------------------------------
 * Props / Emits
 * ------------------------------------------------------------------ */
const props = defineProps<{
  modelValue?: { lat: number; lng: number } | null
  zoom?: number
  selectable?: boolean
  minZoom?: number
  maxZoom?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: { lat: number; lng: number } | null): void
}>()

/* ------------------------------------------------------------------
 * State
 * ------------------------------------------------------------------ */
const mapContainer = ref<HTMLElement | null>(null)
const map = ref<maplibregl.Map | null>(null)

const isSelectable = computed(() => props.selectable !== false)
const isDragging = ref(false)

/* ------------------------------------------------------------------
 * Constants
 * ------------------------------------------------------------------ */
const MARKER_SOURCE = 'marker'
const MARKER_LAYER = 'marker-layer'

/* ------------------------------------------------------------------
 * Helpers
 * ------------------------------------------------------------------ */
const setMarker = (lng: number, lat: number) => {
  const m = map.value
  if (!m) return

  const source = m.getSource(MARKER_SOURCE) as maplibregl.GeoJSONSource | undefined
  if (!source) {
    console.warn('Marker source not ready yet, skipping setMarker')
    return
  }

  source.setData({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lng, lat] },
        properties: {},
      },
    ],
  })
}

const clearMarker = () => {
  const m = map.value
  if (!m) return
  const source = m.getSource(MARKER_SOURCE) as maplibregl.GeoJSONSource
  source.setData({ type: 'FeatureCollection', features: [] })
}

/* ------------------------------------------------------------------
 * Drag / Click handlers with modifier key support
 * ------------------------------------------------------------------ */
const isModifierPressed = (e: MouseEvent) => e.ctrlKey || e.metaKey

// Marker drag start
const onMarkerMouseDown = (e: maplibregl.MapMouseEvent) => {
  if (!isSelectable.value || !map.value) return

  const original = e.originalEvent as MouseEvent
  if (!isModifierPressed(original)) return // only allow drag if key is pressed

  e.preventDefault()
  isDragging.value = true
  map.value.getCanvas().style.cursor = 'grabbing'
}

// Dragging
const onMapMouseMove = (e: maplibregl.MapMouseEvent) => {
  if (!isDragging.value || !isSelectable.value) return
  setMarker(e.lngLat.lng, e.lngLat.lat)
}

// Drop / finish drag
const onMapMouseUp = (e: maplibregl.MapMouseEvent) => {
  if (!isDragging.value || !isSelectable.value) return
  isDragging.value = false
  map.value!.getCanvas().style.cursor = ''
  emit('update:modelValue', { lat: e.lngLat.lat, lng: e.lngLat.lng })
}

// Click-to-place marker
const onMapClick = (e: maplibregl.MapMouseEvent) => {
  if (!isSelectable.value || isDragging.value) return

  const original = e.originalEvent as MouseEvent
  if (!isModifierPressed(original)) return // only place marker if key is pressed

  setMarker(e.lngLat.lng, e.lngLat.lat)
  emit('update:modelValue', { lat: e.lngLat.lat, lng: e.lngLat.lng })
}

/* ------------------------------------------------------------------
 * Mount
 * ------------------------------------------------------------------ */
// Mount
onMounted(() => {
  if (!mapContainer.value) return

  const m = new maplibregl.Map({
    container: mapContainer.value,
    center: props.modelValue
        ? [props.modelValue.lng, props.modelValue.lat]
        : [13.405, 52.52],
    zoom: props.zoom ?? 12,
    minZoom: props.minZoom ?? 2,
    maxZoom: props.maxZoom ?? 19,
    style: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
        },
      },
      layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
    },
  })

  m.addControl(new maplibregl.NavigationControl())
  map.value = m

  m.on('load', () => {
    const img = new Image()
    img.src = markerIcon
    img.onload = () => {
      if (!m.hasImage('marker')) m.addImage('marker', img)

      m.addSource(MARKER_SOURCE, {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      })

      m.addLayer({
        id: MARKER_LAYER,
        type: 'symbol',
        source: MARKER_SOURCE,
        layout: {
          'icon-image': 'marker',
          'icon-size': 0.8,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
        },
      })

      if (props.modelValue) {
        setMarker(props.modelValue.lng, props.modelValue.lat)
      }

      // Marker drag start
      m.on('mousedown', MARKER_LAYER, onMarkerMouseDown)
      m.on('mouseenter', MARKER_LAYER, () => {
        if (isSelectable.value) m.getCanvas().style.cursor = 'grab'
      })
      m.on('mouseleave', MARKER_LAYER, () => {
        if (!isDragging.value) m.getCanvas().style.cursor = ''
      })
    }
  })

  // Map drag
  m.on('mousemove', onMapMouseMove)
  m.on('mouseup', onMapMouseUp)

  // Click-to-place marker: **attach your function**
  m.on('click', onMapClick)
})

/* ------------------------------------------------------------------
 * Watch external model updates
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
      map.value.easeTo({ center: [val.lng, val.lat] })
    }
)

onBeforeUnmount(() => {
  map.value?.remove()
})
</script>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
}

.maplibre-map {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border: 2px solid var(--uranus-bg-color-d2);
}
</style>
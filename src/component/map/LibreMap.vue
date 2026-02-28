<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { FeatureCollection } from 'geojson'
import maplibregl, { Popup, type LngLatLike } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import markerIcon from '@/assets/marker.png'

// ----------------------- Props -----------------------
const props = defineProps<{
  // The parent can pass multiple layers keyed by layer name
  layers: Record<
      string,
      { data: FeatureCollection; cluster?: boolean; icon?: string }
  >
  // Optional map settings
  center?: LngLatLike
  zoom?: number
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = ref<maplibregl.Map | null>(null)
let currentPopup: Popup | null = null

// Default map settings
const defaultCenter: LngLatLike = props.center ?? [9.5, 54.3]
const defaultZoom = props.zoom ?? 8

// ----------------------- Utils -----------------------
type PopupProperties = Record<string, unknown>

const normalizeProperties = (raw: unknown): PopupProperties =>
    raw && typeof raw === 'object' ? (raw as PopupProperties) : {}

const escapeHtml = (value: string): string =>
    value.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

const pickString = (props: PopupProperties, keys: string[], fallback = ''): string => {
  for (const key of keys) {
    const value = props[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return fallback
}

const pickNumber = (props: PopupProperties, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = props[key]
    if (typeof value === 'number' && !isNaN(value)) return value
    if (typeof value === 'string' && value.trim()) {
      const n = Number(value)
      if (!isNaN(n)) return n
    }
  }
  return undefined
}

const buildPopupHtml = (properties: PopupProperties, coordinates: [number, number]): string => {
  const title = pickString(properties, ['venue_name', 'event_title', 'name', 'title'], 'Unbenannter Ort')
  const city = pickString(properties, ['venue_city', 'city', 'event_city'])
  const address = pickString(properties, ['venue_address', 'address', 'street'])
  const metaLines = [city, address].filter(Boolean).join(' · ')

  return `
    <div class="uranus-map-popup">
      <div class="uranus-map-popup__header">
        <span class="uranus-map-popup__title-text">${escapeHtml(title)}</span>
        <button class="uranus-map-popup__close" type="button" data-map-popup-close aria-label="Popup schließen">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="uranus-map-popup__body">
        <p class="uranus-map-popup__meta">${escapeHtml(metaLines) || 'Keine weiteren Angaben'}</p>
      </div>
    </div>
  `
}

const attachPopupInteractions = (popup: Popup | null) => {
  if (!popup) return
  const button = popup.getElement()?.querySelector<HTMLButtonElement>('[data-map-popup-close]')
  if (!button) return
  button.addEventListener('click', () => popup.remove(), { once: true })
}

// ----------------------- Map Setup -----------------------
onMounted(async () => {
  if (!mapContainer.value) return

  const map = new maplibregl.Map({
    container: mapContainer.value,
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
      layers: [
        { id: 'osm-layer', type: 'raster', source: 'osm' },
      ],
    },
    center: defaultCenter,
    zoom: defaultZoom,
  })

  map.addControl(new maplibregl.NavigationControl())
  mapInstance.value = map

  // Wait for map to load
  map.on('load', async () => {
    // Preload marker image
    const img = new Image()
    img.src = markerIcon
    await new Promise<void>((res) => { img.onload = () => res() })
    map.addImage('custom-marker', img)

    // Add all layers from props
    for (const [layerName, layerData] of Object.entries(props.layers)) {
      // Add GeoJSON source
      map.addSource(layerName, {
        type: 'geojson',
        data: layerData.data,
        cluster: layerData.cluster ?? true,
        clusterRadius: 20,
        clusterMaxZoom: 17,
      })

      // Cluster layers if needed
      if (layerData.cluster) {
        map.addLayer({
          id: `${layerName}-clusters`,
          type: 'circle',
          source: layerName,
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#ffffff',
            'circle-radius': ['step', ['get', 'point_count'], 16, 16, 20, 48, 24],
            'circle-stroke-width': 3,
            'circle-stroke-color': '#235df1',
          },
        })

        map.addLayer({
          id: `${layerName}-cluster-count`,
          type: 'symbol',
          source: layerName,
          filter: ['has', 'point_count'],
          layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 14 },
          paint: { 'text-color': '#000' },
        })
      }

      // Unclustered points
      map.addLayer({
        id: `${layerName}-unclustered`,
        type: 'symbol',
        source: layerName,
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': layerData.icon ?? 'custom-marker',
          'icon-size': 0.8,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      })

      // Click popup
      map.on('click', `${layerName}-unclustered`, (e) => {
        if (!e.features?.length) return
        const feature = e.features[0]
        if (!feature) return
        const props = normalizeProperties(feature.properties)
        const coords = (feature.geometry?.type === 'Point' ? feature.geometry.coordinates as [number, number] : [e.lngLat.lng, e.lngLat.lat])
        if (currentPopup) currentPopup.remove()
        currentPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false })
            .setLngLat(coords)
            .setHTML(buildPopupHtml(props, coords))
            .addTo(map)
        attachPopupInteractions(currentPopup)
      })

      // Click cluster to zoom
      if (layerData.cluster) {
        map.on('click', `${layerName}-clusters`, (e) => {
          const features = map.queryRenderedFeatures(e.point, { layers: [`${layerName}-clusters`] })
          if (!features.length) return
          const cluster = features[0]
          const coordinates = cluster.geometry.coordinates as [number, number]
          const currentZoom = map.getZoom()
          map.easeTo({ center: coordinates, zoom: Math.min(currentZoom + 2, 18), duration: 600 })
        })
      }

      // Hover pointer
      map.on('mouseenter', `${layerName}-unclustered`, () => { map.getCanvas().style.cursor = 'pointer' })
      map.on('mouseleave', `${layerName}-unclustered`, () => { map.getCanvas().style.cursor = '' })
    }
  })
})

// ----------------------- Watchers -----------------------
// Dynamically update layer data from parent
watch(() => props.layers, (layers) => {
  const map = mapInstance.value
  if (!map) return

  for (const [layerName, layerData] of Object.entries(layers)) {
    const source = map.getSource(layerName) as maplibregl.GeoJSONSource | undefined
    if (source) source.setData(layerData.data)
  }
}, { deep: true })
</script>

<style scoped>
.map-container { width: 100%; height: 100%; }
</style>

<style>
.maplibregl-popup-content {
  padding: 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 30px rgba(0,0,0,0.2) !important;
  background: transparent !important;
  overflow: hidden;
  border: none !important;
}

.maplibregl-popup-close-button { display: none !important; }
</style>
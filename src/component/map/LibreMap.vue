<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, toRaw } from 'vue'
import type { FeatureCollection } from 'geojson'
import maplibregl, { Popup, type LngLatLike } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useThemeStore } from '@/store/themeStore.ts'

const themeStore = useThemeStore()

// Props
const props = defineProps<{
  layers: Record<
      string,
      {
        data: FeatureCollection
        cluster?: boolean
        clusterProperties?: Record<string, any>
        icon?: string
        unclusteredStyle?: Record<string, any>
        clusterStyle?: Record<string, any>
        minzoom?: number
        maxzoom?: number
        popupTitle?: (feature: GeoJSON.Feature) => string
        popupContent?: (feature: GeoJSON.Feature) => string
      }
  >
  center?: LngLatLike
  zoom?: number
}>()

const emit = defineEmits<{
  (e: 'mapLoaded', map: maplibregl.Map): void
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = ref<maplibregl.Map | null>(null)
defineExpose({ map: mapInstance })

let currentPopup: Popup | null = null

const defaultCenter: LngLatLike = props.center ?? [9.5, 54.3]
const defaultZoom = props.zoom ?? 8

// Define the handler separately
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && currentPopup) {
    currentPopup.remove()
    currentPopup = null
  }
}


// Utils
const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

const attachPopupInteractions = (popup: Popup | null) => {
  if (!popup) return
  const button = popup.getElement()?.querySelector<HTMLButtonElement>('[data-map-popup-close]')
  if (!button) return
  button.addEventListener('click', () => popup.remove(), { once: true })
}

// --- Add Clustered Layer ---
const addClusteredLayer = (map: maplibregl.Map, layerName: string, layerData: any) => {
  const cs = layerData.clusterStyle || {}

  // Circle for clusters
  map.addLayer({
    id: `${layerName}-clusters`,
    type: 'circle',
    source: layerName,
    filter: ['has', 'point_count'],
    minzoom: layerData.minzoom ?? 0,
    maxzoom: layerData.maxzoom ?? 24,
    paint: {
      'circle-color': cs.circleColor || '#ffffff',
      'circle-radius': cs.circleRadius || ['step', ['get', 'point_count'], 16, 16, 20, 48, 24],
      'circle-stroke-width': cs.circleStrokeWidth || 0,
      'circle-stroke-color': cs.circleStrokeColor || '#000000',
    },
  })

  map.addLayer({
    id: `${layerName}-circle`,
    type: 'circle',
    source: layerName,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-radius': 16,
      'circle-color': '#ff0000',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#ffffff'
    }
  });

  map.addLayer({
    id: `${layerName}-number`,
    type: 'symbol',
    source: layerName,
    filter: ['!', ['has', 'point_count']],
    layout: {
      'text-field': ['get', 'count'], // 👈 your JSON property
      'text-size': 14,
      'text-anchor': 'center',
      'text-allow-overlap': true
    },
    paint: {
      'text-color': '#ffffff'
    }
  });


  // Text for cluster count (can show total_event_count)
  map.addLayer({
    id: `${layerName}-cluster-count`,
    type: 'symbol',
    source: layerName,
    filter: ['has', 'point_count'],
    minzoom: layerData.minzoom ?? 0,
    maxzoom: layerData.maxzoom ?? 24,
    layout: {
      'text-field': cs.textField || ['get', 'point_count_abbreviated'],
      'text-size': cs.textSize || 14
    },
    paint: {
      'text-color': cs.textColor ?? '#000000'
    }
  })

  // Zoom on cluster click
  map.on('click', `${layerName}-clusters`, (e) => {
    const features = map.queryRenderedFeatures(e.point, { layers: [`${layerName}-clusters`] })
    if (!features.length) return

    const cluster = features[0]
    if (!cluster) return
    const coordinates: [number, number] =
        cluster.geometry?.type === 'Point' && Array.isArray(cluster.geometry.coordinates)
            ? [cluster.geometry.coordinates[0], cluster.geometry.coordinates[1]]
            : [e.lngLat.lng, e.lngLat.lat]

    const currentZoom = map.getZoom()
    map.easeTo({ center: coordinates, zoom: Math.min(currentZoom + 2, 18), duration: 600 })
  })
}

// --- Add Unclustered Layer ---
const addUnclusteredLayer = (map: maplibregl.Map, layerName: string, layerData: any) => {
  const us = layerData.unclusteredStyle || {}
  const minzoom = layerData.minzoom ?? 0
  const maxzoom = layerData.maxzoom ?? 24

  // Circle-based points
  if (us.circleRadius) {
    map.addLayer({
      id: `${layerName}-unclustered`,
      type: 'circle',
      source: layerName,
      filter: ['!', ['has', 'point_count']],
      minzoom,
      maxzoom,
      paint: {
        'circle-radius': us.circleRadius,
        'circle-color': us.circleColor || '#000000',
        'circle-stroke-width': us.circleStrokeWidth || 0,
        'circle-stroke-color': us.circleStrokeColor || '#fff'
      }
    })

    // Optional text inside circle
    if (us.textField) {
      map.addLayer({
        id: `${layerName}-unclustered-text`,
        type: 'symbol',
        source: layerName,
        filter: ['!', ['has', 'point_count']],
        minzoom,
        maxzoom,
        layout: {
          'text-field': us.textField,
          'text-size': us.textSize ?? 12,
          'text-anchor': 'center'
        },
        paint: { 'text-color': us.textColor ?? '#fff' }
      })
    }
  } else if (layerData.icon) {
    // Icon-based points
    const layout: Record<string, any> = {
      'icon-image': layerName,
      'icon-size': us.iconSize ?? 0.8,
      'icon-anchor': us.iconAnchor ?? 'bottom',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true
    }
    if (us.textField) {
      layout['text-field'] = us.textField
      layout['text-size'] = us.textSize ?? 12
      layout['text-anchor'] = us.textAnchor ?? 'top'
      layout['text-offset'] = us.textOffset ?? [0, -1.5]
    }
    map.addLayer({
      id: `${layerName}-unclustered`,
      type: 'symbol',
      source: layerName,
      filter: ['!', ['has', 'point_count']],
      minzoom,
      maxzoom,
      layout,
      paint: { 'text-color': us.textColor }
    })
  }

  // Popups
  map.on('click', `${layerName}-unclustered`, (e) => {
    if (!e.features?.length) return
    const feature = e.features[0]
    if (!feature) return

    const coords: [number, number] =
        feature.geometry?.type === 'Point' && Array.isArray(feature.geometry.coordinates)
            ? [feature.geometry.coordinates[0], feature.geometry.coordinates[1]]
            : [e.lngLat.lng, e.lngLat.lat]

    if (currentPopup) currentPopup.remove()

    const titleHtml = layerData.popupTitle
        ? `<span class="uranus-map-popup__title-text">${escapeHtml(layerData.popupTitle(feature))}</span>`
        : ''
    const bodyHtml = layerData.popupContent
        ? layerData.popupContent(feature)
        : '<p>No info</p>'

    const html = `
      <div class="uranus-map-popup">
        <div class="uranus-map-popup__header">
          ${titleHtml}
          <button class="uranus-map-popup__close" type="button" data-map-popup-close>&times;</button>
        </div>
        <div class="uranus-map-popup__body">${bodyHtml}</div>
      </div>
    `

    currentPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false })
        .setLngLat(coords)
        .setHTML(html)
        .addTo(map)
    attachPopupInteractions(currentPopup)
  })
}

// --- Map Setup ---
onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)

  if (!mapContainer.value) return

  const map = new maplibregl.Map({
    container: mapContainer.value,
    style:
        themeStore.theme === 'dark'
            ? '/versatiles/versatiles-dark-style.json'
            : '/versatiles/versatiles-style.json',
    center: defaultCenter,
    zoom: 12,
    minZoom: 2,
    maxZoom: 19
  });

/*
  const map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        osm: { type: 'raster', tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'], tileSize: 256 }
      },
      layers: [{ id: 'osm-layer', type: 'raster', source: 'osm' }]
    },
    center: defaultCenter,
    zoom: defaultZoom
  })

 */

  map.addControl(new maplibregl.NavigationControl())
  mapInstance.value = map

  map.on('load', async () => {
    for (const [layerName, layerData] of Object.entries(toRaw(props.layers))) {
      // Register icon if provided
      if (layerData.icon) {
        const img = new Image()
        img.src = layerData.icon
        await new Promise<void>(res => { img.onload = () => res() })
        if (!map.hasImage(layerName)) map.addImage(layerName, img)
      }

      // Add source
      map.addSource(layerName, {
        type: 'geojson',
        data: layerData.data,
        cluster: false, // layerData.cluster ?? false,
        clusterRadius: 1,
        clusterProperties: layerData.clusterProperties
      })

      // Add layers
      if (layerData.cluster) addClusteredLayer(map, layerName, layerData)
      addUnclusteredLayer(map, layerName, layerData)
    }

    // Close popup when clicking anywhere else on the map
    map.on('click', (e) => {
      if (!currentPopup) return

      // Build a list of all layer IDs that could be clicked
      const clickableLayerIds = Object.entries(toRaw(props.layers)).flatMap(([name, layerData]) => {
        const ids: string[] = [`${name}-unclustered`]
        if (layerData.cluster) ids.push(`${name}-clusters`)
        return ids
      })

      // Check if the click hits any of the markers/clusters
      const features = map.queryRenderedFeatures(e.point, { layers: clickableLayerIds })

      if (features.length === 0) {
        currentPopup.remove()
        currentPopup = null
      }
    })

    emit('mapLoaded', map)
  })
})

// --- Update sources on props change ---
watch(() => props.layers, (layers) => {
  const map = mapInstance.value
  if (!map) return
  for (const [layerName, layerData] of Object.entries(toRaw(layers))) {
    const source = map.getSource(layerName) as maplibregl.GeoJSONSource
    if (source) source.setData(layerData.data)
  }
}, { deep: true })

onBeforeUnmount(() => {
  currentPopup?.remove()
  document.removeEventListener('keydown', handleKeyDown)
})
</script>

<style scoped>
.map-container { width: 100%; height: 100%; }
</style>

<style>
.maplibregl-popup-content {
  padding: 0 !important;
  border-radius: 12px !important;
  background: transparent !important;
  overflow: hidden;
  border: none !important;
}
.maplibregl-popup-close-button { display: none !important; }
</style>
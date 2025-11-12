<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { FeatureCollection } from 'geojson'
import markerIcon from '@/assets/marker.png'

import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import type { LngLatLike, Popup } from 'maplibre-gl'

// Props
const props = defineProps<{
  data: FeatureCollection
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = ref<maplibregl.Map | null>(null)

let currentPopup: Popup | null = null

const GEOJSON_SOURCE_ID = 'events'
const CLUSTER_LAYER_ID = 'clusters'
const CLUSTER_COUNT_LAYER_ID = 'cluster-count'
const UNCLUSTERED_LAYER_ID = 'unclustered-point'

type PopupProperties = Record<string, unknown>

const normalizeProperties = (raw: unknown): PopupProperties => {
  if (!raw) {
    return {}
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return typeof parsed === 'object' && parsed !== null ? (parsed as PopupProperties) : { value: raw }
    } catch {
      return { value: raw }
    }
  }
  if (typeof raw === 'object') {
    return raw as PopupProperties
  }
  return {}
}

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const pickString = (properties: PopupProperties, keys: string[], fallback = ''): string => {
  for (const key of keys) {
    const value = properties[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim()
    }
  }
  return fallback
}

const pickNumber = (properties: PopupProperties, keys: string[]): number | undefined => {
  for (const key of keys) {
    const value = properties[key]
    if (typeof value === 'number' && !Number.isNaN(value)) {
      return value
    }
    if (typeof value === 'string' && value.trim().length > 0) {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
  }
  return undefined
}

const formatTypeInfo = (properties: PopupProperties): string => {
  if (typeof properties.venue_type_list === 'string') {
    return properties.venue_type_list
  }
  const eventTypes = properties.event_types
  if (Array.isArray(eventTypes)) {
    const names = eventTypes
      .map((entry) => {
        if (typeof entry === 'string') return entry
        if (entry && typeof entry === 'object' && 'type_name' in entry) {
          const value = (entry as Record<string, unknown>).type_name
          return typeof value === 'string' ? value : ''
        }
        return ''
      })
      .filter((name) => name.trim().length > 0)
    if (names.length) {
      return names.join(', ')
    }
  }
  const fallbackKeys = ['type', 'category', 'event_type']
  return pickString(properties, fallbackKeys)
}

const buildDirectionsUrl = (properties: PopupProperties, coordinates: [number, number]): string => {
  const lat = pickNumber(properties, ['venue_lat', 'lat', 'latitude']) ?? coordinates[1]
  const lon = pickNumber(properties, ['venue_lon', 'lon', 'longitude']) ?? coordinates[0]
  const destination = `${lat},${lon}`
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
}

const safeUrl = (value: string): string => {
  if (!value) return ''
  try {
    const base =
      typeof window !== 'undefined' && window.location ? window.location.origin : 'https://localhost'
    const url = new URL(value, base)
    return url.toString()
  } catch {
    return ''
  }
}

const buildPopupHtml = (properties: PopupProperties, coordinates: [number, number]): string => {
  const title = pickString(properties, ['venue_name', 'event_title', 'name', 'title'], 'Unbenannter Ort')
  const city = pickString(properties, ['venue_city', 'city', 'event_city'])
  const address = pickString(properties, ['venue_address', 'address', 'street'])
  const typeInfo = formatTypeInfo(properties)
  const websiteRaw = pickString(properties, ['venue_url', 'url', 'link'])
  const website = safeUrl(websiteRaw)
  const directionsUrl = buildDirectionsUrl(properties, coordinates)

  const subtitleParts = [city, address].filter((part) => part.length > 0)
  const metaLines = [subtitleParts.join(' · '), typeInfo].filter((line) => line.length > 0)

  const titleHtml = website
    ? `<a class="generic-info-window__title-link" href="${website}" target="_blank" rel="noopener noreferrer">${escapeHtml(
        title
      )}</a>`
    : `<span class="generic-info-window__title-text">${escapeHtml(title)}</span>`

  const metaHtml = metaLines
    .map(
      (line) => `
        <p class="generic-info-window__meta">
          ${escapeHtml(line)}
        </p>
      `
    )
    .join('')

  const detailsLink = website
    ? `<a class="generic-info-window__action generic-info-window__action--details" href="${website}" target="_blank" rel="noopener noreferrer">
        <span>Link</span>
      </a>`
    : ''

  return `
    <div class="generic-info-window">
      <div class="generic-info-window__header">
        ${titleHtml}
        <button class="generic-info-window__close" type="button" data-map-popup-close aria-label="Popup schließen">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="generic-info-window__body">
        ${metaHtml || '<p class="generic-info-window__meta">Keine weiteren Angaben</p>'}
      </div>
      <div class="generic-info-window__footer">
        <a class="generic-info-window__action generic-info-window__action--route" href="${directionsUrl}" target="_blank" rel="noopener noreferrer">
          <span>Route</span>
        </a>
        ${detailsLink}
      </div>
    </div>
  `
}

const attachPopupInteractions = (popup: Popup | null) => {
  if (!popup) return
  const element = popup.getElement()
  if (!element) return
  const button = element.querySelector<HTMLButtonElement>('[data-map-popup-close]')
  if (!button) return
  const close = () => {
    popup.remove()
  }
  button.addEventListener('click', close, { once: true })
}

onMounted(() => {
  if (!mapContainer.value) return

  const map = new maplibregl.Map({
    container: mapContainer.value,
    style: {
      version: 8,
      glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      sources: {
        osm: {
          type: 'raster',
          tiles: ['https://tiles.oklabflensburg.de/sgm/{z}/{x}/{y}.png'],
          tileSize: 256,
          attribution: 'MapLibre | © OpenStreetMap contributors',
        },
      },
      layers: [
        {
          id: 'osm-layer',
          type: 'raster',
          source: 'osm',
          paint: { 'raster-brightness-min': 0.6, 'raster-brightness-max': 1.0 },
        },
      ],
    },
    center: [9.5, 54.3] as LngLatLike,
    zoom: 8,
  })

  map.addControl(new maplibregl.NavigationControl())

  map.on('load', () => {
    // Initialize empty GeoJSON source
    map.addSource(GEOJSON_SOURCE_ID, {
      type: 'geojson',
      data: props.data, // Use initial data from props
      cluster: true,
      clusterRadius: 20,
      clusterMaxZoom: 17,
    })

    // Cluster circle layer
    map.addLayer({
      id: CLUSTER_LAYER_ID,
      type: 'circle',
      source: GEOJSON_SOURCE_ID,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#ffffff',
        'circle-radius': ['step', ['get', 'point_count'], 16, 16, 20, 48, 24],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#235df1',
      },
    })

    // Cluster count labels
    map.addLayer({
      id: CLUSTER_COUNT_LAYER_ID,
      type: 'symbol',
      source: GEOJSON_SOURCE_ID,
      filter: ['has', 'point_count'],
      layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 14 },
      paint: { 'text-color': '#000' },
    })

    const img = new Image()
    img.src = markerIcon
    img.onload = () => {
      map.addImage('custom-marker', img)

      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'events',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': 'custom-marker',
          'icon-size': 0.8,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        },
      })
    }

    const fitMapToData = (geojson: FeatureCollection) => {
        if (!mapInstance.value) return
        const { features } = geojson
        if (!Array.isArray(features) || features.length === 0) return

        const coordinates: [number, number][] = []
        for (const feature of features) {
            const geometry = feature?.geometry
            if (!geometry) continue
            if (geometry.type === 'Point' && Array.isArray(geometry.coordinates)) {
                const [lon, lat] = geometry.coordinates as [number, number]
                if (Number.isFinite(lon) && Number.isFinite(lat)) {
                    coordinates.push([lon, lat])
                }
            }
        }

        if (!coordinates.length) return

        let bounds = coordinates.reduce<maplibregl.LngLatBounds | null>((acc, coord) => {
            if (!acc) {
                return new maplibregl.LngLatBounds(coord, coord)
            }
            acc.extend(coord)
            return acc
        }, null)

        if (!bounds) return

        if (coordinates.length === 1) {
            const [lon, lat] = coordinates[0]
            const delta = 0.01
            bounds.extend([lon + delta, lat + delta])
            bounds.extend([lon - delta, lat - delta])
        }

        mapInstance.value.fitBounds(bounds, {
            padding: 80,
            duration: 600,
            maxZoom: coordinates.length === 1 ? 14 : 15,
        })
    }

    watch(
      () => props.data,
      (geojson) => {
        if (!mapInstance.value?.getSource(GEOJSON_SOURCE_ID)) return
        const source = mapInstance.value.getSource(GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource
        source.setData(geojson)
        fitMapToData(geojson)
      },
      { immediate: true }
    )

    // Click popups
    map.on('click', UNCLUSTERED_LAYER_ID, (e) => {
      if (!e.features || e.features.length === 0) return

      const feature = e.features[0]
      if (!feature) return

      const properties = normalizeProperties(feature.properties)
      const geometry = feature.geometry
      const coordinates: [number, number] =
        geometry && geometry.type === 'Point'
          ? (geometry.coordinates as [number, number])
          : [e.lngLat.lng, e.lngLat.lat]

      if (currentPopup) {
        currentPopup.remove()
        currentPopup = null
      }

      const html = buildPopupHtml(properties, coordinates)

      currentPopup = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        maxWidth: '320px',
        anchor: 'left',
        offset: 15,
      })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map)

      attachPopupInteractions(currentPopup)
    })

    // Close popup on clicking outside
    map.on('click', (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [UNCLUSTERED_LAYER_ID, CLUSTER_LAYER_ID],
      })
      if (!features.length && currentPopup) {
        currentPopup.remove()
        currentPopup = null
      }
    })

    map.on('click', CLUSTER_LAYER_ID, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER_ID] })
      if (!features.length) return

      const feature = features[0]
      if (!feature || feature.geometry.type !== 'Point') return

      const coordinates = feature.geometry.coordinates as [number, number]
      const currentZoom = map.getZoom()

      // Smooth zoom-in by 2 levels, max 18
      map.easeTo({
        center: coordinates,
        zoom: Math.min(currentZoom + 2, 18),
        duration: 600,
      })
    })

    // Cursor pointer
    const layers = [UNCLUSTERED_LAYER_ID, CLUSTER_LAYER_ID] as const
    layers.forEach((layer) => {
      map.on('mouseenter', layer, () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', layer, () => {
        map.getCanvas().style.cursor = ''
      })
    })
  })

  // Assign to ref after all setup
  mapInstance.value = map
})

// Watch data prop and update map
watch(
  () => props.data,
  (geojson) => {
    const map = mapInstance.value
    if (!map) {
      return
    }

    // Wait for map to be loaded
    if (!map.isStyleLoaded()) {
      map.once('load', () => {
        const source = map.getSource(GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource
        if (source) {
          source.setData(geojson)
        }
      })
      return
    }

    const source = map.getSource(GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource
    if (source) {
      source.setData(geojson)
    }
  },
  { deep: true }
)
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>

<style>
/* Global styles for MapLibre popups (cannot be scoped) */
.maplibregl-popup-content {
  padding: 0 !important;
  border-radius: 12px !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.2) !important;
  background: transparent !important;
  overflow: hidden;
  border: none !important;
}

.maplibregl-popup-close-button {
  display: none !important;
}

.generic-info-window {
  width: 280px;
  display: flex;
  flex-direction: column;
  font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: var(--text-primary);
  background: var(--uranus-bg-color);
  border-radius: 12px;
  overflow: hidden;
}

.generic-info-window__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--accent-primary);
  color: #fff;
}

.generic-info-window__title-link,
.generic-info-window__title-text {
  font-size: 1rem;
  font-weight: 600;
  color: inherit;
  text-decoration: none;
  margin-right: 12px;
  line-height: 1.3;
}

.generic-info-window__title-link:hover {
  opacity: 0.85;
}

.generic-info-window__close {
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 999px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.generic-info-window__close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.generic-info-window__body {
  padding: 12px 16px 4px;
  background: var(--uranus-bg-color);
}

.generic-info-window__meta {
  margin: 0 0 8px;
  font-size: 1rem;
  color: var(--muted-text);
  line-height: 1.4;
}

.generic-info-window__meta:last-child {
  margin-bottom: 0;
}

.generic-info-window__footer {
  display: flex;
  width: 100%;
  border-top: 1px solid var(--border-color);
  gap: 6px;
  padding: 12px;
}

.generic-info-window__action {
  flex: 1;
  padding: 4px 6px;
  text-align: center;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  transition: background 0.2s ease, color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 100px;
  gap: 8px;
}

.generic-info-window__action--route {
  background: var(--uranus-ia-color-light2);
  color: var(--uranus-bg-color);
}

.generic-info-window__action--route:hover {
  background: var(--uranus-ia-color);
}

.generic-info-window__action--details {
  background: var(--uranus-bg-color-d1);
  color: var(--text-primary);
}

.generic-info-window__action--details:hover {
  background: var(--uranus-bg-color-d2);
}
</style>

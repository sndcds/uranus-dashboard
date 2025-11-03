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
  popupContent?: (properties: Record<string, any>) => string
}>()

const mapContainer = ref<HTMLElement | null>(null)
const mapInstance = ref<maplibregl.Map | null>(null)

let currentPopup: Popup | null = null

const GEOJSON_SOURCE_ID = 'events'
const CLUSTER_LAYER_ID = 'clusters'
const CLUSTER_COUNT_LAYER_ID = 'cluster-count'
const UNCLUSTERED_LAYER_ID = 'unclustered-point'

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
      clusterRadius: 40,
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
        'circle-radius': ['step', ['get', 'point_count'], 24, 16, 32, 48, 40],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#A0D896',
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

    // Click popups
    map.on('click', UNCLUSTERED_LAYER_ID, (e) => {
      if (!e.features || e.features.length === 0) return

      const properties = e.features[0]!.properties

      if (currentPopup) {
        currentPopup.remove()
        currentPopup = null
      }

      // Use custom popup content if provided, otherwise show basic info
      const html = props.popupContent 
        ? props.popupContent(properties || {})
        : `<div style="padding: 8px;"><strong>${properties?.name || 'Feature'}</strong></div>`

      currentPopup = new maplibregl.Popup({ 
        closeButton: true,
        closeOnClick: false,
        maxWidth: '300px',
        anchor: 'left',
        offset: 15
      })
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map)
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

    // Cluster click zoom
    map.on('click', CLUSTER_LAYER_ID, (e) => {
      const features = map.queryRenderedFeatures(e.point, { layers: [CLUSTER_LAYER_ID] })
      if (!features.length || !features[0]) return
      
      const feature = features[0]
      const clusterId = feature.properties?.cluster_id
      if (!clusterId) return
      
      const geometry = feature.geometry
      if (geometry.type !== 'Point') return
      
      const source = map.getSource(GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource
      
      // Type assertion for the callback - MapLibre's types are inconsistent here
      ;(source as any).getClusterExpansionZoom(
        clusterId,
        (err: Error | null, zoom: number) => {
          if (err) return
          map.easeTo({ 
            center: geometry.coordinates as [number, number], 
            zoom 
          })
        }
      )
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
    console.log('Data changed, features:', geojson.features.length)
    
    const map = mapInstance.value
    if (!map) {
      console.log('Map instance not ready yet')
      return
    }
    
    // Wait for map to be loaded
    if (!map.isStyleLoaded()) {
      console.log('Map style not loaded yet, waiting...')
      map.once('load', () => {
        const source = map.getSource(GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource
        if (source) {
          console.log('Setting data after load:', geojson.features.length)
          source.setData(geojson)
        }
      })
      return
    }
    
    const source = map.getSource(GEOJSON_SOURCE_ID) as maplibregl.GeoJSONSource
    if (source) {
      console.log('Setting data immediately:', geojson.features.length)
      source.setData(geojson)
    } else {
      console.log('Source not found yet')
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  background: white !important;
  overflow: hidden;
}

.maplibregl-popup-close-button {
  font-size: 20px !important;
  padding: 4px 8px !important;
  color: #666 !important;
  right: 4px !important;
  top: 4px !important;
}

.maplibregl-popup-close-button:hover {
  background: rgba(0, 0, 0, 0.05) !important;
  color: #333 !important;
}

.popup-wrapper {
  background: white;
  min-width: 200px;
  max-width: 300px;
}

.popup-content {
  padding: 16px;
}

.popup-title {
  font-size: 1.1em;
  font-weight: 600;
  line-height: 1.3;
  color: #2d3748;
  margin: 0 0 12px 0;
}

.popup-title a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s ease;
}

.popup-title a:hover {
  color: #764ba2;
  text-decoration: underline;
}

.popup-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.popup-city,
.popup-type {
  margin: 0;
  font-size: 0.9em;
  color: #4a5568;
  line-height: 1.4;
}

.popup-button {
  display: inline-block;
  width: 100%;
  padding: 8px 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 600;
  font-size: 0.9em;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
}

.popup-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}
</style>
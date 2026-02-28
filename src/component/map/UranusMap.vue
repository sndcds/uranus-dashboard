<template>
  <div v-if="loading" class="loading-state">
    Loading map...
  </div>

  <LibreMap
      v-else
      class="map-container"
      :layers="mapLayers"
      :center="[9.5, 54.3]"
      :zoom="10"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { FeatureCollection, Point } from 'geojson'
import { apiFetch } from '@/api.ts'
import LibreMap from '@/component/map/LibreMap.vue'

// Import your marker images
import venueIcon from '@/assets/map/marker.png'
import eventIcon from '@/assets/map/marker-event.png'
import stationIcon from '@/assets/map/marker-station.png'

// Loading state
const loading = ref(true)

// Map data layers
const venues = ref<FeatureCollection<Point>>({ type: 'FeatureCollection', features: [] })
const stations = ref<FeatureCollection<Point>>({ type: 'FeatureCollection', features: [] })
const events = ref<FeatureCollection<Point>>({ type: 'FeatureCollection', features: [] })


// Optional props
const props = defineProps<{
  showVenues?: boolean
  showStations?: boolean
  showEvents?: boolean
  stationCenterLat?: number
  stationCenterLon?: number
  stationRadius?: number
}>()

// Load data
const loadVenues = async () => {
  try {
    const { data } = await apiFetch<any>('/api/venues/geojson')
    if (Array.isArray(data)) {
      venues.value = {
        type: 'FeatureCollection',
        features: data.map((v: any) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [v.venue_lon, v.venue_lat] },
          properties: v,
        })),
      }
    }
  } catch (err) {
    console.error('Failed to load venues:', err)
  }
}

const loadStations = async () => {
  const lat = props.stationCenterLat ?? 54.7745
  const lon = props.stationCenterLon ?? 9.4411
  const radius = props.stationRadius ?? 500000

  try {
    const { data } = await apiFetch<any>(`/api/transport/stations?lat=${lat}&lon=${lon}&radius=${radius}`)
    if (Array.isArray(data?.data)) {
      stations.value = {
        type: 'FeatureCollection',
        features: data.data.map((s: any) => ({
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [Number(s.lon), Number(s.lat)] },
          properties: s,
        })),
      }
    }
  } catch (err) {
    console.error('Failed to load stations:', err)
  }
}

const loadEvents = async () => {
  try {
    const { data } = await apiFetch<any>('/api/events/geojson')

    // Ensure we have event array
    if (Array.isArray(data?.data?.events)) {
      events.value = {
        type: 'FeatureCollection',
        features: data.data.events.map((e: any) => {
          // Only include events with valid coordinates
          const lat = e.venue_lat ?? e.lat
          const lon = e.venue_lon ?? e.lon
          return {
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: lat != null && lon != null ? [lon, lat] : [0, 0], // fallback coords
            },
            properties: e,
          }
        }),
      }
    }
  } catch (err) {
    console.error('Failed to load events:', err)
  }
}

// Map layers definition
// The order here defines rendering order: stations below, venues above
const mapLayers = computed(() => {
  const layers: Record<string, any> = {}

  // Stations layer
  if (props.showStations) {
    layers.stations = {
      data: stations.value,
      cluster: false,
      minzoom: 14,
      icon: stationIcon,
      unclusteredStyle: { iconSize: 0.6, iconAnchor: 'center' }
    }
  }

  // Venues layer
  if (props.showVenues) {
    layers.venues = {
      data: venues.value,
      cluster: true,
      clusterStyle: {
        circleColor: '#ffffff',
        circleStrokeColor: '#0D79F2',
        circleStrokeWidth: 2,
        textColor: '#0D79F2',
        textSize: 14
      },
      icon: venueIcon,
      unclusteredStyle: { iconSize: 0.8, iconAnchor: 'bottom' }
    }
  }

  // Events layer
  layers.events = {
    data: events.value,
    cluster: true, // optional clustering
    clusterStyle: {
      circleColor: '#780DF2', // gold
      circleStrokeColor: '#780DF2',
      circleStrokeWidth: 2,
      textColor: '#fff',
      textSize: 12,
    },
    icon: eventIcon,
    unclusteredStyle: { iconSize: 0.8, iconAnchor: 'bottom' },
  }

  return layers
})

// Load map
const loadMap = async () => {
  try {
    if (props.showStations) await loadStations()
    if (props.showVenues) await loadVenues()
    if (props.showEvents) await loadEvents()
  } catch (err) {
    console.error('Error loading map layers:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => loadMap())
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--text-secondary);
}
</style>
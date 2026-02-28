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
import { apiFetch } from '@/api.ts'
import type { FeatureCollection, Point } from 'geojson'
import LibreMap from '@/component/map/LibreMap.vue'

// Loading state
const loading = ref(true)

// Map data layers
const venues = ref<FeatureCollection<Point>>({ type: 'FeatureCollection', features: [] })
const stations = ref<FeatureCollection<Point>>({ type: 'FeatureCollection', features: [] })

// Optional props to control which layers to show
const props = defineProps<{
  showVenues?: boolean
  showStations?: boolean
  stationCenterLat?: number
  stationCenterLon?: number
  stationRadius?: number
}>()

// Load layers
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
  const radius = props.stationRadius ?? 5000

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

// Layers for LibreMap
const mapLayers = computed(() => {
  const layers: { id: string; data: FeatureCollection; cluster?: boolean }[] = []

  // Add stations first (rendered below)
  if (props.showStations) {
    layers.push({ id: 'stations', data: stations.value, cluster: false })
  }

  // Add venues on top
  if (props.showVenues) {
    layers.push({ id: 'venues', data: venues.value, cluster: true })
  }

  return layers
})

// Load map data
const loadMap = async () => {
  try {
    if (props.showStations) await loadStations()
    if (props.showVenues) await loadVenues()
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
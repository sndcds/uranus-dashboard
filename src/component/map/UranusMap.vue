<template>
  <div v-if="loading" class="loading-state">
    Loading map...
  </div>

  <LibreMap
      ref="libreMapRef"
      v-else
      class="map-container"
      :layers="mapLayers"
      :center="[9.5, 54.3]"
      :zoom="10"
      @mapLoaded="onMapLoaded"
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

const libreMapRef = ref<any>(null)

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
    const { response } = await apiFetch<any>('/api/venues/geojson')

    if (response?.data?.venues) {
      venues.value = {
        type: 'FeatureCollection',
        features: response.data.venues.map((v: any) => ({
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [v.venue_lon, v.venue_lat],
          },
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
    const { response } = await apiFetch<any>(`/api/transport/stations?lat=${lat}&lon=${lon}&radius=${radius}`)
    if (Array.isArray(response?.data)) {
      stations.value = {
        type: 'FeatureCollection',
        features: response.data.map((s: any) => ({
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
    const { response } = await apiFetch<any>('/api/events/geojson')
    if (response?.data?.venues) {
      const sanitizedFeatures = Object.values(response.data.venues).map((v: any) => {
        const eventCount = Number(v.event_count ?? v.events?.length ?? 0)
        return {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [v.lon ?? 0, v.lat ?? 0] },
          properties: {
            event_count: isNaN(eventCount) ? 0 : eventCount, // must always be a number
            venue_name: v.name ?? 'Unknown',
          },
        }
      })

      events.value = {
        type: 'FeatureCollection',
        features: sanitizedFeatures
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
      unclusteredStyle: {
        iconSize: 0.6,
        iconAnchor: 'center',
        textColor: "#ffffff"
      }
    }
  }

  // Venues layer
  if (props.showVenues) {
    layers.venues = {
      data: venues.value,
      cluster: true,
      clusterStyle: {
        circleColor: "#0D79F2bb",
        circleStrokeColor: "#0D79F2bb",
        circleStrokeWidth: 0,
        textColor: "#ffffff",
        textSize: 14
      },
      icon: venueIcon,
      unclusteredStyle: {
        iconSize: 0.8,
        iconAnchor: "bottom",
        textColor: "#ffffff"
      },
      popupTitle: (f: any) => (f.properties).venue_name,
      popupContent: (f: any) => `<div>${(f.properties).venue_city}</div>`
    }
  }

  // Events layer
  if (props.showEvents) {
    layers.events = {
      data: events.value,
      cluster: false,
      unclusteredStyle: {
        circleRadius: 12,
        circleColor: "#d623f1",
        circleStrokeWidth: 20,
        circleStrokeColor: "rgba(214,35,241,0.11)",
        textField: ["to-string", ["get", "event_count"]],
        textSize: 14,
        textColor: "#ffffff",
      },
      popupTitle: (f: any) => f.properties.venue_name,
      popupContent: (f: any) => `<div>${f.properties.event_count} Events</div>`,
    }
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

const onMapLoaded = (map: maplibregl.Map) => {
  const eventsSource = map.getSource('events')
  if (!eventsSource) {
    console.warn('Events source not ready yet')
    return
  }

  map.once('idle', () => {
    const clusters = map.querySourceFeatures('events', {
      filter: ['has', 'point_count']
    })
    console.log('Clustered features with totals:', clusters.map(f => f.properties.total_event_count))
  })

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
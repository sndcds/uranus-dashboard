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

    if (data?.data?.venues) {
      venues.value = {
        type: 'FeatureCollection',
        features: data.data.venues.map((v: any) => ({
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
    if (data?.data?.venues) {
      const eventFeatures = Object.values(data.data.venues).map((v: any) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [v.lon ?? 0, v.lat ?? 0] },
        properties: {
          ...v,
          event_count: v.event_count ?? v.events?.length ?? 0,
          venue_name: v.name
        },
      }))

      events.value = {
        type: 'FeatureCollection',
        features: eventFeatures,
      }
    }
  } catch (err) {
    console.error('Failed to load events:', err)
  }
  console.log(JSON.stringify(events.value, null, 2))
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
        circleColor: "#0D79F2bb",
        circleStrokeColor: "#0D79F2bb",
        circleStrokeWidth: 0,
        textColor: "#ffffff",
        textSize: 14
      },
      icon: venueIcon,
      unclusteredStyle: {
        iconSize: 0.8,
        iconAnchor: "bottom"
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
      icon: venueIcon,
      // no icon
      unclusteredStyle: {
        circleRadius: [
          "interpolate", ["linear"],
          ["to-number", ["get", "event_count"]],
          1, 10,
          5, 16,
          10, 24
        ],
        circleColor: "#D623F199",
        circleStrokeWidth: 30,
        circleStrokeColor: "#D623F133",

        textField: ["to-string", ["get", "event_count"]],
        textSize: 14,
        textColor: "#ffffff",
      },
      popupTitle: (f: any) => (f.properties as any).venue_name,
      popupContent: (f: any) => `<div>${(f.properties as any).event_count} Events</div>`
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
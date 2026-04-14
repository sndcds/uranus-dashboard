<template>
  <UranusMapRenderer
      :layers="mapLayers"
      :center="[9.5, 54.3]"
      :zoom="8"
      :map-style="mapStyle"
      :default-text-font="['noto_sans_regular']"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { FeatureCollection, Point } from 'geojson'
import { apiFetch } from '@/api'
import UranusMapRenderer, { type MapLayer } from '@/component/map/UranusMapRenderer.vue'
import { useThemeStore } from '@/store/themeStore.ts'


const themeStore = useThemeStore()

/**
 * STATE
 */
const venues = ref<FeatureCollection<Point>>({
  type: 'FeatureCollection',
  features: [],
})
const mapStyle = computed(() =>
    themeStore.theme === 'dark'
        ? '/versatiles/versatiles-dark-style.json'
        : '/versatiles/versatiles-style.json'
)
const emptyFC: FeatureCollection = {
  type: 'FeatureCollection',
  features: [],
}

/**
 * FETCH DATA (BBOX)
 */
const loadVenues = async (bbox?: [number, number, number, number]) => {

  console.log('loadVenues ...', import.meta.env.BASE_URL)
  try {
    const params = bbox
        ? `?minLon=${bbox[0]}&minLat=${bbox[1]}&maxLon=${bbox[2]}&maxLat=${bbox[3]}`
        : ''

    const res = await apiFetch<any>(`/api/venues/geojson${params}`)

    if (!res?.data?.features) return

    venues.value = {
      type: 'FeatureCollection',
      features: res.data.features.map((v: any) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [
            v.properties.venue_lon,
            v.properties.venue_lat,
          ],
        },
        properties: {
          ...v.properties,
          count: v.properties.count ?? 1,
        },
      })),
    }

    console.debug('[UranusVenuesMap]', 'venues:loaded', {
      featureCount: venues.value.features.length,
    })
  } catch (e) {
    console.error('Failed to load venues:', e)
  }
}

/**
 * LAYERS (THIS IS THE IMPORTANT PART)
 */

const mapLayers = computed<MapLayer[]>(() => [
  {
    id: 'venues-circle',
    sourceId: 'venues',
    data: venues.value ?? emptyFC,
    type: 'circle',
    paint: {
      'circle-radius': 16,
      'circle-color': '#ff3b30',
    },
  },
  {
    id: 'venues-count',
    sourceId: 'venues',
    type: 'symbol',
    layout: {
      'text-field': ['to-string', ['get', 'count']],
      'text-size': 12,
      'text-anchor': 'center',
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': '#ffffff',
    },
  },
  {
    id: 'venues-label',
    sourceId: 'venues',
    type: 'symbol',
    layout: {
      'text-field': ['get', 'venue_name'],
      'text-size': 11,
      'text-offset': [0, 1.5],
      'text-anchor': 'top',
    },
    paint: {
      'text-color': '#333',
    },
  },
])

watch(
    () => venues.value.features.length,
    (featureCount) => {
      console.debug('[UranusVenuesMap]', 'venues:state', { featureCount })
    },
    { immediate: true }
)

/**
 * INITIAL LOAD
 */
onMounted(() => {
  loadVenues()
})
</script>

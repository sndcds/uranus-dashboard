<template>
  <div v-if="loading" class="loading-state">
    Loading venues...
  </div>
  <LibreMap v-else :data="geojsonData" class="map-container" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { FeatureCollection, Point } from 'geojson'
import { apiFetch } from '@/api'

import LibreMap from '@/components/LibreMap.vue'

interface Venue {
  venue_name: string
  venue_lat: number
  venue_lon: number
  venue_type_list: string | null
  venue_url: string | null
  venue_city: string
}

const venues = ref<Venue[]>([])
const loading = ref(true)

const geojsonData = computed<FeatureCollection<Point>>(() => {
  const data = {
    type: 'FeatureCollection' as const,
    features: venues.value.map(v => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [v.venue_lon, v.venue_lat]
      },
      properties: {
        venue_name: v.venue_name,
        venue_city: v.venue_city,
        venue_type_list: v.venue_type_list,
        venue_url: v.venue_url,
      },
    })),
  }

  return data
})

const loadVenues = async () => {
  try {
    const { data } = await apiFetch<Venue[]>('/api/geojson/venues')

    if (Array.isArray(data)) {
      // Filter out venues with invalid coordinates (null, 0, or outside valid ranges)
      const filtered = data.filter(v =>
        v.venue_lat != null &&
        v.venue_lon != null &&
        v.venue_lat !== 0 &&
        v.venue_lon !== 0 &&
        Math.abs(v.venue_lat) <= 90 &&
        Math.abs(v.venue_lon) <= 180
      )

      venues.value = filtered
    } else {
      console.error('Data is not an array:', data)
    }
  } catch (err) {
    console.error('Failed to load venues:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadVenues()
})
</script>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: var(--text-secondary);
}
</style>

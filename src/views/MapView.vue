<template>
  <LibreMap :data="geojsonData" :popup-content="getPopupContent" class="map-container" />
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

const geojsonData = computed<FeatureCollection<Point>>(() => ({
  type: 'FeatureCollection',
  features: venues.value.map(v => ({
    type: 'Feature',
    geometry: { 
      type: 'Point', 
      coordinates: [v.venue_lon, v.venue_lat] 
    },
    properties: {
      venue_name: v.venue_name,
      venue_city: v.venue_city,
      venue_type_list: v.venue_type_list,
      venue_url: v.venue_url,
    },
  })),
}))

const getPopupContent = (properties: Record<string, any>): string => {
  return `
    <div class="popup-wrapper">
      <div class="popup-content">
        <h3 class="popup-title">${
          properties.venue_url
            ? `<a href="${properties.venue_url}" target="_blank" rel="noopener noreferrer">${properties.venue_name}</a>`
            : properties.venue_name || ''
        }</h3>
        <div class="popup-details">
          <p class="popup-city">📍 ${properties.venue_city || ''}</p>
          ${properties.venue_type_list ? `<p class="popup-type">🏛️ ${properties.venue_type_list}</p>` : ''}
        </div>
        ${properties.venue_url 
          ? `<a href="${properties.venue_url}" target="_blank" rel="noopener noreferrer" class="popup-button">View Details</a>` 
          : ''}
      </div>
    </div>
  `
}

const loadVenues = async () => {
  try {
    const { data } = await apiFetch<Venue[]>('/api/geojson/venues')
    if (Array.isArray(data)) {
      // Filter out venues with invalid coordinates (null, 0, or outside valid ranges)
      venues.value = data.filter(v => 
        v.venue_lat != null && 
        v.venue_lon != null &&
        v.venue_lat !== 0 && 
        v.venue_lon !== 0 &&
        Math.abs(v.venue_lat) <= 90 && 
        Math.abs(v.venue_lon) <= 180
      )
      console.log(`Loaded ${venues.value.length} valid venues out of ${data.length} total`)
    }
  } catch (err) {
    console.error('Failed to load venues:', err)
  }
}

onMounted(() => {
  loadVenues()
})
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 600px;
}
</style>
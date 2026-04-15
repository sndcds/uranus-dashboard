<!--
  src/component/map/UranusSinglePointMap.vue
-->

<template>
  <LibreMap
      class="map-container"
      :layers="mapLayers"
      :center="[lon, lat]"
      :zoom="zoom"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import LibreMap from '@/component/map/LibreMap.vue'
import venueIcon from '@/assets/map/marker.png'

const props = defineProps<{
  lat: number
  lon: number
  name?: string
  zoom?: number
}>()

const zoom = computed(() => props.zoom ?? 14)

import type { FeatureCollection, Point } from 'geojson'

const mapLayers = computed<Record<string, any>>(() => ({
  point: {
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [props.lon, props.lat],
          },
          properties: {
            name: props.name ?? '',
          },
        },
      ],
    } as FeatureCollection<Point>,
    cluster: false,
    icon: venueIcon,
    unclusteredStyle: {
      iconSize: 1,
      iconAnchor: 'bottom',
      textColor: '#000000',
    },
    popupTitle: (f: any) => f.properties.name,
  },
}))
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
}
</style>
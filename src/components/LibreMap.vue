<template>
  <div ref="mapContainer" class="map-container"></div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMapLibre } from '@/composables/useMapLibre';
import type { LngLatLike } from 'maplibre-gl';

const mapContainer = ref<HTMLDivElement | null>(null);

const initialMarkers: LngLatLike[] = [
  [13.405, 52.52],
  [13.39, 52.51],
];

const { mapInstance, addMarker } = useMapLibre({
  container: mapContainer,
  center: [13.405, 52.52],
  zoom: 12,
  markers: initialMarkers,
});
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 400px;
  overflow: hidden;
}
</style>
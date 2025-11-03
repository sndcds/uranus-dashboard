<template>
  <LibreMap :venues="venues" class="map-container" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LibreMap from '@/components/LibreMap.vue';

interface Venue {
  venue_name: string;
  venue_lat: number;
  venue_lon: number;
  venue_type_list: string | null;
  venue_url: string | null;
}

// Example venues (replace with your API data)
const venues = ref<Venue[]>([
  { venue_name: 'Brandenburg Gate', venue_lat: 52.5163, venue_lon: 13.3777, venue_type_list: 'Monument', venue_url: null },
  { venue_name: 'Berlin TV Tower', venue_lat: 52.5208, venue_lon: 13.4094, venue_type_list: 'Landmark', venue_url: 'https://www.tv-turm.de/' },
]);
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 600px;
}
</style>
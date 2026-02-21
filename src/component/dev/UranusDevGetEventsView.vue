<template>
  <h1>Uranus API - Get Events Demo</h1>

  <!-- Venue type-ahead -->
  <UranusVenueTypeahead v-model:selectedVenue="chosenVenue" />

  <div class="get-events-demo">
    <!-- Basic examples -->
    <div>Get all upcoming events</div>
    <div><a :href="`${API_BASE}/api/events`">Link</a></div>

    <div>Get all events starting from a specific date</div>
    <div><a :href="`${API_BASE}/api/events/?start=2026-10-01`">Link</a></div>

    <div>Get all events ending before a specific date</div>
    <div><a :href="`${API_BASE}/api/events/?end=2026-12-31`">Link</a></div>

    <div>Search events by keyword text elements</div>
    <div><a :href="`${API_BASE}/api/events/?search=music`">Link</a></div>

    <div>Search events by keyword in title</div>
    <div><a :href="`${API_BASE}/api/events/?title=*bullet*`">Link</a></div>

    <div>Filter by event IDs</div>
    <div><a :href="`${API_BASE}/api/events/?events=16,461`">Link</a></div>

    <div>Filter by venue IDs</div>
    <div><a :href="`${API_BASE}/api/events/?venues=52,69`">Link</a></div>

    <div>Filter by space IDs</div>
    <div><a :href="`${API_BASE}/api/events/?spaces=51`">Link</a></div>

    <div>Filter by space types</div>
    <div><a :href="`${API_BASE}/api/events/?space_types=1,2`">Link</a></div>

    <div>Filter by organization IDs</div>
    <div><a :href="`${API_BASE}/api/events/?organizations=9,5`">Link</a></div>

    <div>Filter by country codes</div>
    <div><a :href="`${API_BASE}/api/events/?countries=DEU,DNK`">Link</a></div>

    <div>Filter by postal code</div>
    <div><a :href="`${API_BASE}/api/events/?postal_code=24937`">Link</a></div>

    <div>Filter by city</div>
    <div><a :href="`${API_BASE}/api/events/?city=Flensb*`">Link</a></div>

    <div>Filter by event types</div>
    <div><a :href="`${API_BASE}/api/events/?event_types=1,2`">Link</a></div>

    <div>Filter by tags</div>
    <div><a :href="`${API_BASE}/api/events/?tags=posaune,hund`">Link</a></div>

    <div>Filter by accessibility flags</div>
    <div><a :href="`${API_BASE}/api/events/?accessibility=1`">Link</a></div>

    <div>Filter by visitor info flags</div>
    <div><a :href="`${API_BASE}/api/events/?visitor_infos=2`">Link</a></div>

    <div>Filter by age</div>
    <div><a :href="`${API_BASE}/api/events/?age=18`">Link</a></div>

    <div>Filter by geographic location and radius</div>
    <div><a :href="`${API_BASE}/api/events/?lat=54.78&lon=9.43&radius=5000`">Link</a></div>

    <div>Pagination: limit and offset</div>
    <div><a :href="`${API_BASE}/api/events/?limit=10&offset=20`">Link</a></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { apiBaseUrl } from '@/util/UranusUtils.ts'
import UranusVenueTypeahead from '@/component/venue/UranusVenueTypeahead.vue'

const API_BASE = apiBaseUrl()

// Bind the selected venue from the typeahead
interface Venue {
  id: number
  name: string
}

const chosenVenue = ref<Venue | null>(null)

</script>

<style scoped>
.get-events-demo {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.get-events-demo > div {
  padding: 0.5rem;
  border-bottom: 1px solid black;
}
</style>
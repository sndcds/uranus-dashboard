<template>
  <h1>Uranus API - Get Events Demo</h1>

  <!-- Venue type-ahead -->
  <UranusVenueTypeahead v-model:selectedVenue="chosenVenue" />

  <table class="table table-striped">
    <tr
        v-for="example in mappedExamples"
        :key="example.href"
        class="uranus-admin-api-links"
    >
      <td>{{ example.label }}</td>
      <td>
        <a :href="example.href" target="_blank">
          {{ example.text }}
        </a>
      </td>
    </tr>
  </table>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { apiBaseUrl } from '@/util/UranusUtils.ts'
import UranusVenueTypeahead from '@/component/venue/UranusVenueTypeahead.vue'

const API_BASE = apiBaseUrl()

// Bind the selected venue from the typeahead
interface Venue {
  id: number
  name: string
}

const apiExamples = [
  {
    label: 'Get all upcoming events',
    path: '/api/events'
  },
  {
    label: 'Get all events starting from a specific date',
    path: '/api/events/?start=2026-10-01'
  },
  {
    label: 'Get all events ending before a specific date',
    path: '/api/events/?end=2026-12-31'
  },
  {
    label: 'Search events by keyword text elements',
    path: '/api/events/?search=music'
  },
  {
    label: 'Search events by keyword in title',
    path: '/api/events/?title=*bullet*'
  },
  {
    label: 'Filter by event IDs',
    path: '/api/events/?events=16,461'
  },
  {
    label: 'Filter by venue IDs',
    path: '/api/events/?venues=52,69'
  },
  {
    label: 'Filter by space IDs',
    path: '/api/events/?spaces=51'
  },
  {
    label: 'Filter by space types',
    path: '/api/events/?space_types=hall,art_gallery'
  },
  {
    label: 'Filter by organization IDs',
    path: '/api/events/?organizations=9,5'
  },
  {
    label: 'Filter by country codes',
    path: '/api/events/?countries=DEU,DNK'
  },
  {
    label: 'Filter by postal code',
    path: '/api/events/?postal_code=24937'
  },
  {
    label: 'Filter by city',
    path: '/api/events/?city=Flensb*'
  },
  {
    label: 'Filter by event types',
    path: '/api/events/?event_types=1,2'
  },
  {
    label: 'Filter by tags',
    path: '/api/events/?tags=posaune,hund'
  },
  {
    label: 'Filter by accessibility flags',
    path: '/api/events/?accessibility=1'
  },
  {
    label: 'Filter by visitor info flags',
    path: '/api/events/?visitor_infos=2'
  },
  {
    label: 'Filter by age',
    path: '/api/events/?age=18'
  },
  {
    label: 'Filter by geographic location and radius',
    path: '/api/events/?lat=54.78&lon=9.43&radius=5000'
  },
  {
    label: 'Pagination: limit and offset',
    path: '/api/events/?limit=10&offset=20'
  }
]

function apiLink(path) {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path

  return {
    href: `${API_BASE}/${cleanPath}`,
    text: cleanPath
  }
}
const mappedExamples = computed(() =>
    apiExamples.map(e => ({
      label: e.label,
      ...apiLink(e.path)
    }))
)

const chosenVenue = ref<Venue | null>(null)

</script>

<style scoped>
.uranus-admin-api-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  border-bottom: 0px solid black;
}

.uranus-admin-api-links > td {
  padding: 0.5rem;
}
</style>
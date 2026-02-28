<template>
  <div class="event-slideshow-page">
    <UranusEventSlideshow v-if="events.length" :eventPairs="events" />
    <div v-else class="loading">
      Loading events...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/api.ts'
import UranusEventSlideshow from '@/component/dev/UranusEventSlideshow.vue'

interface ApiEvent {
  event_date_id: number
  id: number
  title: string
  subtitle?: string
  start_date: string
  start_time?: string
  image_path?: string
  venue_name?: string
}

interface EventPair {
  eventId: number
  eventDateId: number
}

const events = ref<EventPair[]>([])

/**
 * Fetch events from your API with optional filters
 */
async function fetchEvents(filters: Record<string, any> = {}) {
  const params = new URLSearchParams(filters).toString()
  const url = `/api/events${params ? `?${params}` : ''}`

  try {
    const data = await apiFetch<any>(url)
    // data.events expected as in your JSON sample
    events.value = (data.data?.events || []).map((ev: ApiEvent) => ({
      eventId: ev.id,
      eventDateId: ev.event_date_id,
    }))
  } catch (error: any) {
    console.error('Failed to load events:', error)
    // optionally show a user-friendly error in UI
  }

  console.log(JSON.stringify(events.value, null, 2))
}

onMounted(() => {
  // Example filters, can be dynamic
  fetchEvents({
    start: '2026-02-01',
    end: '2027-12-31'
  })
})
</script>

<style scoped>
.event-slideshow-page {
  height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #111;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading {
  color: white;
  font-size: 1.5rem;
}
</style>
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
import UranusEventSlideshow from '@/component/event/UranusEventSlideshow.vue'

interface CalendarEvent {
  event_date_id: number
  title: string
  subtitle?: string
  start_date: string
  start_time?: string
  venue_name?: string
  image_path?: string
}

interface EventPair {
  eventId: number
  eventDateId: number
}

// Array of eventId / eventDateId pairs
const events = ref<EventPair[]>([])

onMounted(async () => {
  try {
    // Example: you could fetch this from your API or define it manually
    events.value = [
      { eventId: 20, eventDateId: 75 },
      { eventId: 29, eventDateId: 86 },
      { eventId: 22, eventDateId: 77 },
      { eventId: 31, eventDateId: 88 },
      { eventId: 28, eventDateId: 85 },
      { eventId: 27, eventDateId: 84 },
      { eventId: 23, eventDateId: 78 },
      { eventId: 24, eventDateId: 79 },
      { eventId: 18, eventDateId: 72 },
    ]
  } catch (err) {
    console.error('Failed to load event pairs:', err)
  }
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
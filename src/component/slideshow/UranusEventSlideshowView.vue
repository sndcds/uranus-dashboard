<!--
  src/component/slideshow/UranusEventSlideshowView.vue
-->

<template>
  <div class="event-slideshow-page">
    <UranusEventSlideshow v-if="events.length" :events="events" />
    <div v-else class="loading">
      Loading events...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/api.ts'
import UranusEventSlideshow from '@/component/slideshow/UranusEventSlideshow.vue'

const events = ref<any[]>([])

async function fetchEvents(filters: Record<string, any> = {}) {
  try {
    const params = new URLSearchParams(filters).toString()
    const apiPath = `/api/events${params ? `?${params}` : ''}`
    const apiResponse = await apiFetch<any>(apiPath)
    events.value = apiResponse.data.events

  } catch (error: any) {
    console.error('Failed to load events:', error) // TODO: Show error or placeholder content
  }
}

onMounted(() => {
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
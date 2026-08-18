<!--
  src/component/display/UranusEventSlideshowView.vue
-->

<template>
  <div class="event-slideshow-page">
    <UranusEventSlideshow v-if="events.length" :events="events" :preset="currentPreset" :duration="currentDuration" :transition_time="currentTransitionTime" />
    <div v-else class="loading">
      Loading events...
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { apiFetch } from '@/api.ts'
import UranusEventSlideshow from '@/component/display/UranusEventSlideshow.vue'

const events = ref<any[]>([])
const currentPreset = 'full-hd-portrait ad-1x1'
const currentDuration = 7
const currentTransitionTime = 0.8

async function fetchEvents(options: Record<string, any> = {}) {
  try {
    // API currently expects flat search params; if `filter` is provided,
    // serialize its entries under their own keys.
    const paramsObj: Record<string, any> = {}
    if (options.filter && typeof options.filter === 'object') {
      Object.assign(paramsObj, options.filter)
    } else {
      Object.assign(paramsObj, options)
    }

    const params = new URLSearchParams(paramsObj).toString()
    const apiPath = `/api/events${params ? `?${params}` : ''}`
    const apiResponse = await apiFetch<any>(apiPath)
    events.value = apiResponse.data?.events || []

  } catch (error: any) {
    console.error('Failed to load events:', error) // TODO: Show error or placeholder content
  }
}

const requestJson = `{
  "preset": {
    "name": "full-hd-portrait ad-1x1"
  },
  "filter": {
    "search": "jazz",
    "start": "2024-02-01",
    "end": "2027-12-31"
  }
}`

onMounted(() => {
    const options = JSON.parse(requestJson)
    fetchEvents(options)
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
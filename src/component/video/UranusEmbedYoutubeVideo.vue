<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  url: string | null
}>()

function extractVideoId(url: string): string | null {
  const regex =
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&?/]+)/

  const match = url.match(regex)
  return match ? match[1] : null
}

const embedUrl = computed(() => {
  if (!props.url) return null
  const id = extractVideoId(props.url)
  return id ? `https://www.youtube.com/embed/${id}` : null
})
</script>

<template>
  <div v-if="embedUrl" class="youtube-wrapper">
    <iframe
        :src="embedUrl"
        title="YouTube video"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
    />
  </div>
</template>

<style scoped>
.youtube-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 */
  height: 0;
}

.youtube-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
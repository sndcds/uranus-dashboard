<!--
  src/component/image/UranusImage.vue
-->

<template>
  <div class="uranus-public-event-image-wrapper">
    <div
        v-if="imageUrl"
        class="uranus-public-event-image-frame"
    >
      <img
          :src="imageUrl"
          :alt="altText"
          class="uranus-public-event-image"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
    defineProps<{
      url: string
      alt?: string | null
      ratio?: string
      width?: number
    }>(),

    {
      ratio: '16:9',
      width: 640,
    }
)

const imageUrl = computed(() => {
  const url = props.url
  if (!url) {
    return null
  }

  const params = `ratio=${encodeURIComponent(props.ratio)}&width=${props.width}`
  return url.includes('?')
      ? `${url}&${params}`
      : `${url}?${params}`
})

const altText = computed(() => {
  return props.alt
      ?? props.alt
      ?? ''
})

</script>


<style scoped>
.uranus-public-event-image-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.uranus-public-event-image-frame {
  overflow: hidden;
  border-radius: 12px;
}

.uranus-public-event-image {
  display: block;
  width: 100%;
  height: auto;
  object-fit: cover;
}

.uranus-public-event-image-caption {
  font-size: 0.875rem;
  line-height: 1.4;
  opacity: 0.7;
}
</style>
<!--
  src/component/ui/UranusLogoImage.vue
-->

<template>
  <div v-if="src" class="logo-container" :style="containerStyle">
    <img
        :src="src"
        :alt="alt"
        @load="onImageLoad"
        class="logo-image"
    />
  </div>
</template>

<script setup>
import { reactive, toRefs } from 'vue'

const MAX_PIXELS = 240 * 40

// Props
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: 'Logo' },
  maxWidth: { type: Number, default: 240 },
  maxHeight: { type: Number, default: 100 },
  maxPixels: { type: Number, default: MAX_PIXELS }
})

const containerStyle = reactive({
  width: 'auto',
  height: 'auto'
})

function onImageLoad(event) {
  const img = event.target
  const naturalWidth = img.naturalWidth
  const naturalHeight = img.naturalHeight
  const pixelCount = naturalWidth * naturalHeight

  if (pixelCount <= props.maxPixels) {
    // No scaling needed
    containerStyle.width = `${naturalWidth}px`
    containerStyle.height = `${naturalHeight}px`
    return
  }

  const scale = Math.sqrt(props.maxPixels / pixelCount)
  containerStyle.width = `${Math.round(naturalWidth * scale)}px`
  containerStyle.height = `${Math.round(naturalHeight * scale)}px`
}
</script>

<style scoped>
.logo-container {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  margin: 1rem 0;
}

.logo-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
<!--
  src/component/ui/UranusLogoImage.vue
-->

<template>
  <div class="logo-container" v-show="src" :style="containerStyle">
    <img v-show="src"
        :key="src!"
        :src="src!"
        :alt="alt"
        @load="onImageLoad"
        class="logo-image"
    />
  </div>
</template>

<script setup lang="ts">
import { reactive, toRef } from 'vue'
import { useLogoUrl } from '@/composable/useLogoUrl'


const MAX_PIXELS = 240 * 40

// Props (RAW inputs, not precomputed src anymore)
const props = defineProps({
  logoURL: { type: String, default: null },
  lightThemeLogoURL: { type: String, default: null },
  darkThemeLogoURL: { type: String, default: null },
  theme: { type: String, required: true },
  alt: { type: String, default: 'Logo' },
  plutoWidth: { type: Number, default: 240 },
  maxWidth: { type: Number, default: 240 },
  maxHeight: { type: Number, default: 100 },
  maxPixels: { type: Number, default: MAX_PIXELS },
  type: { type: String, default: 'png' },
  quality: { type: Number, default: 80 },
})

const { logoUrl: src } = useLogoUrl({
  logoURL: toRef(props, 'logoURL'),
  lightThemeLogoURL: toRef(props, 'lightThemeLogoURL'),
  darkThemeLogoURL: toRef(props, 'darkThemeLogoURL'),
  theme: toRef(props, 'theme'),
  plutoWidth: props.plutoWidth,
  maxWidth: props.maxWidth,
  maxHeight: props.maxHeight,
  type: props.type,
  quality: props.quality,
})

const containerStyle = reactive({
  width: 'auto',
  height: 'auto',
})

function onImageLoad(event: Event) {
  const img = event.target as HTMLImageElement

  const naturalWidth = img.naturalWidth
  const naturalHeight = img.naturalHeight

  const pixelCount = naturalWidth * naturalHeight

  // Scale factors
  const pixelScale =
      pixelCount > props.maxPixels
          ? Math.sqrt(props.maxPixels / pixelCount)
          : 1

  const widthScale =
      naturalWidth > props.maxWidth
          ? props.maxWidth / naturalWidth
          : 1

  const heightScale =
      naturalHeight > props.maxHeight
          ? props.maxHeight / naturalHeight
          : 1

  const scale = Math.min(pixelScale, widthScale, heightScale)

  const finalWidth = Math.round(naturalWidth * scale)
  const finalHeight = Math.round(naturalHeight * scale)

  containerStyle.width = `${finalWidth}px`
  containerStyle.height = `${finalHeight}px`
}
</script>

<style scoped>
.logo-container {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.logo-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  right: 0;
}
</style>
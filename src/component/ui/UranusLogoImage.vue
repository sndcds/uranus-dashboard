<!-- src/component/ui/UranusLogoImage.vue -->

<template>
  <div
      v-if="src"
      class="logo-container"
      :style="containerStyle"
  >
    <component
        :is="linkUrl ? 'a' : 'div'"
        v-bind="linkUrl ? { href: linkUrl, target: linkTarget, rel } : {}"
        class="logo-inner"
    >
      <img
          :src="src"
          :alt="alt"
          class="logo-image"
          :class="{ loaded: isLoaded }"
          @load="onLoad"
          loading="lazy"
      />
    </component>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, toRef, type PropType, watchEffect } from 'vue'
import { useLogoUrl } from '@/composable/useLogoUrl'

const MAX_PIXELS = 240 * 40

const props = defineProps({
  logoURL: { type: String, default: null },
  lightThemeLogoURL: { type: String, default: null },
  darkThemeLogoURL: { type: String, default: null },
  theme: { type: String, required: true },
  alt: { type: String, default: 'Logo' },

  plutoWidth: { type: Number, default: 240 },
  maxWidth: { type: Number, default: 240 },
  maxHeight: { type: Number, default: 100 },
  pixelCount: { type: Number, default: MAX_PIXELS },

  type: { type: String, default: 'png' },
  quality: { type: Number, default: 80 },

  linkUrl: { type: String as PropType<string | null>, default: null },
  linkTarget: { type: String, default: '_self' },
  rel: { type: String, default: 'noopener noreferrer' }
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

/**
 * Reserve space upfront → NO layout shift
 */
const containerStyle = computed(() => {
  if (!size.value) return {}
  return {
    width: `${size.value.width}px`,
    height: `${size.value.height}px`
  }
})

/**
 * Smooth fade-in
 */
const isLoaded = ref(false)


function scaleToPixelBudget(
    naturalW: number,
    naturalH: number,
    maxW: number,
    maxH: number,
    pixelCount: number
) {
  const aspect = naturalW / naturalH

  // 1. ideal size based on pixel budget
  let w = Math.sqrt(pixelCount * aspect)
  let h = Math.sqrt(pixelCount / aspect)

  // 2. clamp to max bounds while preserving aspect ratio
  const scale = Math.min(
      maxW / w,
      maxH / h,
      1
  )

  w *= scale
  h *= scale

  return {
    width: Math.round(w),
    height: Math.round(h)
  }
}

function getImageSize(url: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({
        w: img.naturalWidth,
        h: img.naturalHeight
      })
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * Reactive computed size
 */

const size = ref<{ width: number; height: number } | null>(null)

watchEffect(async () => {
  if (!src.value) return
  const { w, h } = await getImageSize(src.value)
  size.value = scaleToPixelBudget(
      w,
      h,
      props.maxWidth,
      props.maxHeight,
      props.pixelCount
  )
})

function onLoad() {
  isLoaded.value = true
}
</script>

<style scoped>
.logo-container {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  overflow: hidden;
}

/* ensures anchor doesn't affect layout */
.logo-inner {
  display: contents;
}

.logo-image {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;

  opacity: 0;
  transition: opacity 0.2s ease;
}

.logo-image.loaded {
  opacity: 1;
}
</style>
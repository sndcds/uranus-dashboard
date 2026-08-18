<template>
  <div class="event-slideshow" :style="{'--transition-time': (transition_time || 1) + 's'}">
      <FullHdPortrait v-if="preset && preset.startsWith('full-hd-portrait') && hasSlides" :events="slides" :preset="preset" :duration="duration" :transition_time="transition_time" />

      <Transition v-else name="fade" mode="out-in">
          <UranusEventSlide
            v-if="slideEvent"
            :key="slideEvent.date_uuid || slideIndex"
            :title="slideEvent.title || ''"
            :subtitle="slideEvent.subtitle || ''"
            :startDate="slideEvent.start_date || ''"
            :venueName="slideEvent.venue_name || ''"
            :imagePath="slideEvent.image_path || ''"
         ratio=""/>
      </Transition>
      <div v-if="!hasSlides" class="loading">No slides available</div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, computed} from 'vue'
import UranusEventSlide from '@/component/display/UranusEventSlide.vue'
import FullHdPortrait from '@/component/display/presets/FullHdPortrait.vue'


const props = defineProps<{
  events: any[]
  preset?: string
  duration?: number
  transition_time?: number
}>()

const preset = props.preset || ''
const duration = props.duration ?? 7
const transition_time = props.transition_time ?? 1

const slides = props.events ?? []
const slideCount = computed(() => (slides.length ?? 0))
const hasSlides = computed(() => (slideCount.value > 0))
const slideIndex = ref(0)
const slideEvent = computed(() => (slides[slideIndex.value]))

let timer: number | null = null


function showNextSlide() {
  if (!hasSlides) return
  slideIndex.value = (slideIndex.value + 1) % slideCount.value
  timer = window.setTimeout(showNextSlide, Math.max(100, Math.round(duration * 1000)))
}

onMounted(async () => {
  if (!hasSlides) return
  slideIndex.value = 0
  timer = window.setTimeout(showNextSlide, Math.max(100, Math.round(duration * 1000)))
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

// presetComponent mapping is handled in the template for clarity and isolation
</script>

<style scoped>
.event-slideshow {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: black;
}

.loading,
.error {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: white;
  font-size: 1.5rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition-time, 1s) ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}
</style>
<template>
  <div class="event-slideshow">
    <Transition name="fade" mode="out-in">
      <UranusEventSlide
          v-if="slideEvent"
          :key="slideEvent.date_uuid"
          :title="slideEvent.title || ''"
          :subtitle="slideEvent.subtitle || ''"
          :startDate="slideEvent.start_date || ''"
          :venueName="slideEvent.venue_name || ''"
          :imagePath="slideEvent.image_path || ''"
       ratio=""/>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onBeforeUnmount, computed} from 'vue'
import UranusEventSlide from '@/component/slideshow/UranusEventSlide.vue'


const props = defineProps<{
  events: any[]
}>()

const slides = props.events ?? []
const slideCount = computed(() => (slides.length ?? 0))
const hasSlides = computed(() => (slideCount.value > 0))
const slideIndex = ref(0)
const slideEvent = computed(() => (slides[slideIndex.value]))

let timer: number | null = null


function showNextSlide() {
  if (!hasSlides) return
  slideIndex.value = (slideIndex.value + 1) % slideCount.value
  timer = window.setTimeout(showNextSlide, 7000)
}

onMounted(async () => {
  if (!hasSlides) return
  slideIndex.value = 0
  timer = window.setTimeout(showNextSlide, 7000)
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})
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
  transition: opacity 1s ease;
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
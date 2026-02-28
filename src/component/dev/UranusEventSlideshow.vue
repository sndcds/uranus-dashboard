<template>
  <div class="event-slideshow">
    <Transition name="fade" mode="out-in">
      <UranusEventSlide
          v-if="activeSlide"
          :key="activeSlideKey"
          :image-url="activeSlide.imageUrl || ''"
          :title="activeSlide.title || ''"
          :subtitle="activeSlide.subtitle || ''"
          :venue="activeSlide.location || ''"
          :date="activeSlide.date || ''"
      />
    </Transition>

    <div v-if="isLoading" class="loading">Loading…</div>
    <div v-else-if="loadError" class="error">{{ loadError }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import UranusEventSlide from './UranusEventSlide.vue'

// Type

interface EventPair {
  eventId: number
  eventDateId: number
}

interface SlideData {
  imageUrl: string
  title: string
  subtitle: string
  location: string
  date: string
}

// Props

const props = defineProps<{
  eventPairs: EventPair[]
}>()

const slides = props.eventPairs ?? []

// State

const { locale } = useI18n({ useScope: 'global' })

const activeSlide = ref<SlideData | null>(null)
const activeSlideKey = ref(0)
const slideIndex = ref(0)

const preloadedSlides = ref<SlideData[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)

let timer: number | null = null

// Helpers

async function loadEvent(eventId: number, eventDateId: number): Promise<SlideData | null> {
  try {
    const endpoint = `/api/event/${eventId}/date/${eventDateId}?lang=${locale.value}`
    const { data } = await apiFetch<any>(endpoint)

    const event = data.data
    if (!event) return null

    console.log(JSON.stringify(data, null, 2))

    return {
      imageUrl: event.image?.url ?? '',
      title: event.title ?? 'Untitled',
      subtitle: event.subtitle ?? '',
      location: event.date?.location ?? '',
      date: event.date?.startDate ?? ''
    }
  } catch (err) {
    console.error('Failed to load event:', err)
    return null
  }

}

// Slideshow logic

function showNextSlide() {
  if (!preloadedSlides.value.length) return

  slideIndex.value = (slideIndex.value + 1) % preloadedSlides.value.length
  activeSlide.value = preloadedSlides.value[slideIndex.value]
  activeSlideKey.value++

  timer = window.setTimeout(showNextSlide, 7000)
}

// Lifecycle

onMounted(async () => {
  if (!slides.length) {
    loadError.value = 'No slides to show'
    isLoading.value = false
    return
  }

  try {
    // Preload all slides in parallel
    const loadedSlides = await Promise.all(
        slides.map(p => loadEvent(p.eventId, p.eventDateId))
    )

    // Filter out nulls
    preloadedSlides.value = loadedSlides.filter((s): s is SlideData => s !== null)

    if (!preloadedSlides.value.length) {
      loadError.value = 'Failed to load any slides'
      return
    }

    // Start slideshow
    activeSlide.value = preloadedSlides.value[0]
    slideIndex.value = 0
    activeSlideKey.value = 0
    timer = window.setTimeout(showNextSlide, 7000)
  } catch (err: unknown) {
    loadError.value = err instanceof Error ? err.message : String(err)
  } finally {
    isLoading.value = false
  }
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
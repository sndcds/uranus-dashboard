<template>
  <div class="event-slideshow">
    <Transition name="fade" mode="out-in">
      <UranusEventSlide
          v-if="activeSlide"
          :key="activeSlideKey"
          :image-url="activeSlide.imageUrl"
          :title="activeSlide.title"
          :subtitle="activeSlide.subtitle"
          :venue="activeSlide.venue"
          :date="activeSlide.date"
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
import { mapPublicEvent } from '@/utils/UranusPublicEventMapper.ts'
import UranusEventSlide from './UranusEventSlide.vue'
import type {
  UranusPublicEventDetail,
  UranusPublicEventDate
} from '@/models/UranusPublicEventModel.ts'

/* ------------------ types ------------------ */

interface EventPair {
  eventId: number
  eventDateId: number
}

interface SlideData {
  imageUrl: string
  title: string
  subtitle: string
  venue: string
  date: string
}

/* ------------------ props ------------------ */

const props = defineProps<{
  eventPairs: EventPair[]
}>()

const slides = props.eventPairs ?? []

/* ------------------ state ------------------ */

const { locale } = useI18n({ useScope: 'global' })

const activeSlide = ref<SlideData | null>(null)
const activeSlideKey = ref(0)

const slideIndex = ref(0)
const isLoading = ref(false)
const loadError = ref<string | null>(null)

let timer: number | null = null

/* ------------------ helpers ------------------ */

function buildImageUrl(event: UranusPublicEventDetail): string {
  if (!event.imageUrl) return ''
  return event.imageUrl.includes('?')
      ? `${event.imageUrl}&ratio=16:9&width=1920`
      : `${event.imageUrl}?ratio=16:9&width=1920`
}

function formatDate(date: UranusPublicEventDate): string {
  if (!date.startDate) return ''
  return new Date(date.startDate).toLocaleDateString(
      locale.value || 'de'
  )
}

/* ------------------ loader ------------------ */

async function loadEvent(
    eventId: number,
    eventDateId: number
): Promise<SlideData | null> {
  isLoading.value = true
  loadError.value = null

  try {
    const endpoint = `/api/event/${eventId}/date/${eventDateId}?lang=${locale.value}`
    const { data } = await apiFetch(endpoint)

    const mapped = mapPublicEvent(data)
    if (!mapped) throw new Error('Event not found')

    return {
      imageUrl: buildImageUrl(mapped),
      title: mapped.title ?? '',
      subtitle: mapped.subtitle ?? '',
      venue: mapped.venueName ?? '',
      date: mapped.startDate ?? ''
    }
  } catch (err) {
    console.error(err)
    loadError.value = (err as Error).message
    return null
  } finally {
    isLoading.value = false
  }
}

/* ------------------ slideshow logic ------------------ */

async function showNextSlide() {
  if (!slides.length) return

  slideIndex.value = (slideIndex.value + 1) % slides.length
  const next = slides[slideIndex.value]

  if (!next) return

  const loaded = await loadEvent(next.eventId, next.eventDateId)

  if (loaded) {
    activeSlide.value = loaded
    activeSlideKey.value++
  }

  timer = window.setTimeout(showNextSlide, 7000)
}

/* ------------------ lifecycle ------------------ */

onMounted(async () => {
  const first = slides[0]
  if (!first) return

  activeSlide.value = await loadEvent(
      first.eventId,
      first.eventDateId
  )

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

/* ---- fade transition ---- */

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
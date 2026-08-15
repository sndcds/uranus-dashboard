<template>
  <div class="fullhd-portrait" :style="{'--transition-time': transition_time + 's'}">
    <div class="frame-9-16">
      <Transition name="fade" mode="out-in">
        <div v-if="currentEvent" :key="currentKey" class="card">
          <div class="image-wrap square">
            <img :src="imageWithParams(currentEvent.image_path, '1:1')" :alt="currentEvent.title" />
          </div>

          <div class="meta">
            <div class="date">{{ localizedDate(currentEvent.start_date) }}</div>
            <div class="title">{{ currentEvent.title }}</div>
            <div class="venue">{{ currentEvent.venue_name }}</div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  events: any[]
  preset?: string
  duration?: number
  transition_time?: number
}>()

const duration = props.duration ?? 7
const transition_time = props.transition_time ?? 0.8

const { locale } = useI18n({ useScope: 'global' })

const slides = props.events ?? []
const slideCount = computed(() => slides.length)
const index = ref(0)

let timer: number | null = null

const currentEvent = computed(() => slides[index.value] || null)
const currentKey = computed(() => currentEvent.value ? (currentEvent.value.date_uuid || index.value) : index.value)

function showNext() {
  if (slideCount.value <= 0) return
  index.value = (index.value + 1) % slideCount.value
  timer = window.setTimeout(showNext, Math.max(100, Math.round(duration * 1000)))
}

onMounted(() => {
  if (slideCount.value <= 0) return
  index.value = 0
  timer = window.setTimeout(showNext, Math.max(100, Math.round(duration * 1000)))
})

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
})

function imageWithParams(path: string | undefined, ratio: string = '9:16') {
  if (!path) return ''
  try {
    const url = new URL(path, window.location.origin)
    // Default width target for images; square images use same width
    url.searchParams.set('width', '1080')
    url.searchParams.set('ratio', ratio)
    return url.toString()
  } catch (e) {
    return path || ''
  }
}

function localizedDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric', month: 'short', day: 'numeric'
  }).format(d)
}
</script>

<style scoped>
.fullhd-portrait {
  /* Center frame on screen and scale to maximum while preserving 9:16 aspect */
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: transparent;
}

.frame-9-16 {
  /* keep the 9:16 ratio and be as large as possible within viewport */
  width: min(calc(100vh * 9 / 16), 100vw);
  height: min(100vh, calc(100vw * 16 / 9));
  max-height: 100vh;
  max-width: 100vw;
  background: black;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.card {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: black;
  color: white;
}

.image-wrap {
  display: block;
  overflow: hidden;
}

/* square image container that keeps the same size inside the 9:16 frame */
.image-wrap.square {
  width: 100%;
  /* use padding-top trick to force square aspect ratio */
  position: relative;
  padding-top: 100%;
  flex: 0 0 auto;
}

.image-wrap.square img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meta {
  padding: 1rem;
  background: rgba(0,0,0,0.6);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-start;
}

.date { font-size: 1.1rem; opacity: 0.9; }
.title { font-size: 1.6rem; font-weight: 700; }
.venue { font-size: 1rem; opacity: 0.9; }

.fade-enter-active, .fade-leave-active { transition: opacity var(--transition-time, 0.8s) ease; }
.fade-enter-from, .fade-leave-to { opacity: 0 }
.fade-enter-to, .fade-leave-from { opacity: 1 }
</style>

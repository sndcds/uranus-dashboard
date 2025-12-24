<template>
  <div class="calendar-page">
    <div class="calendar-body">

      <div v-if="events.length === 0 && !loading">
        No events to display
      </div>

      <div v-else class="calendar-layout">
        <div
            v-for="event in events"
            :key="`${event.id}-${event.event_date_id}`"
            class="calendar-card"
            @click="openEvent(event)"
        >
          <div class="calendar-image">
            <img :src="getEventImageUrl(event)" alt="Event image" />
          </div>

          <div class="calendar-text">
            <h3>{{ event.title }}</h3>
            <span>{{ event.start_date }} {{ event.start_time || '' }}</span>
            <span>{{ event.venue_name }}, {{ event.venue_city }}</span>
          </div>

          <!-- Hover overlay -->
          <div class="calendar-overlay"></div>
        </div>
      </div>

      <!-- Infinite scroll trigger -->
      <div
          ref="loadMoreTrigger"
          class="load-more-trigger"
          v-show="true"
      ></div>

      <div v-if="loading" class="loading-indicator">
        Loading more events…
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { h, ref, defineComponent, computed, onMounted, onBeforeUnmount, watch } from "vue"
import { useRouter } from "vue-router"
import { apiFetch } from "@/api.ts"
import { useEventsFilterStore } from '@/store/eventsFilterStore'

const router = useRouter()

const eventsFilterStore = useEventsFilterStore()
const searchQuery = ref('')

const CalendarFilter = defineComponent({
  setup() {
    return () => h('input', {
      type: 'text',
      placeholder: 'Search events...',
      class: 'filter-textfield',
      value: searchQuery.value,
      onInput: (e: Event) => {
        const target = e.target as HTMLInputElement
        searchQuery.value = target.value
      }
    })
  }
})

onMounted(() => {
  eventsFilterStore.content = CalendarFilter
})

onBeforeUnmount(() => {
  eventsFilterStore.content = null
})


/* -------------------- Types -------------------- */

interface CalendarEventType {
  genre_id: number | null
  genre_name: string | null
  type_id: number
  type_name: string
}

interface CalendarEvent {
  id: number
  event_date_id: number
  title: string
  subtitle: string | null
  image_path: string | null
  teaser_text: string | null
  description: string | null
  start_date: string
  start_time: string | null
  end_date: string | null
  end_time: string | null
  venue_name: string | null
  venue_city: string | null
  event_types: CalendarEventType[] | null
  organization_name: string | null
}

interface EventsResponse {
  events: CalendarEvent[]
  total: number
}

/* -------------------- State -------------------- */

const events = ref<CalendarEvent[]>([])
const limit = 10
const total = ref(200) // TODO: !!!
const loading = ref(false)

const lastEventStartAt = ref<string | null>(null)
const lastEventDateId = ref<number | null>(null)

const hasMore = computed(() => {
  return total.value === 0 || events.value.length < total.value
})

const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null


let searchTimeout: number | null = null

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = window.setTimeout(() => {
    events.value = []
    lastEventStartAt.value = null
    lastEventDateId.value = null
    loadEvents()
  }, 300)
})

const loadEvents = async () => {
  if (loading.value) return
  loading.value = true

  try {
    const params = new URLSearchParams({ limit: limit.toString() })

    if (lastEventStartAt.value) {
      params.set("last_event_start_at", lastEventStartAt.value)
      if (lastEventDateId.value !== null) {
        params.set("last_event_date_id", lastEventDateId.value.toString())
      }
    }

    if (searchQuery.value) {
      params.set("search", searchQuery.value)
    }

    const { data } = await apiFetch<{
      events: CalendarEvent[]
      last_event_start_at: string
      last_event_date_id: number
      total: number
    }>(`/api/events?${params.toString()}`)

    if (data?.events.length) {
      events.value.push(...data.events)

      // update cursor
      lastEventStartAt.value = data.last_event_start_at
      lastEventDateId.value = data.last_event_date_id
    }
  } catch (err) {
    console.error("Failed to load events:", err)
  } finally {
    loading.value = false
  }
}

const getEventImageUrl = (event: CalendarEvent) => {
  if (!event.image_path) return "/placeholder.png"

  const url = new URL(event.image_path, window.location.origin)
  url.searchParams.set("width", "480")
  url.searchParams.set("ratio", "16:9")

  return url.toString()
}

const openEvent = (event: CalendarEvent) => {
  router.push({
    name: "event-details",
    params: {
      id: event.id,
      eventDateId: event.event_date_id,
    },
  })
}

/* -------------------- Lifecycle -------------------- */

onMounted(async () => {
  console.log("Mounted → load first page")
  await loadEvents()

  observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {  // optional chaining
          console.log("Triggering loadEvents() from observer")
          loadEvents()
        }
      },
      {
        rootMargin: "200px",
      }
  )

  if (loadMoreTrigger.value) {
    console.log("Observing loadMoreTrigger element", loadMoreTrigger.value)
    observer.observe(loadMoreTrigger.value)
  } else {
    console.warn("loadMoreTrigger ref is null")
  }
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<style scoped lang="scss">
.calendar-page {
  width: 100%;
}

.calendar-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

.calendar-card {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: #fff;
  width: 100%;
  transition: transform 0.25s ease;
}

.calendar-card:hover {
  transform: translateY(-3px);
}

/* Featured cards */
.calendar-layout > .calendar-card:first-child,
.calendar-layout > .calendar-card:nth-child(6) {
  grid-column: span 2;
  grid-row: span 2;
  font-size: 1.4rem;
}

.calendar-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.calendar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.calendar-text {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Hover overlay */
.calendar-overlay {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.3s ease;
  background: linear-gradient(
          180deg,
          rgba(0, 0, 0, 0) 40%,
          rgba(0, 0, 0, 0.65)
  );
  mix-blend-mode: difference;
}

.calendar-card:hover .calendar-overlay {
  opacity: 1;
}

/* Infinite scroll helpers */
.load-more-trigger {
  height: 20px;
}

.loading-indicator {
  text-align: center;
  padding: 24px;
  color: #666;
}

@media (max-width: 640px) {
  .calendar-layout > .calendar-card:first-child,
  .calendar-layout > .calendar-card:nth-child(6) {
    grid-column: span 1;
    grid-row: span 1;
    font-size: 1rem;
  }
}
</style>

<style lang="scss">
.filter-textfield {
  margin: 10px;
  font-size: 1.4rem;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: calc(100% - 20px);
}
</style>
<template>
  <div class="calendar-page">
    <div class="calendar-body">

      <div class="calendar-settings">
        <div class="calendar-filter-buttons">
          <button class="filter-button" @click="showFilterModal = true">
            {{ t('calendar_filter_button_label') }}
          </button>

          <button
              class="reset-filter-button"
              @click="onResetFilter"
              :disabled="!canResetFilterMore"
          >
            {{ t('calendar_filter_reset_button_label') }}
          </button>
        </div>

        <div class="calendar-type-chips">
          <span
              v-for="entry in typeSummary"
              :key="entry.type_id"
              class="type-chip"
          >
            {{ getTypeName(entry.type_id) }} ({{ entry.date_count }})
          </span>
        </div>
      </div>

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
            <UranusEventReleaseChip
                v-if="(event.release_status_id ?? 0) > 3"
                :releaseStatusId="event.release_status_id"
            />
          </div>

          <!-- Hover overlay -->
          <div class="calendar-overlay"></div>
        </div>

        <!-- Hack to keep fewer than 4 entries in 4 column grid layout -->
        <div></div><div></div><div></div>

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

  <!-- Modal -->
  <UranusModal
      v-if="showFilterModal"
      :title="t('calendar_filter_settings_title')"
      @close="showFilterModal = false"
      show>
    <form
        class="uranus-form"
        @submit.prevent="onSaveFilter"
        novalidate
    >
      <UranusFormRow>
        <UranusTextInput
            id="search-input"
            v-model="filter.search!"
            :label="t('calendar_filter_search_label')"
            :placeholder="t('calendar_filter_search_placeholder')"
            @keydown.enter.prevent="onSaveFilter"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextInput
            id="city-input"
            v-model="filter.city!"
            :label="t('calendar_filter_city_label')"
            @keydown.enter.prevent="onSaveFilter"
        />
      </UranusFormRow>

      <UranusInlineEditActions
          :isSaving="isSavingFilter"
          :canSave="canSaveFilter"
          @save="onSaveFilter"
          @cancel="onCancelFilter"
      />
    </form>

  </UranusModal>

</template>

<script setup lang="ts">
import { h, ref, defineComponent, computed, onMounted, onBeforeUnmount, watch } from "vue"
import { useRouter } from "vue-router"
import { useI18n } from "vue-i18n";
import { apiFetch } from "@/api.ts"
import UranusModal from '@/components/uranus/UranusModal.vue'
import UranusEventReleaseChip from "@/components/event/UranusEventReleaseChip.vue";
import { useEventsFilterStore } from '@/store/eventsFilterStore'
import { useEventTypeLookupStore } from "@/store/eventTypesLookup.ts";
import UranusFormRow from "@/components/ui/UranusFormRow.vue";
import UranusInlineEditActions from "@/components/ui/UranusInlineEditActions.vue";
import UranusTextInput from "@/components/ui/UranusTextInput.vue";
import { urlParamsSetIfPresent } from "@/utils/UranusUtils.ts";

const router = useRouter()
const { t, locale } = useI18n({ useScope: 'global' })


const showFilterModal = ref(false)
const eventsFilterStore = useEventsFilterStore()
const searchQuery = ref('')

const typeLookupStore = useEventTypeLookupStore()

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


const applyFilters = () => {
  showFilterModal.value = false
  // Call your loadEvents() or update filters here
  events.value = []
  lastEventStartAt.value = null
  lastEventDateId.value = null
  loadEvents()
}

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
  organization_name: string | null,
  release_status_id: number | null
}

interface TypeSummaryEntry {
  type_id: number;
  date_count: number;
}

const typeSummary = ref<TypeSummaryEntry[]>([])
const getTypeName = (typeId: number) =>
    typeLookupStore.data[locale.value]?.types?.[typeId]?.name ?? 'Unknown'

interface CalendarEventsFilter {
  search: string
  city: string
}

/* -------------------- State -------------------- */

const events = ref<CalendarEvent[]>([])
const limit = 10
const total = ref(200) // TODO: !!!
const loading = ref(false)
const isSavingFilter = ref(false)
const canSaveFilter = ref(true)

const lastEventStartAt = ref<string | null>(null)
const lastEventDateId = ref<number | null>(null)

// Use reactive state for your filter object
const filter = ref<CalendarEventsFilter>({
  search: '',
  city: ''
})

const hasMore = computed(() => {
  return total.value === 0 || events.value.length < total.value
})

const canResetFilterMore = computed(() => {
  return filter.value.search || filter.value.city
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


const loadEvents = async (resetObserver = false) => {
  if (loading.value) return
  loading.value = true

  // Temporarily disconnect observer if resetting
  if (resetObserver && observer) {
    observer.disconnect()
  }

  try {
    const params = new URLSearchParams({ limit: limit.toString() })

    if (lastEventStartAt.value) {
      params.set("last_event_start_at", lastEventStartAt.value)
      if (lastEventDateId.value !== null) {
        params.set("last_event_date_id", lastEventDateId.value.toString())
      }
    }
    urlParamsSetIfPresent(params, 'search', filter.value.search)
    urlParamsSetIfPresent(params, 'city', filter.value.city)

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

    total.value = data.total ?? 0

    // Fetch type summary
    const response = await apiFetch<{ summary: TypeSummaryEntry[] }>("/api/events/type-summary")
    typeSummary.value = response.data.summary || []

  } catch (err) {
    console.error("Failed to load events:", err)
  } finally {
    loading.value = false

    // Reconnect observer after first page
    if (resetObserver && observer && loadMoreTrigger.value) {
      observer.observe(loadMoreTrigger.value)
    }
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
        if (entry?.isIntersecting) {  // Optional chaining
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


/* Filtering */

const onSaveFilter = async () => {
  showFilterModal.value = false
  isSavingFilter.value = true

  // Reset events and pagination
  events.value = []
  lastEventStartAt.value = null
  lastEventDateId.value = null

  try {
    await loadEvents()
  } finally {
    isSavingFilter.value = false
  }
}

const onCancelFilter = () => {
  showFilterModal.value = false
}

const onResetFilter = () => {
  filter.value.search = ''
  filter.value.city = ''

  // Reset the event list and pagination cursors
  events.value = []
  lastEventStartAt.value = null
  lastEventDateId.value = null
  total.value = 0

  window.scrollTo({ top: 0, behavior: 'smooth' })

  // Reload events and reset observer
  loadEvents(true)
}

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

.filter-button {
  background-color: #333;
  color: #fff;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background-color: #555;
  }
}

.reset-filter-button {
  background-color: #eee;
  color: #333;
  border: 1px solid #ccc;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover:enabled {
    background-color: #ddd;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
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

.calendar-settings {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  position: sticky;
  top: 80px;
  z-index: 10;
  padding: 12px 16px;
  border-bottom: 1px solid #eee;
  min-height: 100px;
  background: var(--uranus-dashboard-bg);
  // background: mistyrose;
}

.calendar-filter-buttons {
  display: flex;
  align-items: center;
  gap: 12px;
  // background: greenyellow;
}

.calendar-type-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  // background: #ccffcc;
}

.type-chip {
  background-color: #fff;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 0.9rem;
  cursor: default;
  user-select: none;
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
<!--
  src/view/public/UranusEventCalendar.vue

  UranusEventCalendar renders the public events calendar with filtering,
  infinite scrolling, and localized display. It fetches paginated event
  data from the backend, supports client-side filters, and provides a
  summary of event type currently visible.
-->

<template>
  <div class="calendar-page">
    <div class="calendar-body">

      <div class="calendar-settings">
        <UranusHorizontalScroller>
        <div class="calendar-type-chips">
          <span
              v-for="entry in typeSummary"
              :key="entry.type_id"
              class="type-chip"
              :class="{ active: filterStore.eventTypeIds.includes(entry.type_id) }"
              @click="toggleType(entry.type_id)"
          >
            {{ getTypeName(entry.type_id) }} ({{ entry.date_count }})
          </span>
        </div>
        </UranusHorizontalScroller>
      </div>

      <!-- TODO: Message for viewer -->
      <div v-if="!eventListStore.hasEvents() && !eventListStore.loading">
        No events to display
      </div>

      <div v-else class="calendar-layout">
        <router-link
            v-for="event in eventListStore.events"
            :key="`${event.uuid}-${event.uuid}`"
            :to="{ name: 'event-details', params: { uuid: event.uuid, eventDateUuid: event.dateUuid } }"
            class="calendar-card custom-link"
        >

          <div class="calendar-image">
            <img :src="eventListStore.getEventImageUrl(event)" alt="Event image" />
          </div>

          <div class="calendar-text">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span>{{ uranusFormatDateTime(event.startDate, event.startTime, locale) }}</span>
              <UranusEventReleaseChip
                  v-if="eventReleaseStatusStore.isReleased(event.releaseStatus ?? '')"
                  :releaseStatus="event.releaseStatus"
                  tiny
              />
            </div>
            <h3>{{ event.title }}</h3>
            <span>{{ event.venue.name }} · {{ event.venue.city }}</span>
            <!-- Render only event type (no genres) -->
            <div v-if="event.eventTypes && event.eventTypes.length" class="uranus-public-event-detail-tags">
              <!--div
                  v-for="typeId in getUniqueEventTypes(event.eventTypes)"
                  :key="typeId"
                  class="uranus-public-event-detail-tag"
              >
                {{ getTypeName(typeId) }}
              </div-->
            </div>
          </div>

          <!-- Hover overlay -->
          <!--div class="calendar-overlay"></div-->
        </router-link>

        <!-- Hack to keep fewer than 4 entries in 4 column grid layout -->
        <div></div><div></div><div></div>

      </div>

      <!-- Infinite scroll trigger -->
      <div
          ref="loadMoreTrigger"
          class="load-more-trigger"
          v-show="true"
      ></div>

      <div v-if="eventListStore.loading" class="loading-indicator">
        Loading more events…
      </div>

      {{ JSON.stringify(eventListStore.events, null, 2) }}

    </div>
  </div>


</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventsFilterStore } from '@/store/uranusEventsFilterStore.ts'
import { useEventListStore } from '@/store/eventListStore.ts'
import { useEventTypeLookupStore } from '@/store/uranusEventTypeGenreLookup.ts'
import { urlParamsSetIfPresent, urlParamsSetArrayIfPresent } from '@/util/UranusUtils.ts'
import { uranusFormatDateTime } from '@/util/UranusStringUtils.ts'
import { useEventReleaseStatusStore } from '@/store/uranusEventReleaseStatusStore.ts'
import UranusEventReleaseChip from '@/component/event/ui/UranusEventReleaseChip.vue'
import UranusHorizontalScroller from '@/component/ui/UranusHorizontalScroller.vue'

const { t, locale } = useI18n({ useScope: 'global' })


const eventReleaseStatusStore = useEventReleaseStatusStore()
const typeLookupStore = useEventTypeLookupStore()
const filterStore = useEventsFilterStore()
const eventListStore = useEventListStore()

const showFilterModal = ref(false)
const searchQuery = ref('')


watch(
    () => filterStore.filter,
    () => {
      eventListStore.reset()
      eventListStore.loadEvents(true)
    },
    { deep: true }
)

onMounted(() => {
})

onBeforeUnmount(() => {
})


// Types
interface TypeSummaryEntry {
  type_id: number;
  date_count: number;
}

const typeSummary = ref<TypeSummaryEntry[]>([])
const getTypeName = (typeId: number) =>
    typeLookupStore.data[locale.value]?.types?.[typeId]?.name ?? 'Unknown'

// Return unique type IDs from the event_types array
/*
const getUniqueEventTypes = (types: CalendarEventType[]): number[] => {
  const unique = new Set<number>()
  types.forEach(t => unique.add(t.type_id))
  return Array.from(unique)
}
*/

const limit = 8


const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null


let searchTimeout: number | null = null

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = window.setTimeout(() => {
    eventListStore.reset()
    eventListStore.loadEvents()
  }, 300)
})


const buildFilterParams = (paginationMode = false, typesMode = false) => {
  const params = new URLSearchParams()
  const f = filterStore.filter // pull current filter from store

  if (paginationMode) {
    params.set("limit", limit.toString())

    console.log("eventListStore.lastEventStartAt:", eventListStore.lastEventStartAt)
    if (eventListStore.lastEventStartAt) {
      params.set("last_event_start_at", eventListStore.lastEventStartAt)
      if (eventListStore.lastEventDateUuid !== null) {
        params.set("last_event_date_id", eventListStore.lastEventDateUuid.toString())
      }
    }
  }

  urlParamsSetArrayIfPresent(params, "categories", f.categories)

  // Only add params if they are not empty
  urlParamsSetIfPresent(params, "search", f.search)
  urlParamsSetIfPresent(params, "city", f.city)
  urlParamsSetIfPresent(params, "start", f.startDate)
  urlParamsSetIfPresent(params, "end", f.endDate)

  // Venue
  if (f.venue?.id != null && f.venue.id >= 0) {
    urlParamsSetIfPresent(params, "venues", f.venue.id.toString())
  }

  // Location
  if (f.useCurrentLocation &&
      typeof f.latitude === 'number' &&
      typeof f.longitude === 'number' &&
      typeof f.radiusKm === 'number') {
    params.set("lat", f.latitude.toString())
    params.set("lon", f.longitude.toString())

    // Convert km → m and round
    const radiusMeters = Math.round(f.radiusKm * 1000)
    params.set("radius", radiusMeters.toString())
  }

  // Age
  if (f.minAge !== null && f.maxAge !== null) {
    params.set("age", f.minAge + ',' + f.maxAge)
  }
  else if (typeof f.minAge === 'number') {
    params.set("age", f.minAge?.toString())
  }
  else if (typeof f.maxAge === 'number') {
    params.set("age", f.maxAge?.toString())
  }

  // Price
  if (f.priceType !== 'not_specified') {
    if (f.priceType === 'free' || f.priceType === 'donation') {
      params.set("price", f.priceType)
    } else if (typeof f.maxPrice === 'number') {
      params.set("price", f.maxPrice?.toString() + ',' + f.priceCurrency)
    }
  }

  // Event types
  if (typesMode && f.eventTypeIds?.length) {
    params.set("event_types", f.eventTypeIds.join(","))
  }

  return params
}

onMounted(async () => {
  await eventListStore.loadEvents()

  observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {  // Optional chaining
          eventListStore.loadEvents()
        }
      },
      {
        rootMargin: "200px",
      }
  )

  if (loadMoreTrigger.value) {
    observer.observe(loadMoreTrigger.value)
  } else {
    console.warn("loadMoreTrigger ref is null")
  }
})

function toggleType(typeId: number) {
  filterStore.toggleEventType(typeId)
}

const onResetFilter = () => {
  // Reset the filter in the store
  filterStore.setFilter({
    search: '',
    city: '',
    startDate: '',
    endDate: '',
    venue: { id: -1, name: '' }
  })

  // Reset the event list and pagination cursors
  eventListStore.reset()

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' })

  // Reload events (observer will re-trigger if needed)
  eventListStore.loadEvents()
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
  width: 100%;
}

.calendar-card {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: var(--uranus-bg-d1);
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

.calendar-settings {
  position: sticky;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  top: 80px;
  z-index: 10;
  padding: 12px 16px;
  min-height: 100px;
  background: var(--uranus-dashboard-bg);
}

.calendar-type-chips {
  display: flex;
  align-items: center;
  gap: 8px;
}

.type-chip {
  background-color: #eee;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 0.9rem;
  cursor: default;
  user-select: none;
}

.type-chip.active {
  background-color: #3b82f6; /* blue */
  color: #fff;
}

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

/* global or scoped */
.custom-link {
  color: var(--uranus-calendar-color);
}

.custom-link:hover {
  color: var(--uranus-calendar-hover-color);
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
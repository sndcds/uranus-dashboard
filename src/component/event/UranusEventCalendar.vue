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
              v-for="entry in eventListStore.typeSummary"
              :key="entry.typeId"
              class="type-chip"
              :class="{ active: filterStore.eventTypeIds.includes(entry.typeId) }"
              @click="toggleType(entry.typeId)"
          >
            {{ typeLookupStore.getTypeName(entry.typeId, locale) }} ({{ entry.count }})
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
              <div
                  v-for="typeId in getUniqueEventTypes(event.eventTypes)"
                  :key="typeId"
                  class="uranus-public-event-detail-tag"
              >
                {{ getTypeName(typeId) }}
              </div>
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

    </div>
  </div>


</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventsFilterStore } from '@/store/eventsFilterStore.ts'
import { useEventListStore } from '@/store/eventListStore.ts'
import { useEventTypeLookupStore } from '@/store/uranusEventTypeGenreLookup.ts'
import { uranusFormatDateTime } from '@/util/UranusStringUtils.ts'
import { useEventReleaseStatusStore } from '@/store/eventReleaseStatusStore.ts'
import UranusEventReleaseChip from '@/component/event/ui/UranusEventReleaseChip.vue'
import UranusHorizontalScroller from '@/component/ui/UranusHorizontalScroller.vue'
import type { EventListItemEventType } from "@/domain/event/eventListItem.model.ts";

const { locale } = useI18n({ useScope: 'global' })


const eventReleaseStatusStore = useEventReleaseStatusStore()
const typeLookupStore = useEventTypeLookupStore()
const filterStore = useEventsFilterStore()
const eventListStore = useEventListStore()

const searchQuery = ref('')

const getTypeName = (typeId: number) =>
    typeLookupStore.data[locale.value]?.types?.[typeId]?.name ?? 'Unknown'


watch(
    () => filterStore.filter,
    () => {
      eventListStore.loadEvents(true)
      eventListStore.loadTypeSummary()
    },
    { deep: true }
)

onMounted(() => {
})

onBeforeUnmount(() => {
})




// Return unique type IDs from the event_types array

const getUniqueEventTypes = (types: EventListItemEventType[]): number[] => {
  const unique = new Set<number>()
  types.forEach(t => unique.add(t.typeId))
  return Array.from(unique)
}


const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null


let searchTimeout: number | null = null

watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)

  searchTimeout = window.setTimeout(() => {
    eventListStore.loadEvents(true)
    eventListStore.loadTypeSummary()
  }, 300)
})

onMounted(async () => {
  // await eventListStore.loadEvents()

  observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {  // Optional chaining
          eventListStore.loadEvents()
          eventListStore.loadTypeSummary()
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
/*
.calendar-layout > .calendar-card:first-child {
  grid-column: span 2;
  grid-row: span 2;
  font-size: 1.4rem;
}
*/

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
  gap: 2px;
}

.type-chip {
  color: #666;
  background-color: transparent;
  border: 1px solid #eeeeee;
  padding: 4px 8px;
  border-radius: 5px;
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
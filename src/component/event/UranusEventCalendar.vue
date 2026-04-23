<!--
  src/view/public/UranusEventCalendar.vue

  UranusEventCalendar renders the public events calendar with filtering,
  infinite scrolling, and localized display. It fetches paginated event
  data from the backend, supports client-side filters, and provides a
  summary of event type currently visible.
-->

<template>
  <div class="calendar-page">
    <div class="calendar-head">
      <div class="calendar-display-modes">
        <UranusIconAction
            :icon="LayoutGrid"
            :selected="displayMode === 'grid'"
            @click="setDisplayMode('grid')"
        />
        <UranusIconAction
            :icon="Rows3"
            :selected="displayMode === 'list'"
            @click="setDisplayMode('list')"
        />
        <UranusIconAction
            :icon="Map"
            :selected="displayMode === 'map'"
            @click="setDisplayMode('map')"
        />
      </div>
      <UranusHorizontalScroller>
        <div class="calendar-event-type-chips-container">
          <span
              v-for="entry in eventListStore.typeSummary"
              :key="entry.typeId"
              class="calendar-event-type-chip"
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

    <div v-else-if="displayMode=='grid'" class="calendar-card-layout">
      <UranusEventCalendarCard
          v-for="event in eventListStore.events"
          :key="event.uuid"
          :event="event"
          :locale="locale"
          :event-list-store="eventListStore"
          :type-lookup-store="typeLookupStore"
      />

      <!-- Hack to keep fewer than 4 entries in 4 column grid layout -->
      <div></div><div></div><div></div>
    </div>
    <div v-else-if="displayMode=='list'" class="calendar-list-layout">
      <UranusEventCalendarListRow
          v-for="event in eventListStore.events"
          :key="event.uuid"
          :event="event"
          :locale="locale"
          :event-list-store="eventListStore"
          :type-lookup-store="typeLookupStore"
      />
    </div>
    <UranusVenuesMap v-else-if="displayMode=='map'" class="calendar-map-layout" />


    <!-- Infinite scroll trigger -->
    <div
        ref="loadMoreTrigger"
        class="load-more-trigger"
        v-show="true"
    ></div>

    <!--div v-if="eventListStore.loading" class="loading-indicator">
      Loading more events…
    </div-->

  </div>


</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventsFilterStore } from '@/store/eventsFilterStore.ts'
import { useEventListStore } from '@/store/eventListStore.ts'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore.ts'
import { useEventReleaseStatusStore } from '@/store/eventReleaseStatusStore.ts'
import UranusHorizontalScroller from '@/component/ui/UranusHorizontalScroller.vue'
import type { EventListItemEventType } from '@/domain/event/eventListItem.model.ts'
import UranusEventCalendarCard from '@/component/event/card/UranusEventCalendarCard.vue'
import UranusEventCalendarListRow from "@/component/event/ui/UranusEventCalendarListRow.vue";
import { Rows3, LayoutGrid, Map } from 'lucide-vue-next'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusVenuesMap from '@/component/map/UranusVenuesMap.vue'

const { t, locale } = useI18n({ useScope: 'global' })

const eventReleaseStatusStore = useEventReleaseStatusStore()
const typeLookupStore = useEventTypeLookupStore()
const filterStore = useEventsFilterStore()
const eventListStore = useEventListStore()

const displayMode = ref<'list' | 'grid' | 'map'>('grid')
function setDisplayMode(mode: 'list' | 'grid' | 'map') {
  displayMode.value = mode
}

const searchQuery = ref('')

const getTypeName = (typeId: number) =>
    typeLookupStore.data[locale.value]?.types?.[typeId]?.name ?? 'Unknown'

let isResetting = false
let filterTimeout: number | null = null

watch(
    () => filterStore.filter,
    () => {
      if (filterTimeout) clearTimeout(filterTimeout)

      filterTimeout = window.setTimeout(() => {
        isResetting = true
        eventListStore.loadEvents(true)
        eventListStore.loadTypeSummary()
        isResetting = false
      }, 200)
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
        if (entry?.isIntersecting && !isResetting) {
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
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.calendar-card-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 12px;
  width: 100%;
  padding: 1rem;
}

.calendar-list-layout {
  display: flex;
  flex-direction: column;
  gap: 0px;
  width: 100%;
  padding: 1rem;
}


.calendar-map-layout {
  flex: 1;
  min-height: 0;
}

.calendar-head {
  display: flex;
  flex-direction: column;
  position: sticky;
  align-items: start;
  gap: 8px;
  top: 80px;
  z-index: 10;
  padding-top: 10px;
  background: var(--uranus-dashboard-bg);
  flex-shrink: 0;
}

.calendar-event-type-chips-container {
  display: flex;
  align-items: center;
  gap: 4px;
}

.calendar-event-type-chip {
  color: var(--uranus-color-2);
  background-color: transparent;
  border: 1px solid var(--uranus-color-6);
  padding: 4px 8px;
  border-radius: 5px;
  font-size: 1rem;
  cursor: default;
  user-select: none;

  &:hover {
    border: 1px solid var(--uranus-color-2);
  }
}

.calendar-event-type-chip.active {
  background-color: var(--uranus-select-bg);
  color: var(--uranus-select-color);
}

.calendar-display-modes {
  display: inline-flex;
  gap: 0;
  align-items: center;
  padding: 0;
  margin-left: 32px;
}

/* Infinite scroll helpers */
.load-more-trigger {
  height: 0px;
}

.loading-indicator {
  text-align: center;
  padding: 24px;
}

@media (max-width: 640px) {
}
</style>

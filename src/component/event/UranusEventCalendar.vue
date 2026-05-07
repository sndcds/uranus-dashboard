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
      <div class="calendar-options">
        <div>
          <UranusIconAction
              :icon="LayoutGrid"
              :selected="displayMode === 'grid'"
              @click="setDisplayMode('grid')"
          />
          <UranusIconAction
              :icon="Grip"
              :selected="displayMode === 'compact'"
              @click="setDisplayMode('compact')"
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

        <UranusButton size="small" variant="tertiary" @click="onResetFilter()">
          {{ t('reset_filter') }}
        </UranusButton>

        <div style="display: none;">{{ locale }}</div>
        <div class="calendar-event-count-info">{{ eventCountInfo }}</div>

      </div>

      <UranusHorizontalScroller>
        <div class="calendar-event-type-chips-container">
          <span
              v-for="entry in eventListStore.typeSummary"
              :key="entry.typeId"
              class="calendar-event-type-chip"
              :class="{ active: activeEventTypeIds.includes(entry.typeId) }"
              @click="toggleType(entry.typeId)"
          >
            {{ typeLookupStore.getTypeName(entry.typeId, locale) }} ({{ entry.count }})
          </span>
        </div>
      </UranusHorizontalScroller>
    </div>

    <transition name="fade" mode="out-in">
        <div v-if="displayMode === 'grid'" class="calendar-card-layout">
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

        <div v-else-if="displayMode === 'compact'" class="calendar-compact-layout">
          <UranusEventCompactCalendarCard
              v-for="event in eventListStore.events"
              :key="event.uuid"
              :event="event"
              :locale="locale"
              :event-list-store="eventListStore"
              :type-lookup-store="typeLookupStore"
          />
        </div>

        <div v-else-if="displayMode === 'list'" class="calendar-list-layout">
          <UranusEventCalendarListRow
              v-for="event in eventListStore.events"
              :key="event.uuid"
              :event="event"
              :locale="locale"
              :event-list-store="eventListStore"
              :type-lookup-store="typeLookupStore"
          />
        </div>

      <!--/div-->
    </transition>

    <div
        v-if="displayMode !== 'map'"
        ref="loadMoreTrigger"
        class="load-more-trigger"
        aria-hidden="true"
    ></div>

    <UranusEventsMap
        v-if="displayMode === 'map'"
        :filter-scope="filterScope"
        class="calendar-map-layout"
    />

    <!--div v-if="eventListStore.loading" class="loading-indicator">
      Loading more events…
    </div-->

  </div>


</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { type UranusEventsFilterScope, useEventsFilterStore } from '@/store/eventsFilterStore.ts'
import { useEventListStore } from '@/store/eventListStore.ts'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore.ts'
import { uranusPluralizedText } from '@/util/UranusStringUtils.ts'
import UranusHorizontalScroller from '@/component/ui/UranusHorizontalScroller.vue'
import UranusEventCalendarCard from '@/component/event/card/UranusEventCalendarCard.vue'
import UranusEventCalendarListRow from '@/component/event/ui/UranusEventCalendarListRow.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusEventsMap from '@/component/map/UranusEventsMap.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import { Rows3, LayoutGrid, Map, Grip } from 'lucide-vue-next'
import UranusEventCompactCalendarCard from '@/component/event/card/UranusEventCompactCalendarCard.vue'

const { t, locale } = useI18n({ useScope: 'global' })

type DisplayMode = 'list' | 'grid' | 'compact' | 'map'

const props = withDefaults(defineProps<{
  filterScope?: UranusEventsFilterScope
}>(), {
  filterScope: 'default'
})

const LOAD_MORE_ROOT_MARGIN = 300
const isSwitchingMode = ref(false)
const typeLookupStore = useEventTypeLookupStore()
const filterStore = useEventsFilterStore()
const eventListStore = useEventListStore()
const filterScope = computed(() => props.filterScope)
const activeFilter = computed(() => filterStore.getFilter(filterScope.value))
const activeEventTypeIds = computed(() => activeFilter.value.eventTypeIds)

const displayMode = ref<DisplayMode>('compact')
function setDisplayMode(mode: DisplayMode) {
  displayMode.value = mode
}

const initialized = ref(false)
let reloadRequestId = 0

const eventCountInfo = computed(() =>
    uranusPluralizedText(t, 'result_count_singular', 'result_count_plural', eventListStore.totalEventCount)
)

const isReloading = ref(false)
const isLoadingMore = ref(false)
let filterTimeout: number | null = null

const onResetFilter = () => {
  filterStore.resetFilter(filterScope.value)
}

async function reloadEvents() {
  const currentReloadRequest = ++reloadRequestId

  isReloading.value = true
  observer?.disconnect()

  try {
    await waitForActiveEventLoad()
    if (currentReloadRequest !== reloadRequestId) return

    await eventListStore.loadEvents(true, activeFilter.value)
    await eventListStore.loadTypeSummary(activeFilter.value)
    await waitForRenderedEvents()

    if (currentReloadRequest !== reloadRequestId) return

    isReloading.value = false
    observeLoadMoreTrigger()
    await loadMoreWhileTriggerIsNearViewport()
  } finally {
    if (currentReloadRequest === reloadRequestId) {
      isReloading.value = false
      observeLoadMoreTrigger()
    }
  }
}

async function waitForRenderedEvents() {
  await nextTick()
  await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()))
}

async function waitForActiveEventLoad() {
  while (eventListStore.loading) {
    await waitForRenderedEvents()
  }
}

function isLoadMoreTriggerNearViewport() {
  const el = loadMoreTrigger.value
  if (!el || displayMode.value === 'map') return false

  const rect = el.getBoundingClientRect()
  return (
      rect.top <= window.innerHeight + LOAD_MORE_ROOT_MARGIN &&
      rect.bottom >= -LOAD_MORE_ROOT_MARGIN
  )
}

async function loadMoreWhileTriggerIsNearViewport() {
  if (isLoadingMore.value || isReloading.value || isSwitchingMode.value || displayMode.value === 'map') return

  isLoadingMore.value = true

  try {
    while (
        eventListStore.hasMore &&
        !eventListStore.loading &&
        !isReloading.value &&
        !isSwitchingMode.value &&
        isLoadMoreTriggerNearViewport()
        ) {
      const eventCountBeforeLoad = eventListStore.events.length

      await eventListStore.loadEvents(false, activeFilter.value)
      await waitForRenderedEvents()

      if (eventListStore.error || eventListStore.events.length === eventCountBeforeLoad) {
        break
      }
    }
  } finally {
    isLoadingMore.value = false
  }
}

watch(
    () => activeFilter.value,
    () => {
      if (!initialized.value) return
      if (filterTimeout) clearTimeout(filterTimeout)
      filterTimeout = window.setTimeout(() => {
        reloadEvents()
      }, 200)
    },
    { deep: true }
)

watch(displayMode, async () => {
  if (!initialized.value) return
  isSwitchingMode.value = true
  observer?.disconnect() // stop infinite scroll during transition
  await reloadEvents()
  await waitForRenderedEvents()
  isSwitchingMode.value = false
  observeLoadMoreTrigger()
  await loadMoreWhileTriggerIsNearViewport()
})

const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function toggleType(typeId: number) {
  filterStore.toggleEventType(typeId, filterScope.value)
}

function observeLoadMoreTrigger() {
  observer?.disconnect()

  const el = loadMoreTrigger.value
  if (!el || displayMode.value === 'map' || !observer) return

  observer.observe(el)
}

onMounted(async () => {
  await reloadEvents()
  initialized.value = true

  observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          void loadMoreWhileTriggerIsNearViewport()
        }
      },
      { rootMargin: `${LOAD_MORE_ROOT_MARGIN}px` }
  )

  observeLoadMoreTrigger()
  await loadMoreWhileTriggerIsNearViewport()
})

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

.calendar-compact-layout {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 4px;
  width: 100%;
  padding: 1rem;
}

.calendar-compact-layout > * {
  aspect-ratio: 1 / 1;
  max-width: 260px;
}

.calendar-list-layout {
  display: flex;
  flex-direction: column;
  gap: 0;
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

.calendar-event-count-info {
  padding: 0 1rem;
}

.calendar-options {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0;
  margin-left: 32px;
}

.load-more-trigger {
  width: 100%;
  height: 1px;
  margin-bottom: 1px;
}

.loading-indicator {
  text-align: center;
  padding: 24px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) {
}
</style>

<!--
  src/view/public/UranusEventCalendar.vue
-->

<template>
  <div ref="calendarRoot" class="calendar-page">
    <div class="calendar-head">
      <div class="calendar-options">
        <div class="calendar-display-options">
          <UranusIconAction
              v-if="isDisplayModeAllowed('cards')"
              :icon="LayoutGrid"
              :selected="displayMode === 'cards'"
              @click="setDisplayMode('cards')"
          />
          <UranusIconAction
              v-if="isDisplayModeAllowed('compact')"
              :icon="Grip"
              :selected="displayMode === 'compact'"
              @click="setDisplayMode('compact')"
          />
          <UranusIconAction
              v-if="isDisplayModeAllowed('list')"
              :icon="Rows3"
              :selected="displayMode === 'list'"
              @click="setDisplayMode('list')"
          />
          <UranusIconAction
              v-if="isDisplayModeAllowed('calendar')"
              :icon="CalendarDays"
              :selected="displayMode === 'calendar'"
              @click="setDisplayMode('calendar')"
          />
          <UranusIconAction
              v-if="isDisplayModeAllowed('map')"
              :icon="Map"
              :selected="displayMode === 'map'"
              @click="setDisplayMode('map')"
          />
        </div>

        <UranusButton v-if="showFilterControls" size="small" variant="tertiary" @click="onResetFilter()">
          {{ t('reset_filter') }}
        </UranusButton>

        <div style="display: none;">{{ locale }}</div>
        <div class="calendar-event-count-info">{{ eventCountInfo }}</div>

        <div v-if="showFilterControls" class="calendar-mobile-filter-menu">
          <UranusButton
              class="calendar-mobile-filter-button"
              size="small"
              variant="secondary"
              :aria-expanded="isMobileFilterOpen"
              aria-controls="calendar-mobile-filter-panel"
              @click.stop="toggleMobileFilter"
          >
            <template #icon>
              <SlidersHorizontal />
            </template>
            {{ t('calendar_filter_button_label') }}
            <span v-if="activeFilterCount" class="calendar-mobile-filter-count">
              {{ activeFilterCount }}
            </span>
          </UranusButton>

          <transition name="calendar-filter-dropdown">
            <div
                v-if="isMobileFilterOpen"
                id="calendar-mobile-filter-panel"
                class="calendar-mobile-filter-dropdown"
                role="dialog"
                :aria-label="t('calendar_filter_settings_title')"
                @click.stop
                @keydown.esc="closeMobileFilter"
            >
              <div class="calendar-mobile-filter-header">
                <strong>{{ t('calendar_filter_settings_title') }}</strong>
                <button
                    type="button"
                    class="calendar-mobile-filter-close"
                    :aria-label="t('cancel')"
                    @click="closeMobileFilter"
                >
                  <X />
                </button>
              </div>

              <UranusEventFilterPanel :filter-scope="filterScope" />
            </div>
          </transition>
        </div>
      </div>

      <div v-if="typeFilterMode === 'select-single'" class="calendar-event-type-select-container">
        <label class="calendar-event-type-select-label" :for="eventTypeSelectId">
          {{ t('event_type') }}
        </label>
        <select
            :id="eventTypeSelectId"
            v-model="selectedEventTypeId"
            class="calendar-event-type-select"
        >
          <option value="">{{ t('all_events') }}</option>
          <option
              v-for="entry in eventTypeOptions"
              :key="entry.typeId"
              :value="String(entry.typeId)"
          >
            {{ typeLookupStore.getTypeName(entry.typeId, locale) }} ({{ entry.count }})
          </option>
        </select>
      </div>

      <UranusHorizontalScroller v-else>
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
        <div v-if="displayMode === 'cards'" class="calendar-card-layout">
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

        <div v-else-if="displayMode === 'calendar'" class="calendar-classic-layout">
          <UranusEventsCalendarView :event-list="eventListStore.events" />
        </div>

      <!--/div-->
    </transition>

    <div
        v-if="displayMode !== 'map' && displayMode !== 'calendar'"
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
import { uranusPluralizedText } from '@/util/string.ts'
import UranusHorizontalScroller from '@/component/ui/UranusHorizontalScroller.vue'
import UranusEventCalendarCard from '@/component/event/card/UranusEventCalendarCard.vue'
import UranusEventCalendarListRow from '@/component/event/ui/UranusEventCalendarListRow.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusEventsMap from '@/component/map/UranusEventsMap.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import { Rows3, LayoutGrid, Map, Grip, CalendarDays, SlidersHorizontal, X } from 'lucide-vue-next'
import UranusEventCompactCalendarCard from '@/component/event/card/UranusEventCompactCalendarCard.vue'
import UranusEventsCalendarView from '@/component/event/view/UranusEventsCalendarView.vue'
import UranusEventFilterPanel from '@/component/event/panel/UranusEventFilterPanel.vue'
import { isEventViewMode, type EventViewMode, useAppStore } from '@/store/appStore.ts'
import type { EventListTypeSummary } from '@/domain/event/eventListItem.model.ts'

const { t, locale } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{
  filterScope?: UranusEventsFilterScope
  displayModes?: EventViewMode[]
  initialDisplayMode?: EventViewMode
  persistDisplayMode?: boolean
  showFilterControls?: boolean
  typeFilterMode?: 'chips-multiple' | 'select-single'
}>(), {
  filterScope: 'default',
  displayModes: () => ['cards', 'compact', 'list', 'calendar', 'map'],
  initialDisplayMode: 'compact',
  persistDisplayMode: true,
  showFilterControls: true,
  typeFilterMode: 'chips-multiple'
})

const LOAD_MORE_ROOT_MARGIN = 300
const isSwitchingMode = ref(false)
const appStore = useAppStore()
const typeLookupStore = useEventTypeLookupStore()
const filterStore = useEventsFilterStore()
const eventListStore = useEventListStore()
const filterScope = computed(() => props.filterScope)
const activeFilter = computed(() => filterStore.getFilter(filterScope.value))
const activeEventTypeIds = computed(() => activeFilter.value.eventTypeIds)
const localDisplayMode = ref<EventViewMode>(props.initialDisplayMode)
const singleTypeOptions = ref<EventListTypeSummary[]>([])
const eventTypeOptions = computed(() =>
    props.typeFilterMode === 'select-single' ? singleTypeOptions.value : eventListStore.typeSummary
)
const eventTypeSelectId = computed(() => `calendar-event-type-select-${filterScope.value}`)
const calendarRoot = ref<HTMLElement | null>(null)
const isMobileFilterOpen = ref(false)
const activeFilterCount = computed(() => {
  const filter = activeFilter.value
  let count = 0

  if (filter.categories?.length) count++
  if (filter.search) count++
  if (filter.city) count++
  if (filter.startDate) count++
  if (filter.endDate) count++
  if (filter.venue?.uuid) count++
  if (filter.useCurrentLocation) count++
  if (filter.minAge != null || filter.maxAge != null) count++
  if (filter.priceType && filter.priceType !== 'not_specified') count++
  if (filter.maxPrice != null) count++
  if (filter.eventTypeIds?.length) count++

  return count
})

const displayMode = computed<EventViewMode>(() => {
  const requestedMode = props.persistDisplayMode && isEventViewMode(appStore.eventViewMode)
      ? appStore.eventViewMode
      : localDisplayMode.value

  return isDisplayModeAllowed(requestedMode) ? requestedMode : fallbackDisplayMode.value
})

function setDisplayMode(mode: EventViewMode) {
  if (!isDisplayModeAllowed(mode)) return

  localDisplayMode.value = mode

  if (props.persistDisplayMode) {
    appStore.setEventViewMode(mode)
  }
}

const fallbackDisplayMode = computed<EventViewMode>(() =>
    props.displayModes.find(isEventViewMode) ?? 'compact'
)

function isDisplayModeAllowed(mode: EventViewMode) {
  return props.displayModes.includes(mode)
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
  const currentDateRange = {
    dateRangeMode: activeFilter.value.dateRangeMode,
    startDate: activeFilter.value.startDate,
    endDate: activeFilter.value.endDate,
  }

  filterStore.resetFilter(filterScope.value)
  filterStore.setFilter(currentDateRange, filterScope.value)
}

const selectedEventTypeId = computed({
  get: () => String(activeFilter.value.eventTypeIds[0] ?? ''),
  set: (value: string) => {
    const typeId = Number(value)
    filterStore.setFilter({
      eventTypeIds: value && Number.isFinite(typeId) ? [typeId] : [],
    }, filterScope.value)
  }
})

function toggleMobileFilter() {
  isMobileFilterOpen.value = !isMobileFilterOpen.value
}

function closeMobileFilter() {
  isMobileFilterOpen.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (!isMobileFilterOpen.value) return

  const target = event.target
  if (!(target instanceof Node)) return

  if (!calendarRoot.value?.contains(target)) {
    closeMobileFilter()
  }
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
    rememberSingleTypeOptions()
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
  if (!el || displayMode.value === 'map' || displayMode.value === 'calendar') return false

  const rect = el.getBoundingClientRect()
  return (
      rect.top <= window.innerHeight + LOAD_MORE_ROOT_MARGIN &&
      rect.bottom >= -LOAD_MORE_ROOT_MARGIN
  )
}

async function loadMoreWhileTriggerIsNearViewport() {
  if (isLoadingMore.value || isReloading.value || isSwitchingMode.value || displayMode.value === 'map' || displayMode.value === 'calendar') return

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

function rememberSingleTypeOptions() {
  if (props.typeFilterMode !== 'select-single') return
  if (!eventListStore.typeSummary.length) return

  const knownOptions = new globalThis.Map<number, EventListTypeSummary>(
      singleTypeOptions.value.map(entry => [entry.typeId, entry])
  )

  for (const entry of eventListStore.typeSummary) {
    knownOptions.set(entry.typeId, entry)
  }

  singleTypeOptions.value = Array.from(knownOptions.values())
      .sort((a, b) => typeLookupStore.getTypeName(a.typeId, locale.value)
          .localeCompare(typeLookupStore.getTypeName(b.typeId, locale.value), locale.value))
}

function observeLoadMoreTrigger() {
  observer?.disconnect()

  const el = loadMoreTrigger.value
  if (!el || displayMode.value === 'map' || displayMode.value === 'calendar' || !observer) return

  observer.observe(el)
}

onMounted(async () => {
  document.addEventListener('click', onDocumentClick)
  if (props.persistDisplayMode) {
    appStore.normalizeEventViewMode()
  }

  if (!isDisplayModeAllowed(localDisplayMode.value)) {
    localDisplayMode.value = fallbackDisplayMode.value
  }

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
  document.removeEventListener('click', onDocumentClick)
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

.calendar-event-type-select-container {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 1rem;
}

.calendar-event-type-select-label {
  color: var(--uranus-color-4);
  font-size: 0.95rem;
  white-space: nowrap;
}

.calendar-event-type-select {
  min-width: 220px;
  max-width: min(320px, 100%);
  min-height: 2rem;
  border: 1px solid var(--uranus-color-6);
  border-radius: 5px;
  padding: 4px 8px;
  background: var(--uranus-bg);
  color: var(--uranus-color);
  font: inherit;
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

.calendar-display-options {
  display: inline-flex;
  gap: 0;
  align-items: center;
}

.calendar-mobile-filter-menu {
  display: none;
  position: relative;
}

.calendar-mobile-filter-button {
  position: relative;
}

.calendar-mobile-filter-count {
  display: inline-flex;
  min-width: 1.25rem;
  height: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 0 0.35rem;
  background: var(--uranus-select-bg);
  color: var(--uranus-select-color);
  font-size: 0.78rem;
  line-height: 1;
}

.calendar-mobile-filter-dropdown {
  position: fixed;
  left: 0.75rem;
  right: 0.75rem;
  top: 5rem;
  z-index: 50;
  max-height: calc(100dvh - 6rem);
  overflow: auto;
  border: 1px solid var(--uranus-color-7);
  border-radius: 8px;
  background: var(--uranus-bg);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.22);
}

.calendar-mobile-filter-header {
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0.75rem 0.5rem;
  border-bottom: 1px solid var(--uranus-color-7);
  background: var(--uranus-bg);
}

.calendar-mobile-filter-close {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--uranus-color-7);
  border-radius: 999px;
  background: transparent;
  color: var(--uranus-color);
}

.calendar-mobile-filter-close svg {
  width: 1rem;
  height: 1rem;
}

:deep(.calendar-mobile-filter-dropdown .uranus-filter-panel) {
  width: 100%;
  max-width: none;
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

.calendar-filter-dropdown-enter-active,
.calendar-filter-dropdown-leave-active {
  transition: opacity 0.14s ease, transform 0.14s ease;
}

.calendar-filter-dropdown-enter-from,
.calendar-filter-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 768px) {
  .calendar-head {
    top: 0;
    align-items: stretch;
    padding: 0.5rem 0.75rem;
  }

  .calendar-options {
    width: 100%;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem;
    margin-left: 0;
  }

  .calendar-display-options {
    order: 2;
    width: 100%;
    justify-content: space-between;
    padding-top: 0.25rem;
  }

  .calendar-mobile-filter-menu {
    display: block;
    order: 1;
  }

  .calendar-options > .uranus-button {
    display: none;
  }

  .calendar-event-count-info {
    order: 1;
    margin-left: auto;
    padding: 0;
    font-size: 0.9rem;
    white-space: nowrap;
  }

  .calendar-card-layout,
  .calendar-compact-layout,
  .calendar-list-layout {
    padding: 0.75rem;
  }

  .calendar-event-type-select-container {
    width: 100%;
    padding: 0;
  }

  .calendar-event-type-select {
    flex: 1;
    min-width: 0;
  }

  .calendar-card-layout {
    grid-template-columns: 1fr;
  }

  .calendar-compact-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>

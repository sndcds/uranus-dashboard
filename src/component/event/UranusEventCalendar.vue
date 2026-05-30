<!--
  src/view/public/UranusEventCalendar.vue
-->

<template>
  <div ref="calendarRoot" class="calendar-page">
    <div class="calendar-head">
      <div class="calendar-options">
        <div class="calendar-display-options">
          <button
              type="button"
              class="calendar-mode-button"
              :class="{ 'is-active': calendarMode === 'week' }"
              @click="calendarMode = 'week'"
          >
            <Rows3 :size="14" />
            {{ calendarLabels.week }}
          </button>
          <button
              type="button"
              class="calendar-mode-button"
              :class="{ 'is-active': calendarMode === 'month' }"
              @click="calendarMode = 'month'"
          >
            <CalendarDays :size="14" />
            {{ calendarLabels.month }}
          </button>
        </div>

        <div class="calendar-event-type-select-container">
          <UranusPopupSelect
              v-model="selectedEventTypeId"
              class="calendar-event-type-select"
              width="100%"
              :options="eventTypeSelectOptions"
              :placeholder="t('all_event_types')"
              :aria-label="t('event_type')"
          />
        </div>

        <UranusButton
            v-if="showFilterControls"
            class="calendar-reset-filter-button"
            size="small"
            variant="tertiary"
            @click="onResetFilter()"
        >
          {{ t('reset_filter') }}
        </UranusButton>

        <div v-if="showFilterControls" class="calendar-mobile-filter-menu">
          <UranusButton
              class="calendar-mobile-filter-button"
              size="small"
              variant="tertiary"
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
                <div class="calendar-mobile-filter-actions">
                  <UranusButton
                      size="small"
                      variant="tertiary"
                      @click="onResetFilterAndClose"
                  >
                    {{ t('reset_filter') }}
                  </UranusButton>
                  <button
                      type="button"
                      class="calendar-mobile-filter-close"
                      :aria-label="t('cancel')"
                      @click="closeMobileFilter"
                  >
                    <X />
                  </button>
                </div>
              </div>

              <UranusEventFilterPanel :filter-scope="filterScope" />
            </div>
          </transition>
        </div>
        <div class="calendar-event-count-info">{{ eventCountInfo }}</div>

      </div>
    </div>

    <section class="calendar-sheet-layout">
      <div v-if="calendarMode === 'week'" class="calendar-week-header">
        <UranusButton size="small" variant="tertiary" @click="goToPreviousWeek">
          <template #icon>
            <ChevronLeft />
          </template>
          {{ calendarLabels.previous }}
        </UranusButton>

        <div class="calendar-week-range">{{ weekRangeLabel }}</div>

        <UranusButton size="small" variant="tertiary" @click="goToNextWeek">
          {{ calendarLabels.next }}
          <template #icon>
            <ChevronRight />
          </template>
        </UranusButton>
      </div>

      <div v-if="calendarMode === 'week'" class="calendar-week-grid">
        <div
            v-for="day in weekDays"
            :key="day.dateKey"
            class="calendar-week-day"
        >
          <header class="calendar-week-day__header">
            <strong>{{ day.weekday }}</strong>
            <span>{{ day.dateLabel }}</span>
          </header>

          <ul v-if="day.events.length" class="calendar-week-day__events">
            <li
                v-for="event in day.events"
                :key="`${event.uuid}-${event.dateUuid}`"
                class="calendar-week-event"
            >
              <router-link
                  class="calendar-week-event__link"
                  :to="{
                    name: 'event-details',
                    params: { uuid: event.uuid, eventDateUuid: event.dateUuid }
                  }"
              >
                <span class="calendar-week-event__time">{{ formatEventStartTime(event) }}</span>
                <span class="calendar-week-event__title">{{ event.title }}</span>
                <span class="calendar-week-event__venue">{{ event.venue.name }} · {{ event.venue.city }}</span>
              </router-link>
            </li>
          </ul>

          <p v-else class="calendar-week-day__empty">{{ calendarLabels.emptyDay }}</p>
        </div>
      </div>

      <div v-else class="calendar-month-placeholder">
        {{ calendarLabels.monthPlaceholder }}
      </div>
    </section>

    <div ref="loadMoreTrigger" class="load-more-trigger" aria-hidden="true"></div>

    <!--div v-if="eventListStore.loading" class="loading-indicator">
      Loading more events…
    </div-->

  </div>


</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import {type UranusEventsFilter, type UranusEventsFilterScope, useEventsFilterStore} from '@/store/eventsFilterStore.ts'
import { useEventListStore } from '@/store/eventListStore.ts'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore.ts'
import { uranusPluralizedText } from '@/util/string.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusPopupSelect, { type UranusPopupSelectOption } from '@/component/ui/UranusPopupSelect.vue'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight, Rows3, CalendarDays } from 'lucide-vue-next'
import UranusEventFilterPanel from '@/component/event/panel/UranusEventFilterPanel.vue'
import type { EventListItem } from '@/domain/event/eventListItem.model.ts'
import type { EventListTypeSummary } from '@/domain/event/eventListItem.model.ts'
import { addDays, formatDateKey, startOfWeek } from '@/component/calendar/uranusCalendar.ts'

const { t, locale } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{
  filterScope?: UranusEventsFilterScope
  showFilterControls?: boolean
  typeFilterMode?: 'chips-multiple' | 'select-single'
}>(), {
  filterScope: 'default',
  showFilterControls: true,
  typeFilterMode: 'chips-multiple'
})

const LOAD_MORE_ROOT_MARGIN = 300
const typeLookupStore = useEventTypeLookupStore()
const filterStore = useEventsFilterStore()
const eventListStore = useEventListStore()
const filterScope = computed(() => props.filterScope)
const activeFilter = computed(() => filterStore.getFilter(filterScope.value))
const singleTypeOptions = ref<EventListTypeSummary[]>([])
const eventTypeOptions = computed(() =>
  props.typeFilterMode === 'select-single'
    ? singleTypeOptions.value
    : [...eventListStore.typeSummary].sort(compareEventTypes)
)
const eventTypeSelectOptions = computed<UranusPopupSelectOption[]>(() => [
  { value: '', label: t('all_event_types') },
  ...eventTypeOptions.value.map((entry) => ({
    value: String(entry.typeId),
    label: `${typeLookupStore.getTypeName(entry.typeId, locale.value)} (${entry.count})`,
  })),
])
const calendarMode = ref<'week' | 'month'>('week')
const weekAnchorDate = ref(startOfWeek(new Date()))
const calendarRoot = ref<HTMLElement | null>(null)
const isMobileFilterOpen = ref(false)

const calendarLabels = computed(() => {
  const isGerman = locale.value.startsWith('de')

  return {
    week: isGerman ? 'Wochenansicht' : 'Week view',
    month: isGerman ? 'Monatsansicht' : 'Month view',
    previous: isGerman ? 'Vorherige Woche' : 'Previous week',
    next: isGerman ? 'Naechste Woche' : 'Next week',
    emptyDay: isGerman ? 'Keine Veranstaltungen' : 'No events',
    monthPlaceholder: isGerman
        ? 'Monatsansicht folgt im naechsten Schritt.'
        : 'Month view will be added in the next step.',
  }
})

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

const initialized = ref(false)
let reloadRequestId = 0

const eventCountInfo = computed(() =>
    uranusPluralizedText(t, 'result_count_singular', 'result_count_plural', eventListStore.totalEventCount)
)

const isReloading = ref(false)
const isLoadingMore = ref(false)
let filterTimeout: number | null = null

const onResetFilter = () => {
  const currentDateRange: Partial<UranusEventsFilter> = {
    ...(activeFilter.value.dateRangeMode !== undefined && {
      dateRangeMode: activeFilter.value.dateRangeMode,
    }),
    ...(activeFilter.value.startDate !== undefined && {
      startDate: activeFilter.value.startDate,
    }),

    ...(activeFilter.value.endDate !== undefined && {
      endDate: activeFilter.value.endDate,
    }),
  }

  filterStore.resetFilter(filterScope.value)
  // filterStore.setFilter(currentDateRange, filterScope.value)
}

const onResetFilterAndClose = () => {
  onResetFilter()
  closeMobileFilter()
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
  const effectiveFilter = createWeeklyApiFilter(activeFilter.value)

  isReloading.value = true
  observer?.disconnect()

  try {
    await waitForActiveEventLoad()
    if (currentReloadRequest !== reloadRequestId) return

    await eventListStore.loadEvents(true, effectiveFilter)
    await eventListStore.loadTypeSummary(effectiveFilter)
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
  if (!el) return false

  const rect = el.getBoundingClientRect()
  return (
      rect.top <= window.innerHeight + LOAD_MORE_ROOT_MARGIN &&
      rect.bottom >= -LOAD_MORE_ROOT_MARGIN
  )
}

async function loadMoreWhileTriggerIsNearViewport() {
  if (isLoadingMore.value || isReloading.value) return

  isLoadingMore.value = true

  try {
    while (
        eventListStore.hasMore &&
        !eventListStore.loading &&
        !isReloading.value &&
        isLoadMoreTriggerNearViewport()
        ) {
      const eventCountBeforeLoad = eventListStore.events.length
      const effectiveFilter = createWeeklyApiFilter(activeFilter.value)

      await eventListStore.loadEvents(false, effectiveFilter)
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

watch(weekAnchorDate, () => {
  if (!initialized.value) return
  void reloadEvents()
})

const loadMoreTrigger = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const eventsByDate = computed(() => {
  const grouped = new globalThis.Map<string, EventListItem[]>()

  eventListStore.events.forEach((event) => {
    const dateKey = formatDateKey(toEventDateTime(event))
    const bucket = grouped.get(dateKey) ?? []
    bucket.push(event)
    grouped.set(dateKey, bucket)
  })

  grouped.forEach((events) => {
    events.sort((a, b) => toEventDateTime(a).getTime() - toEventDateTime(b).getTime())
  })

  return grouped
})

const weekRangeLabel = computed(() => {
  const weekStart = weekAnchorDate.value
  const weekEnd = addDays(weekStart, 6)
  const formatter = new Intl.DateTimeFormat(locale.value, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  return `${formatter.format(weekStart)} - ${formatter.format(weekEnd)}`
})

const weekDays = computed(() => {
  const weekdayFormatter = new Intl.DateTimeFormat(locale.value, { weekday: 'long' })
  const dateFormatter = new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: '2-digit' })

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekAnchorDate.value, index)
    const dateKey = formatDateKey(date)

    return {
      date,
      dateKey,
      weekday: weekdayFormatter.format(date),
      dateLabel: dateFormatter.format(date),
      events: eventsByDate.value.get(dateKey) ?? [],
    }
  })
})

function goToPreviousWeek() {
  weekAnchorDate.value = addDays(weekAnchorDate.value, -7)
}

function goToNextWeek() {
  weekAnchorDate.value = addDays(weekAnchorDate.value, 7)
}

function toEventDateTime(event: EventListItem) {
  const [year, month, day] = event.startDate.split('-').map(Number)
  const [hour = 0, minute = 0] = (event.startTime ?? '00:00').split(':').map(Number)

  if (!year || !month || !day) {
    const fallback = new Date(event.startDate)
    return Number.isNaN(fallback.getTime()) ? new Date() : fallback
  }

  return new Date(year, month - 1, day, hour, minute)
}

function formatEventStartTime(event: EventListItem) {
  if (!event.startTime) return '--:--'

  return new Intl.DateTimeFormat(locale.value, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(toEventDateTime(event))
}

function createWeeklyApiFilter(filter: UranusEventsFilter): UranusEventsFilter {
  const weekStart = weekAnchorDate.value
  const weekEnd = addDays(weekStart, 6)

  return {
    ...filter,
    dateRangeMode: 'custom',
    startDate: formatDateKey(weekStart),
    endDate: formatDateKey(weekEnd),
  }
}

function compareEventTypes(a: EventListTypeSummary, b: EventListTypeSummary) {
  if (b.count !== a.count) return b.count - a.count
  return typeLookupStore
      .getTypeName(a.typeId, locale.value)
      .localeCompare(
          typeLookupStore.getTypeName(b.typeId, locale.value),
          locale.value
      )
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

  singleTypeOptions.value = Array.from(knownOptions.values()).sort(compareEventTypes)
}

function observeLoadMoreTrigger() {
  observer?.disconnect()

  const el = loadMoreTrigger.value
  if (!el || !observer) return

  observer.observe(el)
}

onMounted(async () => {
  document.addEventListener('click', onDocumentClick)

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

.calendar-sheet-layout {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
}

.calendar-week-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.calendar-week-range {
  font-weight: 600;
  text-align: center;
}

.calendar-week-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 0.75rem;
}

.calendar-week-day {
  display: grid;
  align-content: start;
  gap: 0.6rem;
  min-height: 220px;
  padding: 0.75rem;
  border: 1px solid var(--uranus-color-7);
  background: var(--uranus-bg);
}

.calendar-week-day__header {
  display: grid;
  gap: 0.15rem;
}

.calendar-week-day__header strong {
  text-transform: capitalize;
}

.calendar-week-day__events {
  display: grid;
  gap: 0.45rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.calendar-week-event {
  display: block;
}

.calendar-week-event__link {
  display: grid;
  gap: 0.15rem;
  padding: 0.45rem 0.5rem;
  background: #f2f2f2;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.calendar-week-event__link:hover {
  background: #e8e8e8;
}

.calendar-week-event__link:focus-visible {
  outline: 2px solid var(--uranus-select-bg);
  outline-offset: 1px;
}

.calendar-week-event__time {
  font-size: 0.88rem;
  color: var(--uranus-color-4);
}

.calendar-week-event__title {
  font-weight: 600;
  line-height: 1.25;
}

.calendar-week-event__venue,
.calendar-week-day__empty {
  font-size: 0.9rem;
  color: var(--uranus-color-4);
}

.calendar-month-placeholder {
  min-height: 320px;
  display: grid;
  place-items: center;
  border: 1px dashed var(--uranus-color-7);
  background: var(--uranus-bg);
  color: var(--uranus-color-4);
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
  width: 100%;
  max-width: none;
  justify-self: stretch;
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
  padding: 0.5rem 1rem;
  background: var(--uranus-dashboard-bg);
  flex-shrink: 0;
}

.calendar-display-type-icon {
  padding: 0.5rem;
}

.calendar-mode-button {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--uranus-color-6);
  background: transparent;
  color: var(--uranus-color);
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}

.calendar-mode-button.is-active {
  border-color: var(--uranus-select-bg);
  background: var(--uranus-select-bg);
  color: var(--uranus-select-color);
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
}

.calendar-event-type-select {
  min-width: 220px;
  max-width: min(320px, 100%);
  width: 100%;
}

.calendar-event-type-select :deep(.uranus-popup-select__trigger) {
  border-color: var(--uranus-color-6);
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
  height: 32px;
}

.calendar-mobile-filter-count {
  display: inline-flex;
  min-width: 1.25rem;
  height: 1.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  // padding: 0 0.35rem;
  margin-left: 0.25rem;
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

.calendar-mobile-filter-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
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

@media (max-width: 1023px) {
  .calendar-mobile-filter-menu {
    display: block;
  }

  .calendar-reset-filter-button {
    display: none;
  }
}

@media (max-width: 768px) {
  .calendar-head {
    top: 80px;
    align-items: stretch;
    padding: 0.5rem 0.75rem;
  }

  .calendar-options {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
  }

  /* First row */
  .calendar-event-type-select-container {
    order: 1;
    flex: 1 1 auto;
    min-width: 0;
  }

  .calendar-event-type-select {
    width: 100%;
    min-width: 0;
  }

  .calendar-mobile-filter-menu {
    display: block;
    order: 2;
    flex-shrink: 0;
  }

  .calendar-event-count-info {
    order: 3;
    margin-left: auto;
    padding: 0;
    font-size: 0.9rem;
    white-space: nowrap;
    flex-shrink: 0;
  }

  /* Second row */
  .calendar-display-options {
    order: 4;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 2rem;
    padding-top: 0.25rem;
  }

  .calendar-sheet-layout {
    padding: 0.75rem;
  }

  .calendar-week-header {
    flex-wrap: wrap;
    justify-content: center;
  }

  .calendar-week-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<!--
  src/component/portal/view/UranusPortalView.vue
-->

<template>
  <div class="uranus-portal-events">
    <header class="uranus-portal-events__header">
      <div>
        <h1>{{ t('events') }}</h1>
        <p>{{ eventCountInfo }}</p>
      </div>

      <UranusButton
          v-if="activeEventTypeIds.length"
          size="small"
          variant="tertiary"
          @click="onResetFilter"
      >
        {{ t('reset_filter') }}
      </UranusButton>
    </header>

    <UranusHorizontalScroller v-if="eventListStore.typeSummary.length" class="uranus-portal-events__type-scroller">
      <div class="uranus-portal-events__type-list">
        <button
            v-for="entry in eventListStore.typeSummary"
            :key="entry.typeId"
            type="button"
            class="uranus-portal-events__type-chip"
            :class="{ 'uranus-portal-events__type-chip--active': activeEventTypeIds.includes(entry.typeId) }"
            @click="toggleType(entry.typeId)"
        >
          {{ typeLookupStore.getTypeName(entry.typeId, locale) }} ({{ entry.count }})
        </button>
      </div>
    </UranusHorizontalScroller>

    <div v-if="eventListStore.error" class="uranus-portal-events__state">
      {{ eventListStore.error }}
    </div>

    <div v-else-if="showInitialLoading" class="uranus-portal-events__state">
      Loading events...
    </div>

    <div v-else-if="!eventListStore.events.length" class="uranus-portal-events__state">
      {{ t('result_count_plural', { count: 0 }) }}
    </div>

    <div v-else class="uranus-portal-events__grid">
      <router-link
          v-for="event in eventListStore.events"
          :key="`${event.uuid}-${event.dateUuid}`"
          :to="{
            name: 'event-details',
            params: { uuid: event.uuid, eventDateUuid: event.dateUuid }
          }"
          class="uranus-portal-event-card custom-link"
      >
        <div class="uranus-portal-event-card__image-frame">
          <img
              :src="eventListStore.getEventImageUrl(event, { width: 640, ratio: '4:3' })"
              :alt="event.title"
              class="uranus-portal-event-card__image"
          />
        </div>

        <div class="uranus-portal-event-card__body">
          <div class="uranus-portal-event-card__meta">
            <span>{{ formatEventDateTime(event) }}</span>
            <span>{{ event.venue.name }} · {{ event.venue.city }}</span>
          </div>

          <h2>{{ event.title }}</h2>

          <p v-if="event.subtitle" class="uranus-portal-event-card__subtitle">
            {{ event.subtitle }}
          </p>

          <div v-if="getUniqueEventTypes(event).length" class="uranus-portal-event-card__tags">
            <span
                v-for="typeId in getUniqueEventTypes(event)"
                :key="typeId"
                class="uranus-portal-event-card__tag"
            >
              {{ typeLookupStore.getTypeName(typeId, locale) }}
            </span>
          </div>
        </div>
      </router-link>
    </div>

    <div ref="loadMoreTrigger" class="uranus-portal-events__load-more-trigger" aria-hidden="true"></div>

    <div v-if="isLoadingMore" class="uranus-portal-events__state uranus-portal-events__state--inline">
      Loading events...
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useEventListStore } from '@/store/eventListStore.ts'
import { useEventsFilterStore } from '@/store/eventsFilterStore.ts'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusHorizontalScroller from '@/component/ui/UranusHorizontalScroller.vue'
import { uranusFormatDateTime, uranusPluralizedText } from '@/util/UranusStringUtils.ts'
import type { EventListItem, EventListItemEventType } from '@/domain/event/eventListItem.model.ts'

const { t, locale } = useI18n({ useScope: 'global' })

const LOAD_MORE_ROOT_MARGIN = 300

const eventListStore = useEventListStore()
const filterStore = useEventsFilterStore()
const typeLookupStore = useEventTypeLookupStore()
const route = useRoute()

const filterScope = 'portal'
const portalUuid = computed(() => route.params.uuid?.toString() ?? null)
const activeFilter = computed(() => ({
  ...filterStore.getFilter(filterScope),
  portalUuid: portalUuid.value
}))
const activeEventTypeIds = computed(() => activeFilter.value.eventTypeIds)
const eventCountInfo = computed(() =>
    uranusPluralizedText(t, 'result_count_singular', 'result_count_plural', eventListStore.totalEventCount)
)
const showInitialLoading = computed(() => eventListStore.loading && !eventListStore.events.length)

const initialized = ref(false)
const isReloading = ref(false)
const isLoadingMore = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)

let reloadRequestId = 0
let filterTimeout: number | null = null
let observer: IntersectionObserver | null = null

function onResetFilter() {
  filterStore.resetFilter(filterScope)
}

function toggleType(typeId: number) {
  filterStore.toggleEventType(typeId, filterScope)
}

function formatEventDateTime(event: EventListItem) {
  return uranusFormatDateTime(event.startDate, event.startTime, locale.value)
}

function getUniqueEventTypes(event: EventListItem) {
  const set = new Set<number>()
  event.eventTypes?.forEach((type: EventListItemEventType) => set.add(type.typeId))
  return Array.from(set)
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

function observeLoadMoreTrigger() {
  observer?.disconnect()

  const el = loadMoreTrigger.value
  if (!el || !observer) return

  observer.observe(el)
}

watch(
    () => activeFilter.value,
    () => {
      if (!initialized.value) return
      if (filterTimeout) clearTimeout(filterTimeout)
      filterTimeout = window.setTimeout(() => {
        void reloadEvents()
      }, 200)
    },
    { deep: true }
)

onMounted(async () => {
  observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          void loadMoreWhileTriggerIsNearViewport()
        }
      },
      { rootMargin: `${LOAD_MORE_ROOT_MARGIN}px` }
  )

  await typeLookupStore.initialize()
  await reloadEvents()
  initialized.value = true

  observeLoadMoreTrigger()
  await loadMoreWhileTriggerIsNearViewport()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (filterTimeout) clearTimeout(filterTimeout)
})
</script>

<style scoped lang="scss">
.uranus-portal-events {
  --portal-event-bg: var(--uranus-bg);
  --portal-event-text: var(--uranus-color);
  --portal-event-muted: var(--uranus-color-3);
  --portal-event-border: var(--uranus-color-7);
  --portal-event-accent: var(--uranus-link-color);
  --portal-event-chip-bg: var(--uranus-color-8);

  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  min-height: 100vh;
  padding: clamp(1rem, 3vw, 2rem);
  background: var(--portal-event-bg);
  color: var(--portal-event-text);
}

.uranus-portal-events__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.uranus-portal-events__header h1 {
  margin: 0;
  font-size: clamp(1.75rem, 4vw, 3rem);
  line-height: 1;
}

.uranus-portal-events__header p {
  margin: 0.35rem 0 0;
  color: var(--portal-event-muted);
}

.uranus-portal-events__type-list {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.uranus-portal-events__type-chip {
  border: 1px solid var(--portal-event-border);
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  background: transparent;
  color: var(--portal-event-text);
  cursor: pointer;
  white-space: nowrap;
}

.uranus-portal-events__type-chip:hover,
.uranus-portal-events__type-chip--active {
  border-color: var(--portal-event-accent);
  background: var(--portal-event-chip-bg);
  color: var(--portal-event-accent);
}

.uranus-portal-events__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: clamp(0.75rem, 2vw, 1.25rem);
  width: 100%;
}

.uranus-portal-event-card {
  display: flex;
  min-width: 0;
  min-height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--portal-event-border);
  border-radius: var(--portal-event-card-radius, 6px);
  background: var(--portal-event-card-bg, var(--portal-event-bg));
  color: var(--portal-event-text);
  transition: transform 0.18s ease, border-color 0.18s ease;
}

.uranus-portal-event-card:hover {
  transform: translateY(-2px);
  border-color: var(--portal-event-accent);
  color: var(--portal-event-text);
}

.uranus-portal-event-card__image-frame {
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--portal-event-chip-bg);
}

.uranus-portal-event-card__image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.25s ease;
}

.uranus-portal-event-card:hover .uranus-portal-event-card__image {
  transform: scale(1.04);
}

.uranus-portal-event-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.65rem;
  padding: 0.9rem;
}

.uranus-portal-event-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  color: var(--portal-event-muted);
  font-size: 0.9rem;
  line-height: 1.35;
}

.uranus-portal-event-card h2 {
  margin: 0;
  font-size: 1.2rem;
  line-height: 1.15;
}

.uranus-portal-event-card__subtitle {
  margin: 0;
  color: var(--portal-event-muted);
  line-height: 1.4;
}

.uranus-portal-event-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: auto;
}

.uranus-portal-event-card__tag {
  border-radius: 999px;
  padding: 0.25rem 0.5rem;
  background: var(--portal-event-chip-bg);
  color: var(--portal-event-muted);
  font-size: 0.8rem;
}

.uranus-portal-events__state {
  display: flex;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
  color: var(--portal-event-muted);
}

.uranus-portal-events__state--inline {
  min-height: 3rem;
}

.uranus-portal-events__load-more-trigger {
  width: 100%;
  height: 1px;
}

@media (max-width: 640px) {
  .uranus-portal-events__header {
    flex-direction: column;
  }
}
</style>

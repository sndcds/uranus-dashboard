<!--
  src/component/portal/view/UranusPortalView.vue
-->

<template>
  <div class="uranus-portal-events" :style="portalCssVars">
    <header class="uranus-portal-events__header">
      <div>
        <h1>{{ portal?.name ?? t('events') }}</h1>
        <p>{{ portal?.description ?? eventCountInfo }}</p>
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

    <div v-if="portalError" class="uranus-portal-events__state">
      {{ portalError }}
    </div>

    <div v-else-if="eventListStore.error" class="uranus-portal-events__state">
      {{ eventListStore.error }}
    </div>

    <div v-else-if="showInitialLoading || portalLoading" class="uranus-portal-events__state">
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
import { apiFetch } from '@/api.ts'
import { useEventListStore } from '@/store/eventListStore.ts'
import { useEventsFilterStore } from '@/store/eventsFilterStore.ts'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusHorizontalScroller from '@/component/ui/UranusHorizontalScroller.vue'
import { uranusFormatDateTime, uranusPluralizedText } from '@/util/UranusStringUtils.ts'
import type { EventListItem, EventListItemEventType } from '@/domain/event/eventListItem.model.ts'

type PortalStyleSection = Record<string, string | number | null | undefined>

interface PortalStyle {
  portal?: PortalStyleSection
  content?: PortalStyleSection
  header?: {
    title?: PortalStyleSection
    description?: PortalStyleSection
  }
  'event-grid'?: PortalStyleSection
  'event-card'?: PortalStyleSection & {
    hover?: PortalStyleSection
  }
  // Legacy style keys kept for existing portal records.
  grid?: PortalStyleSection
  card?: PortalStyleSection
}

interface PortalDTO {
  uuid: string
  name: string
  description?: string | null
  org_uuid: string
  spatial_filter_mode?: string | null
  prefilter?: Record<string, unknown> | null
  style?: PortalStyle | string | null
}

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
const portal = ref<PortalDTO | null>(null)
const portalLoading = ref(false)
const portalError = ref<string | null>(null)
const portalCssVars = computed(() => {
  const style = normalizePortalStyle(portal.value?.style)
  const eventGrid = style?.['event-grid'] ?? style?.grid
  const eventCard = style?.['event-card'] ?? style?.card
  const eventCardHover = getStyleSection(eventCard?.hover)
  const vars: Record<string, string> = {}

  setStyleVar(vars, '--portal-event-padding', style?.portal?.padding)
  setStyleVar(vars, '--portal-event-bg', style?.portal?.background)
  setStyleVar(vars, '--portal-event-text', style?.portal?.color)
  setStyleVar(vars, '--portal-event-font-family', style?.portal?.['font-family'])

  setStyleVar(vars, '--portal-content-max-width', style?.content?.['max-width'])
  setStyleVar(vars, '--portal-content-text-align', style?.content?.align)
  setStyleVar(vars, '--portal-content-align-self', mapContentAlign(style?.content?.align))

  setStyleVar(vars, '--portal-header-title-color', style?.header?.title?.color)
  setStyleVar(vars, '--portal-header-title-font-size', style?.header?.title?.['font-size'])
  setStyleVar(vars, '--portal-header-title-font-weight', style?.header?.title?.['font-weight'])
  setStyleVar(vars, '--portal-header-title-line-height', style?.header?.title?.['line-height'])
  setStyleVar(vars, '--portal-header-description-color', style?.header?.description?.color)
  setStyleVar(vars, '--portal-header-description-font-size', style?.header?.description?.['font-size'])
  setStyleVar(vars, '--portal-header-description-line-height', style?.header?.description?.['line-height'])

  setStyleVar(vars, '--portal-event-grid-gap', eventGrid?.gap)
  setStyleVar(vars, '--portal-event-grid-min-card-width', eventGrid?.['min-card-width'])

  setStyleVar(vars, '--portal-event-card-bg', eventCard?.background)
  setStyleVar(vars, '--portal-event-card-radius', eventCard?.radius ?? eventCard?.['border-radius'])
  setStyleVar(vars, '--portal-event-card-border', eventCard?.border)
  setStyleVar(vars, '--portal-event-card-shadow', eventCard?.shadow)
  setStyleVar(vars, '--portal-event-card-hover-shadow', eventCardHover?.shadow)
  setStyleVar(vars, '--portal-event-card-hover-scale', eventCardHover?.scale)

  return vars
})

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

function setStyleVar(vars: Record<string, string>, name: string, value: string | number | null | undefined) {
  if (typeof value === 'string' && value.trim()) {
    vars[name] = value.trim()
  } else if (typeof value === 'number') {
    vars[name] = value.toString()
  }
}

function normalizePortalStyle(style: PortalStyle | string | null | undefined): PortalStyle | null {
  if (!style) return null
  if (typeof style === 'object') return style

  try {
    const parsed = JSON.parse(style)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as PortalStyle
        : null
  } catch {
    return null
  }
}

function getStyleSection(value: unknown): PortalStyleSection | undefined {
  return value && typeof value === 'object' && !Array.isArray(value)
      ? value as PortalStyleSection
      : undefined
}

function mapContentAlign(value: string | number | null | undefined) {
  if (value === 'center') return 'center'
  if (value === 'right') return 'flex-end'
  if (value === 'stretch') return 'stretch'
  return 'flex-start'
}

async function fetchPortal() {
  if (!portalUuid.value) {
    portal.value = null
    portalError.value = 'Missing portal UUID'
    return
  }

  portalLoading.value = true
  portalError.value = null

  try {
    const apiResponse = await apiFetch<PortalDTO>(`/api/portal/${encodeURIComponent(portalUuid.value)}`)
    portal.value = apiResponse.data ?? null
  } catch (err) {
    portal.value = null
    portalError.value = 'Failed to load portal'
    console.error(err)
  } finally {
    portalLoading.value = false
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

watch(portalUuid, async () => {
  if (!initialized.value) return
  await fetchPortal()
})

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
  await fetchPortal()
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
  padding: var(--portal-event-padding, clamp(1rem, 3vw, 2rem));
  background: var(--portal-event-bg);
  color: var(--portal-event-text);
  font-family: var(--portal-event-font-family, inherit);
}

.uranus-portal-events__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  max-width: var(--portal-content-max-width, none);
  align-self: var(--portal-content-align-self, stretch);
  text-align: var(--portal-content-text-align, left);
}

.uranus-portal-events__header h1 {
  margin: 0;
  color: var(--portal-header-title-color, var(--portal-event-text));
  font-size: var(--portal-header-title-font-size, clamp(1.75rem, 4vw, 3rem));
  font-weight: var(--portal-header-title-font-weight, 700);
  line-height: var(--portal-header-title-line-height, 1);
}

.uranus-portal-events__header p {
  margin: 0.35rem 0 0;
  color: var(--portal-header-description-color, var(--portal-event-muted));
  font-size: var(--portal-header-description-font-size, 1rem);
  line-height: var(--portal-header-description-line-height, 1.4);
}

.uranus-portal-events__type-scroller,
.uranus-portal-events__grid,
.uranus-portal-events__state,
.uranus-portal-events__load-more-trigger {
  width: 100%;
  max-width: var(--portal-content-max-width, none);
  align-self: var(--portal-content-align-self, stretch);
}

.uranus-portal-events__type-scroller {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
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
  grid-template-columns: repeat(auto-fill, minmax(var(--portal-event-grid-min-card-width, 240px), 1fr));
  gap: var(--portal-event-grid-gap, clamp(0.75rem, 2vw, 1.25rem));
}

.uranus-portal-event-card {
  display: flex;
  min-width: 0;
  min-height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: var(--portal-event-card-border, 1px solid var(--portal-event-border));
  border-radius: var(--portal-event-card-radius, 6px);
  background: var(--portal-event-card-bg, var(--portal-event-bg));
  box-shadow: var(--portal-event-card-shadow, none);
  color: var(--portal-event-text);
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.uranus-portal-event-card:hover {
  transform: translateY(-2px) scale(var(--portal-event-card-hover-scale, 1));
  border-color: var(--portal-event-accent);
  box-shadow: var(--portal-event-card-hover-shadow, var(--portal-event-card-shadow, none));
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

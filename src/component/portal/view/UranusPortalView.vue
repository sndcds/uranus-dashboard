<!--
  src/component/portal/view/UranusPortalView.vue
-->

<template>

  <component
      :is="'style'"
      v-if="portalCustomCss"
      type="text/css"
      v-text="portalCustomCss"
  ></component>
  <div
      class="uranus-portal-events"
      :style="{
        '--portal-background-image': backgroundUrl ? `url(${backgroundUrl})` : undefined
      }"
  >
    <header class="uranus-portal-events__header">

      <UranusLogoImage
          v-if="logoUrl"
          :logoURL="logoUrl"
          theme="light"
          :pixelCount="24000"
          :maxWidth="480"
          :maxHeight="240"
      />

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
import UranusLogoImage from '@/component/ui/UranusLogoImage.vue'

type PortalStyleSection = Record<string, string | number | null | undefined>

interface PortalStyle {
  'custom-css'?: string
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
  'event-card-image'?: PortalStyleSection & {
    hover?: PortalStyleSection
  }
  'event-card-info'?: PortalStyleSection
  'event-card-tags'?: PortalStyleSection
  'event-card-type-chips'?: PortalStyleSection
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
  pre_filter?: Record<string, unknown> | string | null
  prefilter?: Record<string, unknown> | null
  style?: PortalStyle | string | null
  web_logo_uuid?: string | null
  background_image_uuid?: string | null
}

const { t, locale } = useI18n({ useScope: 'global' })

const LOAD_MORE_ROOT_MARGIN = 300

const eventListStore = useEventListStore()
const filterStore = useEventsFilterStore()
const typeLookupStore = useEventTypeLookupStore()
const route = useRoute()

const logoUrl = computed(() => {
  const uuid = portal.value?.web_logo_uuid
  return uuid
      ? `http://localhost:9090/api/image/${uuid}?width=3600&type=png&quality=80`
      : null
})

const backgroundUrl = computed(() => {
  const uuid = portal.value?.background_image_uuid
  return uuid
      ? `http://localhost:9090/api/image/${uuid}?width=3600&type=png&quality=80`
      : null
})

const filterScope = 'portal'
const portalUuid = computed(() => route.params.uuid?.toString() ?? null)
const activeFilter = computed(() => ({
  ...filterStore.getFilter(filterScope),
  portalUuid: portalUuid.value,
  portalPrefilter: portalEventPrefilter.value,
}))
const activeEventTypeIds = computed(() => activeFilter.value.eventTypeIds)
const eventCountInfo = computed(() =>
    uranusPluralizedText(t, 'result_count_singular', 'result_count_plural', eventListStore.totalEventCount)
)
const showInitialLoading = computed(() => eventListStore.loading && !eventListStore.events.length)
const portal = ref<PortalDTO | null>(null)
const portalLoading = ref(false)
const portalError = ref<string | null>(null)
const portalEventPrefilter = computed(() => {
  const prefilter = normalizePortalPrefilter(portal.value?.pre_filter ?? portal.value?.prefilter)
  const result: { age?: string | number | null, venues?: string | number | null } = {}

  if (isPrefilterValue(prefilter?.age)) result.age = prefilter.age
  if (isPrefilterValue(prefilter?.venues)) result.venues = prefilter.venues

  return Object.keys(result).length ? result : null
})
const portalCustomCss = computed(() => {
  const css = normalizePortalStyle(portal.value?.style)?.['custom-css']
  return typeof css === 'string' && css.trim() ? css : ''
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

function normalizePortalPrefilter(prefilter: Record<string, unknown> | string | null | undefined): Record<string, unknown> | null {
  if (!prefilter) return null
  if (typeof prefilter === 'object' && !Array.isArray(prefilter)) return prefilter

  if (typeof prefilter === 'string') {
    try {
      const parsed = JSON.parse(prefilter)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
          ? parsed as Record<string, unknown>
          : null
    } catch {
      return null
    }
  }

  return null
}

function isPrefilterValue(value: unknown): value is string | number {
  return (
      (typeof value === 'string' && value.trim().length > 0) ||
      (typeof value === 'number' && Number.isFinite(value))
  )
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
    const apiPath = `/api/portal/${encodeURIComponent(portalUuid.value)}`
    const apiResponse = await apiFetch<PortalDTO>(apiPath)
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

<style lang="scss">
*, *::before, *::after {
  box-sizing: border-box;
}

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
}

.uranus-portal-events__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  align-self: stretch;
  text-align:  left;
}

.uranus-portal-events__header h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  line-height: 1;
}

.uranus-portal-events__header p {
  margin: 0.35rem 0 0;
  font-size: 1rem;
  line-height: 1.4;
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
  border-radius: 999px;
  padding: 0.45rem 0.75rem;
  background: transparent;
  cursor: pointer;
  white-space: nowrap;
}

.uranus-portal-events__type-chip:hover,
.uranus-portal-events__type-chip--active {
}

.uranus-portal-events__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(var(--portal-event-grid-min-card-width, 240px), 1fr));
  gap: 1rem;
}

.uranus-portal-event-card {
  display: flex;
  min-width: 0;
  min-height: 100%;
  flex-direction: column;
  overflow: hidden;
  gap: 0;
  padding: 0;
}

.uranus-portal-event-card:hover {
  color: inherit !important;
}

.uranus-portal-event-card__image-frame {
  aspect-ratio: var(--portal-event-card-image-aspect-ratio, 7 / 5);
  overflow: hidden;
}

.uranus-portal-event-card__image {
  width: 100%;
  height: 100%;
  transition: transform var(--portal-event-card-image-transition, 0.25s ease);
}

.uranus-portal-event-card:hover .uranus-portal-event-card__image {
  transform: scale(var(--portal-event-card-image-hover-scale, 1.04));
}

.uranus-portal-event-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem;
}

.uranus-portal-event-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.uranus-portal-event-card h2 {
  margin: 0;
  line-height: 1.15;
}

.uranus-portal-event-card__subtitle {
  margin: 0;
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
  font-size: 0.8rem;
}

.uranus-portal-events__state {
  display: flex;
  min-height: 12rem;
  align-items: center;
  justify-content: center;
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

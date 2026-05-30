<!--
  src/component/portal/view/UranusPortalEventListContent.vue

  Zeigt die Event-Liste mit Infinite-Scroll zwischen Header und Footer des Portals.
-->

<template>
  <div v-if="portalError" class="uranus-portal-events__state">
    {{ portalError }}
  </div>

  <div v-else-if="eventListStore.error" class="uranus-portal-events__state">
    {{ eventListStore.error }}
  </div>

  <div v-else class="uranus-portal-events__grid">
    <router-link
        v-for="event in eventListStore.events"
        :key="`${event.uuid}-${event.dateUuid}`"
        :to="{
          name: 'event-details',
          params: { uuid: event.uuid, eventDateUuid: event.dateUuid }
        }"
        class="uranus-portal-event-card"
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
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEventListStore } from '@/store/eventListStore.ts'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore.ts'
import { uranusFormatDateTime } from '@/util/string.ts'
import type { EventListItem, EventListItemEventType } from '@/domain/event/eventListItem.model.ts'
import type { UranusEventsFilter } from '@/store/eventsFilterStore.ts'

const props = defineProps<{
  activeFilter: UranusEventsFilter
  portalError: string | null
  portalReady: boolean
}>()

const LOAD_MORE_ROOT_MARGIN = 300

const { locale } = useI18n({ useScope: 'global' })
const eventListStore = useEventListStore()
const typeLookupStore = useEventTypeLookupStore()

const isLoadingMore = ref(false)
const isReloading = ref(false)
const loadMoreTrigger = ref<HTMLElement | null>(null)

let reloadRequestId = 0
let filterTimeout: number | null = null
let observer: IntersectionObserver | null = null
let initialized = false

function formatEventDateTime(event: EventListItem) {
  return uranusFormatDateTime(event.startDate, event.startTime, locale.value)
}

function getUniqueEventTypes(event: EventListItem) {
  const set = new Set<number>()
  event.eventTypes?.forEach((type: EventListItemEventType) => set.add(type.typeId))
  return Array.from(set)
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

async function waitForRenderedEvents() {
  await nextTick()
  await new Promise<void>(resolve => window.requestAnimationFrame(() => resolve()))
}

async function waitForActiveEventLoad() {
  while (eventListStore.loading) {
    await waitForRenderedEvents()
  }
}

async function loadMoreWhileTriggerIsNearViewport() {
  if (isLoadingMore.value || isReloading.value) return

  isLoadingMore.value = true

  try {
    while (
        eventListStore.hasMore &&
        !eventListStore.loading &&
        isLoadMoreTriggerNearViewport()
        ) {
      const eventCountBeforeLoad = eventListStore.events.length

      await eventListStore.loadEvents(false, props.activeFilter)
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

async function reloadEvents() {
  const currentReloadRequest = ++reloadRequestId

  isReloading.value = true
  observer?.disconnect()

  try {
    await waitForActiveEventLoad()
    if (currentReloadRequest !== reloadRequestId) return

    await eventListStore.loadEvents(true, props.activeFilter, {
      keepCurrentEvents: initialized && eventListStore.events.length > 0,
    })
    await eventListStore.loadTypeSummary(props.activeFilter)
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

watch(
    () => props.portalReady,
    async (ready) => {
      if (!ready) return
      await typeLookupStore.initialize()
      await reloadEvents()
      initialized = true
      observeLoadMoreTrigger()
      await loadMoreWhileTriggerIsNearViewport()
    },
    { immediate: true }
)

watch(
    () => props.activeFilter,
    () => {
      if (!initialized) return
      if (filterTimeout) clearTimeout(filterTimeout)
      filterTimeout = window.setTimeout(() => {
        void reloadEvents()
      }, 200)
    },
    { deep: true }
)

onMounted(() => {
  observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          void loadMoreWhileTriggerIsNearViewport()
        }
      },
      { rootMargin: `${LOAD_MORE_ROOT_MARGIN}px` }
  )
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (filterTimeout) clearTimeout(filterTimeout)
})
</script>

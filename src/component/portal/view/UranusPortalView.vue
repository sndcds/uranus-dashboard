<!--
  src/component/portal/view/UranusPortalView.vue
-->

<template>
  <component
      :is="'style'"
      v-if="portalRenderReady && portalStructuredCss"
      type="text/css"
      v-text="portalStructuredCss"
  ></component>
  <component
      :is="'style'"
      v-if="portalRenderReady && portalCustomCss"
      type="text/css"
      v-text="portalCustomCss"
  ></component>
  <div
      v-if="portalRenderReady"
      class="uranus-portal-events"
      :class="`uranus-portal-events--header-${headerConfig.layout}`"
      :data-portal-uuid="portalUuid"
      :style="portalRootStyle"
  >
    <UranusPortalHeader
        :config="headerConfig"
        :title="portal?.name ?? t('events')"
        :description="portal?.description ?? null"
        :logo-url="webLogoUrl"
    >
      <template #search>
        <UranusPopupSelect
            v-model="portalDateRangeMode"
            width="100%"
            :options="dateRangeOptions"
            :aria-label="t('date_range')"
        />

        <UranusButton
            v-if="activeEventTypeIds.length"
            size="small"
            variant="tertiary"
            @click="onResetFilter"
        >
          {{ t('reset_filter') }}
        </UranusButton>

        <UranusPopupSelect
            v-model="selectedPortalEventTypeId"
            width="100%"
            :options="portalEventTypeOptions"
            :placeholder="t('all_events')"
            :aria-label="t('event_type')"
        />
      </template>
    </UranusPortalHeader>


    <div v-if="portalError" class="uranus-portal-events__state">
      {{ portalError }}
    </div>

    <div v-else-if="eventListStore.error" class="uranus-portal-events__state">
      {{ eventListStore.error }}
    </div>

    <!--div v-else-if="showInitialLoading || portalLoading" class="uranus-portal-events__state">
      Loading events...
    </div-->

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

    <UranusPortalFooter
        :config="footerConfig"
        :logo-url="footerLogoUrl"
        :text-html="footerTextHtml"
    />

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
import UranusPopupSelect, { type UranusPopupSelectOption } from '@/component/ui/UranusPopupSelect.vue'
import { uranusFormatDateTime, uranusPluralizedText } from '@/util/string.ts'
import type { EventListItem, EventListItemEventType } from '@/domain/event/eventListItem.model.ts'
import { apiBaseUrl } from '@/util/util.ts'
import '@/style/portal_view.scss'
import { marked } from 'marked'
import {
  createFooterConfig,
  createHeaderConfig,
  type PortalFooterConfig,
  type PortalHeaderConfig,
} from '@/component/portal/editor/portalLayoutConfig.ts'
import {
  resolveEventDateRange,
  type UranusPresetDateRangeMode,
} from '@/util/eventDateRange.ts'
import {
  type PortalStyle,
  createPortalStructuredCss,
} from '@/component/portal/util/portalStyleGenerator'
import {
  normalizeJsonObject,
  normalizePortalPrefilter,
  isPrefilterValue,
  isPrefilterStringList,
} from '@/component/portal/util/portalParser'
import UranusPortalFooter from '@/component/portal/UranusPortalFooter.vue'
import UranusPortalHeader from '@/component/portal/UranusPortalHeader.vue'


interface PortalDTO {
  uuid: string
  name: string
  description?: string | null
  org_uuid: string
  spatial_filter_mode?: string | null
  pre_filter?: Record<string, unknown> | string | null
  prefilter?: Record<string, unknown> | null
  style?: PortalStyle | string | null
  header?: Record<string, unknown> | string | null
  footer?: Record<string, unknown> | string | null
  web_logo_uuid?: string | null
  background_image_uuid?: string | null
  footer_logo_uuid?: string | null
}

const { t, locale } = useI18n({ useScope: 'global' })

const LOAD_MORE_ROOT_MARGIN = 300

const eventListStore = useEventListStore()
const filterStore = useEventsFilterStore()
const typeLookupStore = useEventTypeLookupStore()
const route = useRoute()
const apiBase = apiBaseUrl()


const dateRangeOptions = computed(() => [
  {
    value: 'all_events',
    label: t('calendar_filter_date_all_events'),
  },
  {
    value: 'today',
    label: t('calendar_filter_date_today'),
  },
  {
    value: 'tomorrow',
    label: t('calendar_filter_date_tomorrow'),
  },
  {
    value: 'weekend',
    label: t('calendar_filter_date_weekend'),
  },
  {
    value: 'next_week',
    label: t('calendar_filter_date_next_week'),
  },
  {
    value: 'following_weekend',
    label: t('calendar_filter_date_following_weekend'),
  },
] satisfies {
  value: string
  label: string
}[])


const webLogoUrl = computed(() => {
  const uuid = portal.value?.web_logo_uuid
  return uuid
      ? `${apiBase}/api/image/${uuid}?width=480&type=png&quality=80`
      : null
})

const footerLogoUrl = computed(() => {
  const uuid = portal.value?.footer_logo_uuid
  return uuid
      ? `${apiBase}/api/image/${uuid}?width=480&type=png&quality=80`
      : null
})

const backgroundUrl = computed(() => {
  const uuid = portal.value?.background_image_uuid
  return uuid
      ? `${apiBase}/api/image/${uuid}?width=1920`
      : null
})

const filterScope = 'portal'
const portalUuid = computed(() => route.params.uuid?.toString() ?? null)
const portalFilter = computed(() => filterStore.getFilter(filterScope))
const activeFilter = computed(() => ({
  ...portalFilter.value,
  portalUuid: portalUuid.value,
  portalPrefilter: portalEventPrefilter.value,
}))
const activeEventTypeIds = computed(() => activeFilter.value.eventTypeIds)
const selectedPortalEventTypeId = computed({
  get: () => String(activeEventTypeIds.value[0] ?? ''),
  set: (value: string) => {
    const typeId = Number(value)
    filterStore.setFilter({
      eventTypeIds: value && Number.isFinite(typeId) ? [typeId] : [],
    }, filterScope)
  }
})
const portalDateRangeMode = computed<UranusPresetDateRangeMode>({
  get: () => filterStore.portalDateRangeMode,
  set: (mode) => {
    applyPortalDateRangeMode(mode)
  }
})
const eventCountInfo = computed(() =>
    uranusPluralizedText(t, 'result_count_singular', 'result_count_plural', eventListStore.events.length)
)

const showInitialLoading = computed(() => eventListStore.loading && !eventListStore.events.length)

const sortedTypeSummary = computed(() => {
  return [...eventListStore.typeSummary].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    const nameA = typeLookupStore.getTypeName(a.typeId, locale.value)
    const nameB = typeLookupStore.getTypeName(b.typeId, locale.value)
    return nameA.localeCompare(nameB)
  })
})
const portalEventTypeOptions = computed<UranusPopupSelectOption[]>(() => [
  { value: '', label: t('all_event_types') },
  ...sortedTypeSummary.value.map((entry) => ({
    value: String(entry.typeId),
    label: `${typeLookupStore.getTypeName(entry.typeId, locale.value)} (${entry.count})`,
  })),
])

const portal = ref<PortalDTO | null>(null)
const portalLoading = ref(false)
const portalError = ref<string | null>(null)
const portalRenderReady = computed(() => !portalLoading.value && (!!portal.value || !!portalError.value))
const portalEventPrefilter = computed(() => {
  const prefilter = normalizePortalPrefilter(portal.value?.pre_filter ?? portal.value?.prefilter)
  const result: { age?: string | number | null, venues?: string | number | string[] | null } = {}

  if (isPrefilterValue(prefilter?.age)) result.age = prefilter.age
  if (isPrefilterValue(prefilter?.venues) || isPrefilterStringList(prefilter?.venues)) {
    result.venues = prefilter.venues
  }

  return Object.keys(result).length ? result : null
})
const portalCustomCss = computed(() => {
  const css = normalizedPortalStyle.value?.['custom-css']
  return typeof css === 'string' && css.trim() ? css : ''
})
const normalizedPortalStyle = computed(() => normalizePortalStyle(portal.value?.style))
const headerConfig = computed<PortalHeaderConfig>(() => createHeaderConfig(normalizeJsonObject(portal.value?.header)))
const footerConfig = computed<PortalFooterConfig>(() => createFooterConfig(normalizeJsonObject(portal.value?.footer)))

const footerTextHtml = computed<string>(() =>
    formatMarkdown(footerConfig.value.text)
)

const portalRootStyle = computed(() => ({
  '--portal-background-image': backgroundUrl.value ? `url(${backgroundUrl.value})` : undefined,
}))
const portalStructuredCss = computed(() => {
  const style = normalizedPortalStyle.value
  const uuid = portalUuid.value

  if (!style || !uuid) return ''

  return createPortalStructuredCss(style, uuid)
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
  applyPortalDateRangeMode(portalDateRangeMode.value)
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
  return normalizeJsonObject(style) as PortalStyle | null
}

function formatMarkdown(markdown: string): string {
  if (!markdown.trim()) return ''
 try {
    return marked.parse(markdown) as string
  } catch {
    return markdown
  }
}

function applyPortalDateRangeMode(mode: UranusPresetDateRangeMode) {
  const range = resolveEventDateRange(mode)
  filterStore.setPortalDateRangeMode(mode)
  portalFilter.value.dateRangeMode = mode
  portalFilter.value.startDate = range.startDate
  portalFilter.value.endDate = range.endDate
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

    await eventListStore.loadEvents(true, activeFilter.value, {
      keepCurrentEvents: initialized.value && eventListStore.events.length > 0,
    })
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
  applyPortalDateRangeMode(portalDateRangeMode.value)
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
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
  <component
      :is="'style'"
      v-if="portalStructuredCss"
      type="text/css"
      v-text="portalStructuredCss"
  ></component>
  <div
      class="uranus-portal-events"
      :class="`uranus-portal-events--header-${headerConfig.layout}`"
      :data-portal-uuid="portalUuid"
      :style="portalRootStyle"
  >
    <header
        class="uranus-portal-events-header"
        :class="portalHeaderLayoutClass"
    >
      <div class="uranus-portal-events-header__logo">
        <a
            v-if="logoUrl && headerConfig.logoLinkUrl"
            class="uranus-portal-events__logo-link"
            :href="headerConfig.logoLinkUrl"
            :target="headerConfig.logoLinkTarget"
            :rel="getLinkRel(headerConfig.logoLinkTarget)"
        >
          <UranusLogoImage
              :logoURL="logoUrl"
              theme="light"
              :pixelCount="24000"
              :maxWidth="480"
              :maxHeight="240"
          />
        </a>

        <UranusLogoImage
            v-else-if="logoUrl"
            :logoURL="logoUrl"
            theme="light"
            :pixelCount="24000"
            :maxWidth="480"
            :maxHeight="240"
        />
      </div>

      <div class="uranus-portal-events-header__title">
        <h1>{{ portal?.name ?? t('events') }}</h1>
        <p>{{ portal?.description ?? eventCountInfo }}</p>
      </div>

      <nav class="uranus-portal-events-header__buttons">
        <a
            v-for="(button, index) in headerConfig.buttons"
            :key="`${button.url}-${index}`"
            :href="button.url"
            :target="button.target"
            :rel="getLinkRel(button.target)"
            :class="['uranus-portal__button', button.cssClass]"
        >
          {{ button.label }}
        </a>
      </nav>

      <div class="uranus-portal-events-header__search">
        <UranusButton
            v-if="activeEventTypeIds.length"
            size="small"
            variant="tertiary"
            @click="onResetFilter"
        >
          {{ t('reset_filter') }}
        </UranusButton>
      </div>

      <div class="uranus-portal-events-header__icon-links"></div>
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

    <footer
        v-if="showPortalFooter"
        class="uranus-portal-events__footer"
    >
      <a
          v-if="footerConfig.showLogo && logoUrl && footerConfig.logoLinkUrl"
          class="uranus-portal-events__footer-logo-link"
          :href="footerConfig.logoLinkUrl"
          :target="footerConfig.logoLinkTarget"
          :rel="getLinkRel(footerConfig.logoLinkTarget)"
      >
        <UranusLogoImage
            :logoURL="logoUrl"
            theme="light"
            :pixelCount="6000"
            :maxWidth="180"
            :maxHeight="90"
        />
      </a>

      <UranusLogoImage
          v-else-if="footerConfig.showLogo && logoUrl"
          :logoURL="logoUrl"
          theme="light"
          :pixelCount="6000"
          :maxWidth="180"
          :maxHeight="90"
      />

      <div
          v-if="footerTextHtml"
          class="uranus-portal-events__footer-text"
          v-html="footerTextHtml"
      ></div>

      <nav v-if="footerConfig.links.length" class="uranus-portal-events__footer-links">
        <a
            v-for="(link, index) in footerConfig.links"
            :key="`${link.url}-${index}`"
            :href="link.url"
            :target="link.target"
            :rel="getLinkRel(link.target)"
        >
          {{ link.label }}
        </a>
      </nav>
    </footer>
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
import { uranusFormatDateTime, uranusPluralizedText } from '@/util/string.ts'
import type { EventListItem, EventListItemEventType } from '@/domain/event/eventListItem.model.ts'
import UranusLogoImage from '@/component/ui/UranusLogoImage.vue'
import { apiBaseUrl } from '@/util/util.ts'
import '@/component/portal/style/uranusPortalEvents.scss'
import { marked } from 'marked'
import {
  createFooterConfig,
  createHeaderConfig,
  type PortalFooterConfig,
  type PortalHeaderConfig,
  type PortalLinkTarget,
} from '@/component/portal/editor/portalLayoutConfig.ts'

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
  header?: Record<string, unknown> | string | null
  footer?: Record<string, unknown> | string | null
  web_logo_uuid?: string | null
  background_image_uuid?: string | null
}

const { t, locale } = useI18n({ useScope: 'global' })

const LOAD_MORE_ROOT_MARGIN = 300

const eventListStore = useEventListStore()
const filterStore = useEventsFilterStore()
const typeLookupStore = useEventTypeLookupStore()
const route = useRoute()
const apiBase = apiBaseUrl()

const logoUrl = computed(() => {
  const uuid = portal.value?.web_logo_uuid
  return uuid
      ? `${apiBase}/api/image/${uuid}?width=3600&type=png&quality=80`
      : null
})

const backgroundUrl = computed(() => {
  const uuid = portal.value?.background_image_uuid
  return uuid
      ? `${apiBase}/api/image/${uuid}?width=3600&type=png&quality=80`
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
  const css = normalizedPortalStyle.value?.['custom-css']
  return typeof css === 'string' && css.trim() ? css : ''
})
const normalizedPortalStyle = computed(() => normalizePortalStyle(portal.value?.style))
const headerConfig = computed<PortalHeaderConfig>(() => createHeaderConfig(normalizeJsonObject(portal.value?.header)))
const portalHeaderLayoutClass = computed(() => {
  return headerConfig.value.layout === 'centered'
      ? 'uranus-portal-events-header__centered'
      : 'uranus-portal-events-header__left'
})
const footerConfig = computed<PortalFooterConfig>(() => createFooterConfig(normalizeJsonObject(portal.value?.footer)))
const footerTextHtml = computed(() => formatMarkdown(footerConfig.value.text))
const showPortalFooter = computed(() =>
    footerConfig.value.showLogo ||
    !!footerTextHtml.value ||
    footerConfig.value.links.length > 0
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
  return normalizeJsonObject(style) as PortalStyle | null
}

function normalizeJsonObject(value: Record<string, unknown> | string | null | undefined): Record<string, unknown> | null {
  if (!value) return null
  if (typeof value === 'object' && !Array.isArray(value)) return value

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : null
  } catch {
    return null
  }
}

function formatMarkdown(markdown: string) {
  if (!markdown.trim()) return ''

  try {
    return marked(markdown)
  } catch {
    return markdown
  }
}

function getLinkRel(target: PortalLinkTarget) {
  return target === '_blank' ? 'noopener noreferrer' : undefined
}

function createPortalStructuredCss(style: PortalStyle, portalUuid: string) {
  const rootSelector = `.uranus-portal-events[data-portal-uuid="${escapeCssString(portalUuid)}"]`
  const parts = [
    createRule(rootSelector, [
      cssDeclaration('background', readStyleValue(style.portal, 'background')),
      cssDeclaration('padding', readStyleValue(style.portal, 'padding')),
      cssDeclaration('color', readStyleValue(style.portal, 'color')),
      cssDeclaration('font-family', readStyleValue(style.portal, 'font-family')),
    ]),
    createRule(`${rootSelector} .uranus-portal-events__type-scroller,
${rootSelector} .uranus-portal-events__grid,
${rootSelector} .uranus-portal-events__state,
${rootSelector} .uranus-portal-events__load-more-trigger`, [
      cssDeclaration('max-width', readStyleValue(style.content, 'max-width')),
      cssDeclaration('align-self', normalizeContentAlign(readStyleValue(style.content, 'align'))),
    ]),
    createRule(`${rootSelector} .uranus-portal-events-header h1`, [
      cssDeclaration('color', readStyleValue(style.header?.title, 'color')),
      cssDeclaration('font-size', readStyleValue(style.header?.title, 'font-size')),
      cssDeclaration('font-weight', readStyleValue(style.header?.title, 'font-weight')),
      cssDeclaration('line-height', readStyleValue(style.header?.title, 'line-height')),
    ]),
    createRule(`${rootSelector} .uranus-portal-events-header p`, [
      cssDeclaration('color', readStyleValue(style.header?.description, 'color')),
      cssDeclaration('font-size', readStyleValue(style.header?.description, 'font-size')),
      cssDeclaration('line-height', readStyleValue(style.header?.description, 'line-height')),
    ]),
    createRule(`${rootSelector} .uranus-portal-events__grid`, [
      cssDeclaration('gap', readStyleValue(style['event-grid'] ?? style.grid, 'gap')),
      cssDeclaration('grid-template-columns', createGridTemplate(readStyleValue(style['event-grid'] ?? style.grid, 'min-card-width'))),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card`, [
      cssDeclaration('background', readStyleValue(style['event-card'] ?? style.card, 'background')),
      cssDeclaration('padding', readStyleValue(style['event-card'] ?? style.card, 'padding')),
      cssDeclaration('gap', readStyleValue(style['event-card'] ?? style.card, 'gap')),
      cssDeclaration('border', readStyleValue(style['event-card'] ?? style.card, 'border')),
      cssDeclaration('border-radius', readStyleValue(style['event-card'] ?? style.card, 'radius') ?? readStyleValue(style['event-card'] ?? style.card, 'border-radius')),
      cssDeclaration('box-shadow', readStyleValue(style['event-card'] ?? style.card, 'shadow')),
      cssDeclaration('transition', readStyleValue(style['event-card'] ?? style.card, 'transition')),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card:hover`, [
      cssDeclaration('background', readStyleValue((style['event-card'] ?? style.card)?.hover, 'background')),
      cssDeclaration('border', readStyleValue((style['event-card'] ?? style.card)?.hover, 'border')),
      cssDeclaration('box-shadow', readStyleValue((style['event-card'] ?? style.card)?.hover, 'shadow')),
      cssDeclaration('transform', createScaleTransform(readStyleValue((style['event-card'] ?? style.card)?.hover, 'scale'))),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card__image-frame`, [
      cssDeclaration('background', readStyleValue(style['event-card-image'], 'background')),
      cssDeclaration('aspect-ratio', readStyleValue(style['event-card-image'], 'aspect-ratio')),
      cssDeclaration('border-radius', readStyleValue(style['event-card-image'], 'border-radius')),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card__image`, [
      cssDeclaration('object-fit', readStyleValue(style['event-card-image'], 'object-fit')),
      cssDeclaration('filter', readStyleValue(style['event-card-image'], 'filter')),
      cssDeclaration('transition', createImageTransition(readStyleValue(style['event-card-image'], 'transition'))),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card:hover .uranus-portal-event-card__image`, [
      cssDeclaration('filter', readStyleValue(style['event-card-image']?.hover, 'filter')),
      cssDeclaration('transform', createScaleTransform(readStyleValue(style['event-card-image']?.hover, 'scale'))),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card__body`, [
      cssDeclaration('padding', readStyleValue(style['event-card-info'], 'padding')),
      cssDeclaration('background', readStyleValue(style['event-card-info'], 'background')),
      cssDeclaration('border', readStyleValue(style['event-card-info'], 'border')),
      cssDeclaration('border-radius', readStyleValue(style['event-card-info'], 'border-radius')),
      cssDeclaration('color', readStyleValue(style['event-card-info'], 'color')),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card h2`, [
      cssDeclaration('font-family', readStyleValue(style['event-card-info'], 'title-font-family')),
      cssDeclaration('font-size', readStyleValue(style['event-card-info'], 'title-font-size')),
      cssDeclaration('font-weight', readStyleValue(style['event-card-info'], 'title-font-weight')),
    ]),
    createRule(`${rootSelector} .uranus-portal-event-card__meta`, [
      cssDeclaration('font-family', readStyleValue(style['event-card-info'], 'meta-font-family')),
      cssDeclaration('font-size', readStyleValue(style['event-card-info'], 'meta-font-size')),
      cssDeclaration('font-weight', readStyleValue(style['event-card-info'], 'meta-font-weight')),
      cssDeclaration('line-height', readStyleValue(style['event-card-info'], 'meta-line-height')),
      cssDeclaration('gap', readStyleValue(style['event-card-info'], 'meta-gap')),
    ]),
  ]

  return parts.filter(Boolean).join('\n')
}

function readStyleValue(section: PortalStyleSection | null | undefined, key: string) {
  const value = section?.[key]

  if (value == null || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : null
  if (typeof value !== 'string') return null

  const trimmed = value.trim()
  if (!trimmed || /[{};]/.test(trimmed)) return null

  return trimmed
}

function createRule(selector: string, declarations: Array<string | null>) {
  const body = declarations.filter(Boolean)
  if (!body.length) return ''

  return `${selector} {\n${body.map(declaration => `  ${declaration}`).join('\n')}\n}`
}

function cssDeclaration(property: string, value: string | null | undefined) {
  return value ? `${property}: ${value};` : null
}

function createGridTemplate(minCardWidth: string | null) {
  return minCardWidth ? `repeat(auto-fill, minmax(${minCardWidth}, 1fr))` : null
}

function createScaleTransform(scale: string | null) {
  return scale ? `scale(${scale})` : null
}

function createImageTransition(transition: string | null) {
  return transition ? `transform ${transition}, filter ${transition}` : null
}

function normalizeContentAlign(value: string | null) {
  if (!value) return null

  switch (value) {
    case 'left':
    case 'start':
      return 'flex-start'
    case 'center':
      return 'center'
    case 'right':
    case 'end':
      return 'flex-end'
    case 'stretch':
      return 'stretch'
    default:
      return value
  }
}

function escapeCssString(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\a ')
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

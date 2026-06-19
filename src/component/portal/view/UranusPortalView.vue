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
      class="uranus-portal"
      :class="[
        `uranus-portal--header-${headerConfig.layout}`,
        { 'uranus-portal--map-fullscreen': activeContentView === 'map' }
      ]"
      :data-portal-uuid="portalUuid"
      :style="portalRootStyle"
  >
    <template v-if="activeContentView === 'events'">
      <UranusPortalHeader
          :config="headerConfig"
          :title="portal?.name ?? t('events')"
          :description="portal?.description ?? null"
          :logo-url="webLogoUrl"
          :display-locale="displayLocale as UranusLocaleKey"
      >
        <template #content-nav>
          <button
              v-for="view in contentViews"
              :key="view.id"
              :class="['uranus-portal__button', { 'uranus-portal__button--active': activeContentView === view.id }]"
              @click="activeContentView = view.id"
          >
            {{ view.label }}
          </button>
        </template>

        <template #search>
          <UranusPopupSelect
              v-model="portalDateRangeMode"
              width="100%"
              :options="dateRangeOptions"
              :aria-label="t('date_range')"
          />

          <UranusPopupSelect
              v-model="selectedPortalCategoryId"
              width="100%"
              :options="portalCategoryOptions"
              :placeholder="t('all_event_categories')"
              :aria-label="t('event_filter_categories')"
          />

          <UranusPopupSelect
              v-model="selectedPortalEventTypeId"
              width="100%"
              :options="portalEventTypeOptions"
              :placeholder="t('all_events')"
              :aria-label="t('event_type')"
          />

          <UranusButton
              v-if="activeEventTypeIds.length || activeCategoryId"
              size="small"
              variant="tertiary"
              @click="onResetFilter"
          >
            {{ t('reset_filter') }}
          </UranusButton>
        </template>
      </UranusPortalHeader>

      <UranusPortalEventListContent
          :active-filter="activeFilter"
          :portal-error="portalError"
          :portal-ready="portalRenderReady"
          :display-locale="displayLocale as UranusLocaleKey"
      />

      <UranusPortalFooter
          :config="footerConfig"
          :logo-url="footerLogoUrl"
          :text-html="footerTextHtml"
      />
    </template>

    <div v-else-if="activeContentView === 'map'" class="uranus-portal__map-fullscreen-stage">
      <UranusButton
          class="uranus-portal__map-back-button"
          size="small"
          variant="primary"
          @click="activeContentView = 'events'"
      >
        Zurueck
      </UranusButton>

      <UranusVenuesMap
          :portal-uuid="portalUuid"
          :load-mode="'bounds'"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch } from '@/api.ts'
import { useEventListStore } from '@/store/eventListStore.ts'
import { useEventsFilterStore } from '@/store/eventsFilterStore.ts'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusPopupSelect, { type UranusPopupSelectOption } from '@/component/ui/UranusPopupSelect.vue'
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
import UranusPortalEventListContent from '@/component/portal/view/UranusPortalEventListContent.vue'
import UranusVenuesMap from '@/component/map/UranusVenuesMap.vue'
import type {UranusLocaleKey} from "@/i18n/uranus-i18n-index.ts";
import {useLanguage} from "@/composable/useLanguage.ts";

const { setLanguage, getStoredLanguage } = useLanguage()

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

const { t } = useI18n({ useScope: 'global' })

const eventListStore = useEventListStore()
const filterStore = useEventsFilterStore()
const typeLookupStore = useEventTypeLookupStore()
const route = useRoute()
const apiBase = apiBaseUrl()


const displayLocale = ref(getStoredLanguage())

watch(displayLocale, (value) => {
  setLanguage(value)
})


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
const activeCategoryId = computed(() => portalFilter.value.categories?.[0] ?? 0)
const selectedPortalCategoryId = computed({
  get: () => String(activeCategoryId.value || ''),
  set: (value: string) => {
    const categoryId = Number(value)
    filterStore.setFilter({
      categories: value && Number.isFinite(categoryId) ? [categoryId] : null,
    }, filterScope)
  }
})
const portalDateRangeMode = computed<UranusPresetDateRangeMode>({
  get: () => filterStore.portalDateRangeMode,
  set: (mode) => {
    applyPortalDateRangeMode(mode)
  }
})

const sortedTypeSummary = computed(() => {
  return [...eventListStore.typeSummary].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    const nameA = typeLookupStore.getTypeName(a.typeId, displayLocale.value)
    const nameB = typeLookupStore.getTypeName(b.typeId, displayLocale.value)
    return nameA.localeCompare(nameB)
  })
})
const portalCategoryOptions = computed<UranusPopupSelectOption[]>(() => [
  { value: '', label: t('all_event_categories') },
  { value: '1', label: t('event_filter_category_culture') },
  { value: '2', label: t('event_filter_category_education') },
  { value: '3', label: t('event_filter_category_sports') },
  { value: '4', label: t('event_filter_category_leisure') },
  { value: '5', label: t('event_filter_category_family') },
  { value: '6', label: t('event_filter_category_society') },
])

const portalEventTypeOptions = computed<UranusPopupSelectOption[]>(() => [
  { value: '', label: t('all_event_types') },
  ...sortedTypeSummary.value.map((entry) => ({
    value: String(entry.typeId),
    label: `${typeLookupStore.getTypeName(entry.typeId, displayLocale.value)} (${entry.count})`,
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

const activeContentView = ref<'events' | 'map'>('events')
const contentViews = computed(() => [
  { id: 'events' as const, label: t('events') },
  { id: 'map' as const, label: t('nav_map') },
])

function onResetFilter() {
  filterStore.resetFilter(filterScope)
  applyPortalDateRangeMode(portalDateRangeMode.value)
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

watch(portalUuid, async () => {
  await fetchPortal()
})

onMounted(async () => {
  await fetchPortal()
  applyPortalDateRangeMode(portalDateRangeMode.value)
})
</script>
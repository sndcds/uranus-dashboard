<!--
  src/component/venue/view/UranusVenueView.vue

  UranusVenueView renders public venue details using the same public detail
  layout system as UranusEventView.
-->

<template>

  <div v-if="showLoading" class="uranus-public-event-state-info--loading">
    <span>{{ loadingLabel }}</span>
  </div>

  <div v-else-if="loadError !== null" class="uranus-public-event-state-info">
    <!-- TODO: UI/UX message about error for user -->
    <h1 style="font-size:8rem;">Error</h1>
    <span>{{ loadError }}</span>
  </div>

  <div v-else-if="venue" class="uranus-public-event-frame">

    <div class="uranus-public-event-detail-layout">

      <section class="uranus-public-event-main-layout">
        <UranusImage
            class="xxx"
            :url="venue.mainPhotoUrl!"
        />

        <div class="uranus-public-event-section">
          <h1>{{ venue.name }}</h1>
        </div>

        <div v-if="venueTypeLabel" class="uranus-public-event-section">
          <div class="uranus-public-event-detail-tags">
            <span class="uranus-public-event-detail-tag">
              {{ venueTypeLabel }}
            </span>
          </div>
        </div>

        <div v-if="venue.description" class="uranus-public-event-section">
          <div class="uranus-public-event-description" v-html="formatMarkdown(venue.description)"></div>
        </div>

        <div v-if="venue.spaces.length" class="uranus-public-event-section">
          <div v-if="false" class="uranus-public-venue-space-list">
            <h2>{{ t('venue_spaces') }}</h2>
            <UranusAccordion
                v-for="(space, index) in venue!.spaces"
                :key="space.uuid"
                :model-value="index === 0"
                class="uranus-public-venue-space-accordion"
            >
              <template #title>
                <span class="uranus-public-venue-space-title">{{ space.name }}</span>
              </template>

              <article class="uranus-public-venue-space">
                <p v-if="spaceTypeLabel(space)">{{ spaceTypeLabel(space) }}</p>
                <dl v-if="spaceFacts(space).length" class="uranus-public-venue-space-facts">
                  <template v-for="fact in spaceFacts(space)" :key="fact.label">
                    <dt>{{ fact.label }}</dt>
                    <dd>{{ fact.value }}</dd>
                  </template>
                </dl>
                <div
                    v-if="space.description"
                    class="uranus-public-event-description"
                    v-html="formatMarkdown(space.description!)"
                ></div>
                <a
                    v-if="space.webLink"
                    :href="space.webLink!"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                  {{ space.webLink }}&nbsp;↗
                </a>
              </article>
            </UranusAccordion>
          </div>
        </div>
      </section>

      <aside class="uranus-public-event-sidebar">

        <div class="uranus-public-event-info-section">
          <div class="uranus-public-event-info-card">
            <UranusLogoImage
                v-if="hasLogo"
                :logoURL="venue.logoUrl ?? ''"
                :lightThemeLogoURL="venue.logoUrl ?? ''"
                :darkThemeLogoURL="venue.darkThemeLogoUrl ?? ''"
                :theme="themeStore.theme"
                :pixelCount="8000"
                :maxWidth="200"
                :maxHeight="140"
                :linkUrl="venue.org!.webLink ?? null"
                linkTarget="_blank"
            />
          </div>

          <div v-if="hasAddress">
            <p class="uranus-public-event-info-label">{{ t('address') }}</p>
            <p v-if="venue.street || venue.houseNumber">
              {{ venue.street }} {{ venue.houseNumber }}
            </p>
            <p v-if="venue.postalCode || venue.city">
              {{ venue.postalCode }} {{ venue.city }}
            </p>
            <p v-if="venue.state || venue.country">
              {{ [venue.state, venue.country].filter(Boolean).join(', ') }}
            </p>
          </div>

          <div v-if="venue.org">
            <p class="uranus-public-event-info-label">{{ t('org') }}</p>
            <p v-if="venue.org.webLink && venue.org.name">
              <a :href="venue.org.webLink" target="_blank" rel="noopener noreferrer">
                {{ venue.org.name }}&nbsp;↗
              </a>
            </p>
            <p v-else>{{ venue.org.name }}</p>
            <p v-if="venue.org.city || venue.org.country">
              {{ [venue.org.city, venue.org.country].filter(Boolean).join(', ') }}
            </p>
          </div>

          <div v-if="venue.openedAt || venue.closedAt">
            <p v-if="venue.openedAt">{{ t('opened_at') }}: {{ uranusFormatFullDate(venue.openedAt, locale) }}</p>
            <p v-if="venue.closedAt">{{ t('closed_at') }}: {{ uranusFormatFullDate(venue.closedAt, locale) }}</p>
          </div>

          <div style="display: flex; flex-direction: column">
            <UranusIconAction
                v-if="venue.webLink"
                :label="t('website')"
                :icon="Globe"
                :to="venue.webLink"
                style="padding-left: 0;"
            />

            <UranusIconAction
                v-if="venue.contactEmail"
                :label="venue.contactEmail"
                :icon="Mail"
                :to="`mailto:${venue.contactEmail}`"
                style="padding-left: 0;"
            />

            <UranusIconAction
                v-if="venue.contactPhone"
                :label="venue.contactPhone"
                :icon="Phone"
                :to="`tel:${venue.contactPhone}`"
                style="padding-left: 0;"
            />
          </div>
        </div>

        <div
            v-if="hasLonLat"
            class="uranus-public-venue-map-frame"
        >
          <UranusSinglePointMap
              id="venue-map"
              :lat="venue.lat!"
              :lon="venue.lon!"
              :name="venue.name"
          />
        </div>

      </aside>
    </div>

    <div class="uranus-public-venue-calendar">
      <UranusEventCalendar
          filter-scope="venue"
          :display-modes="['cards', 'compact', 'list']"
          initial-display-mode="compact"
          :persist-display-mode="false"
          :show-filter-controls="false"
          type-filter-mode="select-single"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import { Globe, Mail, Phone } from 'lucide-vue-next'
import { ApiError, apiFetch } from '@/api.ts'
import { useEventsFilterStore } from '@/store/eventsFilterStore.ts'
import { useVenueTypeLookupStore } from '@/store/venueTypesLookupStore.ts'
import { useSpaceTypeLookupStore } from '@/store/spaceTypesLookupStore.ts'
import { useThemeStore } from '@/store/themeStore.ts'
import UranusEventCalendar from '@/component/event/UranusEventCalendar.vue'
import UranusSinglePointMap from '@/component/map/UranusSinglePointMap.vue'
import UranusAccordion from '@/component/ui/UranusAccordion.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusImage from '@/component/image/UranusImage.vue'
import { uranusFormatFullDate } from '@/util/string.ts'
import UranusLogoImage from '@/component/ui/UranusLogoImage.vue'

type VenueDetailOrg = {
  uuid: string | null
  name: string
  webLink: string | null
  city: string | null
  country: string | null
}

type VenueDetailSpace = {
  uuid: string
  name: string
  type: string | null
  typeName: string | null
  description: string | null
  webLink: string | null
  buildingLevel: number | null
  areaSqm: number | null
  totalCapacity: number | null
  seatingCapacity: number | null
}

type VenueDetail = {
  uuid: string
  name: string
  type: string | null
  typeName: string | null
  openedAt: string | null
  closedAt: string | null
  street: string | null
  houseNumber: string | null
  postalCode: string | null
  city: string | null
  state: string | null
  country: string | null
  contactEmail: string | null
  contactPhone: string | null
  webLink: string | null
  description: string | null
  lon: number | null
  lat: number | null
  logoUrl: string | null
  darkThemeLogoUrl: string | null
  lightThemeLogoUrl: string | null
  mainPhotoUrl: string | null
  org: VenueDetailOrg | null
  spaces: VenueDetailSpace[]
}

const route = useRoute()
const { t, locale } = useI18n({ useScope: 'global' })
const themeStore = useThemeStore()
const filterStore = useEventsFilterStore()
const venueTypeLookupStore = useVenueTypeLookupStore()
const spaceTypeLookupStore = useSpaceTypeLookupStore()

const venue = ref<VenueDetail | null>(null)
const isLoading = ref(true)
const showLoading = ref(false)
const loadingLabel = computed(() => t('loading'))
const loadError = ref<string | null>(null)

const hasLonLat = computed(() =>
    Number.isFinite(venue.value?.lon) && Number.isFinite(venue.value?.lat)
)

const hasAddress = computed(() =>
    Boolean(
        venue.value?.street ||
        venue.value?.houseNumber ||
        venue.value?.postalCode ||
        venue.value?.city ||
        venue.value?.state ||
        venue.value?.country
    )
)

const venueTypeLabel = computed(() => {
  if (!venue.value) return ''
  return venue.value.typeName
      ?? (venue.value.type ? venueTypeLookupStore.getLabel(venue.value.type, locale.value) : '')
      ?? ''
})

watch(
    () => [route.params.uuid, locale.value],
    () => {
      void loadVenue()
    }
)

watch(isLoading, (loading) => {
  if (loading) {
    const timeout = window.setTimeout(() => {
      showLoading.value = true
    }, 500)

    const stopWatch = watch(isLoading, (stillLoading) => {
      if (!stillLoading) {
        window.clearTimeout(timeout)
        showLoading.value = false
        stopWatch()
      }
    })
  } else {
    showLoading.value = false
  }
})

watch(venue, (loadedVenue) => {
  if (!loadedVenue) return

  filterStore.resetFilter('venue')
  filterStore.setFilter({
    venue: {
      uuid: loadedVenue.uuid,
      name: loadedVenue.name,
    },
  }, 'venue')
})

const hasLogo = computed(() =>
    !!(venue.value!.logoUrl || venue.value!.lightThemeLogoUrl || venue.value!.darkThemeLogoUrl)
)

function formatMarkdown(markdown: string) {
  try {
    return marked(markdown)
  } catch {
    return markdown
  }
}

function resolveRouteParam(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param
}

function mapVenueDetail(raw: any): VenueDetail | null {
  if (!raw) return null

  const uuid = String(raw.uuid ?? raw.id ?? '')
  if (!uuid) return null

  return {
    uuid,
    name: String(raw.name ?? ''),
    type: raw.type ?? null,
    typeName: raw.type_name ?? null,
    openedAt: raw.opened_at ?? null,
    closedAt: raw.closed_at ?? null,
    street: raw.street ?? null,
    houseNumber: raw.house_number ?? null,
    postalCode: raw.postal_code ?? null,
    city: raw.city ?? null,
    state: raw.state ?? null,
    country: raw.country ?? null,
    contactEmail: raw.contact_email ?? null,
    contactPhone: raw.contact_phone ?? null,
    webLink: raw.web_link ?? null,
    description: raw.description ?? null,
    lon: normalizeNumber(raw.lon),
    lat: normalizeNumber(raw.lat),
    logoUrl: raw.logo_url,
    darkThemeLogoUrl: raw.dark_theme_logo_url,
    lightThemeLogoUrl: raw.light_theme_logo_url,
    mainPhotoUrl: raw.main_photo_url,
    org: mapOrganization(raw.organization),
    spaces: Array.isArray(raw.spaces) ? raw.spaces.map(mapSpace).filter(Boolean) : [],
  }
}

function mapOrganization(raw: any): VenueDetailOrg | null {
  if (!raw) return null

  return {
    uuid: raw.uuid ?? null,
    name: String(raw.name ?? ''),
    webLink: raw.web_link ?? null,
    city: raw.city ?? null,
    country: raw.country ?? null,
  }
}

function mapSpace(raw: any): VenueDetailSpace | null {
  const uuid = String(raw?.uuid ?? raw?.id ?? '')
  if (!uuid) return null

  return {
    uuid,
    name: String(raw.name ?? ''),
    type: raw.type ?? raw.space_type ?? null,
    typeName: raw.type_name ?? raw.space_type_name ?? null,
    description: raw.description ?? null,
    webLink: raw.web_link ?? null,
    buildingLevel: normalizeNumber(raw.building_level),
    areaSqm: normalizeNumber(raw.area_sqm),
    totalCapacity: normalizeNumber(raw.total_capacity),
    seatingCapacity: normalizeNumber(raw.seating_capacity),
  }
}

function normalizeNumber(value: unknown) {
  if (value === null || value === undefined || value === '') return null

  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : null
}

function spaceTypeLabel(space: VenueDetailSpace) {
  return space.typeName
      ?? (space.type ? spaceTypeLookupStore.getLabel(space.type, locale.value) : '')
      ?? ''
}

function spaceFacts(space: VenueDetailSpace) {
  const facts: Array<{ label: string; value: string | number | null }> = [
    { label: t('building_level'), value: space.buildingLevel },
    { label: t('area_sqm'), value: space.areaSqm != null ? `${space.areaSqm} m²` : null },
    { label: t('total_capacity'), value: space.totalCapacity },
    { label: t('seating_capacity'), value: space.seatingCapacity },
  ]

  return facts.filter((fact): fact is { label: string; value: string | number } =>
      fact.value !== null && fact.value !== undefined && fact.value !== ''
  )
}

async function loadVenue() {
  const venueUuid = resolveRouteParam(route.params.uuid)
  if (!venueUuid) {
    loadError.value = t('error_missing_params')
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = null

  try {
    const lang = locale.value || 'en'
    const apiPath = `/api/venue/${venueUuid}?lang=${lang}`
    const apiResponse = await apiFetch<any>(apiPath)
    const mappedVenue = mapVenueDetail(apiResponse.data)

    if (!mappedVenue) {
      loadError.value = t('error_incomplete_data')
      return
    }

    venue.value = mappedVenue
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      loadError.value = error.status === 404 ? t('error_fetch_data_failed') : error.message
      return
    }

    loadError.value = error instanceof Error ? error.message : t('error_fetch_data_failed')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => void loadVenue())
</script>

<style scoped>
.uranus-public-venue-space-list {
  display: grid;
  gap: 8px;
}

.uranus-public-venue-space-accordion {
  border-top: 1px solid var(--uranus-color-6);
}

.uranus-public-venue-space-title {
  font-size: 1.1rem;
  font-weight: 500;
}

.uranus-public-venue-space {
  display: grid;
  gap: 8px;
  padding: 4px 0 16px;
}

.uranus-public-venue-space-facts {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 4px 12px;
  margin: 0;
}

.uranus-public-venue-space-facts dt {
  color: var(--uranus-color-4);
}

.uranus-public-venue-space-facts dd {
  margin: 0;
}

.uranus-public-venue-map-frame {
  width: 100%;
  height: 300px;
  border-radius: 7px;
  overflow: clip;
  margin-top: 2rem;
}

.uranus-public-venue-calendar {
  margin-top: 32px;
}

.xxx {
  width: 100%;
}
</style>

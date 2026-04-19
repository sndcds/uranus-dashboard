<!--
  src/view/public/UranusEventView.vue

  UranusEventView is responsible for displaying a single public event
  in detail. It fetches the event and selected event date from the API
  based on the current route parameters, handles loading and error states,
  and renders all relevant event information such as image, description,
  dates, venue, pricing, accessibility, and external links.

  The component also supports localization, dynamic route updates,
  and auxiliary actions like downloading the event as an ICS file.
-->

<template>

  <div v-if="showLoading" class="uranus-public-event-state-info--loading">
    <!-- Loading state -->
    <span>{{ loadingLabel }}</span>
  </div>
  <div v-else-if="loadError !== null" class="uranus-public-event-state-info">
    <h1 style="font-size:8rem;">404</h1>
    <span>{{ loadError }}</span>
  </div>
  <div v-else-if="event" class="uranus-public-event-frame">
    <!-- Event content -->
    <div class="uranus-public-event-detail-layout">

      <!-- Main Content -->
      <section class="uranus-public-event-main-layout">

        <!-- Image -->
        <div>
          <div v-if="event.image?.url" class="uranus-public-event-image-frame">
            <img
                :src="event.image.url.includes('?')
                  ? `${event.image.url}&ratio=16:9&width=1280`
                  : `${event.image.url}?ratio=16:9&width=1280`"
                :alt="event.image.altText ?? event.title ?? ''"
                class="uranus-public-event-image"
            />
          </div>
          <span v-if="imageCredit()" class="uranus-public-event-image-caption">
            {{ imageCredit() }}
          </span>
        </div>

        <!-- Title -->
        <div class="uranus-public-event-section">
          <h1>{{ event.title }}</h1>
          <h2 v-if="event.subtitle">
            {{ event.subtitle }}
          </h2>
          <UranusEventReleaseChip
              v-if="['cancelled', 'deferred', 'rescheduled'].includes(event.releaseStatus ?? 'draft')"
              :releaseStatus="event.releaseStatus"
          />
        </div>

        <!-- Event type and genres -->
        <div
            v-if="event.types && event.types.length"
            class="uranus-public-event-section">
          <div class="uranus-public-event-detail-tags">
            <span
                v-for="type in event.types"
                :key="`${type.typeId}-${type.genreId}`"
                class="uranus-public-event-detail-tag">
              {{ getTypeGenreName(type.typeId!, type.genreId ?? null) }}
            </span>
          </div>
        </div>

        <!-- Languages -->
        <div v-if="event.languages && event.languages.length">
          <div class="uranus-public-event-language-tags">
            <span v-for="lang in event.languages" :key="lang" class="uranus-public-event-language-tag">
              {{ getLanguageName(lang) }}
            </span>
          </div>
        </div>

        <!-- Tags -->
        <div v-if="event.tags && event.tags.length">
          <div class="uranus-public-event-tags">
            <span v-for="tag in event.tags" :key="tag" class="uranus-public-event-tag">
              #{{ tag }}
            </span>
          </div>
        </div>

        <!-- Description -->
        <div v-if="event.description" class="uranus-public-event-section">
          <div class="uranus-public-event-description" v-html="formatMarkdown(event.description)"></div>
        </div>

        <!-- URLs -->
        <div v-if="event.eventLinks && event.eventLinks.length > 0" class="uranus-public-event-section">
          <div class="uranus-public-event-detail-links">
            <a v-for="(link, index) in event.eventLinks" :key="index" :href="link.url!" target="_blank"
               rel="noopener noreferrer" class="uranus-public-event-detail-link">
              {{ link.label || link.url }}&nbsp;↗
            </a>
          </div>
        </div>

        <!--UranusEmbedYoutubeVideo url="https://www.youtube.com/watch?v=63zGtiv89bA" /-->

      </section>

      <!-- Sidebar -->
      <aside class="uranus-public-event-sidebar">
        <div class="uranus-public-event-info-section">

          <!-- Date & Time -->
          <UranusEventDateTimeDisplay
              :startDate="eventStartDate"
              :startTime="eventStartTime"
              :endDate="eventEndDate"
              :endTime="eventEndTime"
              :entryTime="eventEntryTime"
              :allDay="eventAllDay"
              style="padding-top: 1rem;"
          />
          <UranusIconAction
              v-if="eventDate?.eventUuid"
              :label="t('download_ics')"
              :icon="CalendarArrowDown"
              @click="onDownloadIcs"
          />


          <UranusEventOrganizationDisplay :event="event" />

          <!-- Venue, Space, Location -->
          <UranusEventVenueDisplay :eventDate="eventDate" />

          <UranusIconAction
              :to="{ hash: '#event-map' }"
              :label="t('scroll_to_map')"
              :icon="Map"
          />

          <div v-if="event.meetingPoint">
            <p class="uranus-public-event-info-label">{{ t('event_meeting_point') }}</p>
            <p>{{ event.meetingPoint }}</p>
          </div>

          <div v-if="priceLabel || priceTypeLabel">
            <p class="uranus-public-event-info-label">{{ t('event_price') }}</p>
            <template v-if="priceTypeLabel">
              {{ priceTypeLabel }}<br>
            </template>
            <template v-if="priceLabel">
              {{ priceLabel }}
            </template>
          </div>

          <UranusIconAction
              v-if="event.ticketLink"
              :label="t('event_ticket_link')"
              :icon="Ticket"
              :to="event.ticketLink"
          />

          <div v-if="event.maxAttendees || ageLabel">
            <p class="uranus-public-event-info-label">{{ t('event_participation_info') }}</p>
            <template v-if="event.maxAttendees">
              {{ t('event_max_attendees', { count: event.maxAttendees }) }}<br>
            </template>
            <template v-if="ageLabel">
              {{ ageLabel }}<br>
            </template>
            <template v-if="event.participationInfo">
              {{ event.participationInfo }}<br>
            </template>
          </div>

          <br>

          <UranusEventAllDatesDisplay
              v-if="event?.furtherDates?.length"
              :dates="event.furtherDates"
          />

          <div v-if="selectedAccessibilityLabels.length" class="uranus-public-event-tight-section">
            <UranusIconAction :icon="Accessibility" :label="t('accessibility')"/>
            <p v-for="label in selectedAccessibilityLabels" :key="label">
              {{ label }}
            </p>
          </div>

        </div>
      </aside>

      <div style="width: 100%; height: 400px; border-radius: 7px;overflow: clip">
        <UranusSinglePointMap
            v-if="eventDate && eventDate.venueLat && eventDate.venueLon"
            id="event-map"
            :lat="parseFloat(eventDate.venueLat)"
            :lon="parseFloat(eventDate.venueLon)"
            :name="'Name der Venue'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch, ApiError } from '@/api.ts'
import { marked } from 'marked'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore.ts'
import { useLanguageLookupStore } from '@/store/languageLookupStore.ts'
import { type PublicEvent, mapPublicEventFromDTO } from '@/domain/event/publicEvent.model.ts'
import { type PublicEventDate } from '@/domain/event/publicEventDate.model.ts'
import { uranusI18nAccessibilityFlags } from '@/i18n/accessibility.ts'
import { uranusStringInterpolate } from '@/util/UranusStringUtils.ts'
import { type PublicEventDTO } from '@/api/dto/publicEvent.dto.ts'

import UranusEventDateTimeDisplay from '@/component/event/ui/UranusEventDateTimeDisplay.vue'
import UranusEventVenueDisplay from '@/component/event/ui/UranusEventVenueDisplay.vue'
import UranusEventOrganizationDisplay from '@/component/event/ui/UranusEventOrganizationDisplay.vue'
import UranusEventAllDatesDisplay from '@/component/event/ui/UranusEventAllDatesDisplay.vue'
import UranusEventReleaseChip from '@/component/event/ui/UranusEventReleaseChip.vue'
import UranusSinglePointMap from '@/component/map/UranusSinglePointMap.vue'
import UranusExternalLink from '@/component/ui/UranusExternalLink.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import { Ticket, Map, Accessibility, CalendarArrowDown } from 'lucide-vue-next'

const route = useRoute()

const { t, locale } = useI18n({ useScope: 'global' })

const typeLookupStore = useEventTypeLookupStore()
const getTypeGenreName = (typeId: number, genreId: number | null) => typeLookupStore.getTypeGenreName(typeId, genreId, locale.value)


const languageLookupStore = useLanguageLookupStore()

// State
const event = ref<PublicEvent | null>(null)
const eventDate = ref<PublicEventDate | null>(null)
const isLoading = ref(true)
const showLoading = ref(false)
const loadingLabel = computed(() => t('loading'))
const loadError = ref<string | null>(null)
const isDownloadingIcs = ref(false)
const isPreview = computed(() => route.params.mode === 'preview')


// Watch for changes in route params
watch(
    () => [route.params.id, route.params.eventDateId],
    () => {
      loadEvent() // reload the event whenever id/date changes
    }
)

// Watch isLoading and delay the indicator
watch(isLoading, (loading) => {
  if (loading) {
    // Delay showing the loader
    const timeout = setTimeout(() => {
      showLoading.value = true
    }, 500)

    // Clear the timeout if loading ends before 0.5s
    const stopWatch = watch(isLoading, (l) => {
      if (!l) {
        clearTimeout(timeout)
        showLoading.value = false
        stopWatch() // stop this inner watcher
      }
    })
  } else {
    showLoading.value = false
  }
})

const selectedAccessibilityLabels = computed(() => {
  if (!event.value?.date.accessibilityFlags) return []

  const mask = BigInt(event.value.date.accessibilityFlags) // <-- convert to BigInt
  const labels: string[] = []

  uranusI18nAccessibilityFlags.forEach(topic => {
    topic.flags.forEach(flag => {
      const flagValue = 1n << BigInt(flag.id)  // <-- use BigInt
      if ((mask & flagValue) === flagValue) {
        labels.push(t(flag.name))
      }
    })
  })

  return labels
})

// Helpers
function imageCredit() {
  const e = event.value
  if (!e) return null
  let parts = ''
  if (e.image?.creator) {
    parts += t('image_by') + ': ' + e.image.creator
  }
  if (e.image?.copyright) {
    if (e.image?.creator) { parts += ' ' }
    parts += `© ${e.image.copyright}`
  }
  return parts.length > 0 ? parts : null
}

const resolveRouteParam = (param: string | string[] | undefined) =>
  Array.isArray(param) ? param[0] : param


const getLanguageName = (langCode: string) => {
  const map = languageLookupStore.data[locale.value]
  return map?.[langCode] ?? langCode
}

const formatMarkdown = (markdown: string) => {
  try { return marked(markdown) }
  catch { return markdown }
}

// Computed for date/time
const eventStartDate = computed(() => eventDate.value?.startDate ?? event.value?.date.startDate ?? null)
const eventStartTime = computed(() => eventDate.value?.startTime ?? event.value?.date.startTime ?? null)
const eventEndDate = computed(() => eventDate.value?.endDate ?? event.value?.date.endDate ?? null)
const eventEndTime = computed(() => eventDate.value?.endTime ?? event.value?.date.endTime ?? null)
const eventEntryTime = computed(() => eventDate.value?.entryTime ?? event.value?.date.entryTime ?? null)
const eventAllDay = computed(() => eventDate.value?.allDay ?? event.value?.date.allDay ?? false)

const ageLabel = computed(() => {
  const min = event.value?.minAge
  const max = event.value?.maxAge
  if (!min && !max) return null
  if (min && max) { return t('event_age_between', { min, max }) }
  if (min) { return t('event_age_from', { min }) }
  if (max) { return t('event_age_until', { max }) }
  return null
})

const priceLabel = computed(() => {
  const min = event.value?.minPrice
  const max = event.value?.maxPrice
  const currency = event.value?.currency ?? ''

  // Helper to format numbers according to locale with 2 decimals
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat(navigator.language, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  if (min && max) {
    return uranusStringInterpolate(t('event_price_between_sentence'), {
      min: formatNumber(min), max: formatNumber(max), currency: currency
    });
  }
  if (min) {
    return uranusStringInterpolate(t('event_price_from_sentence'), {
      min: formatNumber(min), currency: currency
    });
  }
  if (max) {
    return uranusStringInterpolate(t('event_price_until_sentence'), {
      max: formatNumber(max), currency: currency
    });
  }
  return null
})

const priceTypeLabel = computed(() => {
  const map: Record<string, string> = {
    not_specified: 'event_price_not_specified',
    regular_price: 'event_price_regular',
    free: 'event_price_free',
    donation: 'event_price_donation',
    tiered_prices: 'event_price_tiered',
  }

  const priceType = event.value?.priceType ?? 'not_specified'
  const key = map[priceType] || 'event_price_not_specified'

  // Return null if not_specified
  if (key === 'event_price_not_specified') {
    return null
  }

  return t(key)
})

const hasLonLat = computed(() => {
  if ((event.value?.date.venueLon && event.value?.date.venueLat) || (event.value?.date.venueLon && event.value?.date.venueLat))
    return true
  return false
})


const loadEvent = async () => {
  isLoading.value = true
  loadError.value = null

  try {
    const eventUuid = resolveRouteParam(route.params.uuid)
    const eventDateUuid = resolveRouteParam(route.params.eventDateUuid)

    const lang = locale.value || 'de'
    let apiPath = null
    if (isPreview.value) {
      apiPath = `/api/admin/event/${eventUuid}/date/${eventDateUuid}?lang=${lang}`
    } else {
      apiPath = `/api/event/${eventUuid}/date/${eventDateUuid}?lang=${lang}`
    }
    if (!apiPath) {
      loadError.value = t('permission_denied')
      return
    }

    const apiResponse = await apiFetch<PublicEventDTO>(apiPath)
    if (apiResponse.data) {
      const mappedEvent: PublicEvent | null = mapPublicEventFromDTO(apiResponse.data, eventDateUuid)
      if (!mappedEvent) {
        loadError.value = t('error_incomplete_data')
        return
      }
      event.value = mappedEvent
      eventDate.value = mappedEvent.date
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      if (error.status === 404) {
        loadError.value = t('error_fetch_data_failed')
      } else {
        loadError.value = error.message // : t('error_fetch_data_failed')
      }
      console.log('ApiError', JSON.stringify(error, null, 2))
    }
  } finally {
    isLoading.value = false
  }
}

const onDownloadIcs = async () => {
  if (!event.value?.uuid || !eventDate.value?.uuid) {
    return
  }
  if (isDownloadingIcs.value) return

  isDownloadingIcs.value = true

  try {
    const eventUuid = event.value.uuid
    const eventDateUuid = eventDate.value.uuid
    const apiPath = `/api/event/${eventUuid}/date/${eventDateUuid}/ics?lang=${locale.value}`
    const apiResponse = await apiFetch<string>(apiPath, {
      headers: {
        Accept: 'text/calendar,*/*;q=0.8',
      },
    })

    if (typeof apiResponse.data !== 'string' || !apiResponse.data.trim()) {
      throw new Error('Empty ICS payload')
    }

    const blob = new Blob([apiResponse.data], { type: 'text/calendar;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = createIcsFileName(event.value.title ?? '', eventDateUuid)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(blobUrl)
  } catch (error) {
    console.error('Failed to download ICS file', error)
  } finally {
    isDownloadingIcs.value = false
  }
}

const createIcsFileName = (title: string, eventDateUuid: string) => {
  const normalized = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')
  const base = normalized || 'event'
  return `${base}-${eventDateUuid}.ics`
}

onMounted(() => void loadEvent())
</script>

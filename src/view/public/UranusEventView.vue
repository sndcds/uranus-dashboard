<!--
  src/view/public/UranusEventView.vue

  2026-02-05, Roald
-->

<template>

  <div v-if="showLoading" class="uranus-public-state-info--loading">
    <!-- Loading state -->
    <span>{{ loadingLabel }}</span>
  </div>
  <div v-else-if="loadError" class="uranus-public-state-info--alert">
    <!-- Error state -->
    <span>{{ loadError }}</span>
  </div>
  <div v-else-if="event" class="uranus-event-frame">
    <!-- Event content -->

    <div class="uranus-public-event-detail-layout">
      <!-- Main Content -->

      <section class="uranus-public-event-main">
        <!-- Main image -->
        <div>
          <div v-if="event.image?.url" class="uranus-public-event-image-frame">
            <img
                :src="event.image.url.includes('?')
                  ? `${event.image.url}&ratio=16:9&width=1280`
                  : `${event.image.url}?ratio=16:9&width=1280`"
                :alt="event.image.alt ?? event.title ?? ''"
                class="uranus-public-event-image"
            />
          </div>
          <span v-if="buildImageCredit()" class="uranus-public-event-image-caption">
            {{ buildImageCredit() }}
          </span>
        </div>

        <!-- Title area -->
        <div class="uranus-public-section">
          <h1>{{ event.title }}</h1>
          <h2 v-if="event.subtitle">
            {{ event.subtitle }}
          </h2>
          <UranusEventReleaseChip
              v-if="['released', 'cancelled', 'deferred', 'rescheduled'].includes(event.releaseStatus ?? 'draft')"
              :releaseStatus="event.releaseStatus"
          />
        </div>

        <!-- Event type and genres -->
        <div
            v-if="event.types && event.types.length"
            class="uranus-public-section">
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
        <div v-if="event.description" class="uranus-public-section">
          <div class="uranus-public-event-description" v-html="formatMarkdown(event.description)"></div>
        </div>

        <!-- URLs -->
        <div v-if="event.eventUrls && event.eventUrls.length > 0" class="uranus-public-section">
          <div class="uranus-public-detail-links">
            <a v-for="link in event.eventUrls" :key="link.id" :href="link.url" target="_blank"
               rel="noopener noreferrer" class="uranus-public-detail-link">
              {{ link.label || link.url }}&nbsp;↗
            </a>
          </div>
        </div>

      </section>

      <!-- Right Column - Sidebar -->
      <aside class="uranus-event-detail-sidebar">
        <div class="uranus-public-info-section">

          <!-- Date & Time -->
          <UranusEventDateTimeDisplay
              :startDate="eventStartDate"
              :startTime="eventStartTime"
              :endDate="eventEndDate"
              :endTime="eventEndTime"
              :entryTime="eventEntryTime"
          />

          <!-- Venue, Space, Location -->
          <UranusEventVenueDisplay :event="event" />
          <UranusEventLocationDisplay :event="event" />

          maxAttendees: {{ event.maxAttendees }}<br>
          minAge: {{ event.minAge }}<br>
          maxAge: {{ event.maxAge }}<br>
          currency: {{ event.currency }}<br>
          priceType: {{ event.priceType }}<br>
          minPrice: {{ event.minPrice }}<br>
          maxPrice: {{ event.maxPrice }}<br>
          meetingPoint: {{ event.meetingPoint }}<br>
          participationInfo: {{ event.participationInfo }}<br>
          <br>

          <!-- Organization -->
          <div v-if="event.organizationName">
            <p class="uranus-public-info-label">{{ t('event_organizer') }}:</p>
            <p v-if="event?.organizationUrl && event?.organizationName">
              <a :href="event.organizationUrl" target="_blank" rel="noopener noreferrer">
                {{ event?.organizationName }}&nbsp;↗
              </a>
            </p>
            <p v-else>{{ event.organizationName }}</p>
          </div>

          <!-- Additional Info -->
          <div v-if="event.meetingPoint">
            <p class="uranus-public-info-label">{{ t('event_meeting_point') }}</p>
            <p>{{ event.meetingPoint }}</p>
          </div>

          <UranusEventFurtherDatesDisplay
              v-if="event?.furtherDates?.length"
              :dates="event.furtherDates"
          />

          <div v-if="selectedAccessibilityLabels.length" class="uranus-public-tight-section">
            <svg width="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
              <g transform="matrix(1.23077,0,0,1.23077,-2.30769,-2.76923)">
                <path d="M11.25,5.25C11.25,6.078 10.578,6.75 9.75,6.75C8.922,6.75 8.25,6.078 8.25,5.25C8.25,4.422 8.922,3.75 9.75,3.75C10.578,3.75 11.25,4.422 11.25,5.25ZM12.75,5.25C12.75,6.648 11.794,7.822 10.5,8.155L10.5,9.75L15.375,9.75L15.375,11.25L10.5,11.25L10.5,14.25L17.865,14.25L18.615,18L19.5,18L19.5,19.5L17.385,19.5L16.635,15.75L15.75,15.75C15.75,19.064 13.064,21.75 9.75,21.75C6.436,21.75 3.75,19.064 3.75,15.75C3.75,12.69 6.04,10.166 9,9.796L9,8.155C7.706,7.822 6.75,6.648 6.75,5.25C6.75,3.593 8.093,2.25 9.75,2.25C11.407,2.25 12.75,3.593 12.75,5.25ZM9,15.75L14.25,15.75C14.25,18.235 12.235,20.25 9.75,20.25C7.265,20.25 5.25,18.235 5.25,15.75C5.25,13.52 6.872,11.669 9,11.312L9,15.75Z"/>
              </g>
            </svg>
            <p class="uranus-public-info-label">{{ t('space_accessibility') }}:</p>
            <p v-for="label in selectedAccessibilityLabels" :key="label">
              {{ label }}
            </p>
          </div>

          <button
              v-if="hasLonLat"
              type="button"
              class="uranus-public-detail-link"
              @click="onShowOnMap">
            <svg width="20px" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
              <path d="M29.664,1.531L29.411,1.579L20.823,4.907L11.177,1.531L2.11,4.587C1.769,4.687 1.532,5 1.531,5.355L1.531,29.664C1.531,30.111 1.889,30.469 2.336,30.469L2.589,30.421L11.177,27.093L20.823,30.469L29.89,27.413C30.231,27.313 30.468,27 30.469,26.645L30.469,2.336C30.469,2.335 30.469,2.334 30.469,2.333C30.469,1.893 30.107,1.531 29.667,1.531C29.666,1.531 29.665,1.531 29.664,1.531M12.783,5.501L19.217,7.753L19.217,26.499L12.783,24.247L12.783,5.501M4.748,7.093L9.571,5.469L9.571,24.28L4.748,26.145L4.748,7.094M27.252,24.907L22.429,26.531L22.429,7.738L27.252,5.874L27.252,24.907Z" style="fill-rule:nonzero;"/>
            </svg>
            {{ t('show_map') }}
          </button>

          <button
              v-if="event.eventId && eventDate?.id"
              type="button"
              class="uranus-public-detail-link"
              @click="onDownloadIcs">
            <svg width="20px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(0.294848,0,0,0.303202,-229.662,-293.77)">
                <path d="M778.917,1038.26L778.917,978.682C778.917,973.278 783.429,968.891 788.985,968.891L850.247,968.891C855.804,968.891 860.315,973.278 860.315,978.682L860.315,1038.26C860.315,1043.66 855.804,1048.05 850.247,1048.05L788.985,1048.05C783.429,1048.05 778.917,1043.66 778.917,1038.26ZM784.638,991.976L784.638,1038.26C784.638,1040.59 786.586,1042.48 788.985,1042.48L850.247,1042.48C852.647,1042.48 854.594,1040.59 854.594,1038.26L854.594,991.976L784.638,991.976ZM837.635,1020.8C840.618,1020.8 843.04,1023.16 843.04,1026.06C843.04,1028.96 840.618,1031.32 837.635,1031.32C834.651,1031.32 832.229,1028.96 832.229,1026.06C832.229,1023.16 834.651,1020.8 837.635,1020.8ZM819.616,1020.8C822.6,1020.8 825.022,1023.16 825.022,1026.06C825.022,1028.96 822.6,1031.32 819.616,1031.32C816.633,1031.32 814.211,1028.96 814.211,1026.06C814.211,1023.16 816.633,1020.8 819.616,1020.8ZM801.598,1020.8C804.581,1020.8 807.003,1023.16 807.003,1026.06C807.003,1028.96 804.581,1031.32 801.598,1031.32C798.615,1031.32 796.192,1028.96 796.192,1026.06C796.192,1023.16 798.615,1020.8 801.598,1020.8ZM819.616,1003.14C822.6,1003.14 825.022,1005.5 825.022,1008.4C825.022,1011.3 822.6,1013.66 819.616,1013.66C816.633,1013.66 814.211,1011.3 814.211,1008.4C814.211,1005.5 816.633,1003.14 819.616,1003.14ZM837.635,1003.14C840.618,1003.14 843.04,1005.5 843.04,1008.4C843.04,1011.3 840.618,1013.66 837.635,1013.66C834.651,1013.66 832.229,1011.3 832.229,1008.4C832.229,1005.5 834.651,1003.14 837.635,1003.14ZM854.594,986.413L854.594,978.682C854.594,976.349 852.647,974.455 850.247,974.455L788.985,974.455C786.586,974.455 784.638,976.349 784.638,978.682L784.638,986.413L854.594,986.413Z"/>
              </g>
            </svg>
            {{ t('download_ics') }}
          </button>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { marked } from 'marked'
import { useEventTypeLookupStore } from '@/store/uranusEventTypeGenreLookup.ts'
import { useLanguageLookupStore } from '@/store/UranusLanguageLookup.ts'

import UranusEventDateTimeDisplay from '@/component/event/ui/UranusEventDateTimeDisplay.vue'
import UranusEventVenueDisplay from '@/component/event/ui/UranusEventVenueDisplay.vue'

import { UranusEvent } from '@/domain/event/UranusEvent.ts'
import { UranusEventDate } from '@/domain/event/UranusEventDate.ts'
import UranusEventLocationDisplay from '@/component/event/ui/UranusEventLocationDisplay.vue'
import UranusEventFurtherDatesDisplay from '@/component/event/ui/UranusEventFurtherDatesDisplay.vue'
import UranusEventReleaseChip from '@/component/event/ui/UranusEventReleaseChip.vue'
import { uranusI18nAccessibilityFlags } from '@/i18n/uranus-i18n-accessibility.ts'

const route = useRoute()

const { t, locale } = useI18n({ useScope: 'global' })

const typeLookupStore = useEventTypeLookupStore()
const getTypeGenreName = (typeId: number, genreId: number | null) => typeLookupStore.getTypeGenreName(typeId, genreId, locale.value)


const languageLookupStore = useLanguageLookupStore()

// State
const event = ref<UranusEvent | null>(null)
const eventDate = ref<UranusEventDate | null>(null)
const isLoading = ref(true)
const showLoading = ref(false)
const loadingLabel = computed(() => t('loading'))
const loadError = ref<string | null>(null)
const isDownloadingIcs = ref(false)

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
function buildImageCredit() {
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

const hasLonLat = computed(() => {
  if ((event.value?.date.lon && event.value?.date.lat) || (event.value?.date.lon && event.value?.date.lat))
    return true
  return false
})


const loadEvent = async () => {
  const eventId = Number(resolveRouteParam(route.params.id))
  const eventDateId = Number(resolveRouteParam(route.params.eventDateId))
  if (!eventId || !eventDateId) {
    loadError.value = t('error_missing_params')
    isLoading.value = false
    return
  }

  isLoading.value = true
  loadError.value = null

  try {
    const lang = locale.value || 'de'
    const endpoint = `/api/event/${eventId}/date/${eventDateId}?lang=${lang}`
    const {data} = await apiFetch<unknown>(endpoint)
    const mappedEvent = UranusEvent.fromApi(data, eventDateId)
    if (!mappedEvent) {
      loadError.value = t('error_incomplete_data')
      return
    }
    event.value = mappedEvent
    eventDate.value = mappedEvent.date

  } catch (error: unknown) {
    loadError.value = error instanceof Error ? error.message : t('error_fetch_data_failed')
    console.log('error', error)
  } finally {
    isLoading.value = false
  }
}


const onShowOnMap = () => {
  // TODO: Implement!
  window.alert("onShowOnMap")
}

const onShowAccessibility = () => {
  // TODO: Implement!
  window.alert("onShowAccessibility")
}

const onDownloadIcs = async () => {
  if (!event.value?.eventId || !eventDate.value?.id) {
    return
  }
  if (isDownloadingIcs.value) return

  isDownloadingIcs.value = true

  try {
    const eventId = event.value.eventId
    const eventDateId = eventDate.value.id
    const endpoint = `/api/event/${eventId}/date/${eventDateId}/ics?lang=${locale.value}`
    const { data } = await apiFetch<string>(endpoint, {
      headers: {
        Accept: 'text/calendar,*/*;q=0.8',
      },
    })

    if (typeof data !== 'string' || !data.trim()) {
      throw new Error('Empty ICS payload')
    }

    const blob = new Blob([data], { type: 'text/calendar;charset=utf-8' })
    const blobUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = createIcsFileName(event.value.title ?? '', eventDateId)
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

const createIcsFileName = (title: string, eventDateId: number) => {
  const normalized = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-')
  const base = normalized || 'event'
  return `${base}-${eventDateId}.ics`
}

onMounted(() => void loadEvent())
</script>

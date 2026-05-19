<!--
  src/component/event/ui/UranusEventCalendarListRow.vue
-->

<template>
  <div class="row" @click="toggleExpand">
    <div class="date">{{ formattedDate }}</div>
    <div class="header">
      <div class="title">{{ event.title }}</div>
      <div class="time">
        {{ event.startTime }} / {{ event.venue.name }} / {{ event.venue.city }}
      </div>
      <div class="event-types-container">
        <div
            v-if="hasEventTypes"
            class="uranus-public-event-detail-tags card-footer"
            style="padding-top: 10px;"
        >
          <div
              v-for="typeId in uniqueEventTypes"
              :key="typeId"
              class="uranus-public-event-detail-tag"
          >
            {{ getTypeName(typeId) }}
          </div>
        </div>
      </div>
    </div>

    <div class="content" :class="{ open: isExpanded }" @click.stop>
      <div v-if="isLoading" class="row-state">
        {{ t('loading') }}
      </div>

      <div v-else-if="loadError" class="row-state row-state--error">
        {{ loadError }}
      </div>

      <div v-else-if="eventDetails" class="row-expanded-inner">
        <div class="row-intro">
          <div class="image-frame">
            <img
                :src="detailImageUrl"
                :alt="eventDetails.image?.altText ?? eventDetails.title ?? ''"
                class="uranus-public-event-image"
            />
          </div>

          <p v-if="detailText" class="row-description">
            {{ detailText }}
          </p>
        </div>

        <div v-if="hasLinks" class="row-links">
          <UranusLink
              v-if="eventDetails.sourceUrl"
              :url="uranusEnsureHttpOrHttps(eventDetails.sourceUrl)"
              type="web"
              size="20px"
          />

          <UranusLink
              v-for="(link, index) in eventDetails.eventLinks"
              :key="index"
              :url="uranusEnsureHttpOrHttps(link.url!)"
              :type="link.type"
              :label="link.label"
              size="20px"
          />
        </div>

        <div class="row-info">
          <UranusEventDateTimeDisplay
              :startDate="eventStartDate"
              :startTime="eventStartTime"
              :endDate="eventEndDate"
              :endTime="eventEndTime"
              :entryTime="eventEntryTime"
              :allDay="eventAllDay"
              class="uranus-public-event-info-card"
          />

          <UranusEventOrgDisplay :event="eventDetails" class="uranus-public-event-info-card" />

          <div v-if="eventDetails.onlineLink" class="uranus-public-event-info-card">
            <UranusIconAction
                :to="uranusEnsureHttpOrHttps(eventDetails.onlineLink)"
                :label="t('online_event_link')"
                :icon="Video"
                style="padding-left: 0;"
            />
          </div>

          <div class="uranus-public-event-info-card">
            <UranusFavoriteListEventAction
                :event-uuid="eventDetails.uuid"
                :event-date-uuid="eventDateDetails?.uuid ?? props.event.dateUuid"
            />
          </div>

          <div
              v-if="eventDetails.registrationLink || eventDetails.registrationEmail || eventDetails.registrationPhone"
              class="uranus-public-event-info-card">
            <UranusIconAction
                v-if="eventDetails.registrationLink"
                :to="uranusEnsureHttpOrHttps(eventDetails.registrationLink)"
                :label="t('event_registration_link')"
                :icon="Link"
                style="padding-left: 0;"
            />

            <UranusIconAction
                v-if="eventDetails.registrationEmail"
                :to="'mailto:' + eventDetails.registrationEmail"
                :label="t('event_registration_email')"
                :icon="Mail"
                style="padding-left: 0;"
            />

            <template v-if="eventDetails.registrationPhone">
              <p class="uranus-public-event-info-label">{{ t('event_registration_phone') }}</p>
              <p>{{ eventDetails.registrationPhone }}</p>
            </template>

            <template v-if="eventDetails.registrationDeadline">
              <p class="uranus-public-event-info-label">{{ t('event_registration_deadline') }}</p>
              <p>{{ eventDetails.registrationDeadline }}</p>
            </template>
          </div>

          <UranusEventVenueDisplay :event="eventDetails" :eventDate="eventDateDetails" />

          <div v-if="priceText || priceTypeLabel" class="uranus-public-event-info-card">
            <p class="uranus-public-event-info-label">{{ t('event_price') }}</p>
            <p v-if="priceTypeLabel">{{ priceTypeLabel }}</p>
            <p v-if="priceText">{{ priceText }}</p>

            <UranusIconAction
                v-if="eventDetails.ticketLink"
                :label="t('event_ticket_link')"
                :icon="Ticket"
                :to="uranusEnsureHttpOrHttps(eventDetails.ticketLink)"
                style="padding-left: 0;"
            />
          </div>

          <div
              v-if="(eventDetails.maxAttendees ?? 0) > 0 || ageLabel || !!eventDetails.participationInfo"
              class="uranus-public-event-info-card"
          >
            <p class="uranus-public-event-info-label">{{ t('event_participation_info') }}</p>
            <p v-if="(eventDetails.maxAttendees ?? 0) > 0">{{ maxAttendeesLabel }}</p>
            <p v-if="ageLabel">{{ ageLabel }}</p>
            <p v-if="eventDetails.participationInfo">{{ eventDetails.participationInfo }}</p>
          </div>

          <UranusEventAllDatesDisplay
              v-if="eventDetails.furtherDates?.length"
              :dates="eventDetails.furtherDates"
              :currentDate="eventDateDetails"
              class="uranus-public-event-info-card"
          />

          <div v-if="selectedAccessibilityLabels.length" class="uranus-public-event-info-card row-tight-section">
            <UranusIconAction :icon="Accessibility" :label="t('accessibility')" style="padding-left: 0;" />
            <p v-for="label in selectedAccessibilityLabels" :key="label">
              {{ label }}
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { EventListItem, EventListItemEventType } from '@/domain/event/eventListItem.model.ts'
import { uranusAgeRangeInfo, uranusFormatDayMonth, uranusPriceText, uranusStringInterpolate } from '@/util/string.ts'
import { ApiError, apiFetch } from '@/api.ts'
import type { PublicEventDTO } from '@/api/dto/publicEvent.dto.ts'
import { mapPublicEventFromDTO, type PublicEvent } from '@/domain/event/publicEvent.model.ts'
import type { PublicEventDate } from '@/domain/event/publicEventDate.model.ts'
import { uranusEnsureHttpOrHttps } from '@/util/url.ts'
import { uranusI18nAccessibilityFlags } from '@/i18n/accessibility.ts'
import UranusEventDateTimeDisplay from '@/component/event/ui/UranusEventDateTimeDisplay.vue'
import UranusEventVenueDisplay from '@/component/event/ui/UranusEventVenueDisplay.vue'
import UranusEventOrgDisplay from '@/component/event/ui/UranusEventOrgDisplay.vue'
import UranusEventAllDatesDisplay from '@/component/event/ui/UranusEventAllDatesDisplay.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusLink from '@/component/ui/UranusLink.vue'
import UranusFavoriteListEventAction from '@/component/favorite/UranusFavoriteListEventAction.vue'
import { Accessibility, Link, Mail, Ticket, Video } from 'lucide-vue-next'

const { t, locale } = useI18n({ useScope: 'global' })

const props = defineProps<{
  event: EventListItem
  locale: string
  eventListStore: any
  typeLookupStore: any
}>()

const eventDetails = ref<PublicEvent | null>(null)
const eventDateDetails = ref<PublicEventDate | null>(null)

const isExpanded = ref(false)
const isLoading = ref(false)
const loadError = ref<string | null>(null)

const formattedDate = computed(() =>
    uranusFormatDayMonth(
        props.event.startDate,
        props.locale
    )
)

const fallbackImageUrl = computed(() =>
    props.eventListStore.getEventImageUrl(props.event, { width: 640, ratio: '16:9' })
)

const detailImageUrl = computed(() => {
  const url = eventDetails.value?.image?.url
  if (!url) return fallbackImageUrl.value

  return url.includes('?')
      ? `${url}&ratio=16:9&width=640`
      : `${url}?ratio=16:9&width=640`
})

const detailText = computed(() => {
  const summary = eventDetails.value?.summary?.trim()
  if (summary) return summary

  return excerptWords(eventDetails.value?.description ?? '', 200)
})

const hasLinks = computed(() =>
    Boolean(eventDetails.value?.sourceUrl || eventDetails.value?.eventLinks?.length)
)

const eventStartDate = computed(() => eventDateDetails.value?.startDate ?? eventDetails.value?.date.startDate ?? null)
const eventStartTime = computed(() => eventDateDetails.value?.startTime ?? eventDetails.value?.date.startTime ?? null)
const eventEndDate = computed(() => eventDateDetails.value?.endDate ?? eventDetails.value?.date.endDate ?? null)
const eventEndTime = computed(() => eventDateDetails.value?.endTime ?? eventDetails.value?.date.endTime ?? null)
const eventEntryTime = computed(() => eventDateDetails.value?.entryTime ?? eventDetails.value?.date.entryTime ?? null)
const eventAllDay = computed(() => eventDateDetails.value?.allDay ?? eventDetails.value?.date.allDay ?? false)

const ageLabel = computed(() => {
  return uranusAgeRangeInfo(t, eventDetails.value?.minAge, eventDetails.value?.maxAge)
})

const maxAttendeesLabel = computed(() => {
  return uranusStringInterpolate(t('event_max_count_attendees'), { count: eventDetails.value?.maxAttendees })
})

const priceText = computed(() => {
  return uranusPriceText(t, eventDetails.value?.minPrice, eventDetails.value?.maxPrice, eventDetails.value?.currency ?? '')
})

const priceTypeLabel = computed(() => {
  const map: Record<string, string | null> = {
    not_specified: 'event_price_not_specified',
    regular_price: null,
    free: 'event_price_free',
    donation: 'event_price_donation',
    tiered_prices: 'event_price_tiered',
  }

  const priceType = eventDetails.value?.priceType ?? 'not_specified'
  const key = map[priceType] || 'event_price_not_specified'

  if (key === 'event_price_not_specified') {
    return null
  }

  return t(key)
})

const selectedAccessibilityLabels = computed(() => {
  if (!eventDetails.value?.date.accessibilityFlags) return []

  const mask = BigInt(eventDetails.value.date.accessibilityFlags)
  const labels: string[] = []

  uranusI18nAccessibilityFlags.forEach(topic => {
    topic.flags.forEach(flag => {
      const flagValue = 1n << BigInt(flag.id)
      if ((mask & flagValue) === flagValue) {
        labels.push(t(flag.name))
      }
    })
  })

  return labels
})

const hasEventTypes = computed(() =>
    props.event.eventTypes?.length > 0
)

const uniqueEventTypes = computed(() => {
  const set = new Set<number>()
  props.event.eventTypes?.forEach((t: EventListItemEventType) =>
      set.add(t.typeId)
  )
  return Array.from(set)
})

function toggleExpand() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && eventDetails.value == null) {
    void loadEvent()
  }
}

function excerptWords(value: string, maxWords: number) {
  const plainText = value
      .replace(/<[^>]*>/g, ' ')
      .replace(/[#>*_`~[\]()!-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  const words = plainText.split(' ').filter(Boolean)
  if (words.length <= maxWords) return plainText

  return `${words.slice(0, maxWords).join(' ')}...`
}

const getTypeName = (typeId: number) =>
    props.typeLookupStore.data[props.locale]?.types?.[typeId]?.name ?? 'Unknown'

const loadEvent = async () => {
  isLoading.value = true
  loadError.value = null

  try {
    const eventUuid = props.event.uuid
    const eventDateUuid = props.event.dateUuid

    const lang = locale.value || 'de'
    const apiPath = `/api/event/${eventUuid}/date/${eventDateUuid}?lang=${lang}`

    const apiResponse = await apiFetch<PublicEventDTO>(apiPath)
    if (apiResponse.data) {
      const mappedEvent: PublicEvent | null = mapPublicEventFromDTO(apiResponse.data, eventDateUuid)
      if (!mappedEvent) {
        loadError.value = t('error_incomplete_data')
        return
      }
      eventDetails.value = mappedEvent
      eventDateDetails.value = mappedEvent.date
    }
  } catch (error: unknown) {
    if (error instanceof ApiError) {
      loadError.value = error.status === 404 ? t('error_fetch_data_failed') : error.message
      console.log('ApiError', JSON.stringify(error, null, 2))
    } else {
      loadError.value = t('error_fetch_data_failed')
    }
  } finally {
    isLoading.value = false
  }
}

</script>

<style scoped lang="scss">

.row {
  display: grid;
  grid-template-columns: 70px 1fr;
  gap: 10px;
  border: 1px solid var(--uranus-card-border-color);
  border-left: none;
  border-right: none;
  align-items: start;
  padding: 10px;
  margin: 0;
  overflow: hidden;
  transition: all 0.3s;
  cursor: pointer;
  &:hover {
    color: var(--uranus-link-color) !important;
  }
}

.row:not(:last-child) {
  border-bottom: none;
}

.header {
  grid-column: 2;
  grid-row: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.date {
  grid-column: 1;
  grid-row: 1;
  display: flex;
  align-items: center;
  justify-content: start;
  font-weight: 200;
  font-size: 1.4rem;
}

.title {
  font-weight: 500;
  font-size: 1.4rem;
}

.content {
  grid-column: 1 / span 2;
  grid-row: 2;
  max-height: 0;
  max-width: 1024px;
  overflow: hidden;
  padding-left: 80px;
  transition: max-height 0.3s ease;
  color: var(--uranus-color);
}

.content.open {
  max-height: 5000px;
}

.row-expanded-inner {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 8px 0 18px;
}

.row-intro {
  display: grid;
  grid-template-columns: minmax(220px, 320px) minmax(0, 1fr);
  gap: 18px;
  align-items: start;
}

.image-frame {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: var(--uranus-card-border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--uranus-color-7);
}

.image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.row-description {
  margin: 0;
  line-height: 1.5;
}

.row-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}

.row-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0 16px;
}

.row-tight-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.row-state {
  padding: 16px 0 20px;
  color: var(--uranus-muted-text);
}

.row-state--error {
  color: var(--uranus-danger-color, #b91c1c);
}

@media (max-width: 800px) {
  .row {
    grid-template-columns: 1fr;
  }
  .date,
  .header,
  .content {
    grid-column: 1;
    grid-row: auto;
    padding-left: 0;
  }
  .row-intro {
    grid-template-columns: 1fr;
  }
}
</style>

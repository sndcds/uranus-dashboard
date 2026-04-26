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

    <div class="content" :class="{ open: isExpanded }">
      <div v-if="eventDetails" class="row-expanded-inner">
        <div v-if="eventDetails.image?.url" class="image-frame">
          <img
              :src="eventDetails.image.url.includes('?')
              ? `${eventDetails.image.url}&ratio=16:9&width=640`
              : `${eventDetails.image.url}?ratio=16:9&width=640`"
              :alt="eventDetails.image.altText ?? eventDetails.title ?? ''"
              class="uranus-public-event-image"
          />
        </div>

        <div
            class="uranus-public-event-description"
            v-html="formatMarkdown(eventDetails.summary!)"></div>

      </div>
      <div v-else class="row-expanded-inner">
        ERROR
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { EventListItemEventType } from '@/domain/event/eventListItem.model.ts'
import { uranusFormatDayMonth } from '@/util/UranusStringUtils.ts'
import { ApiError, apiFetch } from '@/api.ts'
import type { PublicEventDTO } from '@/api/dto/publicEvent.dto.ts'
import { mapPublicEventFromDTO, type PublicEvent } from '@/domain/event/publicEvent.model.ts'
import type { PublicEventDate } from '@/domain/event/publicEventDate.model.ts'
import { marked } from 'marked'

const { t, locale } = useI18n({ useScope: 'global' })

const props = defineProps<{
  event: any
  locale: string
  eventListStore: any
  typeLookupStore: any
}>()

const eventDetails = ref<PublicEvent | null>(null)
const eventDateDetails = ref<PublicEventDate | null>(null)

const isExpanded = ref(false)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const formattedDate = computed(() =>
    uranusFormatDayMonth(
        props.event.startDate,
        props.locale
    )
)

const formatMarkdown = (markdown: string) => {
  try { return marked(markdown) }
  catch { return markdown }
}

const imageUrl = computed(() =>
    props.eventListStore.getEventImageUrl(props.event, { width: 120, ratio: '1:1' })
)

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
    loadEvent()
  }
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

.row-expanded {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.row-expanded.open {
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

.time {
}

.event-types-container {
}

.content {
  grid-column: 1 / span 2;
  grid-row: 2;
  max-height: 0;
  overflow: hidden;
  padding-left: 80px;
  transition: max-height 0.3s ease;
}

.content.open {
  max-height: 1000px; /* large enough for your content */
}

.image-frame {
  width: 100%;
  max-width: 320px;
  aspect-ratio: 16/9;
  overflow: hidden;
  border-radius: var(--uranus-card-border-radius);
}

@media (max-width: 800px) {
  .row {
    grid-template-columns: 1fr; /* stack everything */
  }
  .date,
  .header,
  .content {
    grid-column: 1; /* ensure full width */
    grid-row: auto;
    padding-left: 0;
  }
  .image-frame {
    max-width: 100%;
    height: 200px;
  }
}
</style>
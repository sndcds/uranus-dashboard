<!--
  src/component/event/card/UranusEventCalendarCard.vue
-->

<template>
  <router-link
      :to="{
      name: 'event-details',
      params: { uuid: event.uuid, eventDateUuid: event.dateUuid }
    }"
      class="calendar-card"
  >
    <div class="calendar-image">
      <div class="calendar-image-wrapper">
        <img
            v-if="imageUrl"
            class="calendar-main-image"
            :src="imageUrl"
            :alt="t('event_image_alt_text')"
        >

        <UranusEventPriceBadge
            v-if="event.priceType && ['free', 'donation'].includes(event.priceType)"
            :price-type="event.priceType"
            class="calendar-card-free-badge"
            :size="26"
        />
      </div>

      <UranusFavoriteListEventAction
          class="favorite-action"
          :event-uuid="event.uuid"
          :event-date-uuid="event.dateUuid"
      />
    </div>

    <div class="calendar-text">
      <h2>{{ event.title }}</h2>

      <div class="calendar-meta">
        <span>{{ formattedDateTime }}</span>
        <span>{{ event.venue.name }} · {{ event.venue.city }}</span>

        <UranusEventReleaseChip
            v-if="isReleased"
            :releaseStatus="event.releaseStatus"
            tiny
        />
      </div>

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
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusEventReleaseChip from '@/component/event/ui/UranusEventReleaseChip.vue'
import UranusFavoriteListEventAction from '@/component/favorite/UranusFavoriteListEventAction.vue'
import { uranusFormatDateTime } from '@/util/string.ts'
import { useEventReleaseStatusStore } from '@/store/eventReleaseStatusStore.ts'
import type { EventListItemEventType } from '@/domain/event/eventListItem.model.ts'
import UranusEventPriceBadge from '@/component/event/ui/UranusEventPriceBadge.vue'

const { t } = useI18n()

const props = defineProps<{
  event: any
  locale: string
  eventListStore: any
  typeLookupStore: any
}>()

const eventReleaseStatusStore = useEventReleaseStatusStore()

const imageUrl = computed(() =>
    props.eventListStore.getEventImageUrl(props.event)
)

const formattedDateTime = computed(() =>
    uranusFormatDateTime(
        props.event.startDate,
        props.event.startTime,
        props.event.endDate,
        props.event.endTime,
        props.locale,
        true
    )
)

const isReleased = computed(() =>
    eventReleaseStatusStore.isReleased(props.event.releaseStatus ?? '')
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

const getTypeName = (typeId: number) =>
    props.typeLookupStore.data[props.locale]?.types?.[typeId]?.name ?? 'Unknown'
</script>

<style scoped lang="scss">
.calendar-card {
  position: relative;
  cursor: pointer;
  overflow: hidden;
  background: var(--uranus-bg);
  border: 1px solid var(--uranus-color-7);
  border-radius: 2px;
  width: 100%;
  display: flex;
  flex-direction: column;
  color: var(--uranus-color);
  transition: all 0.1s;
  &:hover {
    color: var(--uranus-link-color) !important;
  }
}

.card-footer {
 margin-top: auto;
  padding-top: 10px;

}

.calendar-image {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.calendar-image-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.calendar-main-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.calendar-card:hover .calendar-main-image {
  transform: scale(1.1);
}

.calendar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s;
}

.calendar-text {
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  font-weight: 300;
  letter-spacing: 0.05em;
  gap: 4px;
}

.calendar-text h2 {
  font-size: 1.5rem;
  line-height: 1.8rem;
  margin-bottom: 0.6rem;
  letter-spacing: 0;
}

.calendar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.calendar-card-free-badge {
  right: 0.5rem;
  bottom: -1rem;
  z-index: 2;
}

.favorite-action {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  background: white;
  padding: 8px;
  border-radius: 50%;
}
</style>

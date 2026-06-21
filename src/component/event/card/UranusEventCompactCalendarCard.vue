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
      <img v-if="imageUrl" :src="imageUrl" :alt="t('event_image_alt_text')" />
      <div v-if="isFreeEvent" class="calendar-card-free-badge">
        <Heart :size="18" />
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
        <span>{{ event.venue.city }}</span>
        <span>{{ formattedDateTime }}</span>
      </div>

    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Heart } from 'lucide-vue-next'
import UranusFavoriteListEventAction from '@/component/favorite/UranusFavoriteListEventAction.vue'
import { uranusFormatDateTime } from '@/util/string.ts'
import { useEventReleaseStatusStore } from '@/store/eventReleaseStatusStore.ts'
import type { EventListItemEventType } from '@/domain/event/eventListItem.model.ts'


const { t } = useI18n()

const props = defineProps<{
  event: any
  locale: string
  eventListStore: any
  typeLookupStore: any
}>()

const eventReleaseStatusStore = useEventReleaseStatusStore()

const imageUrl = computed(() =>
    props.eventListStore.getEventImageUrl(props.event, { width: 240, ratio: '2:1' })
)

const isFreeEvent = computed(() => props.event.priceType === 'free')

const formattedDateTime = computed(() =>
    uranusFormatDateTime(
        props.event.startDate,
        props.event.startTime,
        props.event.endDate,
        props.event.endTime,
        props.locale
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
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.calendar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s;

  &:hover {
    transform: scale(1.1);
  }
}

.calendar-text {
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  flex: 1; /* 👈 THIS is the missing piece */
  font-weight: 300;
  letter-spacing: 0.05em;
  // color: var(--uranus-color-3);
  gap: 4px;
}

.calendar-text h2 {
  font-size: 1rem;
  font-weight: 800;
  letter-spacing: 0;
  white-space: nowrap;
}

.calendar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.calendar-card-free-badge {
  position: absolute;
  right: 0.5rem;
  bottom: 0.5rem;
  width: 2rem;
  height: 2rem;
  color: var(--uranus-ci-color);
  background: var(--uranus-ci-light-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
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

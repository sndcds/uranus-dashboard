<!--
  src/component/event/card/UranusEventCalendarCard.vue
-->

<template>
  <router-link
      :to="{
      name: 'event-details',
      params: { uuid: event.uuid, eventDateUuid: event.dateUuid }
    }"
      class="calendar-card custom-link"
  >
    <div class="calendar-image">
      <img v-if="imageUrl" :src="imageUrl" :alt="t('event_image_alt_text')" />
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
import { uranusFormatDateTime } from '@/util/UranusStringUtils.ts'
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
    props.eventListStore.getEventImageUrl(props.event)
)

const formattedDateTime = computed(() =>
    uranusFormatDateTime(
        props.event.startDate,
        props.event.startTime,
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
  transition: all 0.3s;
  &:hover {
    color: var(--uranus-link-color) !important;
  }
}

.card-footer {
 margin-top: auto;
  padding-top: 10px;

}

.calendar-card:hover {
  transform: translateY(-3px);
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
  font-size: 1.6rem;
  // color: var(--uranus-color);
  margin-bottom: 0.6rem;
  letter-spacing: 0;
}

.calendar-meta {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
</style>
<!--
  src/component/event/ui/UranusEventCalendarListRow.vue
-->

<template>
  <div class="row">
    <!--div
        class="row-image"
        :style="imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}"
    ></div-->
    <div class="row-date">{{ formattedDate }}</div>
    <div class="row-content">
      <div class="row-time">
        {{ event.startTime }} / {{ event.venue.name }} / {{ event.venue.city }}</div>
      <div class="row-title">{{ event.title }}</div>
      <div class="row-types">
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { EventListItemEventType } from '@/domain/event/eventListItem.model.ts'
import { uranusFormatDateTime, uranusFormatDayMonth } from '@/util/UranusStringUtils.ts'

const { t } = useI18n()

const props = defineProps<{
  event: any
  locale: string
  eventListStore: any
  typeLookupStore: any
}>()

const formattedDate = computed(() =>
    uranusFormatDayMonth(
        props.event.startDate,
        props.locale
    )
)

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

const getTypeName = (typeId: number) =>
    props.typeLookupStore.data[props.locale]?.types?.[typeId]?.name ?? 'Unknown'

</script>

<style scoped lang="scss">
.row {
  display: flex;
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

.row-content {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding: 0.5rem 1rem;
}

.row-image {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.row-date {
  top: 0;
  font-weight: 200;
  font-size: 1.6rem;
  padding: 0.5rem 1rem;
}

.row-title {
  font-weight: 800;
  font-size: 1.3rem;
}

.row-types {
}
</style>
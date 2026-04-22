<!--
  src/component/event/ui/UranusEventCalendarListRow.vue
-->

<template>
  <div class="row">
    <div class="row-date">{{ formattedDate }}</div>
    <div class="row-content">
      <div class="row-time">{{ event.startTime }}</div>
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
import type { EventListItemEventType } from '@/domain/event/eventListItem.model.ts'
import {uranusFormatDateTime, uranusFormatDayMonth} from '@/util/UranusStringUtils.ts'

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
  align-items: end;
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

.row-date {
  height: 100%;
  font-weight: 200;
  font-size: 2.2rem;
  padding: 0.5rem 1rem;
  border-right: 1px solid var(--uranus-card-border-color);
}

.row-title {
  font-weight: 800;
  font-size: 1.3rem;
}

.row-types {
}
</style>
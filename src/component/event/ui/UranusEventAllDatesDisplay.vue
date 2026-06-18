<!--
  src/component/event/ui/UranusEventAllDatesDisplay.vue
-->

<template>
  <div v-if="dates.length" class="uranus-public-event-all-dates">
    <p class="uranus-public-event-info-label">
      {{ t('event_all_dates') }}
    </p>

    <router-link
        v-for="date in sortedDates"
        :key="date.uuid!"
        :to="`/event/${date.eventUuid}/date/${date.uuid}`"
        :class="{ 'is-current': date.uuid === currentDate?.uuid }"
    >
      <div style="display: flex; gap: 0.4rem;">
        {{ formatDate(date.startDate ?? '', locale) }}<template v-if="date.venueCity">, {{ date.venueCity }}</template>

        <UranusEventReleaseChip
            v-if="['cancelled', 'deferred', 'rescheduled'].includes(date.releaseStatus ?? 'draft')"
            :releaseStatus="date.releaseStatus"
            :tiny="true"
        />
      </div>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PublicEventDate } from '@/domain/event/publicEventDate.model.ts'
import { formatDate } from '@/util/dateTime.ts'
import { getStartDateTime } from '@/util/dateTime'
import UranusEventReleaseChip from "@/component/event/ui/UranusEventReleaseChip.vue";

const { t, locale } = useI18n({ useScope: 'global' })

const props = defineProps<{
  dates: PublicEventDate[]
  currentDate?: PublicEventDate | null
}>()

const sortedDates = computed(() => {
  const allDates = [...props.dates]

  if (props.currentDate) {
    const exists = allDates.some(
        d => d.uuid === props.currentDate!.uuid
    )

    if (!exists) {
      allDates.push(props.currentDate)
    }
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return allDates
      .map(date => ({
        ...date,
        _dt: getStartDateTime(date.startDate, date.startTime),
      }))
      .filter(d => d._dt && d._dt >= today)
      .sort((a, b) => a._dt!.getTime() - b._dt!.getTime())
})
</script>

<style lang="scss" scoped>
.is-current {
  color: var(--uranus-color);
}
</style>
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
      <p>
        {{ formatDate(date.startDate ?? '', locale) }}<template v-if="date.venueCity">, {{ date.venueCity }}</template>
      </p>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PublicEventDate } from '@/domain/event/publicEventDate.model.ts'
import { formatDate } from '@/util/datetime.ts'

const { t, locale } = useI18n({ useScope: 'global' })

const props = defineProps<{
  dates: PublicEventDate[]
  currentDate?: PublicEventDate | null
}>()

const sortedDates = computed(() => {
  const allDates = [...props.dates]
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // const now = new Date()

  // Add currentDate if present and not already included
  if (props.currentDate) {
    const exists = allDates.some(d => d.uuid === props.currentDate!.uuid)

    if (!exists) {
      allDates.push(props.currentDate)
    }
  }

  return allDates
      .filter(date => {
        if (!date.startDate) return false

        return new Date(date.startDate) >= today
      })
      .sort((a, b) => {
        return new Date(a.startDate!).getTime()
            - new Date(b.startDate!).getTime()
      })
})
</script>

<style lang="scss" scoped>
.is-current {
  color: var(--uranus-color);
}
</style>
<!--
  UranusPublicEventDateTimeDisplay.vue
-->
<template>
  <div style="display: flex; flex-direction: column; justify-content: center;">
    <!-- Single-day -->
    <template v-if="model.type === 'single'">
      <h2>{{ model.date }}</h2>
      <p v-if="model.time">{{ model.time }}</p>
    </template>
    <!-- Multi-day -->
    <template v-else>
        <h2>{{ model.startDate }}</h2>
        <p v-if="model.startTime">{{ model.startTime }}</p>
        <p>{{ t('event_end') }}:</p>
        <h2>{{ model.endDate }}</h2>
        <p v-if="model.endTime">{{ model.endTime }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDate, formatTime, formatTimeRange } from "@/utils/uranus-format-date-time.ts";

interface Props {
  startDate: string | null // YYYY-MM-DD
  startTime?: string | null // HH:mm
  endDate?: string | null   // YYYY-MM-DD
  endTime?: string | null   // HH:mm
  allDay?: boolean
  mode?: 'short' | 'long' // formatting mode
}

const props = defineProps<Props>()
const { locale, t } = useI18n()
const mode = props.mode || 'short'

// Computed render model
const model = computed(() => {
  const sameDay = !props.endDate || props.endDate === props.startDate

  if (props.allDay) {
    return sameDay
        ? { type: 'single', date: formatDate(props.startDate ?? '', locale.value), time: null }
        : {
          type: 'multi',
          startDate: formatDate(props.startDate ?? '', locale.value),
          startTime: null,
          endDate: formatDate(props.endDate!, locale.value),
          endTime: null
        }
  }

  if (sameDay) {
    // Single-day event
    let timeStr: string | null = null
    if (props.startTime && props.endTime) {
      timeStr = formatTimeRange(formatTime(props.startTime, locale.value), formatTime(props.endTime, locale.value))
    } else if (props.startTime) {
      timeStr = formatTimeRange(formatTime(props.startTime, locale.value), locale.value)
    }
    return { type: 'single', date: formatDate(props.startDate ?? '', locale.value), time: timeStr }
  }

  // Multi-day event
  return {
    type: 'multi',
    startDate: formatDate(props.startDate ?? '', locale.value),
    startTime: props.startTime ? formatTimeRange(formatTime(props.startTime, locale.value), locale.value) : null,
    endDate: formatDate(props.endDate!, locale.value),
    endTime: props.endTime ? formatTimeRange(formatTime(props.endTime, locale.value), locale.value) : null
  }
})
</script>

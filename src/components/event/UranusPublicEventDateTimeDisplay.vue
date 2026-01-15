<!--
  UranusPublicEventDateTimeDisplay.vue
-->
<template>
  <div style="display: flex; flex-direction: column; justify-content: center;">

    <template v-if="model.type === 'single'">
      <h2>{{ model.date }}</h2>
      <p v-if="model.time">
        {{ model.time }}
      </p>
      <p v-if="model.entryTime">
        {{ t('event_entry_time_short') }}: {{model.entryTime }}
      </p>
    </template>

    <template v-else>
      <h2>{{ model.startDate }}</h2>
      <p v-if="model.startTime">
        {{ t('event_starts_short') }}: {{model.startTime }}
      </p>
      <p v-if="model.entryTime">
        {{ t('event_entry_time_short') }}: {{model.entryTime }}
      </p>
      <template v-if="model.endDate">
        <p>
          {{ t('event_ends_short') }}: {{ model.endDate }}
          <template v-if="model.endTime">
            {{ model.endTime }}
          </template>
        </p>
      </template>
      <p v-else-if="model.endTime">
        {{ t('event_ends_short') }}: {{ model.endTime }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatDate, formatTimeForUI, formatTimeRangeForUI } from "@/utils/uranus-format-date-time.ts";

interface Props {
  startDate: string | null // YYYY-MM-DD
  startTime?: string | null // HH:mm
  endDate?: string | null   // YYYY-MM-DD
  endTime?: string | null   // HH:mm
  entryTime?: string | null   // HH:mm
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
    if (sameDay) {
      return {
        type: 'single',
        startDate: formatDate(props.startDate ?? '', locale.value),
        time: null
      }
    } else {
      return {
        type: 'multi',
        startDate: formatDate(props.startDate ?? '', locale.value),
        startTime: null,
        endDate: formatDate(props.endDate!, locale.value),
        endTime: null,
        entryTime: props.entryTime ? formatTimeRangeForUI(props.entryTime, locale.value) : null,
      }
    }
  }

  if (sameDay) {
    // Single-day event
    let timeStr: string | null = null
    if (props.startTime && props.endTime) {
      timeStr = formatTimeRangeForUI(props.startTime, locale.value, props.endTime)
    } else if (props.startTime) {
      timeStr = t('event_starts_short') + ': ' + formatTimeForUI(props.startTime, locale.value)
    }
    return {
      type: 'single',
      date: formatDate(props.startDate ?? '', locale.value),
      entryTime: props.entryTime ? formatTimeForUI(props.entryTime, locale.value) : null,
      time: timeStr,
    }
  }

  // Multi-day event
  return {
    type: 'multi',
    startDate: formatDate(props.startDate ?? '', locale.value),
    startTime: props.startTime ? formatTimeForUI(props.startTime, locale.value) : null,
    endDate: formatDate(props.endDate!, locale.value),
    endTime: props.endTime ? formatTimeForUI(props.endTime, locale.value) : null,
    entryTime: props.entryTime ? formatTimeForUI(props.entryTime, locale.value) : null,
  }
})
</script>

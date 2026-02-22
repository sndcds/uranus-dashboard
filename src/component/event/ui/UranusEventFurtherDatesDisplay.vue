<!--
  src/component/event/ui/UranusEventFurtherDatesDisplay.vue

  2026-02-05, Roald
-->

<template>
  <div v-if="dates.length" class="uranus-public-event-further-dates">
    <p class="uranus-public-event-info-label">
      {{ t('event_additional_dates') }}
    </p>

    <router-link
        v-for="date in dates"
        :key="date.id!"
        :to="`/event/${date.eventId}/date/${date.id}`"
    >
      {{ formatDate(date.startDate ?? '', locale) }}<br>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { UranusEventDate } from '@/domain/event/UranusEventDate.ts'
import { formatDate } from '@/util/uranus-format-date-time.ts'

const { t, locale } = useI18n({ useScope: 'global' })

defineProps<{
  dates: UranusEventDate[]
}>()
</script>
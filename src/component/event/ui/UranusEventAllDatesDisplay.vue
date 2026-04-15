<!--
  src/component/event/ui/UranusEventAllDatesDisplay.vue

  2026-02-05, Roald
-->

<template>
  <div v-if="dates.length" class="uranus-public-event-all-dates">
    <p class="uranus-public-event-info-label">
      {{ t('event_all_dates') }}
    </p>

    <router-link
        v-for="date in dates"
        :key="date.uuid!"
        :to="`/event/${date.eventUuid}/date/${date.uuid}`"
    >
      {{ formatDate(date.startDate ?? '', locale) }}<br>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { PublicEventDate } from '@/domain/event/publicEventDate.model.ts'
import { formatDate } from '@/util/uranus-format-date-time.ts'

const { t, locale } = useI18n({ useScope: 'global' })

defineProps<{
  dates: PublicEventDate[]
}>()
</script>
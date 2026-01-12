<template>
  <div v-if="dates.length" class="uranus-public-further-dates">
    <p class="uranus-public-info-label">
      {{ t('event_additional_dates') }}
    </p>

    <router-link
        v-for="date in dates"
        :key="date.dateId!"
        :to="`/event/${date.eventId}/date/${date.dateId}`"
    >
      {{ formatDate(date.startDate ?? '', locale) }}<br>
    </router-link>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { UranusPublicEventDate } from '@/models/UranusPublicEventModel'
import { formatDate } from '@/utils/uranus-format-date-time.ts'

const { t, locale } = useI18n({ useScope: 'global' })

defineProps<{
  dates: UranusPublicEventDate[]
}>()
</script>
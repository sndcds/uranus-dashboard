<!--
  src/component/event/ui/UranusEventVenueDisplay.vue

  2026-02-05, Roald
-->

<template>
  <div v-if="hasVenueInfo">
    <span class="uranus-public-event-info-label ">{{ t('location') }}</span><br>

    <p v-if="eventDate?.venueWebsite && eventDate?.venueName">
      <a :href="eventDate.venueWebsite" target="_blank" rel="noopener noreferrer">
        {{ eventDate?.venueName }}&nbsp;↗
      </a>
    </p>
    <p v-else-if="eventDate?.venueName">{{ eventDate.venueName }}</p>

    <template v-if="eventDate?.venueStreet || eventDate?.venueHouseNumber">
      <p>{{ eventDate.venueStreet }} {{ eventDate.venueHouseNumber }}</p>
      <p v-if="eventDate.venuePostalCode || eventDate.venueCity">
        {{ eventDate.venuePostalCode }} {{ eventDate.venueCity }}
      </p>
    </template>

    <template v-if="eventDate?.spaceId">
      <span class="uranus-public-event-info-label ">{{ t('venue_space') }}:</span>
      <p>{{ eventDate?.spaceName }}</p>
    </template>

    <img style="margin-top: 16px"
        v-if="logoUrl"
        :src="`${logoUrl}?width=120&type=png&v=${Date.now()}`"
        :alt="'Venue logo'"
    />

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UranusEventDate } from '@/domain/event/UranusEventDate.ts'
import { useThemeStore } from '@/store/uranusThemeStore.ts'

const { t } = useI18n({ useScope: 'global' })
const themeStore = useThemeStore()

// Accept the entire currentEventDate object
const props = defineProps<{ eventDate: UranusEventDate | null }>()

const hasVenueInfo = computed(() => {
  const e = props.eventDate
  return Boolean(
      e?.venueName ||
      e?.venueStreet ||
      e?.venueCity
  )
})


const logoUrl = computed(() => {
  const e = props.eventDate
  if (!e) return ''
  console.log(themeStore.theme)
  return themeStore.theme === 'dark'
      ? e.venueDarkThemeLogoUrl ?? ''
      : e.venueLightThemeLogoUrl ?? ''
})
</script>

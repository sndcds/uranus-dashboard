<!--
  src/component/event/UranusPublicEventVenueDisplay.vue
-->

<template>
  <div v-if="hasVenueInfo">
    <span class="uranus-public-info-label ">{{ t('location') }}:</span>
    <p v-if="event?.venueUrl && event?.venueName">
      <a :href="event.venueUrl" target="_blank" rel="noopener noreferrer">
        {{ event?.venueName }}&nbsp;↗
      </a>
    </p>
    <p v-else-if="event?.venueName">{{ event.venueName }}</p>

    <template v-if="event?.venueStreet || event?.venueHouseNumber">
      <p>{{ event.venueStreet }} {{ event.venueHouseNumber }}</p>
      <p v-if="event.venuePostalCode || event.venueCity">
        {{ event.venuePostalCode }} {{ event.venueCity }}
      </p>
    </template>

    <template v-if="event?.spaceId">
      <span class="uranus-public-info-label ">{{ t('venue_space') }}:</span>
      <p>{{ event?.spaceName }}</p>
    </template>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UranusPublicEvent } from "@/model/uranusEventModel.ts";

const { t } = useI18n({ useScope: 'global' })

// Accept the entire currentEventDate object
const props = defineProps<{ event: UranusPublicEvent | null }>()

const hasVenueInfo = computed(() => {
  const e = props.event
  return Boolean(
      e?.venueName ||
      e?.venueStreet ||
      e?.venueCity
  )
})
</script>

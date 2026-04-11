<!--
  src/component/event/ui/UranusEventVenueDisplay.vue

  2026-02-05, Roald
-->

<template>
  <div v-if="hasVenueInfo">

    <!--UranusLogoImage
        :logoURL="logoUrl ?? ''"
        :lightThemeLogoURL="lightThemeLogoUrl ?? ''"
        :darkThemeLogoURL="darkThemeLogoUrl ?? ''"
        :theme="themeStore.theme"
        :maxWidth="180"
        :maxHeight="80"
    /-->

    <div class="uranus-public-event-info-label label-space-above">{{ t('event_location') }}</div>

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

    <div class="uranus-public-event-top-space" v-if="eventDate?.spaceUuid">
      <span class="uranus-public-event-info-label ">{{ t('venue_space') }}:</span>
      <p>{{ eventDate?.spaceName }}</p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PublicEventDate } from '@/domain/event/publicEventDate.model.ts'
import { useThemeStore } from '@/store/themeStore.ts'
import UranusLogoImage from '@/component/ui/UranusLogoImage.vue'

const { t } = useI18n({ useScope: 'global' })
const themeStore = useThemeStore()

// Accept the entire currentEventDate object
const props = defineProps<{ eventDate: PublicEventDate | null }>()

const hasVenueInfo = computed(() => {
  const e = props.eventDate
  return Boolean(
      e?.venueName ||
      e?.venueStreet ||
      e?.venueCity
  )
})

const logoUrl = computed(() => props.eventDate?.venueLogoUrl ?? null)

const lightThemeLogoUrl = computed(
    () => props.eventDate?.venueLightThemeLogoUrl ?? null
)

const darkThemeLogoUrl = computed(
    () => props.eventDate?.venueDarkThemeLogoUrl ?? null
)
</script>

<style scoped lang="scss">
.label-space-above {
  margin-top: 2rem;
}
</style>

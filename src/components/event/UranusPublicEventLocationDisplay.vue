<!--
  UranusPublicEventLocationDisplay.vue
-->
<template>

  <div v-if="hasLocationInfo" class="uranus-public-event-venue">
    <span class="uranus-public-info-label">
      {{ t('location') }}:
    </span>

    <!-- Location / Venue name -->
    <p v-if="event?.locationName">
      {{ event.locationName }}
    </p>

    <!-- Street + house number -->
    <p v-if="hasStreet">
      {{ event?.locationStreet }} {{ event?.locationHouseNumber }}
    </p>

    <!-- Postal code + city -->
    <p v-if="hasCity">
      {{ event?.locationPostalCode }} {{ event?.locationCity }}
    </p>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { UranusPublicEventDetail } from '@/models/UranusPublicEventModel'

const { t } = useI18n({ useScope: 'global' })

const props = defineProps<{
  event: UranusPublicEventDetail | null
}>()

const hasLocationInfo = computed(() => {
  const e = props.event
  return Boolean(
      e?.locationName ||
      e?.locationStreet ||
      e?.locationCity
  )
})

const hasStreet = computed(() =>
    Boolean(props.event?.locationStreet || props.event?.locationHouseNumber)
)

const hasCity = computed(() =>
    Boolean(props.event?.locationPostalCode || props.event?.locationCity)
)
</script>

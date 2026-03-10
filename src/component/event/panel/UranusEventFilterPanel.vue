<template>
  <UranusForm @submit.prevent="onSaveFilter" class="uranus-filter-panel">

    <UranusFormRow :cols="2">
      <button type="button" class="filter-action-button reset" @click="onResetFilter">
        {{ t('calendar_filter_reset_button_label') }}
      </button>
    </UranusFormRow>

    <!-- Search & City -->
    <UranusFormRow :cols="1">
      <UranusTextfield
          id="search-input"
          v-model="filter.search!"
          :label="t('calendar_filter_search_label')"
          :placeholder="t('calendar_filter_search_placeholder')"
      />

      <UranusTextfield
          id="city-input"
          v-model="filter.city!"
          :label="t('calendar_filter_city_label')"
      />
    </UranusFormRow>

    <!-- Start & End Date -->
    <UranusFormRow :cols="2">
      <UranusDateInput
          id="start-date"
          v-model="filter.startDate"
          :label="t('calendar_filter_start_date')"
          style="width: 100%;"
      />
      <UranusDateInput
          id="end-date"
          v-model="filter.endDate"
          :label="t('calendar_filter_end_date')"
          style="width: 100%;"
      />
    </UranusFormRow>

    <!-- Venue -->
    <UranusFormRow :cols="1">
      <UranusFieldLabel id="xx" label="Spielstätte">
        <UranusVenueTypeahead v-model:selectedVenue="filter.venue"/>
      </UranusFieldLabel>
    </UranusFormRow>

    <div class="uranus-filter-accordions">
      <UranusAccordion v-model="locationOpen">
        <template #title>{{ t('calendar_filter_use_gps') }}</template>
        <UranusFormRow :cols="1">
          <UranusCheckbox
              id="use-gps"
              v-model="filter.useCurrentLocation!"
              label="Use GPS"
          />
        </UranusFormRow>

        <UranusFormRow :cols="1">
          <UranusTextfield
              id="radius-km"
              v-model="filter.radiusKm"
              type="number"
              min="0"
              step="0.1"
              label="Radius (km)"
              placeholder="Radius in km"
              :disabled="!filter.useCurrentLocation"
          />
        </UranusFormRow>
        locationError: {{ locationError }}
        <div v-if="locationError" class="uranus-error-message">{{ locationError }}</div>
      </UranusAccordion>

      <UranusAccordion v-model="audienceOpen">
        <template #title>Alter</template>
        <UranusFormRow :cols="2">
          <UranusTextfield
              id="min-age"
              :label="t('event_filter_from')"
              type="number" min="0" step="1" :nullableNumber="true"
              v-model="minAgeModel"
          />
          <UranusTextfield
              id="max-age"
              :label="t('event_filter_to')"
              type="number" min="0" step="1" :nullableNumber="true"
              v-model="maxAgeModel"
          />
        </UranusFormRow>
      </UranusAccordion>

      <UranusAccordion v-model="priceOpen">
        <template #title>Preis</template>
        <UranusFormRow :cols="1">
          <UranusCheckbox id="price-free" v-model="filter.priceTypeFree!" label="Gratis"/>
        </UranusFormRow>
        <UranusFormRow :cols="1">
          <UranusCheckbox id="price-donation" v-model="filter.priceTypeDonation!" label="Spende"/>
        </UranusFormRow>
        <UranusFormRow :cols="2">
          <UranusTextfield
              id="min-price"
              :label="t('event_filter_from')"
              type="number" min="0" step="0.1" :nullableNumber="true"
              v-model="minPriceModel"
          />
          <UranusTextfield
              id="max-price"
              :label="t('event_filter_to')"
              type="number" min="0" step="0.1" :nullableNumber="true"
              v-model="maxPriceModel"
          />
        </UranusFormRow>
      </UranusAccordion>
    </div>

  </UranusForm>
</template>

<script setup lang="ts">
import {computed, ref, watch} from 'vue'
import { useI18n } from 'vue-i18n'
import UranusDateInput from '@/component/ui/UranusDateInput.vue'
import UranusVenueTypeahead from '@/component/venue/UranusVenueTypeahead.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import { useEventsFilterStore, type UranusEventsFilter } from '@/store/uranusEventsFilterStore.ts'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusAccordion from '@/component/ui/UranusAccordion.vue'
import { useGpsLocation } from '@/composable/useGpsLocation'
import UranusFieldLabel from "@/component/ui/UranusFieldLabel.vue";

const { t } = useI18n({ useScope: 'global' })

const eventsFilterStore = useEventsFilterStore()
const filter: UranusEventsFilter = eventsFilterStore.filter

// Add defaults if missing
if (filter.useCurrentLocation === undefined) filter.useCurrentLocation = false
if (filter.radiusKm === undefined) filter.radiusKm = 3.0

// GPS composable reads filter.useCurrentLocation directly
const useCurrentLocationRef = ref(filter.useCurrentLocation)
const { latitude, longitude, locationError } = useGpsLocation(useCurrentLocationRef)


const minAgeModel = computed({
  get: () => filter.minAge ?? '',
  set: (v: string | number | null) => {
    if (v === '' || v === null) {
      filter.minAge = null
    } else {
      const n = Number(v)
      filter.minAge = Number.isNaN(n) ? null : n
    }
  }
})

const maxAgeModel = computed({
  get: () => filter.maxAge ?? '',
  set: (v: string | number | null) => {
    if (v === '' || v === null) {
      filter.maxAge = null
    } else {
      const n = Number(v)
      filter.maxAge = Number.isNaN(n) ? null : n
    }
  }
})

const minPriceModel = computed({
  get: () => filter.minPrice ?? '',
  set: (v: string | number | null) => {
    if (v === '' || v === null) {
      filter.minPrice = null
    } else {
      const n = Number(v)
      filter.minPrice = Number.isNaN(n) ? null : n
    }
  }
})

const maxPriceModel = computed({
  get: () => filter.maxPrice ?? '',
  set: (v: string | number | null) => {
    if (v === '' || v === null) {
      filter.maxPrice = null
    } else {
      const n = Number(v)
      filter.maxPrice = Number.isNaN(n) ? null : n
    }
  }
})


// Sync coordinates to filter store
watch([() => filter.useCurrentLocation, latitude, longitude], ([gpsActive, lat, lon]) => {
  if (gpsActive && lat != null && lon != null) {
    filter.latitude = lat
    filter.longitude = lon
  } else {
    filter.latitude = null
    filter.longitude = null
  }
})

// Accordion states
const locationOpen = ref(false)
const audienceOpen = ref(false)
const priceOpen = ref(false)

// Save filter
const onSaveFilter = () => {
  eventsFilterStore.setFilter({ ...filter })
}

// Reset filter
const onResetFilter = () => {
  eventsFilterStore.setFilter({
    search: '',
    city: '',
    startDate: '',
    endDate: '',
    venue: { id: -1, name: '' },
    useCurrentLocation: false,
    radiusKm: 10.0
  })
}

</script>

<style scoped lang="scss">
.uranus-filter-panel {
  width: 300px;
  padding: 12px;
  background: var(--uranus-bg);
}


.uranus-filter-accordions {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* Buttons */
.filter-action-button {
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  border: none;
  background-color: var(--uranus-nav-bg);
  color: var(--uranus-nav-color);
  font-size: 0.9rem;

  &:hover {
    background-color: var(--uranus-nav-bg-active);
    color: var(--uranus-nav-color-active);
  }
}

.filter-action-button.reset {
  background-color: #eee;
  color: #333;

  &:hover {
    background-color: #ddd;
  }
}
</style>
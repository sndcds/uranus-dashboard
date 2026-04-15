<!--
  src/component/event/panel/UranusEventFilterPanel.vue

  UranusEventFilterPanel provides the UI for configuring event search filters.
  It manages user input for criteria such as categories, search text, location
  (including GPS-based filtering), date range, audience age, and pricing.

  The component keeps the filter state in sync with the global filter store,
  normalizes input values (e.g. numbers, nullable fields), and emits updates
  when filters are applied or reset. It also integrates optional GPS-based
  location detection to enhance proximity-based event queries.
-->

<template>
  <UranusForm @submit.prevent="onSaveFilter" class="uranus-filter-panel">

    <UranusFormRow style="margin-bottom: 1rem;">
      <FunnelX class="uranus-icon"
          @click="onResetFilter" />
    </UranusFormRow>


    <div class="uranus-filter-accordions">
      <UranusEventCategorySelectorAccordion v-model="filterStore.filter.categories" :multiple="true" />

      <UranusAccordion v-model="searchOpen">
        <template #title>{{ t('calendar_filter_use_gps') }}</template>
        <UranusFormRow :cols="1">
          <UranusTextfield
              id="search-input"
              v-model="filterStore.filter.search!"
              :label="t('calendar_filter_search_label')"
              :placeholder="t('calendar_filter_search_placeholder')"
          />
        </UranusFormRow>

        <UranusFormRow :cols="1">
          <UranusTextfield
              id="city-input"
              v-model="filterStore.filter.city!"
              :label="t('calendar_filter_city_label')"
          />
        </UranusFormRow>

        <!-- Start & End Date -->
        <UranusFormRow :cols="2">
          <UranusDateInput
              id="start-date"
              v-model="filterStore.filter.startDate"
              :label="t('calendar_filter_start_date')"
              style="width: 100%;"
          />
          <UranusDateInput
              id="end-date"
              v-model="filterStore.filter.endDate"
              :label="t('calendar_filter_end_date')"
              style="width: 100%;"
          />
        </UranusFormRow>

        <UranusFormRow :cols="1">
          <UranusLabel id="venue" label="Spielstätte">
            <UranusVenueTypeahead v-model:selectedVenue="filterStore.filter.venue"/>
          </UranusLabel>
        </UranusFormRow>

      </UranusAccordion>

      <UranusAccordion v-model="locationOpen">
        <template #title>{{ t('calendar_filter_use_gps') }}</template>
        <UranusFormRow :cols="1">
          <UranusCheckbox
              id="use-gps"
              v-model="filterStore.filter.useCurrentLocation!"
              label="Use GPS"
          />
        </UranusFormRow>

        <UranusFormRow :cols="1">
          <UranusTextfield
              id="radius-km"
              v-model="filterStore.filter.radiusKm"
              type="number"
              min="0"
              max="200"
              step="0.1"
              label="Radius (km)"
              placeholder="Radius in km"
              :disabled="!filterStore.filter.useCurrentLocation"
          />
        </UranusFormRow>
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
        <template #title>{{ t('price') }}</template>
        <UranusFormRow :cols="1">
          <UranusLabel id="price-type" label="Preisart">
            <select v-model="filterStore.filter.priceType">
              <option value="not_specified">{{ t('event_price_not_specified') }}</option>
              <option value="free">{{ t('event_price_free') }}</option>
              <option value="donation">{{ t('event_price_donation') }}</option>
              <option value="regular_price">{{ t('event_price_regular') }}</option>
              <option value="tiered_prices">{{ t('event_price_tiered') }}</option>
            </select>
          </UranusLabel>
        </UranusFormRow>
        <UranusFormRow :cols="2">
          <UranusTextfield
              id="max-price"
              :label="t('event_filter_max_price')"
              type="number" min="0" step="0.1" :nullableNumber="true"
              v-model="maxPriceModel"
          />
          <UranusLabel id="price-currency" label="Währung">
            <select v-model="filterStore.filter.priceCurrency" style="height: var(--uranus-input-height)">
              <option value="EUR">Euro</option>
              <option value="DKK">DKK</option>
            </select>
          </UranusLabel>
        </UranusFormRow>
      </UranusAccordion>
    </div>

  </UranusForm>
</template>

<script setup lang="ts">
import {computed, ref, toRef, watch} from 'vue'
import { useI18n } from 'vue-i18n'
import UranusDateInput from '@/component/ui/UranusDateInput.vue'
import UranusVenueTypeahead from '@/component/venue/UranusVenueTypeahead.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import { useEventsFilterStore } from '@/store/eventsFilterStore.ts'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusAccordion from '@/component/ui/UranusAccordion.vue'
import { useGpsLocation } from '@/composable/useGpsLocation'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusEventCategorySelectorAccordion from '@/component/event/panel/UranusEventCategorySelectorAccordion.vue'
import { FunnelX } from 'lucide-vue-next'

const { t } = useI18n({ useScope: 'global' })

const filterStore = useEventsFilterStore()

// Add defaults if missing
if (filterStore.filter.useCurrentLocation === undefined) filterStore.filter.useCurrentLocation = false
if (filterStore.filter.radiusKm === undefined) filterStore.filter.radiusKm = 3.0

// GPS composable reads filter.useCurrentLocation directly
const useCurrentLocationRef = toRef(filterStore.filter, 'useCurrentLocation')
const { latitude, longitude, locationError } = useGpsLocation(useCurrentLocationRef)


const minAgeModel = computed({
  get: () => filterStore.filter.minAge ?? '',
  set: (v: string | number | null) => {
    if (v === '' || v === null) {
      filterStore.filter.minAge = null
    } else {
      const n = Number(v)
      filterStore.filter.minAge = Number.isNaN(n) ? null : n
    }
  }
})

const maxAgeModel = computed({
  get: () => filterStore.filter.maxAge ?? '',
  set: (v: string | number | null) => {
    if (v === '' || v === null) {
      filterStore.filter.maxAge = null
    } else {
      const n = Number(v)
      filterStore.filter.maxAge = Number.isNaN(n) ? null : n
    }
  }
})

const maxPriceModel = computed({
  get: () => filterStore.filter.maxPrice ?? '',
  set: (v: string | number | null) => {
    if (v === '' || v === null) {
      filterStore.filter.maxPrice = null
    } else {
      const n = Number(v)
      filterStore.filter.maxPrice = Number.isNaN(n) ? null : n
    }
  }
})


// Sync coordinates to filter store
watch([() => filterStore.filter.useCurrentLocation, latitude, longitude], ([gpsActive, lat, lon]) => {
  if (gpsActive && lat != null && lon != null) {
    filterStore.filter.latitude = lat
    filterStore.filter.longitude = lon
  } else {
    filterStore.filter.latitude = null
    filterStore.filter.longitude = null
  }
})

const searchOpen = ref(false)
const locationOpen = ref(false)
const audienceOpen = ref(false)
const priceOpen = ref(false)

const onSaveFilter = () => {
  filterStore.setFilter({ ...filterStore.filter })
}

const onResetFilter = () => {
  filterStore.resetFilter()
}

</script>

<style lang="scss">
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
</style>

<style scoped lang="scss">

.filter-button {
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

.filter-button.reset {
  background-color: #eee;
  color: #333;

  &:hover {
    background-color: #ddd;
  }
}

select {
  border: 1px solid var(--uranus-input-border-color) !important;
}

</style>
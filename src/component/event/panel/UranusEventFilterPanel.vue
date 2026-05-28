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

    <div>
      <UranusFormRow :cols="1" class="uranus-filter-panel__select-row">
        <UranusPopupSelect
            id="date-range-mode"
            v-model="dateRangeMode"
            class="uranus-filter-panel__select"
            width="100%"
            :options="dateRangeModeOptions"
            :aria-label="t('calendar_filter_date_range')"
        />
      </UranusFormRow>

      <UranusFormRow v-if="dateRangeMode === 'custom'" :cols="2">
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

      <UranusFormRow :cols="1">
        <UranusTextfield
            id="search-input"
            v-model="filter.search!"
            updateOn="enter"
            :placeholder="t('calendar_filter_search_placeholder')"
        />
      </UranusFormRow>
    </div>

    <div class="uranus-filter-accordions">
      <UranusEventCategorySelectorAccordion v-model="filter.categories" :multiple="true" />

      <UranusAccordion v-model="locationOpen">
        <template #title>{{ t('calendar_filter_location') }}</template>

        <UranusFormRow :cols="1">
          <UranusTextfield
              id="city-input"
              v-model="filter.city!"
              updateOn="enter"
              :label="t('calendar_filter_city_label')"
          />
        </UranusFormRow>

        <UranusFormRow :cols="1">
          <UranusLabel id="venue" :label="t('venue')">
            <UranusVenueTypeahead v-model:selectedVenue="filter.venue"/>
          </UranusLabel>
        </UranusFormRow>

        <UranusFormRow :cols="1">
          <UranusCheckbox
              id="use-gps"
              v-model="filter.useCurrentLocation!"
              :label="t('calendar_filter_use_gps')"
          />
        </UranusFormRow>

        <UranusFormRow :cols="1">
          <UranusTextfield
              id="radius-km"
              v-model="filter.radiusKm"
              type="number"
              min="0"
              max="200"
              step="0.1"
              label="Radius (km)"
              placeholder="Radius in km"
              :disabled="!filter.useCurrentLocation"
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

      <!-- TODO: i18n -->
      <UranusAccordion v-model="priceOpen">
        <template #title>{{ t('price') }}</template>
        <UranusFormRow :cols="1" class="uranus-filter-panel__select-row">
          <UranusLabel id="price-type" label="Preisart">
            <UranusPopupSelect
                v-model="filter.priceType!"
                class="uranus-filter-panel__select"
                width="100%"
                :options="priceTypeOptions"
                :placeholder="t('event_price_not_specified')"
                :aria-label="t('price')"
            />
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
            <UranusPopupSelect
                v-model="filter.priceCurrency!"
                class="uranus-filter-panel__select"
                width="100%"
                :options="priceCurrencyOptions"
                :aria-label="t('currency')"
            />
          </UranusLabel>
        </UranusFormRow>
      </UranusAccordion>
    </div>

  </UranusForm>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusDateInput from '@/component/ui/UranusDateInput.vue'
import UranusVenueTypeahead from '@/component/venue/UranusVenueTypeahead.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusPopupSelect, { type UranusPopupSelectOption } from '@/component/ui/UranusPopupSelect.vue'
import {
  type UranusEventsDateRangeMode,
  type UranusEventsFilter,
  type UranusEventsFilterScope,
  useEventsFilterStore
} from '@/store/eventsFilterStore.ts'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusAccordion from '@/component/ui/UranusAccordion.vue'
import { useGpsLocation } from '@/composable/useGpsLocation'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusEventCategorySelectorAccordion from '@/component/event/panel/UranusEventCategorySelectorAccordion.vue'
import {
  inferEventDateRangeMode,
  resolveEventDateRange,
  uranusPresetDateRangeModes,
  type UranusPresetDateRangeMode,
} from '@/util/eventDateRange.ts'

const { t } = useI18n({ useScope: 'global' })

const props = withDefaults(defineProps<{
  filterScope?: UranusEventsFilterScope
}>(), {
  filterScope: 'default'
})

const emit = defineEmits<{
  (event: 'filter-changed', value: UranusEventsFilter): void
}>()

const filterStore = useEventsFilterStore()
const filter = computed(() => filterStore.getFilter(props.filterScope))
const dateRangeMode = computed<UranusEventsDateRangeMode>({
  get: () => filter.value.dateRangeMode ?? inferDateRangeModeFromFilter(),
  set: (mode) => {
    filter.value.dateRangeMode = mode
  }
})

const dateRangeModeOptions = computed<UranusPopupSelectOption[]>(() => [
  { value: 'all_events', label: t('calendar_filter_date_all_events') },
  { value: 'today', label: t('calendar_filter_date_today') },
  { value: 'tomorrow', label: t('calendar_filter_date_tomorrow') },
  { value: 'weekend', label: t('calendar_filter_date_weekend') },
  { value: 'next_week', label: t('calendar_filter_date_next_week') },
  { value: 'following_weekend', label: t('calendar_filter_date_following_weekend') },
  { value: 'custom', label: t('calendar_filter_date_custom') },
])

const priceTypeOptions = computed<UranusPopupSelectOption[]>(() => [
  { value: 'not_specified', label: t('event_price_not_specified') },
  { value: 'free', label: t('event_price_free') },
  { value: 'donation', label: t('event_price_donation') },
  { value: 'regular_price', label: t('event_price_regular') },
  { value: 'tiered_prices', label: t('event_price_tiered') },
])

const priceCurrencyOptions = computed<UranusPopupSelectOption[]>(() => [
  { value: 'EUR', label: 'Euro' },
  { value: 'DKK', label: 'DKK' },
])

// Add defaults if missing
if (filter.value.useCurrentLocation === undefined) filter.value.useCurrentLocation = false
if (filter.value.radiusKm === undefined) filter.value.radiusKm = 3.0

// GPS composable reads filter.useCurrentLocation directly
const useCurrentLocationRef = computed({
  get: () => filter.value.useCurrentLocation,
  set: (value: boolean) => {
    filter.value.useCurrentLocation = value
  }
})
const { latitude, longitude, locationError } = useGpsLocation(useCurrentLocationRef)

function inferDateRangeModeFromFilter(): UranusEventsDateRangeMode {
  return inferEventDateRangeMode(filter.value.startDate, filter.value.endDate)
}

function applyDateRangeMode(mode: UranusEventsDateRangeMode) {
  if (!uranusPresetDateRangeModes.includes(mode as UranusPresetDateRangeMode)) return

  const range = resolveEventDateRange(mode as UranusPresetDateRangeMode)
  filter.value.startDate = range.startDate
  filter.value.endDate = range.endDate
}

watch(dateRangeMode, (mode) => {
  applyDateRangeMode(mode)
}, { immediate: true })

const minAgeModel = computed({
  get: () => filter.value.minAge ?? '',
  set: (v: string | number | null) => {
    if (v === '' || v === null) {
      filter.value.minAge = null
    } else {
      const n = Number(v)
      filter.value.minAge = Number.isNaN(n) ? null : n
    }
  }
})

const maxAgeModel = computed({
  get: () => filter.value.maxAge ?? '',
  set: (v: string | number | null) => {
    if (v === '' || v === null) {
      filter.value.maxAge = null
    } else {
      const n = Number(v)
      filter.value.maxAge = Number.isNaN(n) ? null : n
    }
  }
})

const maxPriceModel = computed({
  get: () => filter.value.maxPrice ?? '',
  set: (v: string | number | null) => {
    if (v === '' || v === null) {
      filter.value.maxPrice = null
    } else {
      const n = Number(v)
      filter.value.maxPrice = Number.isNaN(n) ? null : n
    }
  }
})


// Sync coordinates to filter store
watch([() => filter.value.useCurrentLocation, latitude, longitude], ([gpsActive, lat, lon]) => {
  if (gpsActive && lat != null && lon != null) {
    filter.value.latitude = lat
    filter.value.longitude = lon
  } else {
    filter.value.latitude = null
    filter.value.longitude = null
  }
})

const searchOpen = ref(false)
const locationOpen = ref(false)
const audienceOpen = ref(false)
const priceOpen = ref(false)

const onSaveFilter = () => {
  const nextFilter = { ...filter.value }
  filterStore.setFilter(nextFilter, props.filterScope)
  emit('filter-changed', nextFilter)
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

.uranus-filter-panel__select {
  width: 100%;

  :deep(.uranus-popup-select__trigger) {
    min-height: var(--uranus-input-height);
    height: var(--uranus-input-height);
  }
}

.uranus-filter-panel__select-row {
  overflow: visible;
}

</style>

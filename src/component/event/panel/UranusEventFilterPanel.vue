<template>
  <UranusForm @submit.prevent="onSaveFilter" class="sss">

    <!-- Accordion: Location -->
    <div class="accordion">
      <div class="accordion-header" @click="locationOpen = !locationOpen">
        {{ t('calendar_filter_location') }}
        <span class="accordion-arrow">{{ locationOpen ? '▲' : '▼' }}</span>
      </div>

      <div v-show="locationOpen" class="accordion-body">
        <UranusFormRow :cols="1">
          <UranusCheckboxButton id="app" v-model="filter.useCurrentLocation!" :label="t('calendar_filter_use_gps')" />
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
          />
        </UranusFormRow>
      </div>
    </div>

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
      <UranusVenueTypeahead
          v-model:selectedVenue="filter.venue"
      />
    </UranusFormRow>

    <!-- Action Buttons -->
    <UranusFormRow :cols="2">
      <button type="submit" class="filter-action-button">
        {{ t('calendar_filter_save_button') }}
      </button>
      <button type="button" class="filter-action-button reset" @click="onResetFilter">
        {{ t('calendar_filter_reset_button_label') }}
      </button>
    </UranusFormRow>

  </UranusForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusDateInput from '@/component/ui/UranusDateInput.vue'
import UranusVenueTypeahead from '@/component/venue/UranusVenueTypeahead.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import { useEventsFilterStore, type UranusEventsFilter } from '@/store/uranusEventsFilterStore.ts'
import UranusCheckboxButton from "@/component/ui/UranusCheckboxButton.vue";

const { t } = useI18n({ useScope: 'global' })

const eventsFilterStore = useEventsFilterStore()

// Use store filter directly
const filter: UranusEventsFilter = eventsFilterStore.filter

// Add location-specific fields if missing
if (filter.useCurrentLocation === undefined) filter.useCurrentLocation = false
if (filter.radiusKm === undefined) filter.radiusKm = 10.0 // default radius in km

// Accordion state
const locationOpen = ref(true)

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
.sss {
  width: 300px;
  padding: 12px;
  background: var(--uranus-bg);
}

/* Accordion */
.accordion {
  border: 1px solid #ccc;
  border-radius: 6px;
  margin-bottom: 12px;
  overflow: hidden;
}

.accordion-header {
  padding: 8px 12px;
  background-color: #f2f2f2;
  cursor: pointer;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accordion-body {
  padding: 8px 12px;
  background-color: #fff;
}

.accordion-arrow {
  font-size: 0.8rem;
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
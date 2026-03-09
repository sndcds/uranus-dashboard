<template>
  <div class="calendar-view">

    <!-- Sidebar for desktop, modal for mobile -->
    <UranusEventFilterPanel
        v-if="isSidebarVisible || showFilterModal"
        :initial-filter="filter"
        :isSavingFilter="isSavingFilter"
        :canSaveFilter="canSaveFilter"
        @filter-changed="onFilterChanged"
        @save="applyFilters"
        @cancel="onCancelFilter"
    />

    <div class="calendar-body">
      search: {{ filter.search }}, city: {{ filter.city }}<br>
      startDate: {{ filter.startDate }}, endDate: {{ filter.endDate }}<br>
      venue: {{ filter.venue }}<br>

      <UranusEventCalendar
          :initial-filter="filter"
      />
    </div>

    <!-- Mobile modal overlay -->
    <UranusModal
        v-if="showFilterModal && !isSidebarVisible"
        :title="t('calendar_filter_settings_title')"
        @close="onCancelFilter"
        show
    >
      <UranusEventFilterPanel
          :initial-filter="filter"
          :isSavingFilter="isSavingFilter"
          :canSaveFilter="canSaveFilter"
          @filter-changed="onFilterChanged"
          @save="applyFilters"
          @cancel="onCancelFilter"
      />
    </UranusModal>

  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import UranusModal from '@/component/uranus/UranusModal.vue'
import { urlParamsSetIfPresent } from '@/util/UranusUtils.ts'
import type { UranusVenueSelectItemInfo } from '@/domain/venue/UranusVenue.ts'
import UranusEventFilterPanel from '@/component/event/panel/UranusEventFilterPanel.vue'
import UranusEventCalendar from '@/component/event/UranusEventCalendar.vue'

const { t } = useI18n({ useScope: 'global' })

// Filter & UI state
interface CalendarEventsFilter {
  search: string | null
  city: string | null
  startDate?: string | null
  endDate?: string | null
  venue: UranusVenueSelectItemInfo | null
}

const props = defineProps<{ initialFilter?: CalendarEventsFilter }>()
const filter = ref<CalendarEventsFilter>({
  search: props.initialFilter?.search ?? '',
  city: props.initialFilter?.city ?? '',
  startDate: props.initialFilter?.startDate ?? '',
  endDate: props.initialFilter?.endDate ?? '',
  venue: props.initialFilter?.venue ?? { id: -1, name: '' }
})

const showFilterModal = ref(false)
const isSavingFilter = ref(false)
const canSaveFilter = ref(true)

// Show sidebar on desktop
const isSidebarVisible = ref(window.innerWidth >= 1024)
window.addEventListener('resize', () => {
  isSidebarVisible.value = window.innerWidth >= 1024
})

// Events & types
interface CalendarEventType { genre_id: number|null; genre_name: string|null; type_id: number; type_name: string }
interface CalendarEvent {
  id: number; event_date_id: number; title: string; subtitle: string|null; image_path: string|null
  summary: string|null; description: string|null; start_date: string; start_time: string|null
  end_date: string; end_time: string|null; venue_name: string|null; venue_city: string|null
  event_types: CalendarEventType[]|null; organization_name: string|null; release_status: string|null
}

const events = ref<CalendarEvent[]>([])
const limit = 32
const lastEventStartAt = ref<string | null>(null)
const lastEventDateId = ref<number | null>(null)


const buildFilterParams = (paginationMode = false) => {
  const params = new URLSearchParams()
  if (paginationMode) {
    params.set('limit', limit.toString())
    if (lastEventStartAt.value) {
      params.set('last_event_start_at', lastEventStartAt.value)
      if (lastEventDateId.value !== null) params.set('last_event_date_id', lastEventDateId.value.toString())
    }
  }
  urlParamsSetIfPresent(params, 'search', filter.value.search)
  urlParamsSetIfPresent(params, 'city', filter.value.city)
  urlParamsSetIfPresent(params, 'start', filter.value.startDate)
  urlParamsSetIfPresent(params, 'end', filter.value.endDate)
  if (filter.value.venue?.id && filter.value.venue.id >= 0) {
    urlParamsSetIfPresent(params, 'venues', filter.value.venue.id.toString())
  }
  return params
}



watch(filter, async (newFilter, oldFilter) => {
  // Reset pagination and events
  events.value = []
  lastEventStartAt.value = null
  lastEventDateId.value = null

  // Optionally debounce to avoid too many API calls
  loadEvents(true)
}, { deep: true })


const onFilterChanged = (newFilter: CalendarEventsFilter) => {
  Object.assign(filter.value, newFilter)
}

const applyFilters = async () => {
  showFilterModal.value = false
  isSavingFilter.value = true
  events.value = []
  lastEventStartAt.value = null
  lastEventDateId.value = null
  // window.scrollTo({ top: 0, behavior: 'smooth' })
  // try { await loadEvents() } finally { isSavingFilter.value = false }
}

const onCancelFilter = () => showFilterModal.value = false
</script>

<style scoped lang="scss">
.calendar-view {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.calendar-body {
  flex: 1;
}

.calendar-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
}

/* Filter buttons (mobile) */
.calendar-settings {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}

.calendar-filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-button {
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}

.calendar-type-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.calendar-type-chip {
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #aaf;
  cursor: default;
  user-select: none;
}

@media (min-width: 1024px) {
  .calendar-body {
    margin-left: 0;
  }
}
</style>
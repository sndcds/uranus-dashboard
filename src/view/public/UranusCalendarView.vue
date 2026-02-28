<!--
  src/view/public/UranusCalendarView.vue

  TODO: Filter store
-->

<template>
  <div class="public-calendar-page">
    <UranusEventCalendar
        :initial-filter="initialFilter"
        @event-clicked="onEventClicked"
        @filter-changed="onFilterChanged"
    />
  </div>
</template>

<script setup lang="ts">
import UranusEventCalendar from '@/component/event/UranusEventCalendar.vue'
import type { UranusVenueSelectItemInfo } from '@/domain/venue/UranusVenue.ts'

const initialFilter = {
  search: null,
  city: null,
  startDate: null,
  endDate: null,
  venue: { id: -1, name: '' } as UranusVenueSelectItemInfo
}

// Optional: handle events when user clicks on an event
const onEventClicked = (event: any) => {
  console.log('Event clicked:', event)
  // Navigate to event details page or show modal
}

// Optional: track filter changes if you need
const onFilterChanged = (newFilter: any) => {
  console.log('Filter updated:', newFilter)
}
</script>
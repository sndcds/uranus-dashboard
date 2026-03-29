<template>

  <div class="calendar-view">

    <!-- Sidebar for desktop, modal for mobile -->
    <div class="sidebar">
      <UranusEventFilterPanel
          v-if="isSidebarVisible || showFilterModal"
          :isSavingFilter="isSavingFilter"
          :canSaveFilter="canSaveFilter"
          @filter-changed="onFilterChanged"
          @cancel="onCancelFilter"
      />
    </div>

    <div class="calendar-body">
      <UranusEventCalendar />
    </div>

    <!-- Mobile modal overlay -->
    <UranusModal
        v-if="showFilterModal && !isSidebarVisible"
        :title="t('calendar_filter_settings_title')"
        @close="onCancelFilter"
        show
    >
      <UranusEventFilterPanel
          :isSavingFilter="isSavingFilter"
          :canSaveFilter="canSaveFilter"
          @filter-changed="onFilterChanged"
          @cancel="onCancelFilter"
      />
    </UranusModal>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusEventFilterPanel from '@/component/event/panel/UranusEventFilterPanel.vue'
import UranusEventCalendar from '@/component/event/UranusEventCalendar.vue'
import { type UranusEventsFilter, useEventsFilterStore } from '@/store/uranusEventsFilterStore.ts'

const filterStore = useEventsFilterStore()

const onFilterChanged = (newFilter: UranusEventsFilter) => {
  console.log(JSON.stringify(newFilter, null, 2))
  filterStore.setFilter(newFilter)
}

const { t } = useI18n({ useScope: 'global' })


const showFilterModal = ref(false)
const isSavingFilter = ref(false)
const canSaveFilter = ref(true)

// Show sidebar on desktop
const isSidebarVisible = ref(window.innerWidth >= 1024)
window.addEventListener('resize', () => {
  isSidebarVisible.value = window.innerWidth >= 1024
})
const onCancelFilter = () => showFilterModal.value = false
</script>

<style scoped lang="scss">
.calendar-view {
  display: flex;
  align-items: flex-start;
  width: 100%;
}

.sidebar {
  width: 300px;
  flex: 0 0 300px;
  position: sticky;
  top: 80px;
  max-height: 100vh;
  overflow: hidden;
}

.calendar-body {
  display: block;
  flex: 1;
  min-width: 0;
  margin-left: -300px;
}

.calendar-layout {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 12px;
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
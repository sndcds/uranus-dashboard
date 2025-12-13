<!--
  UranusEditEventDates.vue
-->
<template>
  <div>
    <!-- Event Dates List -->
    <template v-for="(date, index) in draft.eventDates" :key="index">
      <hr v-if="index > 0" />
      <UranusEventDateDisplay
          :event-date="date"
          :can-edit="true"
          @edit="openModal(index)"
      />
    </template>

    <!-- Add new event date -->
    <button class="uranus-tertiary-button" @click="addEventDate">
      {{ t('add_event_date') }}
    </button>

    <!-- Modal Overlay -->
    <UranusModal :show="editingIndex !== null" @close="cancelEdit" :title="t('edit_event_date')">
      <div class="uranus-form" v-if="editingDate">
        <UranusFormRow>
          <UranusEventVenueSpaceSelect
              v-model="editingDate.venueSpace"
              :selectLabel="t('event_venue_space_as_event')"
              :required="false"
          />
        </UranusFormRow>

        <UranusFormRow>
          <UranusDateInput id="start-date" v-model="editingDate.eventDate.startDate" :label="t('event_start_date')" required />
          <UranusTimeInput id="start-time" v-model="editingDate.eventDate.startTime" :label="t('event_start_time')" required />
        </UranusFormRow>

        <UranusFormRow>
          <UranusDateInput id="end-date" v-model="editingDate.eventDate.endDate" :label="t('event_end_date')" />
          <UranusTimeInput id="end-time" v-model="editingDate.eventDate.endTime" :label="t('event_end_time')" />
        </UranusFormRow>

        <UranusFormRow>
          <UranusTimeInput id="entry-time" v-model="editingDate.eventDate.entryTime" :label="t('event_entry_time')" />
          <UranusCheckboxButton id="all-day" v-model="editingDate.eventDate.allDay" :label="t('event_schedule_all_day')" />
        </UranusFormRow>
      </div>

      <UranusInlineSectionLayout v-if="editingDate">
        <UranusInlineEditActions
            :isSaving="isSaving"
            :canSave="canSave"
            @save="saveModal"
            @cancel="cancelEdit"
        />
      </UranusInlineSectionLayout>
    </UranusModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, type Ref, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'

import { type UranusEventDate, type UranusEventDetail, type UranusVenueSpaceSelection } from '@/models/UranusEventModel.ts'
import UranusEventDateDisplay from '@/components/event/UranusEventDateDisplay.vue'
import UranusModal from '@/components/uranus/UranusModal.vue'
import UranusFormRow from '@/components/ui/UranusFormRow.vue'
import UranusEventVenueSpaceSelect from '@/components/event/UranusEventVenueSpaceSelect.vue'
import UranusDateInput from '@/components/ui/UranusDateInput.vue'
import UranusTimeInput from '@/components/ui/UranusTimeInput.vue'
import UranusCheckboxButton from '@/components/ui/UranusCheckboxButton.vue'
import UranusInlineSectionLayout from '@/components/ui/UranusInlineSectionLayout.vue'
import UranusInlineEditActions from '@/components/ui/UranusInlineEditActions.vue'
import { apiFetch } from '@/api.ts'

const { t } = useI18n({ useScope: 'global' })
const event = inject<Ref<UranusEventDetail | null>>('event')

const draft = reactive({
  eventDates: event?.value?.eventDates ? [...event.value.eventDates] : []
})

const editingIndex = ref<number | null>(null)
const editingDate = ref<{
  eventDate: UranusEventDate
  venueSpace: UranusVenueSpaceSelection
} | null>(null)

const isSaving = ref(false)
const canSave = computed(() => !isSaving.value)

/**
 * Sorting helper
 */
function sortEventDates(a: UranusEventDate, b: UranusEventDate) {
  const aDate = new Date(`${a.startDate ?? ''}T${a.startTime || '00:00'}`)
  const bDate = new Date(`${b.startDate ?? ''}T${b.startTime || '00:00'}`)
  return aDate.getTime() - bDate.getTime()
}

/**
 * Open modal for editing
 */
function openModal(index: number) {
  const date = draft.eventDates[index]!
  editingDate.value = {
    eventDate: { ...date },
    venueSpace: {
      venueId: date.venueId ?? null,
      spaceId: date.spaceId ?? null,
      venueName: date.venueName ?? null,
      spaceName: date.spaceName ?? null
    }
  }

  if (!date.dateVenueId) {
    editingDate.value.venueSpace.venueId = null
    editingDate.value.venueSpace.spaceId = null
  }

  editingIndex.value = index
}

/**
 * Cancel modal
 */
function cancelEdit() {
  editingIndex.value = null
  editingDate.value = null
}

/**
 * Add a new event date, keeping the list sorted
 */
function addEventDate() {
  const newDate: UranusEventDate = {
    eventDateId: null,
    dateVenueId: null,
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    entryTime: null,
    allDay: false,
    venueId: null,
    spaceId: null,
    duration: null,
    visitorInfoFlags: null,
    venueName: null,
    spaceName: null,
    locationId: null
  }

  // Determine insertion index based on sorting
  let insertIndex = draft.eventDates.findIndex(d => sortEventDates(newDate, d) < 0)
  if (insertIndex === -1) {
    draft.eventDates.push(newDate)
    insertIndex = draft.eventDates.length - 1
  } else {
    draft.eventDates.splice(insertIndex, 0, newDate)
  }

  nextTick(() => openModal(insertIndex))
}

/**
 * Save edited or new event date
 */
async function saveModal() {
  if (editingIndex.value === null || !editingDate.value || !event?.value) return
  isSaving.value = true

  const payload = {
    date_id: editingDate.value.eventDate.eventDateId,
    start_date: editingDate.value.eventDate.startDate,
    start_time: editingDate.value.eventDate.startTime,
    end_date: editingDate.value.eventDate.endDate,
    end_time: editingDate.value.eventDate.endTime,
    entry_time: editingDate.value.eventDate.entryTime,
    all_day: editingDate.value.eventDate.allDay,
    venue_id: editingDate.value.venueSpace.venueId,
    space_id: editingDate.value.venueSpace.spaceId,
    duration: editingDate.value.eventDate.duration,
    visitor_info_flags: editingDate.value.eventDate.visitorInfoFlags
  }

  try {
    await apiFetch(`/api/admin/event/${event.value.eventId}/date/${payload.date_id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })

    // Update the draft array
    draft.eventDates[editingIndex.value] = {
      ...editingDate.value.eventDate,
      ...editingDate.value.venueSpace
    }

    // Keep list sorted
    draft.eventDates.sort(sortEventDates)

    cancelEdit()
  } catch (err) {
    console.error('Failed to save event date:', err)
  } finally {
    isSaving.value = false
  }
}
</script>
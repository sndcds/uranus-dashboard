<!--
  UranusEditEventDates.vue
-->
<template>

  <UranusInlineEditSection>
    <!-- Event Dates List -->
    <template v-for="date in event?.eventDates ?? []" :key="date.eventDateId ?? date._uid">
      <UranusEditEventDateDisplay
          :event-date="date"
          :can-edit="true"
          @edit="onOpenModal(date)"
          @delete="onDelete(date)"
      />
    </template>

    <div style="margin-top: 8px;">
      <button class="uranus-inline-edit-button" @click="addEventDate">
        {{ t('event_add_date') }}
      </button>
    </div>
  </UranusInlineEditSection>

  <!-- Modal Overlay -->
  <UranusModal
      :show="editingDate !== null"
      :title="t('event_edit_date')"
      @close="onCancelEdit"
  >
    <div class="uranus-form" v-if="editingDate">
      <UranusFormRow>
        <UranusEventVenueSpaceSelect
            v-model="editingDate.venueSpace"
            :selectLabel="t('event_venue_space_as_event')"
            :required="false"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusDateInput
            id="start-date"
            v-model="editingDate.eventDate.startDate"
            :label="t('event_start_date')"
            required />
        <UranusTimeInput
            id="start-time"
            v-model="editingDate.eventDate.startTime"
            :label="t('event_start_time')"
            required />
      </UranusFormRow>

      <UranusFormRow>
        <UranusDateInput
            id="end-date"
            v-model="editingDate.eventDate.endDate"
            :label="t('event_end_date')" />
        <UranusTimeInput
            id="end-time"
            v-model="editingDate.eventDate.endTime"
            :label="t('event_end_time')" />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTimeInput
            id="entry-time"
            v-model="editingDate.eventDate.entryTime"
            :label="t('event_entry_time')"
        />
        <UranusCheckboxButton
            id="all-day"
            v-model="editingDate.eventDate.allDay"
            :label="t('event_schedule_all_day')"
        />
      </UranusFormRow>
    </div>

    <UranusInlineSectionLayout v-if="editingDate">
      <UranusInlineEditActions
          :isSaving="isSaving"
          :canSave="canSave"
          @save="onSaveModal"
          @cancel="onCancelEdit"
      />
    </UranusInlineSectionLayout>
  </UranusModal>
</template>

<script setup lang="ts">
import { ref, inject, computed, nextTick } from 'vue'
import type { Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import type { UranusEventDate } from '@/model/uranusEventModel.ts'
import { type UranusEventDetail, UranusVenueSpaceSelection } from '@/model/uranusAdminEventModel.ts'
import UranusEditEventDateDisplay from '@/component/event/UranusEditEventDateDisplay.vue'
import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusEventVenueSpaceSelect from '@/component/event/UranusEventVenueSpaceSelect.vue'
import UranusDateInput from '@/component/ui/UranusDateInput.vue'
import UranusTimeInput from '@/component/ui/UranusTimeInput.vue'
import UranusCheckboxButton from '@/component/ui/UranusCheckboxButton.vue'
import UranusInlineSectionLayout from '@/component/ui/UranusInlineSectionLayout.vue'
import UranusInlineEditActions from '@/component/ui/UranusInlineEditActions.vue'
import UranusDashboardButton from "@/component/dashboard/UranusDashboardButton.vue";
import UranusInlineEditSection from "@/component/ui/UranusInlineEditSection.vue";

const { t } = useI18n({ useScope: 'global' })
const event = inject<Ref<UranusEventDetail | null>>('event')

const nextDateUid = ref(1)

const editingDate = ref<{
  eventDate: UranusEventDate
  venueSpace: UranusVenueSpaceSelection
} | null>(null)

const isSaving = ref(false)
const canSave = computed(() => !isSaving.value)
const eventDates = computed(() => event?.value?.eventDates ?? [])

function sortEventDatesAsc() {
  if (!event?.value) return

  event.value.eventDates.sort((a, b) => {
    const aDate = a.startDate ?? ''
    const bDate = b.startDate ?? ''
    if (aDate !== bDate) {
      return aDate.localeCompare(bDate)
    }

    const aTime = a.startTime ?? '00:00'
    const bTime = b.startTime ?? '00:00'
    return aTime.localeCompare(bTime)
  })
}

function onOpenModal(date: UranusEventDate) {
  editingDate.value = {
    eventDate: { ...date },
    venueSpace: {
      dateVenueId: date.dateVenueId,
      venueId: date.venueId,
      spaceId: date.spaceId ?? null,
      venueName: date.location ?? '',
      spaceName: date.spaceName ?? ''
    }
  }
}

async function onDelete(date: UranusEventDate) {
  if (!event?.value) return

  // Unsaved (new) date → just remove locally
  if (!date.eventDateId) {
    event.value.eventDates = event.value.eventDates.filter(d => d !== date)
    return
  }

  // Confirm deletion
  const confirmed = window.confirm(
      t('event_date_delete_confirm') ?? 'Delete this date?'
  )
  if (!confirmed) return

  isSaving.value = true

  try {
    await apiFetch(
        `/api/admin/event/${event.value.eventId}/date/${date.eventDateId}`,
        { method: 'DELETE' }
    )

    // Remove locally (reactive)
    event.value.eventDates = event.value.eventDates.filter(
        d => d.eventDateId !== date.eventDateId
    )

    // Close modal if deleting the currently edited date
    if (editingDate.value?.eventDate.eventDateId === date.eventDateId) {
      onCancelEdit()
    }

    sortEventDatesAsc()
  } finally {
    isSaving.value = false
  }
}

function onCancelEdit() {
  editingDate.value = null
}

function addEventDate() {
  if (!event?.value) return
  const newDate: UranusEventDate & { _uid: number } = {
    _uid: nextDateUid.value++,
    id: null,
    eventId: null,
    startDate: null,
    startTime: null,
    endDate: null,
    endTime: null,
    entryTime: null,
    allDay: false,
    venueId: null,
    spaceId: null,
    venueName: '',
    spaceName: '',
    duration: null,
  }

  event.value.eventDates.push(newDate)
  nextTick(() => onOpenModal(newDate))
}

async function onSaveModal() {
  if (!editingDate.value || !event?.value) return
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
    duration: editingDate.value.eventDate.duration
  }

  try {
    await apiFetch(`/api/admin/event/${event.value.eventId}/date/${payload.date_id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })

    // --- Replace the date object in the array for reactivity ---
    const index = event.value.eventDates.findIndex(
        d => d.eventDateId === editingDate.value!.eventDate.eventDateId
    )

    if (index !== -1) {
      event.value.eventDates[index] = {
        ...editingDate.value.eventDate,
        dateVenueId: editingDate.value.venueSpace.dateVenueId,
        venueId: editingDate.value.venueSpace.venueId,
        spaceId: editingDate.value.venueSpace.spaceId,
        venueName: editingDate.value.venueSpace.venueName ?? '',
        spaceName: editingDate.value.venueSpace.spaceName ?? ''
      }
    }

    // Close the modal
    sortEventDatesAsc()
    onCancelEdit()
  } finally {
    isSaving.value = false
  }
}
</script>
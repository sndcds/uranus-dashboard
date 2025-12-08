<!--
  UranusEditEventDate.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('event_date')"
        :edit-button-text="t('edit')"
        @edit-started="startEdit"
    />

    <template v-if="isEditing">

      <div class="uranus-grid-4">
        <UranusDateInput
            id="start-date"
            v-model="draft.eventDate.startDate"
            :label="t('event_start_date')"
            required
        />
        <UranusTimeInput
            id="start-time"
            v-model="draft.eventDate.startTime"
            :label="t('event_start_time')"
            required
        />
        <UranusDateInput
            id="end-date"
            v-model="draft.eventDate.endDate"
            :label="t('event_end_date')"
        />
        <UranusTimeInput
            id="end-time"
            v-model="draft.eventDate.endTime"
            :label="t('event_end_time')"
        />
        <UranusTimeInput
            id="entry-time"
            v-model="draft.eventDate.entryTime"
            :label="t('event_entry_time')"
        />
        <UranusCheckboxButton
            id="all-day"
            v-model="draft.eventDate.allDay"
            :label="t('event_schedule_all_day')"
        />
      </div>

      <UranusInlineSectionLayout>
        <UranusEventVenueSpaceSelect
            v-model="draft.venueSpace"
            :selectLabel="t('event_venue_space_as_event')"
            @update:model-value="onUpdateVenueSpaceSelection"
            :required="false"/>

        <UranusInlineEditActions
            :isSaving="isSaving"
            :canSave="canSave"
            @save="save"
            @cancel="cancelEdit"
        />
      </UranusInlineSectionLayout>
    </template>

    <template v-else>
      <span>
        <h2>{{ simpleDateString }}</h2>
        {{ dateTimeString }}<br>
        {{ venueSpaceString }}
      </span>

    </template>

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import {computed, inject, reactive, type Ref, ref} from "vue";
import {useI18n} from "vue-i18n";
import {apiFetch} from "@/api.ts";
import {uranusFormatEventDateTime} from "@/utils/UranusUtils.ts"
import {uranusCombineTwoPartString, uranusFormatSimpleDate} from "@/utils/UranusStringUtils.ts";
import type {UranusEventDate, UranusEventDetail, UranusVenueSpaceSelection} from "@/models/UranusEventModel.ts";
import UranusInlineEditLabel from "@/components/ui/UranusInlineEditLabel.vue";
import UranusInlineEditSection from "@/components/ui/UranusInlineEditSection.vue";
import UranusInlineEditActions from "@/components/ui/UranusInlineEditActions.vue";
import UranusCheckboxButton from "@/components/ui/UranusCheckboxButton.vue";
import UranusTimeInput from "@/components/ui/UranusTimeInput.vue";
import UranusDateInput from "@/components/ui/UranusDateInput.vue";
import UranusEventVenueSpaceSelect from "@/components/event/UranusEventVenueSpaceSelect.vue";
import UranusInlineSectionLayout from "@/components/ui/UranusInlineSectionLayout.vue";

const { t } = useI18n({ useScope: 'global' })
const { locale } = useI18n({ useScope: 'global' })

const event = inject<Ref<UranusEventDetail | null>>('event')
const isEditing = ref(false)
const isSaving = ref(false)
const canSave = computed(() => { return !isSaving.value })

const dateTimeString = computed(() => {
  return uranusFormatEventDateTime(
      draft.eventDate.startDate,
      draft.eventDate.startTime,
      draft.eventDate.endDate,
      draft.eventDate.endTime,
      locale.value)
})

const simpleDateString = computed(() => {
  return uranusFormatSimpleDate(draft.eventDate.startDate ?? '', locale.value)
})

const venueSpaceString = computed(() => {
  // If the venue is the same as the main event venue, return empty
  if (draft.venueSpace.venueId === event?.value?.venueId) return ''

  // Only include space name if spaceId is not null
  const spaceName = draft.venueSpace.spaceId != null ? draft.venueSpace.spaceName : null

  return uranusCombineTwoPartString(draft.venueSpace.venueName, spaceName)
})

// Declare modelValue as a prop for v-model
const props = defineProps<{
  modelValue: UranusEventDate
}>();

// Emit updates to parent
const emit = defineEmits<{
  (e: 'update:modelValue', value: UranusEventDate): void
}>();

const draft = reactive<{
  eventDate: UranusEventDate,
  venueSpace: UranusVenueSpaceSelection
}>({
  eventDate: { ...props.modelValue },
  venueSpace: {
    venueId: props.modelValue.venueId ?? null,
    spaceId: props.modelValue.spaceId ?? null,
    venueName: props.modelValue.venueName ?? null,
    spaceName: props.modelValue.spaceName ?? null,
  }
});

function startEdit() {
  Object.assign(draft.eventDate, {
    ...props.modelValue,
    allDay: props.modelValue.allDay ?? false
  });

  if (
      event?.value &&
      draft.eventDate.venueId === event.value.venueId &&
      draft.eventDate.spaceId === event.value.spaceId
  ) {
    draft.venueSpace.venueId = null
    draft.venueSpace.spaceId = null
  }  else {
    draft.venueSpace.venueId = draft.eventDate.venueId
    draft.venueSpace.spaceId = draft.eventDate.spaceId
  }
  isEditing.value = true;
}

function cancelEdit() {
  // if (!event?.value) return
  isEditing.value = false
}


async function save() {
  if (!event?.value) return
  isEditing.value = false
  isSaving.value = true

  // Build JSON payload
  const payload = {
    date_id: draft.eventDate.eventDateId,
    start_date: draft.eventDate.startDate,
    start_time: draft.eventDate.startTime,
    end_date: draft.eventDate.endDate,
    end_time: draft.eventDate.endTime,
    entry_time: draft.eventDate.entryTime,
    all_day: draft.eventDate.allDay,
    venue_id: draft.venueSpace.venueId,
    space_id: draft.venueSpace.spaceId,
    // any other fields you want to send
    duration: draft.eventDate.duration,
    visitor_info_flags: draft.eventDate.visitorInfoFlags
  }

  console.log("Payload for API:", JSON.stringify(payload, null, 2))

  try {
    await apiFetch(`/api/admin/event/${event.value.eventId}/date/${payload.date_id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    })
    console.log("Event date updated successfully")
    // emit updated value to parent
    emit('update:modelValue', { ...draft.eventDate, ...draft.venueSpace })
  } catch (err) {
    console.error("Failed to save event date:", err)
    // optionally show an error message to the user
  } finally {
    isSaving.value = false
  }
}

const onUpdateVenueSpaceSelection = (value: UranusVenueSpaceSelection) => {
  draft.eventDate.venueId = value.venueId
  draft.eventDate.spaceId = value.spaceId
}

</script>

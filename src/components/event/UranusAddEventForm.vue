<!--
UranusAddEventForm.vue
-->
<template>
  <UranusCard>
  <div class="uranus-form">

    <UranusTextInput
        id="title"
        v-model.trim="draft.title"
        :label="t('title')"
        :error="titleError"
        size="big"
        required
    />

    <UranusTextInput
        id="subtitle"
        v-model.trim="draft.subtitle"
        :label="t('subtitle')"
    />

    <UranusTextarea
        id="description"
        v-model.trim="draft.description"
        :label="t('event_description_label')"
        :error="descriptionError"
        required
    />

    <UranusFormRow>
      <UranusDateInput
          id="startDate"
          v-model.trim="draft.startDate"
          :label="t('event_start_date')"
          :error="startDateError"
          required
      />

      <UranusTimeInput
          id="startTime"
          v-model.trim="draft.startTime"
          :label="t('event_start_time')"
          :error="startTimeError"
          required
      />
    </UranusFormRow>


    <!-- Venue / Location -->
    <UranusTabCard
        :cards="cards"
        v-model:active="activeCard"
    >
      <!-- Venue -->
      <template #card-0>
        <UranusFormRow>
          <UranusEventVenueSpaceSelect
              v-model="draft.venueSpace"
              :selectLabel="t('event_without_venue')"
              required
              :error="venueOrLocationError"
          />
        </UranusFormRow>
      </template>

      <!-- Custom location -->
      <template #card-1>
        <UranusTextInput
            id="locationName"
            v-model.trim="draft.locationName"
            :label="t('venue_name')"
            required
            :error="venueOrLocationError"
        />
        <UranusFormRow>
          <UranusTextInput
              id="locationStreet"
              v-model.trim="draft.locationStreet"
              :label="t('street')"
          />
          <UranusTextInput
              id="locationHouseNumber"
              v-model.trim="draft.locationHouseNumber"
              :label="t('house_number')"
          />
        </UranusFormRow>
        <UranusFormRow>
          <UranusTextInput
              id="locationPostalCode"
              v-model.trim="draft.locationPostalCode"
              :label="t('postal_code')"
          />
          <UranusTextInput
              id="locationCity"
              v-model.trim="draft.locationCity"
              :label="t('city')"
          />
        </UranusFormRow>
      </template>
    </UranusTabCard>

    <!-- Actions -->
    <UranusInlineActionBar>
      <UranusInlineCancelButton
          :label="t('cancel')"
          :disabled="isSaving"
          @click="onCancel"
      />
      <UranusInlineSaveButton
          :label="t('save')"
          :disabled="!canSave || isSaving"
          :loading="isSaving"
          @click="onSave"
      />
    </UranusInlineActionBar>

  </div>
  </UranusCard>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useRouter } from 'vue-router'

import type { UranusVenueSpaceSelection, UranusEventLocation } from '@/models/UranusEventModel'
import UranusTextInput from '@/components/ui/UranusTextInput.vue'
import UranusFormRow from '@/components/ui/UranusFormRow.vue'
import UranusTabCard from '@/components/ui/UranusTabCard.vue'
import UranusEventVenueSpaceSelect from '@/components/event/UranusEventVenueSpaceSelect.vue'
import UranusCard from "@/components/ui/UranusCard.vue";
import UranusDateInput from "@/components/ui/UranusDateInput.vue";
import UranusTimeInput from "@/components/ui/UranusTimeInput.vue";
import UranusTextarea from "@/components/ui/UranusTextarea.vue";
import UranusInlineSaveButton from "@/components/ui/UranusInlineSaveButton.vue";
import UranusInlineCancelButton from "@/components/ui/UranusInlineCancelButton.vue";
import UranusInlineActionBar from "@/components/ui/UranusInlineActionBar.vue";

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()

const isSaving = ref(false)
const activeCard = ref(0) // 0 = Venue, 1 = Location

const cards = [
  { title: t('venue') },
  { title: t('custom_location') }
]

const props = defineProps({
  organizationId: { type: [Number, null], required: true },
})

const draft = reactive<{
  title: string | undefined
  subtitle: string
  description: string
  startDate: string | undefined,
  startTime: string | undefined,
  venueId: number | null
  venueName: string | undefined
  spaceId: number | null
  spaceName: string | undefined
  locationName: string | undefined
  locationStreet: string | undefined
  locationHouseNumber: string | undefined
  locationPostalCode: string | undefined
  locationCity: string | undefined
  locationCountryCode: string | undefined
  locationStateCode: string | undefined
  locationLatitude: number | null
  locationLongitude: number | null
  venueSpace: UranusVenueSpaceSelection
}>({
  title: '',
  subtitle: '',
  description: '',
  startDate: undefined,
  startTime: undefined,
  venueId: null,
  venueName: '',
  spaceId: null,
  spaceName: '',
  locationName: '',
  locationStreet: '',
  locationHouseNumber: '',
  locationPostalCode: '',
  locationCity: '',
  locationCountryCode: '',
  locationStateCode: '',
  locationLatitude: null,
  locationLongitude: null,
  venueSpace: {
    dateVenueId: null,
    venueId: null,
    spaceId: null,
    venueName: null,
    spaceName: null,
  }
})

/* Validation */
const titleError = computed(() => {
  if (!draft.title || !draft.title.trim()) {
    return t('input_required')
  }
  return ''
})

const descriptionError = computed(() => {
  if (!draft.description || !draft.description.trim()) {
    return t('input_required')
  }
  return ''
})

const startDateError = computed(() => {
  if (!draft.startDate) {
    return t('input_required')
  }
  // Optional: validate date format
  const isValid = /^\d{4}-\d{2}-\d{2}$/.test(draft.startDate)
  if (!isValid) {
    return t('invalid_date_format_message')
  }

  return ''
})

const startTimeError = computed(() => {
  if (!draft.startTime) {
    return t('input_required')
  }

  // Regex for HH:MM 24-hour format
  const isValid = /^([01]\d|2[0-3]):([0-5]\d)$/.test(draft.startTime)
  if (!isValid) {
    return t('invalid_time_format_message')
  }

  return ''
})

/* Validation for Venue / Location */
const venueOrLocationError = computed(() => {
  if (activeCard.value === 0) {
    // Venue mode: check if a venue is selected
    if (!draft.venueSpace.venueId) {
      return t('input_required')
    }
  } else {
    // Custom location mode: check if a location name is provided
    if (!draft.locationName || !draft.locationName.trim()) {
      return t('input_required')
    }
  }
  return ''
})

const canSave = computed(() => {
  if (isSaving.value) return false
  if (
      titleError.value ||
      descriptionError.value ||
      startDateError.value ||
      startTimeError.value ||
      venueOrLocationError.value
  ) return false
  return true
})

async function onCancel() {
  const organizationId = 9 // or get it dynamically
  await router.push(`/admin/organization/${organizationId}/events`)
}

async function onSave() {
  if (!canSave.value) return

  isSaving.value = true
  if (!draft.title) return

  try {
    const payload: Record<string, any> = {
      organization_id: props.organizationId,
      title: draft.title.trim(),
      subtitle: draft.subtitle?.trim() || null,
      description: draft.description?.trim() || null,
      dates: [
        {
          start_date: draft.startDate,
          start_time: draft.startTime,
        }
      ]
    }

    if (activeCard.value === 0) {
      // Venue mode
      payload.venue_id = draft.venueSpace.venueId
      payload.space_id = draft.venueSpace.spaceId ?? null
    } else {
      // Custom location mode
      payload.location = {
        name: draft.locationName,
        street: draft.locationStreet,
        house_number: draft.locationHouseNumber,
        postal_code: draft.locationPostalCode,
        city: draft.locationCity,
      }
    }

    console.log(JSON.stringify(payload, null, 2))

    const response = await apiFetch<{ event_id: number }>(
        '/api/admin/event/create',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
    )

    router.push(`/admin/event/${response.data.event_id}`)

  } catch (err) {
    console.log(JSON.stringify(err, null, 2))
  } finally {
    isSaving.value = false
  }
}
</script>

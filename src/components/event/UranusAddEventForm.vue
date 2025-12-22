<!--
UranusAddEventForm.vue
-->
<template>
  <UranusCard>
  <div class="uranus-form">

    <!-- Title -->
    <UranusTextInput
        id="title"
        v-model.trim="draft.title"
        :label="t('event_title_label')"
        :error="titleError"
        size="big"
        required
    />

    <UranusTextInput
        id="subtitle"
        v-model.trim="draft.subtitle"
        :label="t('event_subtitle_label')"
    />

    <UranusTextarea
        id="description"
        v-model.trim="draft.description"
        :label="t('event_description_label')"
        required
    />

    <UranusFormRow>
      <UranusDateInput
          id="startDate"
          v-model.trim="draft.startDate"
          :label="t('start_date_label')"
      />

      <UranusTimeInput
          id="startTime"
          v-model.trim="draft.startTime"
          :label="t('start_time_label')"
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
              :selectLabel="t('event_no_venue_space_selected')"
              :required="true"
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
    <UranusInlineEditActions
        :isSaving="isSaving"
        :canSave="canSave"
        @save="save"
    />

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
import UranusInlineEditActions from '@/components/ui/UranusInlineEditActions.vue'
import UranusCard from "@/components/ui/UranusCard.vue";
import UranusDateInput from "@/components/ui/UranusDateInput.vue";
import UranusTimeInput from "@/components/ui/UranusTimeInput.vue";
import UranusTextarea from "@/components/ui/UranusTextarea.vue";

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
    venueId: null,
    spaceId: null,
    venueName: null,
    spaceName: null,
  }
})

/* Validation */
const titleError = computed(() => {
  if (draft.title && !draft.title.trim()) {
    return t('empty_input_field_message')
  }
  return ''
})

const canSave = computed(() => {
  if (isSaving.value) return false
  return true
  if (titleError.value) return false
})

/* Save */
async function save() {
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

    const response = await apiFetch<{ event_id: number }>(
        '/api/admin/event/create',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
    )

    router.push(`/admin/event/${response.data.event_id}`)

  } catch (err) {
    console.error('Failed to create event', err)
  } finally {
    isSaving.value = false
  }
}
</script>

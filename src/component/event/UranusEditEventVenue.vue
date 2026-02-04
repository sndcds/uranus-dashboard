<!--
  UranusEditEventVenue.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('venue_place')"
        :edit-button-text="t('edit')"
        @edit-started="startEdit"
    />

    <!-- Edit form -->
    <UranusInlineSectionLayout v-if="isEditing">

      <UranusTabCard
          :cards="cards"
          v-model:active="activeCard"
          @active-card-change="onCardChange"
      >
        <template #card-0>
          <UranusFormRow>
            <UranusEventVenueSpaceSelect
                v-model="draft.venueSpace"
                :selectLabel="t('event_without_venue')"
                :required="true"
                @update:model-value="onUpdateVenueSpaceSelection"
            />
          </UranusFormRow>
        </template>

        <template #card-1>
          <UranusTextInput
              id="location-name"
              v-model.trim="draft.location.name!"
              :label="t('venue_name')"
              required
          />
          <UranusFormRow>
            <UranusTextInput
                id="location-street"
                flex="3"
                v-model.trim="draft.location.street!"
                :label="t('street')"
            />
            <UranusTextInput
                id="location-house-number"
                v-model.trim="draft.location.houseNumber!"
                :label="t('house_number')"
            />
          </UranusFormRow>
          <UranusFormRow>
            <UranusTextInput
                id="location-postal-code"
                v-model.trim="draft.location.postalCode!"
                :label="t('postal_code')"
            />
            <UranusTextInput
                id="location-city"
                flex="3"
                v-model.trim="draft.location.city!"
                :label="t('city')"
            />
          </UranusFormRow>

          <UranusFormRow>
            <UranusTextInput
                id="location-lon"
                v-model.number="draft.location.latitude!"
                :label="t('longitude')"
            />
            <UranusTextInput
                id="location-lat"
                v-model.number="draft.location.longitude!"
                :label="t('latitude')"
            />
          </UranusFormRow>
        </template>

      </UranusTabCard>

      <UranusInlineEditActions
          :isSaving="isSaving"
          :canSave="canSave"
          @save="onSave"
          @cancel="onCancelEdit"
      />

    </UranusInlineSectionLayout>

    <!-- Read-only display -->
    <template v-else>
      <template v-if="event?.venueId">
        <h3>
          {{ event.venueName }}
          <template v-if="event.spaceName">
            / {{ event.spaceName }}
          </template>
        </h3>
      </template>
      <template v-else>
        <span>
          <strong>{{ t('custom_location') }}:</strong><br>
          {{ event?.location?.name }}<br>
          {{ event?.location?.street }} {{ event?.location?.houseNumber }}<br>
          {{ event?.location?.postalCode }} {{ event?.location?.city }}<br>
        </span>
      </template>
    </template>

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, type Ref, nextTick, watchEffect } from 'vue'
import { useI18n } from "vue-i18n";
import { apiFetch } from "@/api.ts";

import type {
  UranusEventDetail,
  UranusEventLocation,
  UranusVenueSpaceSelection }
  from "@/model/uranusEventModel.ts";
import UranusInlineEditSection from "@/component/ui/UranusInlineEditSection.vue";
import UranusInlineEditLabel from "@/component/ui/UranusInlineEditLabel.vue";
import UranusInlineEditActions from "@/component/ui/UranusInlineEditActions.vue";
import UranusInlineSectionLayout from "@/component/ui/UranusInlineSectionLayout.vue";
import UranusTextInput from "@/component/ui/UranusTextInput.vue";
import UranusTabCard from "@/component/ui/UranusTabCard.vue";
import UranusEventVenueSpaceSelect from "@/component/event/UranusEventVenueSpaceSelect.vue";
import UranusFormRow from "@/component/ui/UranusFormRow.vue";

const { t } = useI18n({ useScope: 'global' })

const event = inject<Ref<UranusEventDetail | null>>('event')
const eventId = computed(() => event?.value?.eventId)
const isEditing = ref(false)
const isSaving = ref(false)
const canSave = computed(() => { return !isSaving.value })

// Cards
const cards = [
  { title: t('venue'), content: 'Default content for card 1' },
  { title: t('custom_location'), content: 'Default content for card 2' }
]
const activeCard = ref(0) // 0 = Venue, 1 = Location
function onCardChange(index: number) {
  activeCard.value = index
}

const draft = reactive<{
  venueSpace: UranusVenueSpaceSelection
  location: UranusEventLocation
}>({
  venueSpace: {
    venueId: event?.value?.venueId ?? null,
    venueName: event?.value?.venueName ?? null,
    spaceId: event?.value?.spaceId ?? null,
    spaceName: event?.value?.spaceName ?? null,
    dateVenueId: null
  },
  location: {
    id: event?.value?.location?.id ?? null,
    name: event?.value?.location?.name ?? '',
    description: event?.value?.location?.description ?? '',
    street: event?.value?.location?.street ?? '',
    houseNumber: event?.value?.location?.houseNumber ?? '',
    postalCode: event?.value?.location?.postalCode ?? '',
    city: event?.value?.location?.city ?? '',
    countryCode: event?.value?.location?.countryCode ?? '',
    stateCode: event?.value?.location?.stateCode ?? '',
    latitude: event?.value?.location?.latitude ?? null,
    longitude: event?.value?.location?.longitude ?? null,
  }
})

/*
watchEffect(() => {
  if (!event?.value) return

  // Venue space
  draft.venueSpace.venueId = event.value.venueId ?? null
  draft.venueSpace.venueName = event.value.venueName ?? null
  draft.venueSpace.spaceId = event.value.spaceId ?? null
  draft.venueSpace.spaceName = event.value.spaceName ?? null
  draft.venueSpace.dateVenueId = null

  // Custom location
  draft.location.id = event.value.location?.id ?? null
  draft.location.name = event.value.location?.name ?? ''
  draft.location.street = event.value.location?.street ?? ''
  draft.location.houseNumber = event.value.location?.houseNumber ?? ''
  draft.location.postalCode = event.value.location?.postalCode ?? ''
  draft.location.city = event.value.location?.city ?? ''
  draft.location.countryCode = event.value.location?.countryCode ?? ''
  draft.location.stateCode = event.value.location?.stateCode ?? ''
  draft.location.latitude = event.value.location?.latitude ?? null
  draft.location.longitude = event.value.location?.longitude ?? null
})
*/

const props = defineProps<{
  titleError?: string | null
}>()

async function startEdit() {
  if (!event?.value) return
  // Set correct tab
  activeCard.value = event.value.venueId ? 0 : 1
  // Wait for DOM update → then show the edit mode
  await nextTick()
  isEditing.value = true
}

function onCancelEdit() {
  if (!event?.value) return
  isEditing.value = false
}

async function onSave() {
  if (!event?.value) return
  isSaving.value = true
  let useVenueSpace = activeCard.value === 0;

  try {
    let payload: Record<string, any>;

    if (useVenueSpace) {
      payload = {
        venue_id: draft.venueSpace.venueId ?? null,
        space_id: draft.venueSpace.spaceId ?? null
      };
    } else {
      payload = {
        location_id: draft.location.id,
        location_name: draft.location.name,
        location_street: draft.location.street,
        location_house_number: draft.location.houseNumber,
        location_postal_code: draft.location.postalCode,
        location_city: draft.location.city,
        location_country_code: draft.location.countryCode,
        location_state_code: draft.location.stateCode,
        location_latitude: draft.location.latitude,
        location_longitude: draft.location.longitude
      };
    }

    await apiFetch(`/api/admin/event/${eventId.value}/place`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    })

    if (useVenueSpace) {
      event.value.venueId = draft.venueSpace.venueId ?? null
      event.value.venueName = draft.venueSpace.venueName ?? null
      event.value.spaceId = draft.venueSpace.spaceId ?? null
      event.value.spaceName = draft.venueSpace.spaceName ?? null
    }
    else {
      event.value.venueId = null
      event.value.spaceId = null
      event.value.location = draft.location
    }
  } catch (err) {
    console.error('Failed to update header', err)
  } finally {
  }

  isSaving.value = false
  isEditing.value = false
}

const onUpdateVenueSpaceSelection = () => {
}
</script>
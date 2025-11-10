<template>
  <UranusInlineEditSection>
    <UranusInlineEditLabel
        :label-text="t('venue_and_space')"
        :edit-button-text="t('edit')"
        @edit-started="startEditingVenue" />

    <h2>{{ venueName }}</h2>

    <UranusInlineSectionLayout v-if="isEditing">
      <UranusFieldLabel
          id="event-venue-select"
          :label="t('event_organizer_label')">
        <select
            id="event-venue-select"
            class="event-venue__select"
            v-model="selectedVenueId"
            :disabled="isLoadingVenues"
            @change="setSelectedVenue(selectedVenueId)">
          <option :value="null" disabled>{{ t('event_venue_select_placeholder') }}</option>
          <option v-for="venueOption in venueOptions" :key="venueOption.id" :value="venueOption.id">
            {{ venueOption.name }}
          </option>
        </select>
      </UranusFieldLabel>

      <UranusFieldLabel
          id="event-space-select"
          :label="t('event_space_select_label')">
        <select
            id="event-space-select"
            class="event-space__select"
            v-model="selectedSpaceId"
            :disabled="isLoadingSpaces">
          <option :value="null" disabled>{{ t('event_space_select_placeholder') }}</option>
          <option v-for="spaceOption in spaceOptions" :key="spaceOption.id" :value="spaceOption.id">
            {{ spaceOption.name }}
          </option>
        </select>
      </UranusFieldLabel>

      <UranusInlineActionBar v-if="isEditing">
        <UranusInlineCancelButton
            :label="t('button_cancel')"
            :disabled="isSaving"
            :onClick="cancelEditing"
        />
        <UranusInlineOKButton
            :label="t('button_save')"
            :busyLabel="t('saving')"
            :onClick="save"/>
      </UranusInlineActionBar>
    </UranusInlineSectionLayout>

    <template v-else>
      <div class="uranus-vertical-flex">
        <span>{{ venueStreet }} {{ venueHouseNumber }}</span>
        <span>{{ venuePostalCode }} {{ venueCity }}</span>
        <span>{{ spaceName }} ({{ spaceCapacityDisplay }} {{ t('event_capacity_label') }})</span>
      </div>
      <!--div>
        <span>{{ spaceName }} ({{ spaceCapacityDisplay }} {{ t('event_capacity_label') }})</span>
        <span v-if="spaceBuildingLevelDisplay">
          {{ spaceBuildingLevelDisplay }} ({{ t('event_building_level_label') }})
        </span>
        <span v-if="spaceSeatingCapacityDisplay">
          {{ spaceSeatingCapacityDisplay }} ({{ t('event_seating_capacity_label') }})
        </span>
      </div-->
    </template>

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue"
import UranusInlineEditSection from "@/components/uranus/UranusInlineEditSection.vue";
import UranusInlineCancelButton from "@/components/uranus/UranusInlineCancelButton.vue";
import UranusInlineOKButton from "@/components/uranus/UranusInlineOKButton.vue";
import UranusInlineActionBar from "@/components/uranus/UranusInlineActionBar.vue";
import UranusFieldLabel from "@/components/uranus/UranusFieldLabel.vue";
import UranusInlineSectionLayout from "@/components/uranus/UranusInlineSectionLayout.vue";

const props = defineProps<{
    eventId: number
    organizerId: number | null
    venueId: number | null
    venueName: string
    venueStreet: string
    venueHouseNumber: string
    venuePostalCode: string
    venueCity: string
    spaceId: number | null
    spaceName: string
    spaceTotalCapacity: number | null
    spaceBuildingLevel: string | null
    spaceSeatingCapacity: number | null
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const isEditing = ref(false)
const selectedVenueId = ref<number | null>(props.venueId ?? null)
const venueOptions = ref<Array<{ id: number; name: string }>>([])
const isLoadingVenues = ref(false)
const isSavingVenue = ref(false)

const selectedSpaceId = ref<number | null>(props.spaceId ?? null)
const spaceOptions = ref<Array<{ id: number; name: string }>>([])
const isLoadingSpaces = ref(false)
const isSavingSpace = ref(false)

const spaceSeatingCapacityDisplay = computed(() => {
    if (props.spaceSeatingCapacity == null || Number.isNaN(props.spaceSeatingCapacity)) {
        return '—'
    }
    return String(props.spaceSeatingCapacity)
})
const spaceBuildingLevelDisplay = computed(() => {
    if (props.spaceBuildingLevel == null || props.spaceBuildingLevel.trim() === '') {
        return '—'
    }
    return props.spaceBuildingLevel
})
const spaceCapacityDisplay = computed(() => {
    if (props.spaceTotalCapacity == null || Number.isNaN(props.spaceTotalCapacity)) {
        return '—'
    }
    return String(props.spaceTotalCapacity)
})

/*
watch(
    () => props.venueId,
    (value) => {
        if (!isEditing.value) {
            selectedVenueId.value = value ?? null
        }
    }
)

watch(
    () => props.spaceId,
    (value) => {
        if (!isEditingSpace.value) {
            selectedSpaceId.value = value ?? null
        }
    }
)
*/

const fetchVenueOptions = async () => {
    if (!props.organizerId) {
        venueOptions.value = []
        return
    }

    isLoadingVenues.value = true
    try {
        const { data } = await apiFetch<Array<{ id: number; name: string }>>(
            `/api/choosable-venues/organizer/${props.organizerId}`
        )
        venueOptions.value = Array.isArray(data) ? data : []
    } catch (err) {
        console.error('Failed to load venues', err)
        venueOptions.value = []
    } finally {
        isLoadingVenues.value = false
    }
}

const fetchSpaceOptions = async (venueId: number | null) => {
    if (venueId === null) {
        spaceOptions.value = []
        return
    }

    isLoadingSpaces.value = true
    try {
        const { data } = await apiFetch<Array<{ id: number; name: string }>>(
            `/api/choosable-spaces/venue/${venueId}`
        )
        spaceOptions.value = Array.isArray(data) ? data : []
    } catch (err) {
        console.error('Failed to load spaces', err)
        spaceOptions.value = []
    } finally {
        isLoadingSpaces.value = false
    }
}

function setSelectedVenue(venueId: number | null) {
  console.log("venueId: " + venueId)
  selectedVenueId.value = venueId
  fetchSpaceOptions(selectedVenueId.value)
}

const startEditingVenue = async () => {
  selectedVenueId.value = props.venueId ?? null
  selectedSpaceId.value = props.spaceId ?? null

  isEditing.value = true
  if (!venueOptions.value.length) {
    await fetchVenueOptions()
  }

  if (!spaceOptions.value.length) {
    await fetchSpaceOptions(props.venueId ?? null)
  }
}

const cancelEditing = () => {
  selectedVenueId.value = props.venueId ?? null
  selectedSpaceId.value = props.spaceId ?? null
  isEditing.value = false
}

const saveVenue = async () => {
    if (selectedVenueId.value === null) {
      isEditing.value = false
        return
    }

    isSavingVenue.value = true
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/venue`, {
            method: 'PUT',
            body: JSON.stringify({
                venue_id: selectedVenueId.value,
            }),
        })
      isEditing.value = false
        emit('updated')
    } catch (err) {
        console.error('Failed to update venue', err)
      isEditing.value = false
    } finally {
        isSavingVenue.value = false
    }
}


const saveSpace = async () => {
    if (selectedSpaceId.value === null) {
        isEditingSpace.value = false
        return
    }

    isSavingSpace.value = true
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/space`, {
            method: 'PUT',
            body: JSON.stringify({
                space_id: selectedSpaceId.value,
            }),
        })
        isEditingSpace.value = false
        emit('updated')
    } catch (err) {
        console.error('Failed to update space', err)
        isEditingSpace.value = false
    } finally {
        isSavingSpace.value = false
    }
}
</script>

<style scoped lang="scss">
.event-venue__controls {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.event-venue__label {
    font-weight: 600;
    color: var(--color-text);
    text-align: left;
}

.event-venue__select {
    width: 100%;
    padding: 0.65rem 0.85rem;
    border-radius: 12px;
    border: 1px solid var(--input-border);
    background: var(--input-bg);
    font-size: 1rem;
    color: var(--color-text);
}

.event-venue__empty {
    margin: 0;
    font-style: italic;
    color: var(--muted-text);
}

.event-venue__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.event-space {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.event-space__controls {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}

.event-space__label {
    font-weight: 600;
    color: var(--color-text);
    text-align: left;
}

.event-space__select {
    width: 100%;
    padding: 0.6rem 0.85rem;
    border-radius: 12px;
    border: 1px solid var(--input-border);
    background: var(--input-bg);
    font-size: 1rem;
    color: var(--color-text);
}

.event-space__empty {
    margin: 0;
    font-style: italic;
    color: var(--muted-text);
}

.event-space__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

</style>

<template>
  <UranusCard custom-style="width:100%;">

    <div>
      <div class="header">
        <h2>{{ venueListItem.name }}</h2>
        <PlutoImage
            :mainImageUuid="venueListItem.mainLogoUuid ?? null"
            :lightImageUuid="venueListItem.lightThemeLogoUuid ?? null"
            :darkImageUuid="venueListItem.darkThemeLogoUuid ?? null"
        />
      </div>
      <span>
        {{ t('events') }}: {{ venueListItem.upcomingEventCount }}
      </span>
    </div>

    <div class="uranus-card-button-container">
      <UranusButton
          v-if="venueListItem.canEditEvent"
          variant="secondary" size="small"
          :to="`/admin/organization/${organizationUuid}/venue/${venueListItem.uuid}/edit`"
      >
        {{ t('edit') }}
      </UranusButton>

      <UranusButton
          v-if="venueListItem.canDeleteEvent"
          variant="secondary" size="small"
          @click="onDeleteEvent(venueListItem)"
      >
        {{ t('delete') }}
      </UranusButton>
    </div>

    <section>
      <div>
        <h3>{{ t('venue_spaces') }}
          <UranusIconAction
              mode="add"
              v-if="venueListItem.canEditVenue"
              :to="`/admin/organization/${organizationUuid}/venue/${venueListItem.uuid}/space/create`"
          />
        </h3>
      </div>

      <template v-if="venueListItem.spaces?.length">
        <div
            v-for="(space, index) in venueListItem.spaces"
            :key="space.uuid"
            class="space-row"
        >
          <div class="space-info">
            <span>{{ space.name }}</span>
            <span>&nbsp;/ {{ space.upcomingEventCount }}</span>
          </div>

          <div class="space-actions">
            <UranusIconAction
                mode="edit"
                v-if="venueListItem.canEditSpace"
                :to="`/admin/organization/${organizationUuid}/venue/${venueListItem.uuid}/space/${space.uuid}/edit`"
            />
            <UranusIconAction
                mode="delete"
                title="Delete"
                :onClick="() => requestDeleteSpace(space)"
            />
          </div>
        </div>
      </template>
      <p v-else>{{ t('spaces_empty') }}</p>
    </section>

    <UranusPasswordConfirmModal
        :show="showDeleteVenueModal"
        :title="t('confirm_delete_venue')"
        :question="getConfirmDeleteDescription(pendingVenueName)"
        :confirm-text="t('venue_delete')"
        :loading-text="t('deleting')"
        :error="deleteVenueError"
        :is-submitting="isDeletingVenue"
        @confirm="confirmDeleteVenue"
        @cancel="cancelDeleteVenue"
    />

    <UranusPasswordConfirmModal
      :show="showDeleteSpaceModal"
      :title="t('confirm_delete_space')"
      :question="getConfirmDeleteDescription(pendingSpaceName)"
      :confirm-text="t('delete_space')"
      :loading-text="t('deleting')"
      :error="deleteSpaceError"
      :is-submitting="isDeletingSpace"
      @confirm="confirmDeleteSpace"
      @cancel="cancelDeleteSpace"
    />
  </UranusCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from "vue-i18n"
import { apiFetch } from '@/api.ts'
import {type VenueListItem, type VenueListSpace} from '@/domain/organization/venueList.ts'

import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import PlutoImage from '@/component/pluto/PlutoImage.vue'
import { uranusStringInterpolate } from '@/util/UranusStringUtils.ts'

const { t } = useI18n()

const props = defineProps<{
  venueListItem: VenueListItem
  organizationUuid: string
}>()

const emit = defineEmits<{
  deleted: [venueId: string]
}>()

const showDeleteVenueModal = ref(false)
const deleteVenueError = ref('Hello')
const isDeletingVenue = ref(false)
const pendingVenueUuid = ref<string | null>(null)
const pendingVenueName = ref('')
const showDeleteSpaceModal = ref(false)
const deleteSpaceError = ref('')
const isDeletingSpace = ref(false)
const pendingSpaceUuid = ref<string | null>(null)
const pendingSpaceName = ref('')

function getConfirmDeleteDescription(name: string): string {
  const template = t('confirm_delete_description');
  return uranusStringInterpolate(template, {name});
}

const onDeleteEvent = (venue: VenueListItem) => {
  if (!venue.canDeleteVenue) return
  pendingVenueUuid.value = venue.uuid
  pendingVenueName.value = venue.name
  deleteVenueError.value = ''
  showDeleteVenueModal.value = true
}

const cancelDeleteVenue = () => {
  showDeleteVenueModal.value = false
  deleteVenueError.value = ''
  pendingVenueUuid.value = null
  pendingVenueName.value = ''
}

const confirmDeleteVenue = async ({ password }: { password: string }) => {
  if (!pendingVenueUuid.value) return

  deleteVenueError.value = ''
  isDeletingVenue.value = true

  try {
    await apiFetch(`/api/admin/venue/${pendingVenueUuid.value}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })

    emit('deleted', pendingVenueUuid.value)
    cancelDeleteVenue()
  } catch (err: unknown) {
    const status =
        typeof err === 'object' && err !== null
            ? (err as { status?: number }).status
            : undefined

    if (status === 401 || status === 403) {
      deleteVenueError.value = t('incorrect_password')
    } else {
      deleteVenueError.value = t('failed_to_delete_venue')
    }

    // NO throw here — just set the error for the modal
  } finally {
    isDeletingVenue.value = false
  }
}

const requestDeleteSpace = (space: VenueListSpace) => {
  if (!props.venueListItem.canDeleteSpace) return
  pendingSpaceUuid.value = space.uuid
  pendingSpaceName.value = space.name
  deleteSpaceError.value = ''
  showDeleteSpaceModal.value = true
}

const cancelDeleteSpace = () => {
  showDeleteSpaceModal.value = false
  deleteSpaceError.value = ''
  pendingSpaceUuid.value = null
  pendingSpaceName.value = ''
}

const confirmDeleteSpace = async ({ password }: { password: string }) => {
  if (!pendingSpaceUuid.value) return

  deleteSpaceError.value = ''
  isDeletingSpace.value = true

  try {
    await apiFetch(`/api/admin/space/${pendingSpaceUuid.value}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })

    const index = props.venueListItem.spaces.findIndex(spaceInfo => spaceInfo.uuid === pendingSpaceUuid.value)
    if (index !== -1) {
      props.venueListItem.spaces.splice(index, 1)
    }

    cancelDeleteSpace()
  } catch (err: unknown) {
    console.error('Failed to delete space:', err)
    const status = typeof err === 'object' && err !== null ? (err as { status?: number }).status : undefined
    if (status === 401 || status === 403) {
      deleteSpaceError.value = t('incorrect_password')
    } else {
      deleteSpaceError.value = t('failed_to_delete_space')
    }
  } finally {
    isDeletingSpace.value = false
  }
}
</script>

<style scoped lang="scss">
.header {
  display: flex;
  align-items: start; // optional, vertically center items
}

.header > :nth-child(2) {
  margin-left: auto;
}

.space-row {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Push left/right content apart */
  gap: 1rem; /* optional spacing */
}

.space-row + .space-row {
  border-top: 1px solid var(--uranus-color-7)
}

.space-info {
  display: flex;
  gap: 0.25rem; /* small spacing between name and count */
}

.space-actions {
  display: flex;
  gap: 0.25rem; /* spacing between edit and delete icons */
}
</style>
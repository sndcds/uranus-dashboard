<template>
  <UranusCard custom-style="width:100%;">

    <div>
      <div class="header">
        <h2>{{ venueInfo.venueName }}</h2>
        <img
            v-if="venueInfo.venueLogoImageId"
            class="uranus-dashboard-organization-card-logo-image"
            :src="buildPlutoImageUrl(venueInfo.venueLogoImageId, 120, 0, 'png', 80, true)"
        />
      </div>
      <span>
        venueUuid: {{ venueInfo.venueUuid }}
        {{ t('events') }}: {{ venueInfo.upcomingEventCount }}
      </span>
    </div>

    <div class="uranus-card-button-container">
      <UranusButton
          v-if="venueInfo.canEditEvent"
          variant="secondary" size="small"
          :to="`/admin/organization/${organizationUuid}/venue/${venueInfo.venueUuid}/edit`"
      >
        {{ t('edit') }}
      </UranusButton>

      <UranusButton
          v-if="venueInfo.canDeleteEvent"
          variant="secondary" size="small"
          @click="onDeleteEvent(venueInfo)"
      >
        {{ t('delete') }}
      </UranusButton>
    </div>

    <section>
      <div>
        <h3>{{ t('venue_spaces') }}
          <UranusIconAction
              mode="add"
              v-if="venueInfo.canEditVenue"
              :to="`/admin/organization/${organizationUuid}/venue/${venueInfo.venueUuid}/space/create`"
          />
        </h3>
      </div>

      <template v-if="venueInfo.spaceInfos.length">
        <div
            v-for="(spaceInfo, index) in venueInfo.spaceInfos"
            :key="spaceInfo.spaceUuid"
            class="space-row"
        >
          <div class="space-info">
            <span>{{ spaceInfo.spaceName }}</span>
            <span>&nbsp;/ {{ spaceInfo.upcomingEventCount }}</span>
          </div>

          <div class="space-actions">
            <UranusIconAction
                mode="edit"
                v-if="venueInfo.canEditSpace"
                :to="`/admin/organization/${organizationUuid}/venue/${venueInfo.venueUuid}/space/${spaceInfo.spaceUuid}/edit`"
            />
            <UranusIconAction
                mode="delete"
                title="Delete"
                :onClick="() => requestDeleteSpace(spaceInfo)"
            />
          </div>
        </div>
      </template>
      <p v-else>{{ t('spaces_empty') }}</p>
    </section>

    <UranusPasswordConfirmModal
      :show="showDeleteModal"
      :title="t('confirm_delete_venue')"
      :question="t('confirm_delete_venue_description', { name: pendingVenueName })"
      :confirm-text="t('venue_delete')"
      :loading-text="t('deleting')"
      :error="deleteError"
      :is-submitting="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <UranusPasswordConfirmModal
      :show="showDeleteSpaceModal"
      :title="t('confirm_delete_space')"
      :question="t('confirm_delete_space_description', { name: pendingSpaceName })"
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

import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import { buildPlutoImageUrl } from '@/util/UranusUtils.ts'
import type { UranusVenue, UranusVenueSpaceInfo } from '@/model/uranusVenue.ts'
import UranusButton from '@/component/ui/UranusButton.vue'

const { t } = useI18n()

const props = defineProps<{
  venueInfo: UranusVenue
  organizationUuid: string
}>()

const emit = defineEmits<{
  deleted: [venueId: string]
}>()

const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)
const pendingVenueUuid = ref<string | null>(null)
const pendingVenueName = ref('')
const showDeleteSpaceModal = ref(false)
const deleteSpaceError = ref('')
const isDeletingSpace = ref(false)
const pendingSpaceUuid = ref<string | null>(null)
const pendingSpaceName = ref('')

const onDeleteEvent = (venue: UranusVenue) => {
  if (!venue.canDeleteVenue) return
  pendingVenueUuid.value = venue.venueUuid
  pendingVenueName.value = venue.venueName
  deleteError.value = ''
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleteError.value = ''
  pendingVenueUuid.value = null
  pendingVenueName.value = ''
}

const confirmDelete = async ({ password }: { password: string }) => {
  if (!pendingVenueUuid.value) return

  deleteError.value = ''
  isDeleting.value = true

  try {
    await apiFetch(`/api/admin/venue/${pendingVenueUuid.value}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })

    emit('deleted', pendingVenueUuid.value)
    cancelDelete()
  } catch (err: unknown) {
    console.error('Failed to delete venue:', err)
    const status = typeof err === 'object' && err !== null ? (err as { status?: number }).status : undefined
    if (status === 401 || status === 403) {
      deleteError.value = t('incorrect_password')
    } else {
      deleteError.value = t('failed_to_delete_venue')
    }
  } finally {
    isDeleting.value = false
  }
}

const requestDeleteSpace = (spaceInfo: UranusVenueSpaceInfo) => {
  if (!props.venueInfo.canDeleteSpace) return
  pendingSpaceUuid.value = spaceInfo.spaceUuid
  pendingSpaceName.value = spaceInfo.spaceName
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

    const index = props.venueInfo.spaceInfos.findIndex(spaceInfo => spaceInfo.spaceUuid === pendingSpaceUuid.value)
    if (index !== -1) {
      props.venueInfo.spaceInfos.splice(index, 1)
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
<template>
  <UranusCard custom-style="width:100%;">
    <header>
      <div>
        <h2>{{ venue.venue_name }}
          <UranusIconAction
              mode="edit"
              v-if="venue.can_edit_venue"
              :to="`/admin/organizer/${organizerId}/venue/${venue.venue_id}/edit`"
          />
          <UranusIconAction
              mode="delete"
              :onClick="() => requestDelete(venue)"
          />
        </h2>
      </div>
      <p>
        <span>{{ venue.upcoming_event_count }}</span>
        <span>&nbsp;{{ t('events') }}</span>
      </p>
    </header>

    <section>
      <div>
        <h3>{{ t('spaces') }}</h3>
        <router-link v-if="venue.can_add_space"
          :to="`/admin/organizer/${organizerId}/venue/${venue.venue_id}/space/create`" class="uranus-secondary-button">
          {{ t('add_new_space') }}
        </router-link>
      </div>

      <template v-if="venue.spaces.length">
        <span v-for="space in venue.spaces" :key="space.space_id">
          <div>
            <span>{{ space.space_name }}</span>
            <span>&nbsp;({{ space.upcoming_event_count }})
                <UranusIconAction
                    mode="edit"
                    v-if="venue.can_edit_space"
                    :to="`/admin/organizer/${organizerId}/venue/${venue.venue_id}/space/${space.space_id}/edit`"
                />
                <UranusIconAction
                    mode="delete"
                    title="Delete"
                    :onClick="() => requestDeleteSpace(space)"
                />
            </span>
          </div>
        </span>
      </template>
      <p v-else>{{ t('spaces_empty') }}</p>
    </section>

    <PasswordConfirmModal
      :show="showDeleteModal"
      :title="t('confirm_delete_venue')"
      :description="t('confirm_delete_venue_description', { name: pendingVenueName })"
      :confirm-text="t('delete_venue')"
      :loading-text="t('deleting')"
      :error="deleteError"
      :is-submitting="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <PasswordConfirmModal
      :show="showDeleteSpaceModal"
      :title="t('confirm_delete_space')"
      :description="t('confirm_delete_space_description', { name: pendingSpaceName })"
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
import { apiFetch } from '@/api'

import PasswordConfirmModal from '@/components/PasswordConfirmModal.vue'
import UranusCard from "@/components/uranus/UranusCard.vue";
import UranusIconAction from "@/components/uranus/UranusIconAction.vue";

const { t } = useI18n()

const props = defineProps<{
  venue: Venue
  organizerId: number
}>()

const emit = defineEmits<{
  deleted: [venueId: number]
}>()

interface Space {
  space_id: number
  space_name: string
  upcoming_event_count: number
}

interface Venue {
  venue_id: number
  venue_name: string
  upcoming_event_count: number
  spaces: Space[]
  can_edit?: boolean
  can_edit_venue?: boolean
  can_delete_venue?: boolean
  can_add_space?: boolean
  can_edit_space?: boolean
  can_delete_space?: boolean
  can_add_event?: boolean
  can_edit_event?: boolean
  can_delete_event?: boolean
  can_release_event?: boolean
}

const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)
const pendingVenueId = ref<number | null>(null)
const pendingVenueName = ref('')
const showDeleteSpaceModal = ref(false)
const deleteSpaceError = ref('')
const isDeletingSpace = ref(false)
const pendingSpaceId = ref<number | null>(null)
const pendingSpaceName = ref('')

const requestDelete = (venue: Venue) => {
  if (!venue.can_delete_venue) return
  pendingVenueId.value = venue.venue_id
  pendingVenueName.value = venue.venue_name
  deleteError.value = ''
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleteError.value = ''
  pendingVenueId.value = null
  pendingVenueName.value = ''
}

const confirmDelete = async ({ password }: { password: string }) => {
  if (!pendingVenueId.value) return

  deleteError.value = ''
  isDeleting.value = true

  try {
    await apiFetch(`/api/admin/venue/${pendingVenueId.value}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })

    emit('deleted', pendingVenueId.value)
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

const requestDeleteSpace = (space: Space) => {
  if (!props.venue.can_delete_space) return
  pendingSpaceId.value = space.space_id
  pendingSpaceName.value = space.space_name
  deleteSpaceError.value = ''
  showDeleteSpaceModal.value = true
}

const cancelDeleteSpace = () => {
  showDeleteSpaceModal.value = false
  deleteSpaceError.value = ''
  pendingSpaceId.value = null
  pendingSpaceName.value = ''
}

const confirmDeleteSpace = async ({ password }: { password: string }) => {
  if (!pendingSpaceId.value) return

  deleteSpaceError.value = ''
  isDeletingSpace.value = true

  try {
    await apiFetch(`/api/admin/space/${pendingSpaceId.value}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    })

    const index = props.venue.spaces.findIndex(space => space.space_id === pendingSpaceId.value)
    if (index !== -1) {
      props.venue.spaces.splice(index, 1)
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

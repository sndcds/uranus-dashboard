<template>
  <article class="uranus-card">
    <header>
      <div>
        <h2>{{ venue.venue_name }}</h2>
      </div>
      <p>
        <span>{{ venue.upcoming_event_count }}</span>
        <span>{{ t('events') }}
          <router-link v-if="venue.can_edit_venue" :to="`/admin/organizer/${organizerId}/venue/${venue.venue_id}/edit`"
            class="uranus-secondary-button">
            {{ t('edit_venue') }}
          </router-link>
          <button
            v-if="venue.can_delete_venue"
            class="uranus-secondary-button"
            @click="requestDelete(venue)"
          >
            {{ t('delete_venue') }}
          </button>
        </span>
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
        <ul>
          <li v-for="space in venue.spaces" :key="space.space_id">
            <div>
              <span>{{ space.space_name }}</span>
              <span>
                {{ space.upcoming_event_count }}
                <span>{{ t('events') }}
                  <router-link v-if="venue.can_edit_space"
                    :to="`/admin/organizer/${organizerId}/venue/${venue.venue_id}/space/${space.space_id}/edit`"
                    class="uranus-secondary-button">
                    {{ t('edit_space') }}
                  </router-link>
                </span>
              </span>
            </div>
          </li>
        </ul>
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
  </article>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from "vue-i18n"
import { apiFetch } from '@/api'

import PasswordConfirmModal from '@/components/PasswordConfirmModal.vue'

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

const confirmDelete = async (password: string) => {
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
</script>

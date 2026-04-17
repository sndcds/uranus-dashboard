<!--
  src/component/venue/UranusVenueCard.vue
-->

<template>
  <UranusCard custom-style="width:100%;">

    <div>
      <div class="header">
        <div>
          <h2>{{ venueListItem.venueName }}</h2>
          <p>{{ eventCountText }}</p>
          <div class="uranus-card-button-container">
          <UranusButton
              v-if="venueListItem.canEditVenue"
              variant="secondary" size="small"
              :to="`/admin/organization/${organizationUuid}/venue/${venueListItem.venueUuid}/edit`"
          >
            {{ t('edit') }}
          </UranusButton>

          <UranusButton
              v-if="venueListItem.canDeleteVenue"
              variant="secondary" size="small"
              @click="onDeleteEvent(venueListItem)"
          >
            {{ t('delete') }}
          </UranusButton>
          </div>
        </div>
        <PlutoImage
            :mainImageUuid="venueListItem.mainLogoUuid ?? null"
            :lightImageUuid="venueListItem.lightThemeLogoUuid ?? null"
            :darkImageUuid="venueListItem.darkThemeLogoUuid ?? null"
        />
      </div>
    </div>

    <section>
      <div>
        <h3>{{ t('venue_spaces') }}
          <UranusIconAction
              v-if="venueListItem.canAddSpace"
              :icon="Plus"
              :title="t('add')"
              :to="`/admin/organization/${organizationUuid}/venue/${venueListItem.venueUuid}/space/create`"
          />
        </h3>
      </div>

      <template v-if="venueListItem.spaces?.length">
        <div
            v-for="(space, index) in venueListItem.spaces"
            :key="space.spaceUuid"
            class="space-row"
        >
          <div class="space-info">
            <span>{{ space.spaceName }}</span>
          </div>

          <div class="space-actions">
            <span>
              <template v-if="space.eventCount">
                {{ space.eventCount }}
              </template>
              <template v-else></template>
            </span>
            <UranusIconAction
                v-if="space.canEditSpace"
                :icon="Edit" :title="t('edit')"
                :to="`/admin/organization/${organizationUuid}/venue/${venueListItem.venueUuid}/space/${space.spaceUuid}/edit`"
            />
            <UranusIconAction
                v-if="space.canDeleteSpace"
                :icon="Trash2" :title="t('delete')"
                :onClick="() => requestDeleteSpace(space)"
            />
          </div>
        </div>
      </template>
      <p v-else>{{ t('spaces_empty') }}</p>
    </section>

    <UranusPasswordConfirmModal
        :show="showDeleteVenueModal"
        :title="t('delete_venue')"
        :question="getConfirmDeleteVenue(pendingVenueName)"
        :confirm-text="t('venue_delete')"
        :loading-text="t('deleting')"
        :error="deleteVenueError"
        :is-submitting="isDeletingVenue"
        @confirm="confirmDeleteVenue"
        @cancel="cancelDeleteVenue"
    />

    <UranusPasswordConfirmModal
      :show="showDeleteSpaceModal"
      :title="t('delete_space')"
      :question="getConfirmDeleteSpace(pendingSpaceName)"
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
import { computed, ref } from 'vue'
import { useI18n } from "vue-i18n"
import { apiFetch } from '@/api.ts'
import {type VenueListItem, type VenueListSpace} from '@/domain/organization/venueList.ts'

import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import PlutoImage from '@/component/pluto/PlutoImage.vue'
import { uranusStringInterpolate } from '@/util/UranusStringUtils.ts'
import { Edit, Trash2, Plus } from 'lucide-vue-next'


const { t } = useI18n()

const props = defineProps<{
  venueListItem: VenueListItem
  organizationUuid: string
}>()

const eventCountText = computed(() => {
  // Pass locale.value to your interpolation function if needed
  const count = props.venueListItem.eventCount
  const key = count === 1 ? 'event_count_singular' : 'event_count_plural'
  const template = t(key) // t automatically picks the correct language
  return uranusStringInterpolate(template, { count })
})

const emit = defineEmits<{
  deleted: [venueUuid: string]
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

function getConfirmDeleteVenue(name: string): string {
  const template = t('confirm_delete_venue');
  return uranusStringInterpolate(template, {name});
}

function getConfirmDeleteSpace(name: string): string {
  const template = t('confirm_delete_space');
  return uranusStringInterpolate(template, {name});
}

const onDeleteEvent = (venue: VenueListItem) => {
  if (!venue.canDeleteVenue) return
  pendingVenueUuid.value = venue.venueUuid
  pendingVenueName.value = venue.venueName
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
  pendingSpaceUuid.value = space.spaceUuid
  pendingSpaceName.value = space.spaceName
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

    const index = props.venueListItem.spaces.findIndex(spaceInfo => spaceInfo.spaceUuid === pendingSpaceUuid.value)
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
  align-items: start;
}

.header > :nth-child(2) {
  margin-left: auto;
}

.space-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.space-row + .space-row {
  border-top: 1px solid var(--uranus-color-7)
}

.space-info {
  display: flex;
  gap: 0.25rem;
}

.space-actions {
  display: flex;
  align-items: center;
  min-height: 2.4rem;
  gap: 1rem;
}
</style>
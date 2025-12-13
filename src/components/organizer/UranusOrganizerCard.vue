<template>
  <div class="uranus-card" :class="{ 'organizer-card--active': appStore.organizerId === organizer.organizer_id }">

    <div>
      <h2>{{ organizer.organizer_name }}</h2>
      <span v-if="organizer.organizer_city || organizer.organizer_country_code">
        {{ organizer.organizer_city || '' }}{{ organizer.organizer_city && organizer.organizer_country_code ? ', ' : '' }}{{ organizer.organizer_country_code || '' }}<br>
      </span>
      <span>
        {{t('venues') }}: {{ organizer.venue_count }} /
        {{t('spaces') }}: {{ organizer.space_count }}<br>
        {{t('events') }}: {{ organizer.total_upcoming_events }}
      </span>
    </div>

    <div class="uranus-card-button-container">
      <button
          class="uranus-tertiary-button"
          :class="{ 'uranus-tertiary-button--active': appStore.organizerId === organizer.organizer_id }"
          @click="assignOrganizer(organizer.organizer_id)"
      >
        {{ appStore.organizerId === organizer.organizer_id ? t('organizer_active') : t('organizer_activate') }}
      </button>

      <UranusButton
          v-if="organizer.can_edit_organizer"
          :to="`/admin/organizer/${organizer.organizer_id}/edit`"
          icon="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1.004 1.004 0 0 0 0-1.42l-2.34-2.34a1.004 1.004 0 0 0-1.42 0l-1.83 1.83 3.75 3.75 1.84-1.82z"
          variant="uranus-button"
          class="uranus-tertiary-button"
      >
        {{ t('edit_organizer') }}
      </UranusButton>

      <UranusButton
          v-if="organizer.can_delete_organizer"
          icon="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"
          variant="uranus-button"
          class="uranus-tertiary-button"
          @click="deleteOrganizer(organizer.organizer_id)"
      >
        {{ t('delete_organizer') }}
      </UranusButton>

      <UranusButton
          v-if="organizer.can_manage_team"
          icon="M22.09,18.9L0.88,18.9C0.52,18.9 0.22,18.6 0.22,18.24L0.22,17.25C0.22,14.22 2.06,11.83 4.39,10.92C3.57,10.29 2.82,9.27 2.82,7.88C2.82,5.72 4.54,4 6.7,4C8.86,4 10.58,5.72 10.58,7.88C10.58,9.15 9.97,10.28 9.02,11C9.96,11.37 10.79,11.95 11.46,12.7C12.14,11.95 12.97,11.37 13.9,11C12.95,10.28 12.34,9.15 12.34,7.88C12.34,5.72 14.06,4 16.22,4C18.38,4 20.1,5.72 20.1,7.88C20.1,9.15 19.49,10.28 18.54,11C20.91,11.94 22.71,14.26 22.71,17.29L22.71,18.28C22.71,18.62 22.43,18.9 22.09,18.9Z"
          variant="uranus-button"
          class="uranus-tertiary-button"
          :to="`/admin/organizer/${organizer.organizer_id}/team`"
      >
        {{ t('manage_team') }}
      </UranusButton>
    </div>


    <!-- Delete confirmation modal -->
    <PasswordConfirmModal
        :show="showDeleteModal"
        :title="t('confirm_delete_organizer')"
        :description="t('confirm_delete_organizer_description', { name: organizer.organizer_name })"
        :confirm-text="t('delete_organizer')"
        :loading-text="t('deleting')"
        :error="deleteError"
        :is-submitting="isDeleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAppStore } from '@/store/appStore.ts'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import PasswordConfirmModal from '@/components/PasswordConfirmModal.vue'
import UranusButton from "@/components/ui/UranusButton.vue";
import UranusNumberDisplay from "@/components/ui/UranusNumberDisplay.vue";

const appStore = useAppStore()
const { t } = useI18n()

const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)
const pendingDeleteId = ref<number | null>(null)

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
}

interface Organizer {
  organizer_id: number
  organizer_name: string
  organizer_city: string | null
  organizer_country_code: string | null
  total_upcoming_events: number
  venue_count: number
  space_count: number
  can_edit_organizer: boolean
  can_delete_organizer: boolean
  can_manage_team: boolean
}

defineProps<{ organizer: Organizer }>()
const emit = defineEmits<{
  deleted: [organizerId: number]
}>()

function assignOrganizer(id: number) {
  appStore.setOrganizerId(id)
}

const deleteOrganizer = (organizerId: number) => {
  pendingDeleteId.value = organizerId
  showDeleteModal.value = true
  deleteError.value = ''
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleteError.value = ''
  pendingDeleteId.value = null
}

const confirmDelete = async ({ password }: { password: string }) => {
  if (!pendingDeleteId.value) return
  deleteError.value = ''
  isDeleting.value = true

  try {
    await apiFetch(`/api/admin/organizer/${pendingDeleteId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (appStore.organizerId === pendingDeleteId.value) {
      appStore.setOrganizerId(null)
    }

    emit('deleted', pendingDeleteId.value)
    cancelDelete()
  } catch (error: any) {
    console.error('Failed to delete organizer:', error)
    if (error.status === 401 || error.status === 403) {
      deleteError.value = t('incorrect_password')
    } else {
      deleteError.value = t('failed_to_delete_organizer')
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped lang="scss">
.organizer-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0;
  p { margin: 0; }
}

.stats-wrapper {
  display: flex;
  gap: 8px;
  align-items: center;
  width: 100%;
}

.organizer-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.organizer-card {
  position: relative;
  min-height: 280px;
  border: 4px solid transparent;
  transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;

  &.organizer-card--active {
    &::after {
      content: attr(data-ribbon-label);
      position: absolute;
      font-size: 1.7rem;
      top: 15px;
      right: 15px;
      pointer-events: none;
    }
  }
}

.organizer-card__content {
  flex: 1;
  margin-bottom: 1rem;
}

.organizer-card__table {
  font-size: 0.9rem;
  color: var(--color-text);

  &-header { font-weight: 600; border-bottom: 2px solid var(--border-soft); padding: 0.5rem; }
  &-header--right { text-align: right; }
  &-cell { padding: 0.5rem; &--right { text-align: right; } }
  &-row--total { border-top: 2px solid var(--border-soft); font-weight: 700; }
}

.organizer-card__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;

  .organizer-card__empty-text { font-style: italic; text-align: center; color: var(--uranus-muted-text); }
}

</style>
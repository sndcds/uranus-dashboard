<template>
  <div class="uranus-card" :class="{ 'organization-card--active': appStore.organizationId === organization.organization_id }">

    <div>
      <h2>{{ organization.organization_name }}</h2>
      <span v-if="organization.organization_city || organization.organization_country_code">
        {{ organization.organization_city || '' }}{{ organization.organization_city && organization.organization_country_code ? ', ' : '' }}{{ organization.organization_country_code || '' }}<br>
      </span>
      <span>
        {{t('venues') }}: {{ organization.venue_count }} /
        {{t('venue_spaces') }}: {{ organization.space_count }} /
        {{t('events') }}: {{ organization.total_upcoming_events }}
      </span>
    </div>

    <div class="uranus-card-button-container">
      <button
          class="uranus-button tiny"
          style="min-width:100px;"
          :class="{ 'active': appStore.organizationId === organization.organization_id }"
          @click="assignOrganization(organization.organization_id)"
      >
        {{ appStore.organizationId === organization.organization_id ? t('organization_active') : t('organization_activate') }}
      </button>

      <UranusDashboardButton
          v-if="organization.can_edit_organization"
          class="tiny"
          :to="`/admin/organization/${organization.organization_id}/edit`"
          icon="edit"
      >
        {{ t('edit') }}
      </UranusDashboardButton>

      <UranusDashboardButton
          v-if="organization.can_delete_organization"
          class="tiny"
          icon="delete"
          @click="deleteOrganization(organization.organization_id)"
      >
        {{ t('delete') }}
      </UranusDashboardButton>

      <UranusDashboardButton
          v-if="organization.can_manage_team"
          class="tiny"
          icon="organization"
          :to="`/admin/organization/${organization.organization_id}/team`"
      >
        {{ t('manage_team') }}
      </UranusDashboardButton>
    </div>


    <!-- Delete confirmation modal -->
    <UranusPasswordConfirmModal
        :show="showDeleteModal"
        :title="t('confirm_delete_organization')"
        :description="t('confirm_delete_organization_description', { name: organization.organization_name })"
        :confirm-text="t('delete_organization')"
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

import UranusPasswordConfirmModal from '@/components/uranus/UranusPasswordConfirmModal.vue'
import UranusDashboardButton from "@/components/dashboard/UranusDashboardButton.vue";
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

interface Organization {
  organization_id: number
  organization_name: string
  organization_city: string | null
  organization_country_code: string | null
  total_upcoming_events: number
  venue_count: number
  space_count: number
  can_edit_organization: boolean
  can_delete_organization: boolean
  can_manage_team: boolean
}

defineProps<{ organization: Organization }>()
const emit = defineEmits<{
  deleted: [organizationId: number]
}>()

function assignOrganization(id: number) {
  appStore.setOrganizationId(id)
}

const deleteOrganization = (organizationId: number) => {
  pendingDeleteId.value = organizationId
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
    await apiFetch(`/api/admin/organization/${pendingDeleteId.value}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (appStore.organizationId === pendingDeleteId.value) {
      appStore.setOrganizationId(null)
    }

    emit('deleted', pendingDeleteId.value)
    cancelDelete()
  } catch (error: any) {
    console.error('Failed to delete organization:', error)
    if (error.status === 401 || error.status === 403) {
      deleteError.value = t('incorrect_password')
    } else {
      deleteError.value = t('failed_to_delete_organization')
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped lang="scss">
.organization-card__header {
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

.organization-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.organization-card {
  position: relative;
  min-height: 280px;
  border: 4px solid transparent;
  transition: background-color 0.3s, border-color 0.3s, box-shadow 0.3s;

  &.organization-card--active {
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

.organization-card__content {
  flex: 1;
  margin-bottom: 1rem;
}

.organization-card__table {
  font-size: 0.9rem;

  &-header { font-weight: 600; border-bottom: 2px solid var(--border-soft); padding: 0.5rem; }
  &-header--right { text-align: right; }
  &-cell { padding: 0.5rem; &--right { text-align: right; } }
  &-row--total { border-top: 2px solid var(--border-soft); font-weight: 700; }
}

.organization-card__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;

  .organization-card__empty-text { font-style: italic; text-align: center; color: var(--uranus-muted-text); }
}

</style>
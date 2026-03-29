<template>
  <UranusCard class="organization-card">
    <div>
      <div class="header">
        <h2>{{ organisation.org_name }}</h2>
        <PlutoImage
            :mainImageUuid="organisation.main_logo_uuid"
            :lightImageUuid="organisation.light_theme_logo_uuid"
            :darkImageUuid="organisation.dark_theme_logo_uuid"
            img-class="uranus-dashboard-organization-card-logo-image"
        />

      </div>
      <span v-if="organisation.org_city || organisation.org_country_code">
        {{ organisation.org_city || '' }}{{
          organisation.org_city && organisation.org_country_code ? ', ' : ''
        }}{{ organisation.org_country_code || '' }}<br>
      </span>
      <span>
        {{ t('venues') }}: {{ organisation.venue_count }} /
        {{ t('venue_spaces') }}: {{ organisation.space_count }} /
        {{ t('events') }}: {{ organisation.total_upcoming_events }}
      </span>
    </div>

    <div class="uranus-card-button-container">
      <UranusButton
          v-if="organisation.can_edit_org"
          variant="secondary" size="small"
          @click="assignOrganization(organisation.org_uuid)"
          style="min-width: 100px;"
      >
        {{ appStore.orgUuid === organisation.org_uuid ? t('organization_active') : t('organization_activate') }}
      </UranusButton>

      <UranusButton
          v-if="organisation.can_edit_org"
          variant="secondary" size="small"
          :to="`/admin/organization/${organisation.org_uuid}/edit`"
      >
        {{ t('edit') }}
      </UranusButton>

      <UranusButton
          v-if="organisation.can_delete_org"
          variant="secondary" size="small"
          @click="deleteOrganization(organisation.org_uuid)"
      >
        {{ t('delete') }}
      </UranusButton>

      <UranusButton
          v-if="organisation.can_manage_team"
          variant="secondary" size="small"
          :to="`/admin/organization/${organisation.org_uuid}/team`"
      >
        {{ t('manage_team') }}
      </UranusButton>

    </div>


    <!-- Delete confirmation modal -->
    <UranusPasswordConfirmModal
        :show="showDeleteModal"
        :title="t('confirm_delete_organization')"
        :question="t('confirm_delete_organization_description', { name: organisation.org_name })"
        :confirm-text="t('delete_organization')"
        :loading-text="t('deleting')"
        :error="deleteError"
        :is-submitting="isDeleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />
  </UranusCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/uranusAppStore.ts'

import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCard from "@/component/ui/UranusCard.vue";
import type { UranusOrganizationListDTO } from '@/api/dto/UranusOrganizationDTO.ts'
import PlutoImage from "@/component/pluto/PlutoImage.vue";

const { t } = useI18n()
const appStore = useAppStore()

const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)
const pendingDeleteUuid = ref<string | null>(null)


const props = defineProps<{ organisation: UranusOrganizationListDTO }>()

const emit = defineEmits<{
  deleted: [orgUuid: string]
}>()

function assignOrganization(uuid: string) {
  appStore.setOrganizationUuid(uuid)
}

const deleteOrganization = (uuid: string) => {
  pendingDeleteUuid.value = uuid
  showDeleteModal.value = true
  deleteError.value = ''
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleteError.value = ''
  pendingDeleteUuid.value = null
}

const confirmDelete = async ({ password }: { password: string }) => {
  if (!pendingDeleteUuid.value) return
  deleteError.value = ''
  isDeleting.value = true

  try {
    await apiFetch(`/api/admin/organization/${pendingDeleteUuid.value}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })

    if (appStore.orgUuid === pendingDeleteUuid.value) {
      appStore.setOrganizationUuid(null)
    }

    emit('deleted', pendingDeleteUuid.value)
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


.organization-card .header {
  display: flex;
  align-items: start; // optional, vertically center items
}

.organization-card .header > :nth-child(2) {
  margin-left: auto;
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
<template>
  <UranusCard class="organization-card">
    <div>
      <div class="header">
        <h2>{{ organisation.name }}</h2>
        <PlutoImage
            :mainImageUuid="organisation.mainLogoUuid"
            :lightImageUuid="organisation.lightThemeLogoUuid"
            :darkImageUuid="organisation.darkThemeLogoUuid"
        />

      </div>

      <span v-if="organisation.city || organisation.countryCode">
        {{ organisation.city || '' }}{{
          organisation.city && organisation.countryCode ? ', ' : ''
        }}{{ organisation.countryCode || '' }}<br>
      </span>
      <span>
        {{ t('venues') }}: {{ organisation.venueCount }} /
        {{ t('venue_spaces') }}: {{ organisation.spaceCount }} /
        {{ t('events') }}: {{ organisation.totalUpcomingEvents }}
      </span>
    </div>

    <div class="uranus-card-button-container">
      <UranusButton
          v-if="organisation.canEditOrg"
          variant="secondary" size="small"
          @click="assignOrganization(organisation.uuid)"
          style="min-width: 100px;"
      >
        {{ appStore.orgUuid === organisation.uuid ? t('organization_active') : t('organization_activate') }}
      </UranusButton>

      <UranusButton
          v-if="organisation.canEditOrg"
          variant="secondary" size="small"
          :to="`/admin/organization/${organisation.uuid}/edit`"
      >
        {{ t('edit') }}
      </UranusButton>

      <UranusButton
          v-if="organisation.canDeleteOrg"
          variant="secondary" size="small"
          @click="deleteOrganization(organisation.uuid)"
      >
        {{ t('delete') }}
      </UranusButton>

      <UranusButton
          v-if="organisation.canManageTeam"
          variant="secondary" size="small"
          :to="`/admin/organization/${organisation.uuid}/team`"
      >
        {{ t('manage_team') }}
      </UranusButton>

    </div>

    <UranusPasswordConfirmModal
        :show="showDeleteModal"
        :title="t('confirm_delete_organization')"
        :question="t('confirm_delete_organization_description', { name: organisation.name })"
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
import { useAppStore } from '@/store/appStore.ts'

import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCard from "@/component/ui/UranusCard.vue";
import type { OrganizationListItem } from '@/domain/organization/organizationListItem.model.ts'
import PlutoImage from "@/component/pluto/PlutoImage.vue";

const { t } = useI18n()
const appStore = useAppStore()

const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)
const pendingDeleteUuid = ref<string | null>(null)


defineProps<{ organisation: OrganizationListItem }>()

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
.organization-card .header {
  display: flex;
  align-items: start; // optional, vertically center items
}

.organization-card .header > :nth-child(2) {
  margin-left: auto;
}

</style>
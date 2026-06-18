<!--
  src/component/org/card/UranusOrgCard.vue
-->

<template>
  <UranusCard class="org-card" :class="{ active: isActiveOrg }">
    <div>
      <div class="header">
        <h2>{{ org.name }}</h2>
        <UranusLogoImage
            :logoURL="org.logoUrl ?? ''"
            :lightThemeLogoURL="org.lightThemeLogoUrl ?? ''"
            :darkThemeLogoURL="org.darkThemeLogoUrl ?? ''"
            :theme="themeStore.theme"
            :pixelCount="6000"
            :maxWidth="200"
            :maxHeight="200"
        />
      </div>

      <span v-if="org.city || org.countryCode">
        {{ org.city || '' }}{{
          org.city && org.countryCode ? ', ' : ''
        }}{{ org.countryCode || '' }}<br>
      </span>
      <span>
        {{ t('venues') }}: {{ org.venueCount }} /
        {{ t('venue_spaces') }}: {{ org.spaceCount }} /
        {{ t('events') }}: {{ org.totalUpcomingEvents }}
      </span>
    </div>

    <div class="uranus-card-button-container">
      <UranusButton
          variant="secondary" size="small"
          @click="assignOrg(org)"
          style="min-width: 100px;"
      >
        {{ isActiveOrg ? t('org_active') : t('org_activate') }}
      </UranusButton>

      <UranusButton
          v-if="org.canEditOrg"
          variant="secondary" size="small"
          :to="`/admin/org/${org.uuid}/edit`"
      >
        {{ t('edit') }}
      </UranusButton>

      <UranusButton
          v-if="org.canDeleteOrg"
          variant="secondary" size="small"
          @click="deleteOrg(org.uuid)"
      >
        {{ t('delete') }}
      </UranusButton>

      <UranusButton
          v-if="org.canManageTeam"
          variant="secondary" size="small"
          :to="`/admin/org/${org.uuid}/team`"
      >
        {{ t('manage_team') }}
      </UranusButton>

    </div>

    <UranusPasswordConfirmModal
        :show="showDeleteModal"
        :title="t('confirm_delete_org')"
        :question="uranusStringInterpolate(
            t('confirm_delete_org_description'),
            { name: org.name }
        )"
        :confirm-text="t('delete')"
        :loading-text="t('deleting')"
        :error="deleteError"
        :is-submitting="isDeleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />
  </UranusCard>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ApiError, apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import { useThemeStore } from '@/store/themeStore.ts'
import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import type { OrgListItem } from '@/domain/org/orgListItem.model.ts'
import UranusLogoImage from '@/component/ui/UranusLogoImage.vue'
import { apiErrorI18nKey } from '@/util/apiError.ts'
import { uranusStringInterpolate } from '@/util/string.ts'

const { t } = useI18n()
const appStore = useAppStore()
const themeStore = useThemeStore()


const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)
const pendingDeleteUuid = ref<string | null>(null)

const props = defineProps<{ org: OrgListItem }>()

const isActiveOrg = computed(() => {
  return appStore.orgUuid === props.org.uuid
})

const emit = defineEmits<{
  deleted: [orgUuid: string]
}>()

function assignOrg(org: OrgListItem) {
  appStore.setOrgValues(
      org.uuid,
      org.name,
      org.logoUrl ?? null,
      org.lightThemeLogoUrl ?? null,
      org.darkThemeLogoUrl ?? null
  )
}

const deleteOrg = (uuid: string) => {
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
    await apiFetch(`/api/admin/org/${pendingDeleteUuid.value}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })

    if (appStore.orgUuid === pendingDeleteUuid.value) {
      appStore.setOrgUuid(null)
    }

    emit('deleted', pendingDeleteUuid.value)
    cancelDelete()
  } catch (err) {
    if (err instanceof ApiError) {
      deleteError.value = t(apiErrorI18nKey(err.status, 'failed_to_delete_org'))
    } else {
      deleteError.value = t('failed_to_delete_org')
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped lang="scss">
.org-card .header {
  display: flex;
  align-items: end;
  margin-bottom: 1rem;
}

.org-card .header > :nth-child(2) {
  margin-left: auto;
  min-width: 100px;
  padding-left: 30px;
}


</style>
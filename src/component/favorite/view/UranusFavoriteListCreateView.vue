<template>
  <div class="uranus-main-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('favorite_list_create')"
        :subtitle="t('favorite_list_create_description')"
    />

    <UranusNotification v-if="!appStore.orgUuid" type="info" action-to="/admin/orgs" :action-label="t('nav_orgs')">
      <template #title>{{ t('notification') }}</template>
      {{ t('favorite_lists_no_active_org') }}
    </UranusNotification>

    <UranusForm v-else @submit="onCreate">
      <UranusTextfield
          id="favorite-list-name"
          v-model="listName"
          :label="t('name')"
          size="medium"
          required
      />

      <UranusFeedback v-if="!!error" type="error">
        {{ error }}
      </UranusFeedback>

      <UranusFormActions>
        <UranusButton to="/admin/org/favorite-lists" variant="secondary">
          {{ t('cancel') }}
        </UranusButton>
        <UranusButton type="submit" :disabled="!canCreate || isCreating" :loading="isCreating" :loading-text="t('saving')">
          {{ t('favorite_list_create') }}
        </UranusButton>
      </UranusFormActions>
    </UranusForm>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusOrgTitle from '@/component/layout/UranusOrgTitle.vue'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const appStore = useAppStore()
const listName = ref('')
const isCreating = ref(false)
const error = ref<string | null>(null)
const canCreate = computed(() => listName.value.trim().length > 0 && !!appStore.orgUuid)

async function onCreate() {
  if (!canCreate.value || !appStore.orgUuid) return

  isCreating.value = true
  error.value = null

  try {
    const apiPath = '/api/admin/favorite-list/create'
    const apiResponse = await apiFetch<any>(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_uuid: appStore.orgUuid,
        favorite_list_name: listName.value,
      }),
    })

    const listUuid = extractCreatedUuid(apiResponse)
    if (!listUuid) {
      throw new Error('Missing favorite list uuid')
    }

    await router.push({ name: 'admin-favorite-lists' })
  } catch {
    error.value = t('favorite_list_create_error')
  } finally {
    isCreating.value = false
  }
}

function extractCreatedUuid(apiResponse: any) {
  return String(
      apiResponse?.metadata?.favorite_list_uuid
      ?? apiResponse?.metadata?.list_uuid
      ?? apiResponse?.data?.uuid
      ?? apiResponse?.data?.favorite_list_uuid
      ?? ''
  )
}
</script>

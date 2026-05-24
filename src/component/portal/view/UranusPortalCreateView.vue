<!--
  src/component/portal/view/UranusPortalCreateView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero :title="t('create_portal')" :subtitle="t('create_portal_description')" />

    <UranusForm>
      <UranusTextfield
          v-model="portalName"
          size="medium"
          id="portal_name"
          :label="t('portal_name')"
          required
      />

      <UranusFeedback v-if="!!error" type="error">
        {{ error }}
      </UranusFeedback>

      <UranusFormActions>
        <UranusButton
            :disabled="isSubmitting || portalName.trim().length === 0"
            @click="onCreate"
        >
          {{ t('create_now') }}
        </UranusButton>
      </UranusFormActions>
    </UranusForm>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'

interface CreatePortalData {
  uuid?: string
  portal_uuid?: string
}

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()

const orgUuid = computed(() => route.params.orgUuid?.toString() ?? '')
const portalName = ref('')
const error = ref('')
const isSubmitting = ref(false)

async function onCreate() {
  const name = portalName.value.trim()
  if (!name) {
    error.value = t('portal_name_required')
    return
  }

  if (!orgUuid.value) {
    error.value = t('portal_missing_org')
    return
  }

  isSubmitting.value = true
  error.value = ''

  try {
    const apiResponse = await apiFetch<CreatePortalData>('/api/admin/portal/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_uuid: orgUuid.value,
        portal_name: name,
      }),
    })

    const portalUuid =
        apiResponse.metadata?.portal_uuid ??
        apiResponse.data?.portal_uuid ??
        apiResponse.data?.uuid ??
        ''

    if (!portalUuid) {
      throw new Error('no portal_uuid returned from API')
    }

    await router.push(`/admin/org/${orgUuid.value}/portal/${portalUuid}/edit`)
  } catch (err) {
    console.error('Failed to create portal:', err)
    error.value = t('failed_to_create_portal')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<!--
  src/view/admin/organization/UranusOrganizationCreateView.vue

  2026-02-09, Roald
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero :title="t('create_organization')" :subtitle="t('create_organization_description')" />

    <!-- TODO: i18n -->
    <h3>Was ist eine Organisation?</h3>
    <p>
      Um Inhalte in Uranus zu erstellen, brauchst du eine Organisation. Sie ist offiziell
      verantwortlich für alle Inhalte, die du erstellst. Verwende den genauen juristischen Namen,
      z. B. für Veranstalter oder Betreiberangaben.
    </p>

    <UranusForm>
      <UranusTextfield
          size="medium"
          id="organization_name"
          :label="t('organization_name')"
          required
          v-model="orgName"
      />

      <UranusFormActions>
        <UranusButton
            :disabled="orgName.trim().length === 0"
            @click="onCreate"
        >
          Jetzt erstellen
        </UranusButton>
      </UranusFormActions>
    </UranusForm>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import router from '@/router/index.ts'
import { apiFetch } from '@/api.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'

const { t } = useI18n()

const orgName = ref<string>('')

async function onCreate() {
  if (orgName.value.trim().length < 1) {
    // TODO: Render UranusFeedback
    alert(t('organization_name_required'))
    return
  }

  const payload = {
    org_name: orgName.value.trim()
  }

  try {
    const apiPath = '/api/admin/organization/create'
    const { response } = await apiFetch<any>(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const orgUuid = response.metadata.org_uuid ?? ''
    if (orgUuid == '') {
      throw new Error('no org_uuid returned from API')
    }
    router.push(`/admin/organization/${orgUuid}/edit`)
  } catch (error) {
    // TODO: Render UranusFeedback
    alert('Organisation konnte nicht erstellt werden')
  }
}

</script>
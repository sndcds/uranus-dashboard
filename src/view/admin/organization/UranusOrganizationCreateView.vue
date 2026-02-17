<!--
  src/view/admin/organization/UranusOrganizationCreateView.vue

  2026-02-09, Roald
-->

<template>
  <UranusDashboardHero
      :title="t('create_organization')"
      :subtitle="t('create_organization_description')"
  />

  <section class="uranus-admin-edit-section uranus-admin-responsive-grid">

    <div class="full-width">
      <h3>Was ist eine Organisation?</h3>
      <p>
        Um Inhalte in Uranus zu erstellen, brauchst du eine Organisation. Sie ist offiziell
        verantwortlich für alle Inhalte, die du erstellst. Verwende den genauen juristischen Namen,
        z. B. für Veranstalter oder Betreiberangaben.
      </p>
    </div>

    <label class="full-width">
      Name
      <input class="big" type="text" v-model="orgName" required
      />
    </label>

    <div class="button-bar full-width">
      <UranusActionButton
          :disabled="orgName.trim().length === 0"
          @click="onCreate"
      >
        Jetzt erstellen
      </UranusActionButton>
    </div>
  </section>

</template>


<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import router from '@/router/index.ts'
import { apiFetch } from '@/api.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusActionButton from '@/component/ui/UranusActionButton.vue'

const { t } = useI18n()

const orgName = ref<string>('')

interface CreateOrgResponse {
  metadata: {
    organization_id: number
  }
}

async function onCreate() {
  const name = orgName.value.trim()

  // Simple validation
  if (name.length < 1) {
    // replace with your own toast / notification system if you have one
    alert(t('organization_name_required'))
    return
  }

  try {
    const apiPath = '/api/admin/organization/create'
    const res = await apiFetch<CreateOrgResponse>(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }), // <-- stringify the object
    })

    const orgId = res.data?.metadata?.organization_id
    if (!orgId) {
      throw new Error('No organizationId returned from API')
    }

    router.push(`/admin/organization/${orgId}/edit`)
  } catch (error) {
    console.error('Failed to create venue', error)
    alert('Spielstätte konnte nicht erstellt werden')
  }
}

</script>
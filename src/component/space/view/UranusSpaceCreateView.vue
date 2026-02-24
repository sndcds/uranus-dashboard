<!--
  src/component/space/view/UranusSpaceCreateView.vue

  2026-02-24, Roald
-->

<template>
  <UranusDashboardHero
      :title="t('create_space')"
      :subtitle="t('create_space_description')"
  />

  <section class="uranus-admin-edit-section uranus-admin-responsive-grid">
    <div class="full-width">
      <h3>Was ist ein Raum?</h3>
      <p>
        Ein Raum ist ein Bereich oder Ort einer Spielstätte, in dem/an dem Veranstaltungen stattfinden,
        z. B. ein Saal, Studio, Club oder Außenbereich.<br>
        Trage den Namen des Raums ein. Danach kannst du alle Details wie Ausstattung, Kapazität
        oder Adresse bearbeiten.
      </p>
    </div>

    <label class="full-width">
      Name
      <input class="big" type="text" v-model="spaceName" required />
    </label>

    <div class="button-bar full-width">
      <UranusActionButton
          :disabled="spaceName.trim().length === 0"
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
import { useRoute } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusActionButton from '@/component/ui/UranusActionButton.vue'

const { t } = useI18n()

const spaceName = ref<string>('')


const route = useRoute()
const organizationId = Number(route.params.id)
const venueId = Number(route.params.venueId)


interface CreateSpaceResponse {
  metadata: {
    space_id: number
  }
}

async function onCreate() {
  // Simple validation
  if (spaceName.value.trim().length < 1) {
    // replace with your own toast / notification system if you have one
    alert(t('space_name_required'))
    return
  }

  try {
    const payload = {
      organization_id: organizationId,
      venue_id: venueId,
      space_name: spaceName.value.trim()
    }

    const apiPath = '/api/admin/space/create'
    const res = await apiFetch<CreateSpaceResponse>(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const spaceId = res.data?.metadata?.space_id
    if (!spaceId) {
      throw new Error('no space_id returned from API')
    }

    router.push(`/admin/organization/${organizationId}/venue/${venueId}/space/${spaceId}/edit`)
  } catch (error) {
    console.error('Failed to create space', error)
    alert('Raum konnte nicht erstellt werden')
  }
}

</script>
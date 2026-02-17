<!--
  src/view/admin/venue/UranusVenueCreateView.vue

  2026-02-10, Roald
-->

<template>
  <UranusDashboardHero
      :title="t('create_venue')"
      :subtitle="t('create_venue_description')"
  />

  <section class="uranus-admin-edit-section uranus-admin-responsive-grid">
    <div class="full-width">
      <h3>Was ist eine Spielstätte?</h3>
      <p>
        Eine Spielstätte ist der Ort, an dem Veranstaltungen stattfinden.
        Sie kann ein Raum oder ein Platz sein, z B. ein Veranstaltungsraum oder ein
        öffentlicher Ort sein. Trage den genauen Namen der Spielstätte ein, damit Besucher:innen die Veranstaltungen
        leicht finden können.
      </p>
    </div>

    <label class="full-width">
      Name
      <input class="big" type="text" v-model="venueName" required />
    </label>

    <div class="button-bar full-width">
      <UranusActionButton
          :disabled="venueName.trim().length === 0"
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

const venueName = ref<string>('')


const route = useRoute()
const organizationId = Number(route.params.id)


interface CreateVenueResponse {
  metadata: {
    venue_id: number
  }
}

async function onCreate() {
  // Simple validation
  if (venueName.value.trim().length < 1) {
    // replace with your own toast / notification system if you have one
    alert(t('venue_name_required'))
    return
  }

  try {
    const payload = {
      organization_id: organizationId,
      venue_name: venueName.value.trim()
    }

    const apiPath = '/api/admin/venue/create'
    const res = await apiFetch<CreateVenueResponse>(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const venueId = res.data?.metadata?.venue_id
    if (!venueId) {
      throw new Error('no venue_id returned from API')
    }

    router.push(`/admin/organization/${organizationId}/venue/${venueId}/edit`)
  } catch (error) {
    console.error('Failed to create organization', error)
    alert('Spielstätte konnte nicht erstellt werden')
  }
}

</script>
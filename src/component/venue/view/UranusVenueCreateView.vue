<!--
  src/view/admin/venue/UranusVenueCreateView.vue

  2026-02-10, Roald
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero :title="t('create_venue')" :subtitle="t('create_venue_description')" />

    <!-- TODO: i18n -->
    <h3>Was ist eine Spielstätte?</h3>
    <p>
      Eine Spielstätte ist der Ort, an dem Veranstaltungen stattfinden.
      Sie kann ein Raum oder ein Platz sein, z B. ein Veranstaltungsraum oder ein
      öffentlicher Ort sein. Trage den genauen Namen der Spielstätte ein, damit Besucher:innen die Veranstaltungen
      leicht finden können.
    </p>

    <UranusForm>
      <UranusTextfield
          v-model="venueName",
          size="medium"
          id="venue_name"
          :label="t('venue_name')"
          required
      />

      <UranusFormActions>
        <UranusButton
            :disabled="venueName.trim().length === 0"
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
import { useRoute } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusTextfield from "@/component/ui/UranusTextfield.vue";
import UranusFormActions from "@/component/ui/UranusFormActions.vue";

const { t } = useI18n()

const route = useRoute()
const orgUuid = route.params.orgUuid
const venueName = ref<string>('')

async function onCreate() {
  if (venueName.value.trim().length < 1) {
    // TODO: Render UranusFeedback
    alert(t('venue_name_required'))
    return
  }

  try {
    const payload = {
      org_uuid: orgUuid,
      venue_name: venueName.value.trim()
    }

    const apiPath = '/api/admin/venue/create'
    const apiResponse = await apiFetch<any>(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const venueUuid = apiResponse.metadata!.venue_uuid ?? ''
    if (venueUuid == '') {
      throw new Error('no venue_uuid returned from API')
    }
    router.push(`/admin/organization/${orgUuid}/venue/${venueUuid}/edit`)
  } catch (error) {
    // TODO: Render UranusFeedback
    alert('Spielstätte konnte nicht erstellt werden')
  }
}

</script>
<!--
  src/component/space/view/UranusSpaceCreateView.vue

  2026-02-24, Roald
-->

<template>
  <div class="uranus-main-layout">

    orgUuid: {{ orgUuid }}<br>
    venueUuid: {{ venueUuid }}<br>
    <UranusDashboardHero :title="t('create_space')" :subtitle="t('create_space_description')" />

    <h3>Was ist ein Raum?</h3>
    <p>
      Ein Raum ist ein Bereich oder Ort einer Spielstätte, in dem/an dem Veranstaltungen stattfinden,
      z. B. ein Saal, Studio, Club oder Außenbereich.<br>
      Trage den Namen des Raums ein. Danach kannst du alle Details wie Ausstattung, Kapazität
      oder Adresse bearbeiten.
    </p>

    <UranusForm>
      <UranusTextfield
          v-model="spaceName",
          size="medium"
          id="space_name"
          :label="t('space_name')"
          required
      />

      <UranusFeedback type="error" :show="i18nErrorKey != null">
        {{ t(`${i18nErrorKey}`) }}
      </UranusFeedback>

      <UranusFormActions>
        <UranusButton
            :disabled="spaceName.trim().length === 0"
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
import UranusForm from "@/component/ui/UranusForm.vue";
import UranusTextfield from "@/component/ui/UranusTextfield.vue";
import UranusFormActions from "@/component/ui/UranusFormActions.vue";
import UranusFeedback from "@/component/uranus/UranusFeedback.vue";

const { t } = useI18n()

const route = useRoute()
const orgUuid = route.params.orgUuid
const venueUuid = route.params.venueUuid
const spaceName = ref<string>('')
const i18nErrorKey = ref<string | null>(null)

interface CreateSpaceResponse {
  metadata: {
    space_uuid: string
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
      org_uuid: orgUuid,
      venue_uuid: venueUuid,
      space_name: spaceName.value.trim()
    }

    const apiPath = '/api/admin/space/create'
    const res = await apiFetch<CreateSpaceResponse>(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const spaceUuid = res.response?.metadata?.space_uuid
    if (!spaceUuid) {
      i18nErrorKey.value = 'error_1'
      return
    }

    router.push(`/admin/organization/${orgUuid}/venue/${venueUuid}/space/${spaceUuid}/edit`)
  } catch (error) {
    i18nErrorKey.value = 'error_2'
  }
}

</script>
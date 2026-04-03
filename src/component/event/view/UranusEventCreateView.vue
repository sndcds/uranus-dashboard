<!--
  src/view/admin/event/UranusEventCreateView.vue

  2026-02-10, Roald
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero :title="t('create_event')" :subtitle="t('create_event_definition')" />

    <UranusHelpPopup baseUrl="/help/create-event" />

    <UranusForm>
      <UranusFormRow>
        <UranusTextfield
            id="event_title"
            :label="t('event_title')"
            :placeholder="t('event_title')"
            v-model="eventTitle"
            size="medium"
        />
      </UranusFormRow>
    </UranusForm>

    <UranusFormActions>
      <UranusButton
          :disabled="eventTitle.trim().length === 0"
          @click="onCreate"
      >
        Jetzt erstellen
      </UranusButton>
    </UranusFormActions>
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
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusHelpPopup from '@/component/uranus/UranusHelpPopup.vue'
import UranusFormActions from "@/component/ui/UranusFormActions.vue";

const { t } = useI18n()

const eventTitle = ref<string>('')


const route = useRoute()
const orgUuid = route.params.orgUuid


interface CreateEventResponse {
  metadata: {
    event_uuid: string
  }
}

async function onCreate() {
  // Simple validation
  if (eventTitle.value.trim().length < 1) {
    // replace with your own toast / notification system if you have one
    alert(t('event_title_required'))
    return
  }

  try {
    const payload = {
      org_uuid: orgUuid,
      event_title: eventTitle.value.trim()
    }

    const apiPath = '/api/admin/event/initial'
    const res = await apiFetch<CreateEventResponse>(apiPath, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const eventId = res.response?.metadata?.event_id
    if (!eventId) {
      throw new Error('no event_id returned from API')
    }

    router.push(`/admin/event/${eventId}`)
  } catch (error) {
    console.error('Failed to create event', error)
    alert('Event konnte nicht erstellt werden')
  }
}

</script>
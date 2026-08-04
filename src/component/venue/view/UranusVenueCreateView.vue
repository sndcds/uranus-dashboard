<!--
  src/view/admin/venue/UranusVenueCreateView.vue

  2026-02-10, Roald
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero :title="t('create_venue')" :subtitle="t('create_venue_description')" />

    <UranusHelpPopup baseUrl="/help/create-venue" />

    <UranusForm>
      <UranusTextfield
          v-model="venueName"
          size="medium"
          id="venue_name"
          :label="t('venue_name')"
          required
      />

      <div class="field-group">
        <label class="uranus-label">
          {{ t('venue_record_kind') }}
        </label>

        <UranusSegmentedSelect
            v-model="recordKind"
            :options="recordKindOptions"
            full-width
        />
      </div>

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
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusHelpPopup from '@/component/uranus/UranusHelpPopup.vue'
import UranusSegmentedSelect from '@/component/ui/UranusSegmentedSelect.vue'

const { t } = useI18n()

const route = useRoute()
const orgUuid = route.params.orgUuid
const venueName = ref<string>('')
const recordKind = ref<'standard' | 'provisional'>('standard')

const recordKindOptions = [
  { label: t('venue_record_kind_standard'), value: 'standard' },
  { label: t('venue_record_kind_provisional'), value: 'provisional' },
] as const

async function onCreate() {
  if (venueName.value.trim().length < 1) {
    // TODO: Render UranusFeedback
    alert(t('venue_name_required'))
    return
  }

  try {
    const payload = {
      org_uuid: orgUuid,
      venue_name: venueName.value.trim(),
      record_kind: recordKind.value,
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
    router.push(`/admin/org/${orgUuid}/venue/${venueUuid}/edit`)
  } catch (error) {
    // TODO: Render UranusFeedback
    alert('Spielstätte konnte nicht erstellt werden')
  }
}

</script>

<style scoped lang="scss">
.field-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.uranus-label {
  font-size: 0.85rem;
  font-weight: 500;
  margin-left: 0.5rem;
  color: var(--uranus-color-2);
}

</style>
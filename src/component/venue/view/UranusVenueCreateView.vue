<!--
  src/view/admin/venue/UranusVenueCreateView.vue

  2026-02-10, Roald
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero :title="t('create_venue')" :subtitle="t('create_venue_description')" />

    <!--UranusHelpPopup baseUrl="/help/create-venue" /-->

    <UranusForm>
      <div class="field-group">
        <h3 style="margin-bottom: .5rem">
          {{ t('venue_choose_scope_question') }}
        </h3>

        <UranusSegmentedSelect
            v-model="venueScope"
            :options="venueScopeOptions"
        />

        <div
            v-if="venueScopeInfo"
            class="field-info"
            v-html="venueScopeInfo"
        ></div>
      </div>

      <UranusTextfield
          v-model="venueName"
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
import { ref, computed } from 'vue'
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
const venueScope = ref<'shared' | 'organization'>('shared')


type VenueScope = 'shared' | 'organization'

const venueScopeOptions = computed(() =>
    [
      { label: t('venue_scope_shared'), value: 'shared' },
      { label: t('venue_scope_organization'), value: 'organization' },
    ] satisfies ReadonlyArray<{ label: string; value: VenueScope }>
)

const venueScopeInfo = computed(() => {
  switch (venueScope.value) {
    case 'shared':
      return t('venue_scope_shared_info')
    case 'organization':
      return t('venue_scope_organization_info')
    default:
      return ''
  }
})

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
      scope: venueScope.value,
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

.field-info {
  font-size: 1.1rem;
  line-height: 1.6;
  border: 1px solid var(--uranus-feedback-info-border-color);
  background: var(--uranus-feedback-info-bg);
  color: var(--uranus-color);
  padding: 1rem;
  margin-top: 1rem;
  width: 100%;

  :deep(h3) {
    margin: 0 0 .75rem;
    font-size: 1.6rem;
  }

  :deep(p) {
    margin: 0 0 .5rem;
  }

  :deep(ul) {
    margin: .5rem 0;
    padding-left: 1.5rem;
  }

  :deep(li) {
    margin-bottom: .25rem;
  }

  :deep(strong) {
    font-weight: 600;
  }
}

.uranus-label {
  font-size: 0.85rem;
  font-weight: 500;
  margin-left: 0.5rem;
  color: var(--uranus-color-2);
}
</style>

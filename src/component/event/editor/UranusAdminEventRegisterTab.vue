<!--
  src/component/event/editor/UranusAdminEventRegisterTab.vue
-->

<template>
  <section class="register-tab">
    <UranusForm>
      <h2>{{t('event_registration') }}</h2>
      <UranusGridLayout>
        <UranusFormCol :span="6">
          <UranusTextfield
              id="online-registration-link"
              :label="t('event_online_registration_link')"
              v-model="draft.registrationLink"
          />
        </UranusFormCol>

        <UranusFormCol :span="6">
          <UranusDateInput
              id="online-registration-last_date"
              :label="t('event_online_registration_last_date')"
              v-model="draft.registrationDeadline"
          />
        </UranusFormCol>

        <UranusFormCol :span="6">
          <UranusTextfield
              id="online-contact-email"
              :label="t('event_online_contact_mail')"
              v-model="draft.registrationEmail"
          />
        </UranusFormCol>

        <UranusFormCol :span="6">
          <UranusTextfield
              id="online-contact-phone"
              :label="t('event_online_contact_phone')"
              v-model="draft.registrationPhone"
          />
        </UranusFormCol>
      </UranusGridLayout>

      <UranusFormActions>
        <UranusButton :disabled="store.saving || !isDirty" @click="resetTab">
          <template #icon><Undo /></template>
          {{ t('discard')}}
        </UranusButton>

        <UranusButton
            :disabled="store.saving || !isDirty"
            :loading="store.saving"
            loading-text="Saving..."
            @click="commitTab"
        >
          <template #icon><Save /></template>
          {{ t('save')}}
        </UranusButton>
      </UranusFormActions>

    </UranusForm>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { apiFetch } from '@/api.ts'
import { useI18n } from 'vue-i18n'
import { useAdminEventStore } from '@/store/adminEventStore.ts'
import { useVenueSpaceLabelStore } from '@/store/venueSpaceLabelsStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import { Save, Undo } from 'lucide-vue-next'
import UranusGridLayout from '@/component/ui/UranusGridLayout.vue'
import UranusFormCol from '@/component/ui/UranusFormCol.vue'
import UranusDateInput from '@/component/ui/UranusDateInput.vue'

const { t } = useI18n({ useScope: 'global' })

const store = useAdminEventStore()
const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()
const draft = computed(() => store.draft!)
const venueLabelStore = useVenueSpaceLabelStore()


const venueLabel = ref('')

watch(
    () => [draft.value?.venueUuid, draft.value?.spaceUuid],
    async ([venueUuid, spaceUuid]) => {
      if (!venueUuid) {
        venueLabel.value = ''
        return
      }

      venueLabel.value =
          await venueLabelStore.getVenueSpaceLabel(venueUuid, spaceUuid ?? null)
    },

    { immediate: true }
)

onMounted(async () => {
})

const isDirty = computed(() => { return !store.isRegisterTabEqual() })

watch(isDirty, (value) => {
  emit('dirty-change', value)
}, { immediate: true })

async function commitTab() {
  if (!draft.value || !store.original) return
  store.saving = true
  store.error = null

  try {
    const payload = {
      registration_link: draft.value.registrationLink,
      registration_email: draft.value.registrationEmail,
      registration_phone: draft.value.registrationPhone,
      registration_deadline: draft.value.registrationDeadline
    }

    await apiFetch(`/api/admin/event/${draft.value.uuid}/fields`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    store.original.registrationLink = draft.value.registrationLink
    store.original.registrationEmail = draft.value.registrationEmail
    store.original.registrationPhone = draft.value.registrationPhone
    store.original.registrationDeadline = draft.value.registrationDeadline

  } catch (err) {
    store.error = 'Failed to save event settings'
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  if (!draft.value || !store.original) return
  draft.value.registrationLink = store.original.registrationLink
  draft.value.registrationDeadline = store.original.registrationDeadline
  draft.value.registrationEmail = store.original.registrationEmail
  draft.value.registrationPhone = store.original.registrationPhone
}
</script>

<style scoped lang="scss">
.register-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: var(--uranus-dashboard-content-width);
}
</style>

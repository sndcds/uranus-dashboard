<!--
  src/component/event/editor/UranusAdminEventVenueTab.vue
-->

<template>
  <section class="venue-tab">
    <UranusForm>

      <h2>{{t('venue') }}</h2>
      <UranusCard class="event-venue">
        <UranusInfoHeading :icon="MapPin" :strokeWidth="1.5">
          {{ choosableVenuesStore.getVenueLabel(draft.venueUuid, draft.spaceUuid) }}
        </UranusInfoHeading>

        <UranusButton variant="tertiary" size="small" :onclick="openVenueModal">
          {{ t('event_select_venue') }}
        </UranusButton>
      </UranusCard>

      <UranusCard>
        <h2>{{t('event_meeting_point') }}</h2>
        <UranusTextfield
            id="meeting-point"
            :label="t('event_meeting_point')"
            v-model="draft.meetingPoint"
        />
      </UranusCard>

      <UranusCard>
        <h2>{{t('event_online_event') }}</h2>

        <UranusTextfield
            id="online-url"
            :label="t('event_online_link')"
            placeholder="https://..."
            v-model="draft.onlineLink"
        />

        <UranusGridLayout>
          <UranusFormCol :span="6">
            <UranusTextfield
                id="online-registration-link"
                :label="t('event_online_registration_link')"
            />
          </UranusFormCol>

          <UranusFormCol :span="6">
            <UranusDateInput
                id="online-registration-last_date"
                :label="t('event_online_registration_last_date')"
            />
          </UranusFormCol>

          <UranusFormCol :span="6">
            <UranusTextfield
                id="online-contact-email"
                :label="t('event_online_contact_mail')"
            />
          </UranusFormCol>

          <UranusFormCol :span="6">
            <UranusTextfield
                id="online-contact-phone"
                :label="t('event_online_contact_phone')"
            />
          </UranusFormCol>
        </UranusGridLayout>



      </UranusCard>

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

  <UranusAdminVenueSelectModal
      :show="showModal"
      :venueSpaceInfos="venueSpacesInfos"
      v-model="selectedPlace"
      @close="closeVenueModal"
  />
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { apiFetch } from '@/api.ts'
import { useI18n } from 'vue-i18n'
import { useAdminEventStore } from '@/store/adminEventStore.ts'
import UranusAdminVenueSelectModal from '@/component/venue/UranusAdminVenueSelectModal.vue'
import { useChoosableVenuesStore } from '@/store/choosableVenuesStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusInfoHeading from '@/component/ui/UranusInfoHeading.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import { Save, Undo, MapPin } from 'lucide-vue-next'
import UranusFormRow from "@/component/ui/UranusFormRow.vue";
import UranusGridLayout from "@/component/ui/UranusGridLayout.vue";
import UranusFormCol from "@/component/ui/UranusFormCol.vue";
import UranusDateInput from "@/component/ui/UranusDateInput.vue";

const { t } = useI18n({ useScope: 'global' })

const store = useAdminEventStore()
const draft = computed(() => store.draft!)
const choosableVenuesStore = useChoosableVenuesStore()

const showModal = ref(false)
const activeDraft = ref<typeof draft.value | null>(null)

const venueSpacesInfos = computed(() =>
    choosableVenuesStore.getVenueSpacesInfos()
)

interface SelectedPlace {
  venueUuid: string | null
  spaceUuid: string | null
}

const selectedPlace = ref<SelectedPlace>({ venueUuid: null, spaceUuid: null })

function openVenueModal() {
  activeDraft.value = draft.value
  selectedPlace.value = {
    venueUuid: draft.value?.venueUuid ?? null,
    spaceUuid: draft.value?.spaceUuid ?? null,
  }
  showModal.value = true
}

function closeVenueModal() {
  if (activeDraft.value && selectedPlace.value) {
    activeDraft.value.venueUuid = selectedPlace.value.venueUuid
    activeDraft.value.spaceUuid = selectedPlace.value.spaceUuid
  }
  showModal.value = false
  activeDraft.value = null
}

onMounted(async () => {
  await choosableVenuesStore.refresh()
})

const isDirty = computed(() => {
  if (!store.draft || !store.original) return false
  const d = store.draft
  const o = store.original
  return (
      (d.venueUuid ?? null) !== (o.venueUuid ?? null) ||
      (d.spaceUuid ?? null) !== (o.spaceUuid ?? null) ||
      (d.meetingPoint ?? '') !== (o.meetingPoint ?? '') ||
      (d.onlineLink ?? '') !== (o.onlineLink ?? '')
  )
})

async function commitTab() {
  if (!draft.value || !store.original) return
  store.saving = true
  store.error = null

  try {
    const payload = {
      venue_uuid: draft.value.venueUuid,
      space_uuid: draft.value.spaceUuid,
      meeting_point: draft.value.meetingPoint,
      online_link: draft.value.onlineLink,
    }

    await apiFetch(`/api/admin/event/${draft.value.uuid}/venue`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    store.original.venueUuid = draft.value.venueUuid
    store.original.spaceUuid = draft.value.spaceUuid
    store.original.meetingPoint = draft.value.meetingPoint
    store.original.onlineLink = draft.value.onlineLink
  } catch (err) {
    store.error = 'Failed to save event settings'
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  if (!draft.value || !store.original) return
  draft.value.venueUuid = store.original.venueUuid
  draft.value.spaceUuid = store.original.spaceUuid
  draft.value.meetingPoint = store.original.meetingPoint
  draft.value.onlineLink = store.original.onlineLink
}
</script>

<style scoped lang="scss">
.venue-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: var(--uranus-dashboard-content-width);

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 1rem;
  }
}

.event-venue {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.event-venue > :first-child {
  flex: 1;
}
</style>
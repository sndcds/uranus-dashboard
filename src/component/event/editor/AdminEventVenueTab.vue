<template>
  <section class="venue-tab">

    <UranusCard class="event-venue">
      <h2 class="venue-name">
        {{ t('venue') }}: <strong>{{ venueInfoStore.getVenueLabel(draft.venueId, draft.spaceId) }}</strong>
      </h2>
      <UranusButton variant="tertiary" size="small" :onclick="openVenueModal">
        {{ t('event_select_venue') }}
      </UranusButton>
    </UranusCard>

    <UranusVenueSelectModal
        :show="showModal"
        :venueInfos="venueInfos"
        v-model="selectedPlace"
        @close="closeVenueModal"
    />

    <UranusTextfield
        id="meeting-point"
        :label="t('event_meeting_point')"
        v-model="draft.meetingPoint"
    />

    <UranusTextfield
        id="online-event-url"
        :label="t('event_online_url')"
        placeholder="https://..."
        v-model="draft.onlineLink"
    />

    <div class="dirty-indicator" v-if="isDirty">
      ⚠ You have unsaved changes
    </div>

    <div class="tab-actions">
      <UranusButton
          variant="cta"
          :disabled="store.saving || !isDirty"
          @click="resetTab"
      >
        <template #icon><Undo /></template>
        {{ t('discard')}}
      </UranusButton>

      <UranusButton
          variant="cta"
          :disabled="store.saving || !isDirty"
          :loading="store.saving"
          loading-text="Saving..."
          @click="commitTab"
      >
        <template #icon><Save /></template>
        {{ t('save')}}
      </UranusButton>
    </div>

  </section>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { apiFetch } from '@/api.ts'
import { useI18n } from 'vue-i18n'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import UranusVenueSelectModal from '@/component/venue/UranusVenueSelectModal.vue'
import { useUranusEventVenueInfoStore } from '@/store/uranusEventVenueInfoStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import {Save, Undo} from "lucide-vue-next";
import UranusCard from "@/component/ui/UranusCard.vue";

const { t } = useI18n({ useScope: 'global' })

const store = useUranusAdminEventStore()
const venueInfoStore = useUranusEventVenueInfoStore()
const draft = computed(() => store.draft!)

const venueInfos = computed(() => venueInfoStore.items)

const showModal = ref(false)
const activeDraft = ref<typeof draft.value | null>(null)

interface SelectedPlace {
  venueId: number | null
  spaceId: number | null
}

const selectedPlace = ref<SelectedPlace>({ venueId: null, spaceId: null })

function openVenueModal() {
  activeDraft.value = draft.value
  selectedPlace.value = {
    venueId: draft.value?.venueId ?? null,
    spaceId: draft.value?.spaceId ?? null,
  }
  showModal.value = true
}

function closeVenueModal() {
  if (activeDraft.value && selectedPlace.value) {
    activeDraft.value.venueId = selectedPlace.value.venueId
    activeDraft.value.spaceId = selectedPlace.value.spaceId
  }
  showModal.value = false
  activeDraft.value = null
}

onMounted(async () => {
  await venueInfoStore.fetchAll()
})

const isDirty = computed(() => {
  if (!store.draft || !store.original) return false
  const d = store.draft
  const o = store.original
  return (
      (d.venueId ?? null) !== (o.venueId ?? null) ||
      (d.spaceId ?? null) !== (o.spaceId ?? null) ||
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
      venue_id: draft.value.venueId,
      space_id: draft.value.spaceId,
      meeting_point: draft.value.meetingPoint,
      online_link: draft.value.onlineLink,
    }

    await apiFetch(`/api/admin/event/${draft.value.id}/venue`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    store.original.venueId = draft.value.venueId
    store.original.spaceId = draft.value.spaceId
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
  draft.value.venueId = store.original.venueId
  draft.value.spaceId = store.original.spaceId
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

  .venue-name {
    font-weight: 500;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;

    label {
      font-weight: bold;
    }

    input {
      padding: 0.4rem;
      border-radius: 4px;
      border: 1px solid #ccc;
    }
  }

  .dirty-indicator {
    color: #b00;
    font-weight: bold;
  }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 1rem;
  }
}

.event-venue {
  display: flex;
  flex-direction: row;       /* default, but explicit */
  align-items: center;      /* vertically align nicely */
}

.event-venue h2 {
  flex: 1;                  /* take remaining space */
}

.event-venue UranusButton {
  margin-left: auto;        /* push it to the right */
}
</style>
<template>
  <section class="release-tab">
    <h2>Venue/Space</h2>

    <button @click="showModal = true">
      Select Venue / Space
    </button>
    <p>
      Selected: Venue {{ draft.venueId }}, Space {{ draft.spaceId }}
    </p>

    <UranusVenueSelectModal
        :show="showModal"
        :venueInfos="venueInfos"
        v-model="selectedPlace"
        @close="showModal = false"
    />

    <!--div class="field">
      <label for="venue">Venue</label>
      <input type="text" id="venue" v-model="draft.venueId" placeholder="Venue ID" />
    </div>

    <div class="field">
      <label for="space">Space</label>
      <input type="text" id="space" v-model="draft.spaceId" placeholder="Space ID" />
    </div-->

    <div class="field">
      <label for="meetingPoint">Meeting Point</label>
      <input type="text" id="meetingPoint" v-model="draft.meetingPoint" placeholder="Meeting point" />
    </div>

    <div class="field">
      <label for="onlineUrl">Online Event URL</label>
      <input type="url" id="onlineUrl" v-model="draft.onlineLink" placeholder="https://..." />
    </div>

    <div class="dirty-indicator" v-if="isBDirty">
      ⚠ You have unsaved changes
    </div>

    <div class="tab-actions">
      <button @click="resetTab" :disabled="store.saving || !isBDirty">Discard</button>
      <button @click="commitTab" :disabled="store.saving || !isBDirty">Save</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { apiFetch } from '@/api.ts'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { type UranusEventVenueInfoProp, type UranusGroupedVenue } from '@/model/uranusAdminEventModel.ts'
import { type UranusAPIResponse } from '@/model/uranusAPIResponse.ts'
import UranusVenueSelectModal from '@/component/venue/UranusVenueSelectModal.vue'

const store = useUranusAdminEventStore()
const draft = computed(() => store.draft!)

const venueInfos = ref<UranusEventVenueInfoProp[]>([])

const showModal = ref(false)

interface SelectedPlace {
  venueId: number | null
  spaceId: number | null
}

const selectedPlace = ref<SelectedPlace>({
  venueId: draft.value?.venueId ?? null,
  spaceId: draft.value?.spaceId ?? null,
})

watch(selectedPlace, (val) => {
  if (!draft.value) return
  draft.value.venueId = val.venueId
  draft.value.spaceId = val.spaceId
})

onMounted(async () => {
  const res = await apiFetch<
      UranusAPIResponse<{ venueInfos: UranusEventVenueInfoProp[] }>
  >('/api/admin/user/choosable-event-venues')

  venueInfos.value = res.data?.data?.venueInfos ?? []
})

const isBDirty = computed(() => {
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // Update original locally
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

// Reset release-related fields
function resetTab() {
  if (!draft.value || !store.original) return

  draft.value.venueId = store.original.venueId
  draft.value.spaceId = store.original.spaceId
  draft.value.meetingPoint = store.original.meetingPoint
  draft.value.onlineLink = store.original.onlineLink
}
</script>

<style scoped lang="scss">
.release-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;

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
    gap: 0.5rem;

    button {
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      border: 1px solid #888;
      cursor: pointer;
      background: #f5f5f5;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
  }
}
</style>
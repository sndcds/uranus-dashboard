<template>
  <section class="venue-tab">
    <h2>Venue / Space</h2>

    <button @click="openVenueModal">
      Select Venue / Space
    </button>
    <p>
      Selected: Venue {{ draft.venueId }}, Space {{ draft.spaceId }}
    </p>

    <UranusVenueSelectModal
        :show="showModal"
        :venueInfos="venueInfos"
        v-model="selectedPlace"
        @close="closeVenueModal"
    />

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
import { onMounted, computed, ref } from 'vue'
import { apiFetch } from '@/api.ts'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import UranusVenueSelectModal from '@/component/venue/UranusVenueSelectModal.vue'
import { useUranusEventVenueInfoStore } from '@/store/uranusEventVenueInfoStore.ts'

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

// ----------------------------
// Modal handlers
// ----------------------------
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

// ----------------------------
// Fetch venues on mount
// ----------------------------
onMounted(async () => {
  await venueInfoStore.fetchAll()
})

// ----------------------------
// Dirty indicator
// ----------------------------
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

// ----------------------------
// API calls
// ----------------------------
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
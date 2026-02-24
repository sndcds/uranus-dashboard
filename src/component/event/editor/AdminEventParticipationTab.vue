<!--
  src/component/event/editor/AdminEventParticipationTab.vue

  2026-02-05, Roald
-->

<template>
  <section class="participation-tab">

    <label>
      Max Attendees
      <input
          type="number"
          :value="event.maxAttendees ?? ''"
          @input="e => event.maxAttendees = parseNumberInput(e)"
          placeholder="Leave empty for unlimited"
          min="0"
      />
    </label>

    <label>
      Min Age
      <input
          type="number"
          :value="event.minAge ?? ''"
          @input="e => event.minAge = parseNumberInput(e)"
          placeholder="No minimum"
          min="0"
      />
    </label>

    <label>
      Max Age
      <input
          type="number"
          :value="event.maxAge ?? ''"
          @input="e => event.maxAge = parseNumberInput(e)"
          placeholder="No maximum"
          min="0"
      />
    </label>

    <div class="field">
      <span>Participation Info</span>
      <textarea v-model="event.participationInfo" />
    </div>

    <!-- Buttons -->
    <div class="tab-actions">
      <button @click="resetParticipationTab" :disabled="store.saving || !isParticipationTabDirty">
        {{ t('discard')}}
      </button>
      <button @click="commitParticipationTab" :disabled="store.saving || !isParticipationTabDirty">
        {{ t('save')}}
      </button>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import type { UranusAdminEvent } from '@/domain/event/UranusAdminEvent.ts'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const event = computed(() => store.draft!)

// ---------------------------
// Participation Tab Types
// ---------------------------
type ParticipationKeys = 'maxAttendees' | 'minAge' | 'maxAge' | 'participationInfo'

const participationKeys: ParticipationKeys[] = [
  'maxAttendees',
  'minAge',
  'maxAge',
  'participationInfo',
]

// ---------------------------
// Dirty check
// ---------------------------
const isParticipationTabDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  return participationKeys.some(key => draft[key] !== original[key])
})

// ---------------------------
// Helpers
// ---------------------------
function parseNumberInput(e: Event): number | null {
  const target = e.target as HTMLInputElement
  return target.value === '' ? null : Number(target.value)
}

function buildPayload(
    draft: UranusAdminEvent,
    original: UranusAdminEvent
) {
  const payload: Record<string, any> = {}

  if (draft.maxAttendees !== original.maxAttendees) { payload.max_attendees = draft.maxAttendees }
  if (draft.minAge !== original.minAge) { payload.min_age = draft.minAge }
  if (draft.maxAge !== original.maxAge) { payload.max_age = draft.maxAge }
  if (draft.participationInfo !== original.participationInfo) { payload.participation_info = draft.participationInfo == '' ? null : draft.participationInfo }

  console.log(JSON.stringify(payload, null, 2))
  return payload
}

async function commitParticipationTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return

  store.saving = true
  store.error = null

  try {
    const payload = buildPayload(draft, original)

    if (Object.keys(payload).length === 0) return

    const apiPath = `/api/admin/event/${draft.id}/fields`

    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    // Commit locally, type-safe
    original.maxAttendees = draft.maxAttendees ?? null
    original.minAge = draft.minAge ?? null
    original.maxAge = draft.maxAge ?? null
    original.participationInfo = draft.participationInfo ?? null

  } catch (err) {
    store.error = 'Failed to save participation tab'
    console.error(err)
  } finally {
    store.saving = false
  }
}

// ---------------------------
// Reset tab to original values
// ---------------------------
function resetParticipationTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return

  draft.maxAttendees = original.maxAttendees ?? null
  draft.minAge = original.minAge ?? null
  draft.maxAge = original.maxAge ?? null
  draft.participationInfo = original.participationInfo ?? null
}
</script>

<style lang="scss" scoped>
.participation-tab {
  width: 100%;
  max-width: 1024px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  label {
    display: flex;
    flex-direction: column;
    font-weight: 500;
    color: #999;
    gap: 0.25rem;

    input,
    textarea {
      padding: 0.5rem;
      border: 2px solid #fff;
      border-radius: 5px;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    textarea {
      resize: vertical;
      min-height: 100px;
    }
  }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1rem;

    button {
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-radius: 4px;
      border: 2px solid #888;
      background-color: #f5f5f5;
      transition: background 0.2s;
      font-size: 1rem;

      &:hover:not(:disabled) {
        background-color: #e0e0e0;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }
}
</style>
<!--
  src/component/event/editor/AdminEventParticipationTab.vue

  2026-02-05, Roald
-->

<template>
  <section class="participation-tab">

    <UranusForm>
      <UranusFormRow :cols="2" style="max-width: 600px;">
        <UranusNumberInput
            id="event-min-age"
            :label="t('event_min_age')"
            :min="0"
            placeholder="No minimum"
            v-model="event.minAge!" />
        <UranusNumberInput
            id="event-max-age"
            :label="t('event_max_age')"
            :min="0"
            placeholder="No maximum"
            v-model="event.maxAge!" />
      </UranusFormRow>

      <UranusFormRow :cols="2" style="max-width: 600px;">
        <UranusNumberInput
            id="event-max-attendees"
            :label="t('event_max_attendees')"
            :min="0"
            v-model="event.maxAttendees!" />
      </UranusFormRow>

      <UranusFormRow>
        <UranusLabel
            id="event-participation-info"
           :label="t('event_participation_info')"
        >
          <UranusTextEditor v-model="event.participationInfo"/>
        </UranusLabel>
      </UranusFormRow>

    </UranusForm>

    <div class="tab-actions">
      <UranusButton :disabled="store.saving || !isDirty" @click="resetParticipationTab">
        <template #icon><Undo /></template>
        {{ t('discard')}}
      </UranusButton>

      <UranusButton
          :disabled="store.saving || !isDirty"
          :loading="store.saving"
          loading-text="Saving..."
          @click="commitParticipationTab"
      >
        <template #icon><Save /></template>
        {{ t('save')}}
      </UranusButton>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import type { UranusAdminEvent } from '@/domain/event/UranusAdminEvent.ts'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusNumberInput from '@/component/ui/UranusNumberInput.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusTextEditor from '@/component/ui/UranusTextEditor.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import {Save, Undo} from 'lucide-vue-next'
import UranusButton from '@/component/ui/UranusButton.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const event = computed(() => store.draft!)

// Participation Tab Types
type ParticipationKeys = 'maxAttendees' | 'minAge' | 'maxAge' | 'participationInfo'

const participationKeys: ParticipationKeys[] = [
  'maxAttendees',
  'minAge',
  'maxAge',
  'participationInfo',
]

// Dirty check

const isDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  return participationKeys.some(key => draft[key] !== original[key])
})

// Helpers
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

// Reset tab to original values
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
  max-width: var(--uranus-dashboard-content-width);
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
  }
}
</style>
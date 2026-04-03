<!--
  src/component/event/editor/AdminEventBaseTab.vue

  2026-02-13, Roald
-->

<template>
  <section class="base-tab">
    <UranusForm>

      <UranusLabel id="event-description" :label="t('event_category')">
        <UranusEventCategorySelector
            v-model="store.draft!.categories"
            :multiple="true"
        />
      </UranusLabel>

      <UranusImageSlot
          context="event"
          :contextUuid="event.id"
          identifier="main"
          :width="420"
      />

      <UranusFormRow>
        <UranusLabel id="event-language" :label="t('content_language')">
          <UranusLanguageSelect
              v-model="draftContentLanguage"
              :label="t('content_language')"
          />
        </UranusLabel>
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextfield id="event-title" size="big" :label="t('title')" v-model="event.title" />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextfield id="event-subtitle" size="medium" :label="t('subtitle')" v-model="event.subtitle" />
      </UranusFormRow>


      <UranusFormRow>
        <UranusLabel id="event-description" :label="t('description')">
          <UranusTextEditor
              v-model="descriptionProxy"
              ref="descriptionEditor"
          />
        </UranusLabel>
      </UranusFormRow>

      <UranusFormRow>
        <UranusLabel id="event-description" :label="t('summary')">
          <UranusTextEditor
              v-model="summaryProxy"
              ref="descriptionEditor"
          />
        </UranusLabel>
      </UranusFormRow>

      <div class="tab-actions">
        <UranusButton :disabled="store.saving || !isDirty" @click="resetBaseTab">
          <template #icon><Undo /></template>
          {{ t('discard')}}
        </UranusButton>

        <UranusButton
            :disabled="store.saving || !isDirty"
            :loading="store.saving"
            loading-text="Saving..."
            @click="commitBaseTab"
        >
          <template #icon><Save /></template>
          {{ t('save')}}
        </UranusButton>
      </div>

    </UranusForm>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'

import UranusLanguageSelect from '@/component/ui/UranusLanguageSelect.vue'
import UranusTextEditor from '@/component/ui/UranusTextEditor.vue'
import UranusImageSlot from '@/component/image/UranusImageSlot.vue'

import type { UranusAdminEvent } from '@/domain/event/UranusAdminEvent.ts'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import { Save, Undo } from 'lucide-vue-next'
import UranusEventCategorySelector from '@/component/event/ui/UranusEventCategorySelector.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const event = computed(() => store.draft!)


// Description editor
const descriptionEditor = ref<InstanceType<typeof UranusTextEditor> | null>(null)
const descriptionProxy = computed({
  get: () => store.draft?.description ?? '',
  set: (val: string) => { if (store.draft) store.draft.description = val }
})


const summaryProxy = computed({
  get: () => store.draft?.summary ?? '',
  set: (val: string) => { if (store.draft) store.draft.summary = val }
})

const draftContentLanguage = computed({
  get: () => store.draft?.contentLanguage ?? '',
  set: (val: string) => { if (store.draft) store.draft.contentLanguage = val }
})

// Fields to track for base tab dirty state
const baseFields = [
  'releaseStatus',
  'releaseDate',
  'contentLanguage',
  'categories',
  'title',
  'subtitle',
  'description',
  'summary',
] as const

const isDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  return baseFields.some(key => JSON.stringify(draft[key]) !== JSON.stringify(original[key]))
})

// Build payload for API
function buildPayload(draft: UranusAdminEvent, original: UranusAdminEvent) {
  const payload: Record<string, any> = {}

  if (draft.releaseStatus !== original.releaseStatus) payload.release_status = draft.releaseStatus
  if (draft.releaseDate !== original.releaseDate) payload.release_date = draft.releaseDate
  if (draft.contentLanguage !== original.contentLanguage) payload.content_language = draft.contentLanguage
  if (draft.categories !== original.categories) payload.categories = draft.categories
  if (draft.title !== original.title) payload.title = draft.title
  if (draft.subtitle !== original.subtitle) payload.subtitle = draft.subtitle
  if (draft.description !== original.description) payload.description = draft.description
  if (draft.summary !== original.summary) payload.summary = draft.summary

  return payload
}

// Commit tab changes
async function commitBaseTab() {
  const { draft, original } = store
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

    // Commit locally
    baseFields.forEach(key => {
      (original as any)[key] = (draft as any)[key] ?? null
    })
  } catch (err) {
    store.error = 'Failed to save base tab'
    console.error(err)
  } finally {
    store.saving = false
  }
}

// Reset tab
function resetBaseTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return

  baseFields.forEach(key => {
    (draft as any)[key] = (original as any)[key] ?? null
  })
}
</script>

<style lang="scss" scoped>
.base-tab {
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

    input, textarea {
      padding: 0.5rem;
      border: 2px solid #fff;
      border-radius: 5px;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
    }

    textarea { resize: vertical; min-height: 80px; }
  }

  .title { font-size: 1.75rem; }
  .description { min-height: 320px; }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.6rem;
    margin-top: 1rem;
  }
}
</style>
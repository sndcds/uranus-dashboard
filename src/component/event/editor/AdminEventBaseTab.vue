<!--
  src/component/event/editor/AdminEventBaseTab.vue

  2026-02-13, Roald
-->

<template>
  <section class="base-tab">

    <!-- Content Language -->
    <UranusLanguageSelect
        v-model="draftContentLanguage"
        :label="t('content_language')"
    />

    <!-- Main Image -->
    <UranusImageSlot
        context="event"
        :contextId="event.id"
        identifier="main"
    />

    <!-- Title / Subtitle -->
    <label>
      Title
      <input v-model="event.title" class="title" />
    </label>

    <label>
      Subtitle
      <input v-model="event.subtitle" />
    </label>

    <!-- Description -->
    <div class="field">
      Dirty: {{ isDescriptionDirty }}
      <span>Description</span>
      <UranusTextEditor
          v-model="descriptionProxy"
          ref="descriptionEditor"
      />
    </div>

    <!-- Summary -->
    <label>
      Summary
      <textarea v-model="event.summary" />
    </label>

    <!-- Buttons -->
    <div class="tab-actions">
      <button @click="resetBaseTab" :disabled="store.saving || !isDirty">
        {{ t('discard')}}
      </button>
      <button @click="commitBaseTab" :disabled="store.saving || !isDirty">
        {{ t('save')}}
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'

import UranusLanguageSelect from '@/component/ui/UranusLanguageSelect.vue'
import UranusTextEditor from '@/component/ui/UranusTextEditor.vue'
import UranusImageSlot from "@/component/image/UranusImageSlot.vue";

import type { UranusAdminEvent } from "@/domain/event/UranusAdminEvent.ts"

const { t } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const event = computed(() => store.draft!)

const showReleaseModal = ref(false)

// Description editor
const descriptionEditor = ref<InstanceType<typeof UranusTextEditor> | null>(null)
const descriptionProxy = computed({
  get: () => store.draft?.description ?? '',
  set: (val: string) => { if (store.draft) store.draft.description = val }
})

// Dirty tracking
const isDescriptionDirty = computed(() => {
  if (!store.draft || !store.original) return false
  return store.draft.description !== store.original.description
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
    gap: 1rem;
    margin-top: 1rem;

    button {
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-radius: 4px;
      border: 2px solid #888;
      background-color: #f5f5f5;
      transition: background 0.2s;

      &:hover:not(:disabled) { background-color: #e0e0e0; }
      &:disabled { cursor: not-allowed; opacity: 0.6; }
    }
  }
}
</style>
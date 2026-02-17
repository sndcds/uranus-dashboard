<!--
  src/component/space/editor/UranusSpaceBaseTab.vue

  2026-02-13, Roald
-->

<template>
  <section class="uranus-admin-edit-section uranus-admin-responsive-grid">

    <label class="full-width">
      Name
      <input
          class="big"
          type="text"
          v-model="space.name"
          required
      />
    </label>

    <label class="full-width">
      Description
      <textarea v-model="space.description" />
    </label>

    <label>
      {{ t('space_type') }}
      <UranusSpaceTypeSelect
          v-model="space.spaceType"
      />
    </label>

    <label>
      Website
      <input
          type="url"
          v-model="space.websiteLink"
          placeholder="https://"
      />
    </label>

    <label>
      Building Level
      <input
          type="number"
          v-model.number="space.buildingLevel"
      />
    </label>

    <label>
      Area (sqm)
      <input
          type="number"
          step="0.01"
          v-model.number="space.areaSqm"
      />
    </label>

    <label class="full-width">
      Accessibility Summary
      <textarea v-model="space.accessibilitySummary" />
    </label>

    <!-- Actions -->
    <div class="tab-actions">
      <button @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </button>
      <button @click="commitTab" :disabled="store.saving || !isDirty">
        {{ t('save') }}
      </button>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useUranusSpaceStore } from '@/store/uranusSpaceStore.ts'
import type { UranusSpace } from '@/domain/space/UranusSpace'
import UranusSpaceTypeSelect from '@/component/select/UranusSpaceTypeSelect.vue'

const { t } = useI18n({ useScope: 'global' })

const store = useUranusSpaceStore()
const space = computed(() => store.draft!)

const baseFields = [
  'name',
  'description',
  'websiteLink',
  'spaceType',
  'buildingLevel',
  'areaSqm',
  'accessibilitySummary',
] as const

const normalize = (val: any) =>
    val === '' || val == null ? null : val

const isDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  return baseFields.some(key => {
    const draftVal = normalize(draft[key])
    const origVal = normalize(original[key])
    return draftVal !== origVal
  })
})

function buildPayload(
    draft: UranusSpace,
    original: UranusSpace
) {
  const payload: Record<string, any> = {}

  const set = (key: string, value: any) => {
    payload[key] = value === '' ? null : value
  }

  if (draft.name !== original.name) set('name', draft.name)
  if (draft.description !== original.description) set('description', draft.description)
  if (draft.websiteLink !== original.websiteLink) set('website_link', draft.websiteLink)
  if (draft.spaceType !== original.spaceType) set('space_type', draft.spaceType)
  if (draft.buildingLevel !== original.buildingLevel) set('building_level', draft.buildingLevel)
  if (draft.areaSqm !== original.areaSqm) set('area_sqm', draft.areaSqm)
  if (draft.accessibilitySummary !== original.accessibilitySummary) {
    set('accessibility_summary', draft.accessibilitySummary)
  }

  return payload
}

function copyFields(source: UranusSpace, target: UranusSpace) {
  target.name = source.name ?? ''
  target.description = source.description ?? null
  target.websiteLink = source.websiteLink ?? null
  target.spaceType = source.spaceType ?? null
  target.buildingLevel = source.buildingLevel ?? null
  target.areaSqm = source.areaSqm ?? null
  target.accessibilitySummary = source.accessibilitySummary ?? null
}

async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return

  store.saving = true
  store.error = null

  try {
    const payload = buildPayload(draft, original)
    if (Object.keys(payload).length === 0) {
      store.saving = false
      return
    }

    const apiPath = `/api/admin/space/${draft.id}/fields`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    copyFields(draft, original)
  } catch (err) {
    store.error = 'Failed to save space details'
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return
  copyFields(original, draft)
}
</script>

<style scoped lang="scss">
.space-base-tab {
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
  }
}
</style>
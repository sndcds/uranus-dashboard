<!--
  src/component/space/editor/UranusSpaceBaseTab.vue

  2026-02-13, Roald
-->

<template>
  <UranusForm>

    <UranusFormRow>
      <UranusTextfield id="space-name" size="big" :label="t('name')" v-model="space.name" required/>
    </UranusFormRow>

    <UranusFormRow>
      <UranusLabel id="space-description" :label="t('description')">
        <UranusTextEditor v-model="space.description"/>
      </UranusLabel>
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusLabel id="space-type" :label="t('space_type')">
        <UranusSpaceTypeSelect v-model="space.spaceType" />
      </UranusLabel>
      <UranusTextfield id="space-web-link" type="url" :label="t('website')" v-model="space.webLink" placeholder="https://"/>
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusNumberInput id="space-building-level" step="1" :label="t('building_level')" v-model="space.buildingLevel!" />
      <UranusNumberInput id="space-area" min="0" step="0.001" :label="t('area_sqm')" v-model="space.areaSqm!" />
    </UranusFormRow>

    <UranusFormRow :cols="2">
      <UranusNumberInput id="space-total-capacity" min="0" step="1" :label="t('total_capacity')" v-model="space.totalCapacity!" />
      <UranusNumberInput id="space-seating-capacity" min="0" step="1" :label="t('seating_capacity')" v-model="space.seatingCapacity!" />
    </UranusFormRow>

    <UranusFormRow>
      <UranusLabel id="space-accessibility-summary" :label="t('accessibility_summery')">
        <UranusTextEditor v-model="space.accessibilitySummary"/>
      </UranusLabel>
    </UranusFormRow>

    <UranusFormActions>
      <UranusButton @click="resetTab" :disabled="store.saving || !isDirty">{{ t('discard') }}</UranusButton>
      <UranusButton @click="commitTab" :disabled="store.saving || !isDirty">{{ t('save') }}</UranusButton>
    </UranusFormActions>

  </UranusForm>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useUranusSpaceStore } from '@/store/uranusSpaceStore.ts'
import type { UranusSpace } from '@/domain/space/space.model.ts'
import UranusSpaceTypeSelect from '@/component/select/UranusSpaceTypeSelect.vue'
import UranusForm from "@/component/ui/UranusForm.vue";
import UranusTextfield from "@/component/ui/UranusTextfield.vue";
import UranusFormRow from "@/component/ui/UranusFormRow.vue";
import UranusTextEditor from "@/component/ui/UranusTextEditor.vue";
import UranusLabel from "@/component/ui/UranusLabel.vue";
import UranusNumberInput from "@/component/ui/UranusNumberInput.vue";
import UranusButton from "@/component/ui/UranusButton.vue";
import UranusFormActions from "@/component/ui/UranusFormActions.vue";

const { t } = useI18n({ useScope: 'global' })

const store = useUranusSpaceStore()
const space = computed(() => store.draft!)

const baseFields = [
  'name',
  'description',
  'webLink',
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
  if (draft.webLink !== original.webLink) set('web_link', draft.webLink)
  if (draft.spaceType !== original.spaceType) set('space_type', draft.spaceType)
  if (draft.buildingLevel !== original.buildingLevel) set('building_level', draft.buildingLevel)
  if (draft.areaSqm !== original.areaSqm) set('area_sqm', draft.areaSqm)
  if (draft.accessibilitySummary !== original.accessibilitySummary) set('accessibility_summary', draft.accessibilitySummary)
  if (draft.totalCapacity !== original.totalCapacity) set('total_capacity', draft.totalCapacity)
  if (draft.seatingCapacity !== original.seatingCapacity) set('seating_capacity', draft.seatingCapacity)

  return payload
}

function copyFields(source: UranusSpace, target: UranusSpace) {
  target.name = source.name ?? ''
  target.description = source.description ?? null
  target.webLink = source.webLink ?? null
  target.spaceType = source.spaceType ?? null
  target.buildingLevel = source.buildingLevel ?? null
  target.areaSqm = source.areaSqm ?? null
  target.accessibilitySummary = source.accessibilitySummary ?? null
  target.totalCapacity = source.totalCapacity ?? null
  target.seatingCapacity = source.seatingCapacity ?? null
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

    const apiPath = `/api/admin/space/${draft.uuid}/fields`
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
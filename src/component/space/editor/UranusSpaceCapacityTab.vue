<!--
  src/component/space/editor/UranusSpaceCapacityTab.vue

  2026-02-13, Roald
-->

<template>
  <section class="uranus-admin-edit-section uranus-admin-responsive-grid">

    <label>
      Total Capacity
      <input
          type="number"
          v-model.number="space.totalCapacity"
          min="0"
          placeholder="Enter total capacity"
      />
    </label>

    <label>
      Seating Capacity
      <input
          type="number"
          v-model.number="space.seatingCapacity"
          min="0"
          placeholder="Enter seating capacity"
      />
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

const { t } = useI18n({ useScope: 'global' })

const store = useUranusSpaceStore()
const space = computed(() => store.draft!)

const capacityFields = ['totalCapacity', 'seatingCapacity'] as const

const normalize = (val: any) =>
    val === '' || val == null ? null : val

const isDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  return capacityFields.some(key => {
    const draftVal = normalize(draft[key])
    const origVal = normalize(original[key])
    return draftVal !== origVal
  })
})

function buildPayload(draft: UranusSpace, original: UranusSpace) {
  const payload: Record<string, any> = {}

  const set = (key: string, value: any) => {
    payload[key] = value === '' ? null : value
  }

  if (draft.totalCapacity !== original.totalCapacity)
    set('total_capacity', draft.totalCapacity)
  if (draft.seatingCapacity !== original.seatingCapacity)
    set('seating_capacity', draft.seatingCapacity)

  return payload
}

function copyFields(source: UranusSpace, target: UranusSpace) {
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

    const apiPath = `/api/admin/space/${draft.id}/fields`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    copyFields(draft, original)
  } catch (err) {
    store.error = 'Failed to save space capacities'
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
.space-capacity-tab {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  label {
    display: flex;
    flex-direction: column;
    font-weight: 500;
    color: #999;
    gap: 0.25rem;

    input {
      padding: 0.5rem;
      border: 2px solid #fff;
      border-radius: 5px;
      font-size: 1rem;
      width: 100%;
      box-sizing: border-box;
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
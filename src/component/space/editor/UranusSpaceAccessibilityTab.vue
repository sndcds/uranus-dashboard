<!--
  src/component/space/editor/UranusSpaceAccessibilityTab.vue
-->

<template>
    <UranusBigIntFlagsEditor
        :topics="uranusI18nAccessibilityFlags"
        v-model="draft.accessibilityFlags!"
    />
  <div class="tab-actions">
    <button @click="onReset" :disabled="store.saving || !isDirty">Discard</button>
    <button @click="onCommit" :disabled="store.saving || !isDirty">Save</button>
  </div>
</template>

<script setup lang="ts">
import { apiFetch } from "@/api.ts";
import { useUranusSpaceStore } from '@/store/uranusSpaceStore'
import { uranusI18nAccessibilityFlags }  from '@/i18n/uranus-i18n-accessibility.ts'
import UranusBigIntFlagsEditor from '@/component/uranus/UranusBigIntFlagsEditor.vue'
import {computed} from "vue";

const store = useUranusSpaceStore()
const draft = computed(() => store.draft!)

const isDirty = computed(() => {
  if (!store.draft || !store.original) return false
  const d = store.draft
  const o = store.original
  return (d.accessibilityFlags ?? null) !== (o.accessibilityFlags ?? null)
})

function onReset() {
  if (!draft.value || !store.original) return
  draft.value.accessibilityFlags = store.original.accessibilityFlags ?? 0n
}

async function onCommit() {
  if (!store.draft || !store.original) return
  store.saving = true
  store.error = null

  try {
    const payload = {
      accessibility_flags: store.draft.accessibilityFlags?.toString() ?? '0'
    }
    const apiPath = `/api/admin/space/${draft.value.id}/fields`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    store.original.accessibilityFlags = store.draft.accessibilityFlags
  } catch (err) {
    console.error(err)
    store.error = 'Failed to save accessibility flags'
  } finally {
    store.saving = false
  }
}
</script>

<style scoped lang="scss">
.accessibility-group {
  margin-bottom: 1.5rem;

  h3 {
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .accessibility-options {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;

    label {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      user-select: none;
      font-size: 1rem;
      position: relative;

      input[type="checkbox"] {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        width: 24px;
        height: 24px;
        border: 2px solid #888;
        border-radius: 4px;
        background-color: #fff;
        position: relative;
        cursor: pointer;
        transition: all 0.2s;
      }

      input[type="checkbox"]:checked {
        background-color: #2a3aed;
        border-color: #2a3aed;
      }

      input[type="checkbox"]:checked::after {
        content: '';
        position: absolute;
        left: 6px;
        top: 2px;
        width: 6px;
        height: 12px;
        border: solid #fff;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      input[type="checkbox"]:hover {
        border-color: #2a3aed;
      }
    }
  }
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}
</style>
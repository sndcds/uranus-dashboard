<!--
  src/component/event/event-editor/AdminEventSettingsTab.vue
-->

<template>
  <section class="release-tab">
    <!-- Dirty indicator -->
    <div class="dirty-indicator" v-if="isDirty">{{ t('unsaved_changes') }}</div>

    <label>
      <UranusEventReleaseSelect v-model="draft.releaseStatus" />
    </label>

    <label>
      {{ t('release_date') }}
      <input type="date" v-model="draft.releaseDate" />
    </label>

    <label>
      {{ t('language') }}
      <input type="text" maxlength="2" v-model="draft.contentLanguage" placeholder="en, de, da…" />
    </label>

    <!-- Buttons -->
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
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import UranusEventReleaseSelect from "@/component/event/UranusEventReleaseSelect.vue";

const { t } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const draft = computed(() => store.draft!)

// Fields for this tab
const releaseFields = ['release_status', 'release_date', 'content_iso_639_1'] as const

// Dirty detection for only release fields
const isBDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  return releaseFields.some(key => {
    return JSON.stringify(draft[key]) !== JSON.stringify(original[key])
  })
})

// Commit changes for release fields only
async function commitTab() {
  if (!draft.value || !store.original) return
  store.saving = true
  store.error = null

  try {
    const payload: Partial<typeof draft.value> = {}
    releaseFields.forEach(key => {
      const value = draft.value![key]
      if (value !== null && value !== undefined) payload[key] = value
    })

    // Adjust API endpoint as needed
    const apiPath = `/api/admin/event/${draft.value.id}/release`
    await apiFetch(apiPath, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // Commit locally
    releaseFields.forEach(key => {
      store.original![key] = structuredClone(draft.value![key] ?? '')
    })
  } catch (err) {
    store.error = t('failed_to_save_tab')
    console.error(err)
  } finally {
    store.saving = false
  }
}

// Reset only release fields
function resetTab() {
  if (!draft.value || !store.original) return
  releaseFields.forEach(key => {
    draft.value![key] = structuredClone(store.original![key] ?? '')
  })
}
</script>


<style lang="scss" scoped>
.release-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;

  label {
    display: flex;
    flex-direction: column;
    font-weight: 500;
    gap: 0.25rem;

    input,
    select {
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      width: 100%;
      box-sizing: border-box;
    }

    select {
      cursor: pointer;
    }
  }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;

    button {
      padding: 0.5rem 1rem;
      cursor: pointer;
      border-radius: 4px;
      border: 1px solid #888;
      background-color: #f5f5f5;

      &:hover:not(:disabled) {
        background-color: #e0e0e0;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }

  .dirty-indicator {
    color: #c00;
    font-weight: 500;
  }
}
</style>
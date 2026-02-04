<template>
  <h2>Languages</h2>

  <section class="languages-tab">
    <!-- Current languages as chips -->
    <div class="chip-list">
      <span
          v-for="(lang, index) in store.draft?.languages ?? []"
          :key="lang"
          class="chip"
      >
        {{ langLookup[lang] ?? lang }}
        <button @click="removeLanguage(index)">×</button>
      </span>
    </div>

    <!-- Add new language -->
    <div class="language-form">
      <select v-model="selectedLang">
        <option :value="null" disabled>Select language</option>
        <option
            v-for="(name, id) in langLookup"
            :key="id"
            :value="id"
            :disabled="store.draft?.languages?.includes(id)"
        >
          {{ name }}
        </option>
      </select>
      <button @click="addLanguage" :disabled="!selectedLang">Add</button>
    </div>

    <!-- Dirty indicator -->
    <div class="dirty-indicator" v-if="isDirty">
      ⚠ You have unsaved changes
    </div>

    <!-- Save / Discard -->
    <div class="tab-actions">
      <button @click="reset" :disabled="!isDirty || store.saving">Discard</button>
      <button @click="commit" :disabled="!isDirty || store.saving">Save</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { useLanguageLookupStore } from '@/store/uranusLanguageLookupStore.ts'
import { apiFetch } from '@/api.ts'
import {UranusEventTypePair} from "@/model/uranusEventModel.ts";

const { t, locale } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()
const langStore = useLanguageLookupStore()
const selectedLang = ref<string | null>(null)

onMounted(async () => {
  if (store.draft) {
    store.draft.languages = store.original?.languages?.map(lang => lang) ?? []
  }
})

// Lookup map for current UI language
const langLookup = computed(() => langStore.data[locale.value] ?? {})

// Add a new language
function addLanguage() {
  if (!selectedLang.value || !store.draft) return
  store.draft.languages.push(selectedLang.value)
  selectedLang.value = null
}

// Remove a language
function removeLanguage(index: number) {
  store.draft!.languages.splice(index, 1)
}

// Dirty check: compare draft vs original ignoring order
const isDirty = computed(() => {
  const draft = store.draft?.languages ?? []
  const original = store.original?.languages ?? []
  return draft.length !== original.length || draft.some(l => !original.includes(l))
})

// Commit changes to backend
async function commit() {
  if (!store.draft) return
  store.saving = true
  try {
    await apiFetch(`/api/admin/event/${store.draft.id}/languages`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ languages: store.draft.languages }),
    })
    // Commit locally
    store.original!.languages = [...store.draft.languages]
  } finally {
    store.saving = false
  }
}

// Reset draft to original
function reset() {
  if (!store.original || !store.draft) return
  store.draft.languages = [...store.original.languages]
  selectedLang.value = null
}
</script>

<style scoped lang="scss">
.languages-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .chip-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .chip {
      background: #22d3ee;
      border-radius: 4px;
      padding: 2px 8px;
      display: flex;
      align-items: center;
      gap: 0.4rem;

      button {
        background: none;
        border: 0;
        cursor: pointer;
        font-weight: bold;
      }
    }
  }

  .language-form {
    display: flex;
    gap: 0.5rem;

    select {
      padding: 0.4rem;
      border-radius: 4px;
      border: 1px solid #ccc;
    }

    button {
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      border: 1px solid #ccc;
      cursor: pointer;
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
      border: 1px solid #ccc;
      cursor: pointer;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
  }
}
</style>
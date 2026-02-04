<template>
  <h2>Tags</h2>

  <section class="tags-tab">
    <!-- Current tags -->
    <div class="tags-list">
      <span
          v-for="tag in store.draft?.tags ?? []"
          :key="tag"
          class="tag-chip"
      >
        {{ tag }}
        <button @click="removeTag(tag)">×</button>
      </span>
    </div>

    <!-- Add new tag -->
    <input
        v-model="newTag"
        @keyup.enter="addTag"
        placeholder="Add tag"
    />

    <!-- Dirty indicator -->
    <div class="dirty-indicator" v-if="isDirty">
      ⚠ You have unsaved changes
    </div>

    <!-- Discard / Save buttons -->
    <div class="tab-actions">
      <button @click="resetTagsTab" :disabled="store.saving || !isDirty">
        Discard
      </button>
      <button @click="commitTagsTab" :disabled="store.saving || !isDirty">
        Save
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import {apiFetch} from "@/api.ts";

const store = useUranusAdminEventStore()
const newTag = ref('')

// Initialize draft.tags as a copy of original.tags
onMounted(() => {
  if (store.draft) {
    store.draft.tags = [...(store.original?.tags ?? [])]
  }
})

// Add new tag
function addTag() {
  if (!newTag.value || !store.draft) return
  if (!store.draft.tags) store.draft.tags = []
  if (!store.draft.tags.includes(newTag.value)) {
    store.draft.tags.push(newTag.value)
  }
  newTag.value = ''
}

// Remove tag
function removeTag(tag: string) {
  if (!store.draft || !store.draft.tags) return
  store.draft.tags = store.draft.tags.filter(t => t !== tag)
}

// Dirty check
const isDirty = computed(() => {
  const draftTags = store.draft?.tags ?? []
  const originalTags = store.original?.tags ?? []

  if (draftTags.length !== originalTags.length) return true

  const allMatch = draftTags.every(t => originalTags.includes(t))
  const allOriginalMatch = originalTags.every(t => draftTags.includes(t))
  return !(allMatch && allOriginalMatch)
})

// Commit changes
async function commitTagsTab() {
  if (!store.draft) return
  store.saving = true
  store.error = null

  try {
    const payload = { tags: store.draft.tags ?? [] }
    const apiPath = `/api/admin/event/${store.draft.id}/fields`

    await apiFetch(apiPath, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    // Commit locally
    if (store.original && store.draft) {
      store.original.tags = [...(store.draft.tags ?? [])]
    }
  } catch (err) {
    store.error = 'Failed to save tags'
    console.error(err)
  } finally {
    store.saving = false
  }
}

// Reset draft to original
function resetTagsTab() {
  if (!store.draft) return
  store.draft.tags = [...(store.original?.tags ?? [])]
  newTag.value = ''
}
</script>

<style scoped lang="scss">
.tags-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    .tag-chip {
      background: #22d3ee;
      padding: 0.3rem 0.6rem;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 0.3rem;

      button {
        background: transparent;
        border: none;
        cursor: pointer;
        font-weight: bold;
      }
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
    }
  }

  input {
    padding: 0.4rem;
    border-radius: 4px;
    border: 1px solid #ccc;
    width: 200px;
  }
}
</style>
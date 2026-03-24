<template>
  <section class="tab-content">

    <!-- Editors directly bound to store.draft -->
    <AdminEventTypeGenreEditor
        v-if="store.draft"
        :draft="store.draft"
        @update="store.draft.eventTypes = $event"
    />

    <EventLanguageEditor
        v-if="store.draft"
        :draft="store.draft"
        @update="store.draft.languages = $event"
    />

    <AdminEventTagsEditor
        v-if="store.draft"
        @update="store.draft.tags = $event"
    />

    <!-- Dirty indicator -->
    <div class="dirty-indicator" v-if="isDirty">
      ⚠ You have unsaved changes
    </div>

    <div class="tab-actions">
      <UranusButton
          variant="cta"
          :disabled="store.saving || !isDirty"
          @click="resetAll"
      >
        <template #icon><Undo /></template>
        {{ t('discard')}}
      </UranusButton>

      <UranusButton
          variant="cta"
          :disabled="store.saving || !isDirty"
          :loading="store.saving"
          loading-text="Saving..."
          @click="commitAll"
      >
        <template #icon><Save /></template>
        {{ t('save')}}
      </UranusButton>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { apiFetch } from '@/api.ts'

import AdminEventTypeGenreEditor from '@/component/event/editor/AdminEventTypeGenreEditor.vue'
import EventLanguageEditor from '@/component/event/editor/EventLanguageEditor.vue'
import AdminEventTagsEditor from '@/component/event/editor/AdminEventTagsEditor.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import { Save, Undo } from 'lucide-vue-next'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()

// ------------------------------
// Dirty check directly on store.draft
// ------------------------------
const isDirty = computed(() => {
  if (!store.draft || !store.original) return false

  // Event types
  const typeDirty =
      store.draft.eventTypes!.length !== (store.original.eventTypes?.length ?? 0) ||
      store.draft.eventTypes!.some(d => !store.original!.eventTypes!.some(o =>
          o.typeId === d.typeId && o.genreId === d.genreId
      ))

  // Languages
  const langDirty =
      store.draft.languages!.length !== (store.original.languages?.length ?? 0) ||
      store.draft.languages!.some(l => !(store.original!.languages ?? []).includes(l))

  // Tags
  const tagsDirty =
      store.draft.tags!.length !== (store.original.tags?.length ?? 0) ||
      store.draft.tags!.some(t => !(store.original!.tags ?? []).includes(t))

  return typeDirty || langDirty || tagsDirty
})

// ------------------------------
// Commit all changes
// ------------------------------
async function commitAll() {
  if (!store.original || !store.draft) return
  store.saving = true
  store.error = null
  try {
    await apiFetch(`/api/admin/event/${store.draft.id}/types`, {
      method: 'PUT',
      body: JSON.stringify({
        event_types: store.draft.eventTypes!.map(e => ({
          type_id: e.typeId,
          genre_id: e.genreId
        }))
      })
    })

    await apiFetch(`/api/admin/event/${store.draft.id}/languages`, {
      method: 'PUT',
      body: JSON.stringify({ languages: store.draft.languages })
    })

    await apiFetch(`/api/admin/event/${store.draft.id}/fields`, {
      method: 'PUT',
      body: JSON.stringify({ tags: store.draft.tags })
    })

    store.original.eventTypes = store.draft.eventTypes!.map(d => ({ ...d }))
    store.original.languages = [...store.draft.languages!]
    store.original.tags = [...store.draft.tags!]
  } catch (err) {
    console.error(err)
    store.error = 'Failed to save changes'
  } finally {
    store.saving = false
  }
}

// ------------------------------
// Reset changes
// ------------------------------
function resetAll() {
  if (!store.draft || !store.original) return

  store.draft.eventTypes = store.original.eventTypes!.map(d => ({ ...d }))
  store.draft.languages = [...store.original.languages!]
  store.draft.tags = [...store.original.tags!]
}
</script>

<style scoped lang="scss">
.tab-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: var(--uranus-dashboard-content-width);
}

.dirty-indicator {
  color: #b00;
  font-weight: bold;
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}
</style>
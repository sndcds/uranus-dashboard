<!--
  src/component/event/editor/UranusMeta1Tab.vue
  Refactored 2026-03-23, Roald
-->

<template>
  <section class="tab-content">

    <!-- Editors -->
    <AdminEventTypeGenreEditor
        :draft="draft"
        @update="draft.eventTypes = $event"
    />
    <EventLanguageEditor
        :draft="draft"
        @update="draft.languages = $event"
    />
    <AdminEventTagsEditor
        :draft="draft"
        @update="draft.tags = $event"
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
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { apiFetch } from '@/api.ts'

import AdminEventTypeGenreEditor from '@/component/event/editor/AdminEventTypeGenreEditor.vue'
import EventLanguageEditor from '@/component/event/editor/EventLanguageEditor.vue'
import AdminEventTagsEditor from '@/component/event/editor/AdminEventTagsEditor.vue'
import {Save, Undo} from 'lucide-vue-next'
import UranusButton from '@/component/ui/UranusButton.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusAdminEventStore()

// Local draft mirrors the store.draft
const draft = ref({
  eventTypes: store.draft?.eventTypes?.map(e => ({ ...e })) ?? [],
  languages: store.draft?.languages?.slice() ?? [],
  tags: store.draft?.tags?.slice() ?? []
})

// Computed dirty state across all sections
const isDirty = computed(() => {
  // Event Types
  const origTypes = store.original?.eventTypes ?? []
  const typeDirty = draft.value.eventTypes.length !== origTypes.length ||
      draft.value.eventTypes.some(d => !origTypes.some(o =>
          o.typeId === d.typeId && o.genreId === d.genreId
      ))

  // Languages
  const origLang = store.original?.languages ?? []
  const langDirty = draft.value.languages.length !== origLang.length ||
      draft.value.languages.some(l => !origLang.includes(l))

  // Tags
  const origTags = store.original?.tags ?? []
  const tagsDirty = draft.value.tags.length !== origTags.length ||
      draft.value.tags.some(t => !origTags.includes(t))

  return typeDirty || langDirty || tagsDirty
})

// Commit all changes
async function commitAll() {
  if (!store.draft) return
  store.saving = true
  store.error = null
  try {
    // Event Types
    await apiFetch(`/api/admin/event/${store.draft.id}/types`, {
      method: 'PUT',
      body: JSON.stringify({
        event_types: draft.value.eventTypes.map(e => ({
          type_id: e.typeId,
          genre_id: e.genreId
        }))
      })
    })

    // Languages
    await apiFetch(`/api/admin/event/${store.draft.id}/languages`, {
      method: 'PUT',
      body: JSON.stringify({ languages: draft.value.languages })
    })

    // Tags
    await apiFetch(`/api/admin/event/${store.draft.id}/fields`, {
      method: 'PUT',
      body: JSON.stringify({ tags: draft.value.tags })
    })

    // Update store.original
    store.original!.eventTypes = draft.value.eventTypes.map(e => ({ ...e }))
    store.original!.languages = draft.value.languages.slice()
    store.original!.tags = draft.value.tags.slice()
  } catch (err) {
    console.error(err)
    store.error = 'Failed to save changes'
  } finally {
    store.saving = false
  }
}

// Reset all changes
function resetAll() {
  if (!store.draft) return
  draft.value.eventTypes = store.original?.eventTypes?.map(e => ({ ...e })) ?? []
  draft.value.languages = store.original?.languages?.slice() ?? []
  draft.value.tags = store.original?.tags?.slice() ?? []
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
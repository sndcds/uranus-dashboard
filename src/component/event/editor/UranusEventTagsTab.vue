<!--
  src/component/event/editor/UranusEventTagsTab.vue
-->

<template>
  <div class="tab-content">

    <!-- Editors directly bound to store.draft -->
    <UranusEventTypeGenreEditor
        v-if="store.draft"
        :draft="store.draft"
        @update="store.draft.eventTypes = $event"
    />

    <UranusEventLanguageEditor
        v-if="store.draft"
        :draft="store.draft"
        @update="store.draft.languages = $event"
    />

    <UranusEventTagsEditor
        v-if="store.draft"
        @update="store.draft.tags = $event"
    />

    <!-- Dirty indicator -->
    <div class="dirty-indicator" v-if="isDirty">
      ⚠ You have unsaved changes
    </div>

    <div class="tab-actions">
      <UranusButton :disabled="store.saving || !isDirty" @click="resetAll">
        <template #icon><Undo /></template>
        {{ t('discard')}}
      </UranusButton>

      <UranusButton
          :disabled="store.saving || !isDirty"
          :loading="store.saving"
          loading-text="Saving..."
          @click="commitAll"
      >
        <template #icon><Save /></template>
        {{ t('save')}}
      </UranusButton>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminEventStore } from '@/store/adminEventStore.ts'
import { apiFetch } from '@/api.ts'

import UranusEventTypeGenreEditor from '@/component/event/editor/UranusEventTypeGenreEditor.vue'
import UranusEventLanguageEditor from '@/component/event/editor/UranusEventLanguageEditor.vue'
import UranusEventTagsEditor from '@/component/event/editor/UranusEventTagsEditor.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import { Save, Undo } from 'lucide-vue-next'

const { t } = useI18n({ useScope: 'global' })
const store = useAdminEventStore()

const isDirty = computed(() => {
  if (!store.draft || !store.original) return false

  const draftTypes = store.draft.eventTypes ?? []
  const origTypes = store.original.eventTypes ?? []

  const draftLangs = store.draft.languages ?? []
  const origLangs = store.original.languages ?? []

  const draftTags = store.draft.tags ?? []
  const origTags = store.original.tags ?? []

  const typeDirty =
      draftTypes.length !== origTypes.length ||
      draftTypes.some(d => !origTypes.some(o => o.typeId === d.typeId && o.genreId === d.genreId))

  const langDirty =
      draftLangs.length !== origLangs.length ||
      draftLangs.some(l => !origLangs.includes(l))

  const tagsDirty =
      draftTags.length !== origTags.length ||
      draftTags.some(t => !origTags.includes(t))

  return typeDirty || langDirty || tagsDirty
})

async function commitAll() {
  if (!store.original || !store.draft) return
  store.saving = true
  store.error = null
  try {
    await apiFetch(`/api/admin/event/${store.draft.uuid}/types`, {
      method: 'PUT',
      body: JSON.stringify({
        event_types: store.draft.eventTypes!.map(e => ({
          type_id: e.typeId,
          genre_id: e.genreId
        }))
      })
    })

    await apiFetch(`/api/admin/event/${store.draft.uuid}/languages`, {
      method: 'PUT',
      body: JSON.stringify({ languages: store.draft.languages })
    })

    await apiFetch(`/api/admin/event/${store.draft.uuid}/fields`, {
      method: 'PUT',
      body: JSON.stringify({ tags: store.draft.tags })
    })

    store.original.eventTypes = (store.draft.eventTypes ?? []).map(d => ({
      typeId: d.typeId,
      genreId: d.genreId
    }))
    store.original.languages = [...store.draft.languages!]
    store.original.tags = [...store.draft.tags!]
  } catch (err) {
    console.error(err)
    store.error = 'Failed to save changes'
  } finally {
    store.saving = false
  }
}

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
  padding: 0 !important;
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
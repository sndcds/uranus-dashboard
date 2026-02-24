<!--
  src/component/event/editor/UranusEventVisitorInfosEditor.vue
-->

<template>
  <UranusBigIntFlagsEditor
      :topics="uranusI18nVisitorInformationFlags"
      v-model="draft.visitorInfoFlags!"
  />
  <div class="tab-actions">
    <button @click="onReset" :disabled="store.saving || !isDirty">Discard</button>
    <button @click="onCommit" :disabled="store.saving || !isDirty">Save</button>
  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { apiFetch } from "@/api.ts";
import UranusBigIntFlagsEditor from '@/component/uranus/UranusBigIntFlagsEditor.vue'
import { uranusI18nVisitorInformationFlags } from '@/i18n/uranus-i18n-visitor-information'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'

const store = useUranusAdminEventStore()
const draft = computed(() => store.draft!)

const isDirty = computed(() => {
  if (!store.draft || !store.original) return false
  const d = store.draft
  const o = store.original
  return (d.visitorInfoFlags ?? null) !== (o.visitorInfoFlags ?? null)
})

function onReset() {
  if (!store.draft || !store.original) return
  store.draft.visitorInfoFlags = store.original.visitorInfoFlags
}

async function onCommit() {
  if (!store.draft || !store.original) return
  store.saving = true
  store.error = null

  try {
    const payload = {
      visitor_info_flags: store.draft.visitorInfoFlags?.toString() ?? '0'
    }
    const apiPath = `/api/admin/event/${store.draft.id}/fields`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
    store.original.visitorInfoFlags = store.draft.visitorInfoFlags
  } catch (err) {
    console.error(err)
    store.error = 'Failed to save visitor flags'
  } finally {
    store.saving = false
  }
}

</script>

<!--
  src/component/space/editor/UranusSpaceAccessibilityTab.vue
-->

<template>
  <UranusBigIntFlagsEditor
      :topics="uranusI18nAccessibilityFlags"
      v-model="draft.accessibilityFlags!"
  />

  <UranusFormActions>
    <UranusButton @click="resetTab" :disabled="store.saving || !isDirty">{{ t('discard') }}</UranusButton>
    <UranusButton @click="commitTab" :disabled="store.saving || !isDirty">{{ t('save') }}</UranusButton>
  </UranusFormActions>

</template>

<script setup lang="ts">
import { apiFetch } from '@/api.ts'
import { useI18n } from 'vue-i18n'
import { useUranusSpaceStore } from '@/store/uranusSpaceStore'
import { uranusI18nAccessibilityFlags }  from '@/i18n/accessibility.ts'
import UranusBigIntFlagsEditor from '@/component/uranus/UranusBigIntFlagsEditor.vue'
import {computed} from 'vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'

const { t } = useI18n({ useScope: 'global' })

const store = useUranusSpaceStore()
const draft = computed(() => store.draft!)

const isDirty = computed(() => {
  if (!store.draft || !store.original) return false
  const d = store.draft
  const o = store.original
  return (d.accessibilityFlags ?? null) !== (o.accessibilityFlags ?? null)
})

function resetTab() {
  if (!draft.value || !store.original) return
  draft.value.accessibilityFlags = store.original.accessibilityFlags ?? 0n
}

async function commitTab() {
  if (!store.draft || !store.original) return
  store.saving = true
  store.error = null

  try {
    const payload = {
      accessibility_flags: store.draft.accessibilityFlags?.toString() ?? '0'
    }
    const apiPath = `/api/admin/space/${draft.value.uuid}/fields`
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

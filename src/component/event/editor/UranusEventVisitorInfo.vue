<!--
  src/component/event/editor/UranusEventVisitorInfo.vue
-->

<template>
  <section class="visitor-info-tab">
      <UranusBigIntFlagsEditor
          :topics="uranusI18nVisitorInformationFlags"
          v-model="draft.visitorInfoFlags!"
      />

    <div class="tab-actions">
      <UranusButton :disabled="store.saving || !isDirty" @click="onReset">
        <template #icon><Undo /></template>
        {{ t('discard')}}
      </UranusButton>

      <UranusButton
          :disabled="store.saving || !isDirty"
          :loading="store.saving"
          loading-text="Saving..."
          @click="onCommit"
      >
        <template #icon><Save /></template>
        {{ t('save')}}
      </UranusButton>
    </div>

  </section>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { apiFetch } from '@/api.ts'
import { useI18n } from 'vue-i18n'
import UranusBigIntFlagsEditor from '@/component/uranus/UranusBigIntFlagsEditor.vue'
import { uranusI18nVisitorInformationFlags } from '@/i18n/visitor-info.ts'
import { useAdminEventStore } from '@/store/adminEventStore.ts'
import {Save, Undo} from 'lucide-vue-next'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusCard from "@/component/ui/UranusCard.vue";

const { t } = useI18n({ useScope: 'global' })

const store = useAdminEventStore()
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
    const apiPath = `/api/admin/event/${store.draft.uuid}/fields`
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

<style scoped>
.visitor-info-tab {
  width: 100%;
  max-width: var(--uranus-dashboard-content-width);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tab-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>

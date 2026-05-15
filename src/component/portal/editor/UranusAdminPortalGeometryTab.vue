<template>
  <UranusForm>
    <UranusFormRow>
      <UranusLabel id="portal-spatial-filter-mode" :label="t('portal_spatial_filter_mode')">
        <select id="portal-spatial-filter-mode" v-model="portal.spatialFilterMode">
          <option
              v-for="option in spatialFilterModeOptions"
              :key="option"
              :value="option"
          >
            {{ option }}
          </option>
        </select>
      </UranusLabel>
    </UranusFormRow>

    <UranusFormActions>
      <UranusButton @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </UranusButton>
      <UranusButton @click="commitTab" :disabled="store.saving || !isDirty">
        {{ t('save') }}
      </UranusButton>
    </UranusFormActions>
  </UranusForm>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useUranusPortalStore } from '@/store/portalStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusPortalStore()
const portal = computed(() => store.draft!)
const spatialFilterModeOptions = ['polygon', 'bbox', 'radius'] as const

const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()

const isDirty = computed(() =>
    store.draft?.spatialFilterMode !== store.original?.spatialFilterMode
)

watch(isDirty, value => emit('dirty-change', value), { immediate: true })

async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original || !draft.uuid) return

  store.saving = true
  store.error = null

  try {
    await apiFetch(`/api/admin/portal/${draft.uuid}/fields`, {
      method: 'PUT',
      body: JSON.stringify({ spatial_filter_mode: draft.spatialFilterMode }),
    })

    original.spatialFilterMode = draft.spatialFilterMode
  } catch (err) {
    store.error = t('failed_to_save_portal')
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  if (!store.draft || !store.original) return
  store.draft.spatialFilterMode = store.original.spatialFilterMode
}

defineExpose({
  commitTab,
})
</script>

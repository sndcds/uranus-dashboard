<template>
  <UranusForm>
    <UranusFormRow>
      <UranusTextarea
          id="portal-prefilter"
          v-model="jsonText"
          :label="t('portal_prefilter')"
          height="360px"
          resize="vertical"
          :error="jsonError"
      />
    </UranusFormRow>

    <UranusFormActions>
      <UranusButton @click="resetTab" :disabled="store.saving || !isDirty">
        {{ t('discard') }}
      </UranusButton>
      <UranusButton @click="commitTab" :disabled="store.saving || !isDirty || !!jsonError">
        {{ t('save') }}
      </UranusButton>
    </UranusFormActions>
  </UranusForm>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useUranusPortalStore } from '@/store/portalStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusTextarea from '@/component/ui/UranusTextarea.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusPortalStore()

const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()

const jsonText = ref(formatJson(store.draft?.prefilter ?? null))

const jsonError = computed(() => {
  if (!jsonText.value.trim()) return ''
  try {
    const parsed = JSON.parse(jsonText.value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? ''
        : t('portal_json_object_required')
  } catch {
    return t('portal_invalid_json')
  }
})

const originalText = computed(() => formatJson(store.original?.prefilter ?? null))
const isDirty = computed(() => normalizeJsonText(jsonText.value) !== normalizeJsonText(originalText.value))

watch(isDirty, value => emit('dirty-change', value), { immediate: true })

function formatJson(value: Record<string, unknown> | null) {
  return value ? JSON.stringify(value, null, 2) : ''
}

function normalizeJsonText(value: string) {
  return value.trim()
}

function parseJsonOrNull() {
  if (!jsonText.value.trim()) return null
  return JSON.parse(jsonText.value) as Record<string, unknown>
}

async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original || !draft.uuid || jsonError.value) return

  store.saving = true
  store.error = null

  try {
    const prefilter = parseJsonOrNull()
    await apiFetch(`/api/admin/portal/${draft.uuid}/fields`, {
      method: 'PUT',
      body: JSON.stringify({ prefilter }),
    })

    draft.prefilter = prefilter
    original.prefilter = prefilter ? JSON.parse(JSON.stringify(prefilter)) : null
    jsonText.value = formatJson(original.prefilter)
  } catch (err) {
    store.error = t('failed_to_save_portal')
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  jsonText.value = originalText.value
  if (store.draft && store.original) {
    store.draft.prefilter = store.original.prefilter
        ? JSON.parse(JSON.stringify(store.original.prefilter))
        : null
  }
}
</script>

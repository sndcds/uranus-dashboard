<template>
  <UranusForm>
    <UranusFormRow>
      <UranusTextfield
          id="portal-name"
          v-model="portal.name"
          size="big"
          :label="t('name')"
          required
      />
    </UranusFormRow>

    <UranusFormRow>
      <UranusTextarea
          id="portal-description"
          v-model="descriptionModel"
          :label="t('description')"
          height="160px"
          resize="vertical"
      />
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
import type { PortalModel } from '@/domain/portal/portal.model.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusTextarea from '@/component/ui/UranusTextarea.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusPortalStore()
const portal = computed(() => store.draft!)

const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()

const descriptionModel = computed({
  get: () => portal.value.description ?? '',
  set: (value: string | undefined) => {
    portal.value.description = value?.trim() ? value : null
  }
})

const normalize = (value: string | null | undefined) => value === '' || value == null ? null : value

const isDirty = computed(() => {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return false

  return (
      normalize(draft.name) !== normalize(original.name) ||
      normalize(draft.description) !== normalize(original.description)
  )
})

watch(isDirty, value => {
  emit('dirty-change', value)
}, { immediate: true })

function buildPayload(draft: PortalModel, original: PortalModel) {
  const payload: Record<string, unknown> = {}

  if (draft.name !== original.name) payload.name = draft.name
  if (draft.description !== original.description) {
    payload.description = draft.description === '' ? null : draft.description
  }

  return payload
}

function copyFields(source: PortalModel, target: PortalModel) {
  target.name = source.name ?? ''
  target.description = source.description ?? null
}

async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original || !draft.uuid) return

  store.saving = true
  store.error = null

  try {
    const payload = buildPayload(draft, original)
    if (Object.keys(payload).length === 0) return

    await apiFetch(`/api/admin/portal/${draft.uuid}/fields`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    copyFields(draft, original)
  } catch (err) {
    store.error = t('failed_to_save_portal')
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original) return
  copyFields(original, draft)
}
</script>

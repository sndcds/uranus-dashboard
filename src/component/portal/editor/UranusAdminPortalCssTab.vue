<template>
  <UranusForm>
    <section class="portal-css-group">
      <h2>CSS</h2>
      <UranusTextarea
          id="portal-style-custom-css"
          v-model="customCss"
          label="CSS"
          height="420px"
          resize="vertical"
          spellcheck="false"
      />
    </section>

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
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useUranusPortalStore } from '@/store/portalStore.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusTextarea from '@/component/ui/UranusTextarea.vue'

const { t } = useI18n({ useScope: 'global' })
const store = useUranusPortalStore()

const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()

const customCss = ref(readCustomCss(store.draft?.style))
const originalCustomCss = computed(() => readCustomCss(store.original?.style))
const isDirty = computed(() => customCss.value !== originalCustomCss.value)

watch(isDirty, value => emit('dirty-change', value), { immediate: true })

function readCustomCss(style: Record<string, unknown> | null | undefined) {
  const value = style?.['custom-css']
  return typeof value === 'string' ? value : ''
}

function cloneStyle(style: Record<string, unknown> | null | undefined) {
  return style ? JSON.parse(JSON.stringify(style)) as Record<string, unknown> : {}
}

async function commitTab() {
  const draft = store.draft
  const original = store.original
  if (!draft || !original || !draft.uuid || !isDirty.value) return

  store.saving = true
  store.error = null

  try {
    const style = cloneStyle(draft.style)
    style['custom-css'] = customCss.value

    await apiFetch(`/api/admin/portal/${draft.uuid}/style`, {
      method: 'PUT',
      body: JSON.stringify(style),
    })

    draft.style = JSON.parse(JSON.stringify(style))
    original.style = JSON.parse(JSON.stringify(style))
  } catch (err) {
    store.error = t('failed_to_save_portal')
    console.error(err)
  } finally {
    store.saving = false
  }
}

function resetTab() {
  customCss.value = originalCustomCss.value
}

defineExpose({
  commitTab,
})
</script>

<style scoped>
.portal-css-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.portal-css-group h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}
</style>

<!--
  UranusEditEventTags.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('event_tags')"
        :edit-button-text="t('edit')"
        @edit-started="startEdit"
    />
    <UranusTagManager
        v-model:tags="draft.tags"
        :isSaving="isSaving"
        :error="error"
        :empty-label="t('tag_no_tags')"
        :add-placeholder="t('tag_select_placeholder')"
        :add-button-label="t('tag_selector_add')"
        :save-label="t('save')"
        :cancel-label="t('cancel')"
        :saving-label="t('saving')"
        :is-editing="isEditing"
        @save="save"
        @cancel="cancelEdit"
    />

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, type Ref } from 'vue'
import { apiFetch } from "@/api.ts"
import { useI18n } from "vue-i18n"

import { type UranusEventDetail } from "@/model/uranusEventModel.ts"
import UranusInlineEditSection from "@/component/ui/UranusInlineEditSection.vue"
import UranusInlineEditLabel from "@/component/ui/UranusInlineEditLabel.vue"
import UranusInlineSectionLayout from "@/component/ui/UranusInlineSectionLayout.vue"
import UranusTagManager from "@/component/ui/UranusTagManager.vue"

const { t } = useI18n({ useScope: 'global' })

const event = inject<Ref<UranusEventDetail | null>>('event')
const eventId = computed(() => event?.value?.eventId)
const isEditing = ref(false)
const isSaving = ref(false)
const forceRerender = ref(0)

const draft = reactive({
  tags: event?.value?.tags ? [...event.value.tags] : [] as string[]
})

const props = defineProps<{
  titleError?: string | null
}>()

// Validation (simple example)
const error = computed(() => '')

// --- Editing control ---
function startEdit() {
  updateDraft()
  isEditing.value = true
}

function cancelEdit() {
  updateDraft()
  isEditing.value = false
}

// Copy latest from parent event
function updateDraft() {
  if (!event?.value) return
  draft.tags = event.value.tags ? [...event.value.tags] : []
}

// --- Save handler ---
async function save(tags: string[]) {
  if (!event?.value) return
  isSaving.value = true

  try {
    const payload = { tags }
    await apiFetch(`/api/admin/event/${eventId.value}/fields`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    // Update parent event
    event.value.tags = [...tags]
    updateDraft()
    forceRerender.value++
  } catch (err) {
    console.error('Failed to save event tags', err)
  } finally {
    isSaving.value = false
    isEditing.value = false
  }
}
</script>
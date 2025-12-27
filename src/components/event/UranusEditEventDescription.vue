<!--
  UranusEditEventDescription.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('description')"
        :edit-button-text="t('edit')"
        @edit-started="startEdit"
    />

    <!-- Edit form -->
    <UranusInlineSectionLayout v-if="isEditing">

      <MarkdownEditorComponent
          ref="markdownEditorRef"
          v-model="draft.description"
      />

      <UranusInlineEditActions
          :isSaving="isSaving"
          :canSave="canSave"
          @save="save"
          @cancel="cancelEdit"
      />

    </UranusInlineSectionLayout>

    <!-- Read-only display -->
    <div v-else>
      <MarkdownPreviewComponent v-if="draft.description" :value="draft.description" />
    </div>

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import {ref, reactive, computed, inject, type Ref, nextTick} from 'vue'
import {apiFetch} from "@/api.ts";
import {useI18n} from "vue-i18n";

import type {UranusEventDetail} from "@/models/UranusEventModel.ts";
import UranusCard from "@/components/ui/UranusCard.vue";
import UranusInlineEditSection from "@/components/ui/UranusInlineEditSection.vue";
import UranusInlineEditLabel from "@/components/ui/UranusInlineEditLabel.vue";
import UranusInlineEditActions from "@/components/ui/UranusInlineEditActions.vue";
import UranusInlineSectionLayout from "@/components/ui/UranusInlineSectionLayout.vue";
import UranusTextInput from "@/components/ui/UranusTextInput.vue";
import MarkdownEditorComponent from "@/components/MarkdownEditorComponent.vue";
import MarkdownPreviewComponent from "@/components/MarkdownPreviewComponent.vue";

const markdownEditorRef = ref()

const { t } = useI18n({ useScope: 'global' })

const event = inject<Ref<UranusEventDetail | null>>('event')
const eventId = computed(() => event?.value?.eventId)
const isEditing = ref(false)
const isSaving = ref(false)
const canSave = computed(() => { return !descriptionError.value && !isSaving.value })

const draft = reactive({
  description: event?.value?.description ?? '',
})

const props = defineProps<{
  descriptionError?: string | null
}>()

// Validation
const descriptionError = computed(() => {
  if (props.descriptionError) return props.descriptionError
  if (!draft.description || draft.description.trim() === '') {
    return t('event_description_required');
  }
  return ''
})

async function startEdit() {
  if (!event?.value) return
  draft.description = event.value.description ?? ""
  isEditing.value = true

  await nextTick()
  markdownEditorRef.value?.focus()
}

function cancelEdit() {
  if (!event?.value) return
  draft.description = event.value.description ?? ""
  isEditing.value = false
}

async function save() {
  if (!event?.value) return
  isSaving.value = true

  draft.description = draft.description.trim()
  if (!draft.description) {
    console.log("Descriptions is empty!") // TODO: Error handling!
  }

  try {
    await apiFetch(`/api/admin/event/${eventId.value}/description`, {
      method: 'PUT',
      body: JSON.stringify({
        description: draft.description,
      }),
    })

    // Disable edit mode and update the reactive event directly
    isEditing.value = false
    event.value.description = draft.description

  } catch (err) {
    console.error('Failed to update description', err)
  } finally {
    isSaving.value = false
  }

  isEditing.value = false
}
</script>
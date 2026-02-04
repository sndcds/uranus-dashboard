<!--
  UranusEditEventTitle.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('title')"
        :edit-button-text="t('edit')"
        @edit-started="onStartEdit"
    />

    <!-- Edit form -->
    <UranusInlineSectionLayout v-if="isEditing">

      <UranusTextInput
          id="titleId"
          v-model.trim="draft.title"
          :label="t('title')"
          :error="titleError"
          size="big"
          required
      />

      <UranusTextInput
          id="subtitleId"
          v-model.trim="draft.subtitle"
          :label="t('subtitle')"
      />

      <UranusInlineEditActions
          :isSaving="isSaving"
          :canSave="canSave"
          @save="onSave"
          @cancel="onCancel"
      />

    </UranusInlineSectionLayout>

    <!-- Read-only display -->
    <div v-else>
      <h1 class="font-bold text-lg">{{ event?.title }}</h1>
      <h3>{{ event?.subtitle }}</h3>
    </div>

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import {ref, reactive, computed, inject, type Ref} from 'vue'
import {apiFetch} from "@/api.ts";
import {useI18n} from "vue-i18n";

import type {UranusEventDetail} from "@/model/uranusAdminEventModel.ts";
import UranusInlineEditSection from "@/component/ui/UranusInlineEditSection.vue";
import UranusInlineEditLabel from "@/component/ui/UranusInlineEditLabel.vue";
import UranusInlineEditActions from "@/component/ui/UranusInlineEditActions.vue";
import UranusInlineSectionLayout from "@/component/ui/UranusInlineSectionLayout.vue";
import UranusTextInput from "@/component/ui/UranusTextInput.vue";

const { t } = useI18n({ useScope: 'global' })

const event = inject<Ref<UranusEventDetail | null>>('event')
const eventId = computed(() => event?.value?.id)
const isEditing = ref(false)
const isSaving = ref(false)
const canSave = computed(() => { return !titleError.value && !isSaving.value })

const draft = reactive({
  title: event?.value?.title ?? '',
  subtitle: event?.value?.subtitle ?? '',
})

const props = defineProps<{
  titleError?: string | null
}>()

// Validation
const titleError = computed(() => {
  if (props.titleError) return props.titleError
  if (!draft.title || draft.title.trim() === '') {
    return t('input_required')
  }
  return ''
})

function onStartEdit() {
  if (!event?.value) return
  draft.title = event.value.title
  draft.subtitle = event.value.subtitle ?? ''
  isEditing.value = true
}

function onCancel() {
  console.log("..................")
  if (!event?.value) return
  draft.title = event.value.title
  draft.subtitle = event.value.subtitle ?? ''
  isEditing.value = false
}

async function onSave() {
  if (!event?.value) return
  isSaving.value = true

  draft.title = draft.title.trim()
  if (!draft.title) {
    console.log("Title is empty!") // TODO: Error handling!
  }
  draft.subtitle = draft.subtitle.trim()

  try {
    await apiFetch(`/api/admin/event/${eventId.value}/header`, {
      method: 'PUT',
      body: JSON.stringify({
        title: draft.title,
        subtitle: draft.subtitle || null,
      }),
    })

    // Disable edit mode and update the reactive event directly
    isEditing.value = false
    event.value.title = draft.title
    event.value.subtitle = draft.subtitle

  } catch (err) {
    console.error('Failed to update header', err)
  } finally {
    isSaving.value = false
  }

  isEditing.value = false
}
</script>
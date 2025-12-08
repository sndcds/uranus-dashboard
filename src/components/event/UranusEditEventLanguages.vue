<!--
  UranusEditEventLanguages.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('event_languages')"
        :edit-button-text="t('edit')"
        @edit-started="startEdit"
    />

    <!-- Edit form -->
    <UranusInlineSectionLayout v-if="isEditing">
      <UranusMultiLanguageSelect
          v-model="draft.languages"
      />

      <UranusInlineEditActions
          :isSaving="isSaving"
          :canSave="canSave"
          @save="save"
          @cancel="cancelEdit"
      />
    </UranusInlineSectionLayout>

    <UranusEventLanguageChips
        v-else
        :key="forceRerender"
        :items="draft.languages"
    />

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, type Ref } from 'vue'
import { apiFetch } from "@/api.ts";
import { useI18n } from "vue-i18n";

import {type UranusEventDetail, type UranusEventType, uranusSortEventTypes} from "@/models/UranusEventModel.ts";
import UranusCard from "@/components/ui/UranusCard.vue";
import UranusInlineEditSection from "@/components/ui/UranusInlineEditSection.vue";
import UranusInlineEditLabel from "@/components/ui/UranusInlineEditLabel.vue";
import UranusInlineEditActions from "@/components/ui/UranusInlineEditActions.vue";
import UranusInlineSectionLayout from "@/components/ui/UranusInlineSectionLayout.vue";
import UranusEventTypeSelect from "@/components/event/UranusEventTypeSelect.vue";
import UranusEventTypeChips from "@/components/event/UranusEventTypeChips.vue";
import UranusEventLanguageChips from "@/components/event/UranusEventLanguageChips.vue";
import UranusLanguageSelect from "@/components/selects/UranusLanguageSelect.vue";
import UranusMultiLanguageSelect from "@/components/selects/UranusMultiLanguageSelect.vue";

const { t } = useI18n({ useScope: 'global' })

const event = inject<Ref<UranusEventDetail | null>>('event')
const eventId = computed(() => event?.value?.eventId)
const isEditing = ref(false)
const isSaving = ref(false)
const canSave = computed(() => { return !error.value && !isSaving.value })

const forceRerender = ref(0)

const draft = reactive({
  languages: event?.value?.languages ? [...event.value.languages] : []
})

const props = defineProps<{
  titleError?: string | null
}>()

// Validation
const error = computed(() => {
  return ''
})

function startEdit() {
  updateDraft()
  isEditing.value = true
}

function cancelEdit() {
  updateDraft()
  isEditing.value = false
}

function updateDraft() {
  if (!event?.value) return
  draft.languages = event.value.languages ? [...event.value.languages] : []
  console.log("languages: ", JSON.stringify(event.value.languages, null, 2))
}

async function save() {
  if (!event?.value) return
  isSaving.value = true

  try {
    // Payload is just the languages array
    const payload = { languages: draft.languages }

    // Send to server
    await apiFetch(`/api/admin/event/${eventId.value}/languages`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    // Sync back to parent event
    event.value.languages = [...draft.languages] // shallow copy to trigger reactivity

    // Optional: update draft to stay in sync
    updateDraft()

    // Force re-render if needed
    forceRerender.value++

  } catch (err) {
    console.error('Failed to save event languages', err)
  } finally {
    isSaving.value = false
    isEditing.value = false
  }
}

const normalizeId = (value: number | string | null | undefined): number | null => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

</script>

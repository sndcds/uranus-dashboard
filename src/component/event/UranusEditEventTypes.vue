<!--
  UranusEditEventTypes.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('event_type')"
        :edit-button-text="t('edit')"
        @edit-started="startEdit"
    />

    <!-- Edit form -->
    <UranusInlineSectionLayout v-if="isEditing">

      <UranusEventTypeSelect v-model="draft.eventTypes" />

      <UranusInlineEditActions
          :isSaving="isSaving"
          :canSave="canSave"
          @save="save"
          @cancel="cancelEdit"
      />
    </UranusInlineSectionLayout>

      <!-- Read-only display -->
    <div v-else :key="forceRerender">
      <UranusEventTypeChips
          :items="draft.eventTypes"
      />
    </div>

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, type Ref } from 'vue'
import { apiFetch } from "@/api.ts";
import { useI18n } from "vue-i18n";
import { type UranusAdminEvent } from "@/composable/useAdminEvent.ts";

import { uranusSortEventTypes} from "@/model/uranusEventModel.ts";
import UranusInlineEditSection from "@/component/ui/UranusInlineEditSection.vue";
import UranusInlineEditLabel from "@/component/ui/UranusInlineEditLabel.vue";
import UranusInlineEditActions from "@/component/ui/UranusInlineEditActions.vue";
import UranusInlineSectionLayout from "@/component/ui/UranusInlineSectionLayout.vue";
import UranusEventTypeSelect from "@/component/event/UranusEventTypeSelect.vue";
import UranusEventTypeChips from "@/component/event/UranusEventTypeChips.vue";

const { t } = useI18n({ useScope: 'global' })

const event = inject<Ref<UranusAdminEvent | null>>('event')
const eventId = computed(() => event?.value?.id)
const isEditing = ref(false)
const isSaving = ref(false)
const canSave = computed(() => { return !error.value && !isSaving.value })

const forceRerender = ref(0)

const draft = reactive({
  eventTypes: event?.value?.eventTypes ? [...event.value.eventTypes] : []
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
  draft.eventTypes = event.value.eventTypes?.map(et => ({
    typeId: et.typeId,
    genreId: et.genreId,
  })) ?? []
}

async function save() {
  if (!event?.value) return
  isSaving.value = true

  try {
    const payload = draft.eventTypes
        .map((item) => ({
          type_id: normalizeId(item.typeId),
          genre_id: normalizeId(item.genreId),
        }))
        .filter(
            (pair): pair is { type_id: number; genre_id: number | null } =>
                pair.type_id !== null
        )
    await apiFetch(`/api/admin/event/${eventId.value}/types`, {
      method: 'PUT',
      body: JSON.stringify({ types: payload }),
    })

    // Sync draft back to the parent event
    event.value.eventTypes = uranusSortEventTypes(draft.eventTypes).map(et => ({ ...et }))
    updateDraft()
    forceRerender.value++

  } catch (err) {
    console.error('Failed to save event type', err)
  } finally {
  }

  isSaving.value = false
  isEditing.value = false
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

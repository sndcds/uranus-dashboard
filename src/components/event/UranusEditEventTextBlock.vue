<!--
  UranusEditEventTextBlock.vue
-->

<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t(labelKey)"
        :edit-button-text="t('edit')"
        @edit-started="startEdit"
    />

    <!-- Edit form -->
    <UranusInlineSectionLayout v-if="isEditing">
      <UranusMarkdownEditor
          ref="editorRef"
          v-model="draftValue"
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
      <UranusMarkdownPreview
          v-if="currentValue"
          :value="currentValue"
      />
    </div>
  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, computed, inject, nextTick, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import type { UranusEventDetail } from '@/models/UranusEventModel.ts'
import UranusInlineEditSection from "@/components/ui/UranusInlineEditSection.vue";
import UranusInlineEditLabel from "@/components/ui/UranusInlineEditLabel.vue";
import UranusInlineSectionLayout from "@/components/ui/UranusInlineSectionLayout.vue";
import UranusMarkdownEditor from "@/components/uranus/UranusMarkdownEditor.vue";
import UranusInlineEditActions from "@/components/ui/UranusInlineEditActions.vue";
import UranusMarkdownPreview from "@/components/uranus/UranusMarkdownPreview.vue";


const { t } = useI18n({ useScope: 'global' })

// Props

type TextFields = 'description' | 'summary' | 'participationInfo' | 'meetingPoint'

const props = defineProps<{
  field: TextFields
  apiPath: string
  labelKey: string
  required?: boolean
  requiredErrorKey?: string
}>()

/*

const props = defineProps({
  field: {
    type: String as PropType<keyof UranusEventDetail>,
    required: true,
  },
  apiPath: {
    type: String,
    required: true,
  },
  labelKey: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  requiredErrorKey: {
    type: String,
    default: 'field_required',
  },
})
*/
// State

const event = inject<Ref<UranusEventDetail | null>>('event')!
const isEditing = ref(false)
const isSaving = ref(false)
const editorRef = ref()

const draftValue = ref('')

// Computed

const currentValue = computed(() => {
  return event.value?.[props.field] as string | undefined
})

const error = computed(() => {
  if (props.required && !draftValue.value.trim()) {
    return t(props.requiredErrorKey ?? 'field_required')
  }
  return ''
})

const canSave = computed(() => !error.value && !isSaving.value)

// Actions

async function startEdit() {
  if (!event.value) return
  draftValue.value = (event.value[props.field] as string) ?? ''
  isEditing.value = true

  await nextTick()
  editorRef.value?.focus()
}

function cancelEdit() {
  if (!event.value) return
  draftValue.value = (event.value[props.field] as string) ?? ''
  isEditing.value = false
}

async function save() {
  if (!event.value) return

  isSaving.value = true
  draftValue.value = draftValue.value.trim()

  try {
    await apiFetch(`/api/admin/event/${event.value.eventId}/${props.apiPath}`, {
      method: 'PUT',
      body: JSON.stringify({
        [props.apiPath.replace('-', '_')]: draftValue.value,
      }),
    })

    // Update reactive event
    event.value[props.field] = draftValue.value as any
    isEditing.value = false
  } catch (err) {
    console.error('Failed to update field', err)
  } finally {
    isSaving.value = false
  }
}
</script>
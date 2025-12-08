<template>
  <section class="todo-editor__card">
    <UranusTextInput
      :id="`${idPrefix}-title`"
      v-model="titleModel"
      :label="titleLabel"
      :placeholder="titlePlaceholder"
      :disabled="disabled"
      @keyup.escape="$emit('escape')"
    />

    <UranusFormRow class="todo-editor__row">
      <UranusFieldLabel :id="`${idPrefix}-description`" :label="descriptionLabel" class="todo-editor__label">
        <textarea
          :id="`${idPrefix}-description`"
          v-model="descriptionModel"
          class="uranus-text-input todo-editor__textarea"
          :placeholder="descriptionPlaceholder"
          rows="3"
          :disabled="disabled"
          @keyup.escape="$emit('escape')"
        />
      </UranusFieldLabel>
    </UranusFormRow>

    <UranusFormRow>
      <UranusDateInput
        :id="`${idPrefix}-due-date`"
        v-model="dueDateModel"
        :label="dueDateLabel"
        :disabled="disabled"
      />
    </UranusFormRow>

    <div v-if="error" class="todo-feedback todo-feedback--error">
      {{ error }}
    </div>
  </section>
</template>

<script setup lang="ts">
import UranusTextInput from '@/components/ui/UranusTextInput.vue'
import UranusFieldLabel from '@/components/ui/UranusFieldLabel.vue'
import UranusFormRow from '@/components/ui/UranusFormRow.vue'
import UranusDateInput from '@/components/ui/UranusDateInput.vue'

const props = withDefaults(
  defineProps<{
    idPrefix?: string
    titleLabel: string
    titlePlaceholder: string
    descriptionLabel: string
    descriptionPlaceholder: string
    dueDateLabel: string
    disabled?: boolean
    error?: string | null
  }>(),
  {
    idPrefix: 'todo',
    disabled: false,
    error: null,
  }
)

defineEmits<{
  (e: 'escape'): void
}>()

const titleModel = defineModel<string>('title', { required: true })
const descriptionModel = defineModel<string>('description', { required: true })
const dueDateModel = defineModel<string>('dueDate', { required: true })
</script>

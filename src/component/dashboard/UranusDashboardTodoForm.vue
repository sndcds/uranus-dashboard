<template>
  <section class="todo-editor__card">
    <UranusTextfield
      :id="`${idPrefix}-title`"
      v-model="titleModel"
      :label="titleLabel"
      :placeholder="titlePlaceholder"
      :disabled="disabled"
      @keyup.escape="$emit('escape')"
    />

    <UranusFormRow class="todo-editor__row">
      <UranusLabel :id="`${idPrefix}-description`" :label="descriptionLabel" class="todo-editor__label">
        <textarea
          :id="`${idPrefix}-description`"
          v-model="descriptionModel"
          class="uranus-input todo-editor__textarea"
          :placeholder="descriptionPlaceholder"
          rows="3"
          :disabled="disabled"
          @keyup.escape="$emit('escape')"
        />
      </UranusLabel>
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
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusDateInput from '@/component/ui/UranusDateInput.vue'

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
    locationError: null,
  }
)

defineEmits<{
  (e: 'escape'): void
}>()

const titleModel = defineModel<string>('title', { required: true })
const descriptionModel = defineModel<string>('description', { required: true })
const dueDateModel = defineModel<string>('dueDate', { required: true })
</script>

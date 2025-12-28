<template>
  <UranusModal
      :show="show"
      :title="t('edit_todo')"
      @close="onCancel"
  >
    <!-- BODY -->
    <form @submit.prevent="onSubmit">
      <UranusTextInput
          id="todo_title"
          v-model="form.title"
          :label="t('title')"
          required
      />

      <UranusTextarea
          id="todo_description"
          v-model="form.description"
          :label="t('description')"
      />

      <UranusTextInput
          id="todo_due_date"
          v-model="form.due_date"
          type="date"
          :label="t('due_date')"
      />

      <UranusCheckboxButton
          id="todo_completed"
          v-model="form.completed"
          :label="t('completed')"
      />

      <p v-if="error" class="form-feedback-error">{{ error }}</p>
    </form>

    <!-- ACTIONS -->
    <template #actions>
      <button
          type="button"
          class="uranus-button uranus-button--secondary"
          @click="onCancel"
          :disabled="saving"
      >
        {{ t('cancel') }}
      </button>

      <button
          type="submit"
          class="uranus-button uranus-button--primary"
          @click="onSubmit"
          :disabled="saving"
      >
        <span v-if="saving">{{ t('saving') }}...</span>
        <span v-else>{{ t('save') }}</span>
      </button>
    </template>
  </UranusModal>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusModal from '@/components/uranus/UranusModal.vue'
import UranusTextInput from '@/components/ui/UranusTextInput.vue'
import UranusTextarea from '@/components/ui/UranusTextarea.vue'
import UranusCheckboxButton from '@/components/ui/UranusCheckboxButton.vue'

interface Todo {
  todo_id: number
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
}

const props = defineProps<{
  show: boolean
  todo: Todo | null
}>()

const emit = defineEmits<{
  close: []
  updated: [todo: Todo]
}>()

const { t } = useI18n()

const saving = ref(false)
const error = ref('')

// Local form state (independent from parent)
const form = reactive({
  title: '',
  description: '',
  due_date: '',
  completed: false,
})

watch(
    () => props.show,
    (show) => {
      if (show && props.todo) {
        // Reset form to original todo whenever modal opens
        form.title = props.todo.title
        form.description = props.todo.description ?? ''
        form.due_date = props.todo.due_date?.slice(0, 10) ?? ''
        form.completed = props.todo.completed
        error.value = ''
      }
    },
    { immediate: true }
)

const onCancel = () => {
  error.value = ''
  emit('close')
}

const onSubmit = async () => {
  if (!props.todo) return

  saving.value = true
  error.value = ''

  try {
    const updatedTodo: Todo = {
      todo_id: props.todo.todo_id,
      title: form.title,
      description: form.description || null,
      due_date: form.due_date || null,
      completed: form.completed,
    }

    await apiFetch(`/api/admin/todo/${props.todo.todo_id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedTodo),
    })

    emit('updated', { ...updatedTodo }) // notify parent
    emit('close')
  } catch {
    error.value = t('failed_to_save_todo')
  } finally {
    saving.value = false
  }
}
</script>
<!--
  UranusEditTodoModal.vue
-->
<template>
  <UranusModal
      :show="show"
      :title="props.todo ? t('edit_todo') : t('add_todo')"
      :close-on-backdrop="false"
      @close="onCancel"
  >
    <!-- BODY -->
    <form class="uranus-form" @submit.prevent="onSubmit">
      <UranusFormRow>
        <UranusTextInput
            id="todo_title"
            v-model="form.title"
            :label="t('title')"
            required
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextarea
            id="todo_description"
            v-model="form.description"
            :label="t('description')"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextInput
            id="todo_due_date"
            v-model="form.due_date"
            type="date"
            :label="t('due_date')"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusCheckboxButton
            id="todo_completed"
            v-model="form.completed"
            :label="t('completed')"
        />
      </UranusFormRow>

      <p v-if="error" class="form-feedback-error">{{ error }}</p>
    </form>

    <template #actions>
      <button
          type="button"
          class="uranus-button uranus-cancel-button"
          @click="onCancel"
          :disabled="saving"
      >
        {{ t('cancel') }}
      </button>

      <button
          type="submit"
          class="uranus-button uranus-ok-button"
          @click="onSubmit"
          :disabled="saving"
      >
        <template v-if="saving">{{ t('saving') }}...</template>
        <template v-else>{{ t('save') }}</template>
      </button>
    </template>
  </UranusModal>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import UranusModal from '@/components/uranus/UranusModal.vue'
import UranusTextInput from '@/components/ui/UranusTextInput.vue'
import UranusTextarea from '@/components/ui/UranusTextarea.vue'
import UranusCheckboxButton from '@/components/ui/UranusCheckboxButton.vue'
import UranusFormRow from "@/components/ui/UranusFormRow.vue";

interface Todo {
  id: number
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
  saving.value = true
  error.value = ''

  try {
    const payload: Todo = {
      id: props.todo ? props.todo.id : -1,
      title: form.title,
      description: form.description || null,
      due_date: form.due_date || null,
      completed: form.completed,
    }

    const { data } = await apiFetch<{ id: number }>(`/api/admin/todo`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    if (props.todo) {
      payload.id = data.id;
    }

    emit('updated', { ...payload })
    emit('close')
  } catch {
    error.value = t('failed_to_save_todo')
  } finally {
    saving.value = false
  }
}
</script>
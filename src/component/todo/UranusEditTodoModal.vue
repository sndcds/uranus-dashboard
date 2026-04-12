<!--
  src/component/todo/UranusEditTodoModal.vue
-->

<template>
  <UranusModal
      :show="show"
      :title="props.todo ? t('edit_todo') : t('add_todo')"
      :close-on-backdrop="false"
      @close="onCancel"
  >
    <UranusForm @submit.prevent="onSubmit">
      <UranusFormRow>
        <UranusTextfield
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
        <UranusLabel id="todo_priority" :label="t('importance')">
          <UranusPrioritySelect v-model="form.importance" style="width: 100%;" />
        </UranusLabel>
      </UranusFormRow>


      <UranusFormRow>
        <UranusTextfield
            id="todo_due_date"
            v-model="form.due_date"
            type="date"
            :label="t('due_date')"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusCheckbox
            id="todo_completed"
            v-model="form.completed"
            :label="t('completed')"
        />
      </UranusFormRow>

      <UranusFeedback :show="!!error" type="error">
        {{ t(error) }}
      </UranusFeedback>

      <UranusFormActions>
        <UranusButton
            class="uranus-button uranus-cancel-button"
            @click="onCancel"
            :disabled="saving"
        >
          {{ t('cancel') }}
        </UranusButton>

        <UranusButton
            type="submit"
            class="uranus-button uranus-ok-button"
            @click="onSubmit"
            :disabled="saving"
        >
          <template v-if="saving">{{ t('saving') }}...</template>
          <template v-else>{{ t('save') }}</template>
        </UranusButton>
      </UranusFormActions>

    </UranusForm>

  </UranusModal>
</template>

<script setup lang="ts">
import { reactive, watch, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ApiError, apiFetch } from '@/api.ts'

import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusTextarea from '@/component/ui/UranusTextarea.vue'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusPrioritySelect from '@/component/ui/UranusPrioritySelect.vue'
import { type TodoDTO } from '@/model/uranusTodoModel.ts'
import UranusFormActions from "@/component/ui/UranusFormActions.vue";
import UranusLabel from "@/component/ui/UranusLabel.vue";


const props = defineProps<{
  show: boolean
  todo: TodoDTO | null
}>()

const emit = defineEmits<{
  close: []
  updated: [todo: TodoDTO]
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
  importance: 'mid' as 'low' | 'mid' | 'high',
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
        form.importance = (props.todo as TodoDTO).importance ?? 'mid'
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
    const payload: TodoDTO = {
      id: props.todo ? props.todo.id : -1,
      title: form.title,
      description: form.description || null,
      due_date: form.due_date || null,
      completed: form.completed,
      importance: form.importance,
    }

    const apiPath = `/api/admin/user/todo`
    const apiResonse = await apiFetch<TodoDTO>(apiPath, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    if (apiResonse.status !== 200) {
      throw new ApiError(apiResonse.message ?? '', apiResonse.status)
    }

    emit('updated', {...payload})
    emit('close')
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      error.value = err.error
    } else {
      error.value = t('failed_to_save_todo')
    }
  } finally {
    saving.value = false
  }
}

</script>
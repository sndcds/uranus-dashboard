<template>
  <UranusCard class="todo-list-item" :class="{ completed: todo.completed }">
    <div class="todo-main">
      <div class="title-wrapper">
        <span
            class="importance-indicator"
            :class="todo.importance"
            :title="t(todo.importance)"
        ></span>
        <div class="title">{{ todo.title }}</div>
      </div>

      <div v-if="todo.description" class="description" v-html="todo.description"></div>
      <div v-if="todo.due_date" class="due-date">{{ formattedDueDate }}</div>
    </div>

    <div class="todo-actions">
      <UranusIconAction
          mode="edit"
          :title="t('edit')"
          @click="openEdit"
      />
      <UranusIconAction
          mode="delete"
          :title="t('delete')"
          @click="requestDelete"
      />
    </div>

    <!-- Edit Modal -->
    <UranusEditTodoModal
        :show="showEditModal"
        :todo="todo"
        @close="showEditModal = false"
        @updated="onUpdated"
    />

    <!-- Delete Modal -->
    <UranusPasswordConfirmModal
        :show="showDeleteModal"
        :title="t('confirm_delete_todo')"
        :question="t('confirm_delete_todo_description', { name: todo.title })"
        :confirm-text="t('delete')"
        :loading-text="t('deleting')"
        :error="deleteError"
        :is-submitting="isDeleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />
  </UranusCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import UranusIconAction from '@/component/ui/UranusIconAction.vue'
import UranusEditTodoModal from '@/component/todo/UranusEditTodoModal.vue'
import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import { type UranusTodoDTO } from '@/model/uranusTodoModel.ts'

const props = defineProps<{ todo: UranusTodoDTO }>()
const emit = defineEmits<{
  updated: [todo: UranusTodoDTO]
  deleted: [todoId: number]
}>()

const { t } = useI18n()

const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)

const formattedDueDate = computed(() => {
  if (!props.todo.due_date) return ''
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(props.todo.due_date))
})

const openEdit = () => { showEditModal.value = true }

const onUpdated = (updatedTodo: UranusTodoDTO) => {
  showEditModal.value = false
  emit('updated', { ...updatedTodo })
}

const requestDelete = () => {
  deleteError.value = ''
  showDeleteModal.value = true
}

const cancelDelete = () => {
  deleteError.value = ''
  showDeleteModal.value = false
}

const confirmDelete = async ({ password }: { password: string }) => {
  isDeleting.value = true
  deleteError.value = ''

  try {
    await apiFetch(`/api/admin/user/todo/${props.todo.id}`, {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    })
    emit('deleted', props.todo.id)
    cancelDelete()
  } catch {
    deleteError.value = t('failed_to_delete_todo')
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped>
.todo-list-item {
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
  padding: 0.75rem 1rem;
  background: var(--uranus-card-bg);
  border-radius: 6px;
}

.todo-list-item.completed {
  opacity: 0.6;
  text-decoration: line-through;
}

.todo-main {
  display: flex;
  flex-direction: column;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.importance-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.importance-indicator.low { background-color: var(--uranus-low-priority_color, #34d399); }
.importance-indicator.medium { background-color: var(--uranus-medium-priority_color, #facc15); }
.importance-indicator.high { background-color: var(--uranus-high-priority_color, #f87171); }

.title {
  font-weight: 500;
}

.description {
  font-size: 0.9rem;
  color: var(--uranus-color);
  margin-top: 0.25rem;
}

.due-date {
  font-size: 0.85rem;
  color: var(--uranus-color);
}

.todo-actions {
  display: flex;
  gap: 0.5rem;
}
</style>
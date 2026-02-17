<!--
  src/view/UranusDashboardTodosView.vue
-->

<template>
  <div class="uranus-main-layout" style="max-width: 1600px;">
    <UranusDashboardHero
        :title="t('todo_title')"
        :subtitle="t('todo_description')"
    />

    <!-- Empty State -->
    <UranusNotification
        v-if="!loading && !todos.length"
        type="info"
    >
      <template #title>{{ t('notification') }}</template>
      {{ t('todo_empty_message') }}
    </UranusNotification>

    <UranusDashboardActionBar>
      <UranusActionButton @click="openCreate">
        {{ t('add_todo') }}
      </UranusActionButton>
    </UranusDashboardActionBar>

    <!-- Error -->
    <div v-if="error" class="todo-dashboard-view__error">
      <p class="form-feedback-error">{{ error }}</p>
    </div>

    <!-- Todos -->
    <div class="todo-list" v-if="!loading && todos.length">
      <UranusTodoListItem
          v-for="todo in todos"
          :key="todo.id"
          :todo="todo"
          @updated="updateTodo"
          @deleted="deleteTodo"
      />
    </div>
  </div>

  <UranusEditTodoModal
      :show="showCreateModal"
      :todo="null"
      @close="showCreateModal = false"
      @updated="createTodo"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import UranusTodoListItem from '@/component/todo/UranusTodoListItem.vue'
import UranusDashboardActionBar from '@/component/uranus/UranusDashboardActionBar.vue'
import UranusEditTodoModal from '@/component/todo/UranusEditTodoModal.vue'
import UranusActionButton from '@/component/ui/UranusActionButton.vue'

const { t } = useI18n()

interface Todo {
  id: number
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
}

const todos = ref<Todo[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showCreateModal = ref(false)

onMounted(async () => {
  try {
    const { data } = await apiFetch<{ todos: Todo[] }>('/api/admin/user/todos')
    todos.value = data?.todos ?? []
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || 'Failed to load todos'
    } else {
      error.value = 'Unknown error'
    }
  } finally {
    loading.value = false
  }
})

const openCreate = () => {
  showCreateModal.value = true
}

const createTodo = (todo: Todo) => {
  todos.value = [todo, ...todos.value]
}

const updateTodo = (updated: Todo) => {
  console.log("What:", JSON.stringify(updated, null, 2))
  todos.value = todos.value.map(t =>
      t.id === updated.id ? { ...updated } : t
  )
}

const deleteTodo = (todoId: number) => {
  todos.value = todos.value.filter(t => t.id !== todoId)
}
</script>

<style scoped lang="scss">
.todo-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: var(--uranus-dashboard-content-width);
}

.todo-dashboard-view__error {
  max-width: 600px;
}
</style>
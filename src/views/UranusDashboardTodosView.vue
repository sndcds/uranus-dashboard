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
        :title="t('notification')"
        :text="t('todo_empty_message')"
    />

    <!-- Error -->
    <div v-if="error" class="todo-dashboard-view__error">
      <p class="form-feedback-error">{{ error }}</p>
    </div>

    <!-- Todos -->
    <div class="todo-list" v-if="!loading && todos.length">
      <UranusTodoListItem
          v-for="todo in todos"
          :key="todo.todo_id"
          :todo="todo"
          @updated="updateTodo"
          @deleted="deleteTodo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusDashboardHero from '@/components/dashboard/UranusDashboardHero.vue'
import UranusNotification from '@/components/ui/UranusNotification.vue'
import UranusTodoListItem from '@/components/todo/UranusTodoListItem.vue'

const { t } = useI18n()

interface Todo {
  todo_id: number
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
}

const todos = ref<Todo[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    const { data } = await apiFetch<{ todos: Todo[] }>('/api/admin/todos')
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

const updateTodo = (updated: Todo) => {
  console.log("What:", JSON.stringify(updated, null, 2))
  todos.value = todos.value.map(t =>
      t.todo_id === updated.todo_id ? { ...updated } : t
  )
}

const deleteTodo = (todoId: number) => {
  todos.value = todos.value.filter(t => t.todo_id !== todoId)
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
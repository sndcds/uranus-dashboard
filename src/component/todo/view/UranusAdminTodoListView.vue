<!--
  src/component/todo/view/UranusAdminTodoListView.vue

  todos - DTO data from API
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('todo_title')"
        :subtitle="t('todo_description')"
    />

    <UranusNotification v-if="!loading && !todos.length" type="info">
      <template #title>{{ t('notification') }}</template>
      {{ t('todo_empty_message') }}
    </UranusNotification>

    <div>
      <UranusButton @click="openCreate">
        {{ t('add_todo') }}
      </UranusButton>
    </div>

    <UranusFeedback v-if="error" type="error">
      {{ error }}
    </UranusFeedback>

    <div class="todo-list" v-if="!loading && todos.length">
      <UranusTodoCard
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
import UranusTodoCard from '@/component/todo/UranusTodoCard.vue'
import UranusEditTodoModal from '@/component/todo/UranusEditTodoModal.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import { type UranusTodoDTO } from '@/model/uranusTodoModel.ts'
import UranusFeedback from "@/component/uranus/UranusFeedback.vue";

const { t } = useI18n()

const todos = ref<UranusTodoDTO[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showCreateModal = ref(false)

onMounted(async () => {
  try {
    const { response } = await apiFetch<any>('/api/admin/user/todos')
    todos.value = response.data.todos ?? []
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || t('failed_to_load_todos')
    } else {
      error.value = t('unknown_error')
    }
  } finally {
    loading.value = false
  }
})

const openCreate = () => {
  showCreateModal.value = true
}

const createTodo = (todo: UranusTodoDTO) => {
  todos.value = [todo, ...todos.value]
}

const updateTodo = (updated: UranusTodoDTO) => {
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
</style>
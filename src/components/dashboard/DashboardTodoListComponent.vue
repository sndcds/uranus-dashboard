<template>
    <section class="uranus-card uranus-hover-section" aria-labelledby="dashboard-todo-heading">
        <div class="todo-panel__header">
            <h2 id="dashboard-todo-heading" class="todo-panel__title">
                {{ todoListTitle }}
            </h2>
            <button type="button" class="uranus-button" @click="startAddingTodo" :disabled="todoLoading">
                {{ addTodoLabel }}
            </button>
        </div>

        <transition name="fade">
            <p v-if="todoError" class="todo-feedback todo-feedback--error" role="alert" aria-live="assertive">
                {{ todoError }}
            </p>
        </transition>

        <ul class="todo-list" role="list" :aria-busy="todoLoading" :aria-label="todoListTitle">
            <li v-if="todoLoading" class="todo-list__loading">
                {{ loadingTodoLabel }}
            </li>
            <template v-else>
                <li v-if="todos.length === 0" class="todo-list__empty">
                    {{ todoEmptyLabel }}
                </li>
                <li v-for="todo in todos" :key="todo.todo_id">
                    <article class="todo-item">
                        <div class="todo-item__header">
                            <input type="checkbox" :id="`todo-${todo.todo_id}`" class="todo-item__checkbox"
                                :checked="Boolean(todo.completed)" @change="toggleTodo(todo)" :disabled="todoLoading" />
                            <label :for="`todo-${todo.todo_id}`" class="todo-item__label">
                                {{ todo.title }}
                            </label>
                        </div>
                        <p v-if="todo.description" class="todo-item__description">
                            {{ todo.description }}
                        </p>
                        <p v-if="todo.dueDate" class="todo-item__due-date">
                            {{ t('dashboard_todo_due') }}: {{ formatTodoDueDate(todo.dueDate) }}
                        </p>
                        <div class="todo-item__footer">
                            <button type="button" class="uranus-secondary-button uranus-inline-edit-button"
                                @click="startEditingTodo(todo)" :disabled="todoLoading" :aria-label="t('edit')">
                                {{ t('edit') }}
                            </button>
                            <button type="button"
                                class="uranus-secondary-button uranus-inline-edit-button todo-item__delete-button"
                                @click="deleteTodo(todo)" :disabled="todoLoading" :aria-label="t('delete')">
                                {{ t('delete') }}
                            </button>
                        </div>
                    </article>
                </li>
            </template>
        </ul>

        <div v-if="isEditingTodo || isAddingTodo" class="todo-editor uranus-card">
            <div class="todo-editor__form uranus-form">
                <UranusTextInput
                    id="todo-title"
                    v-model="todoDraft.title"
                    :label="todoTitleLabel"
                    :placeholder="todoTitlePlaceholder"
                    :disabled="todoSaving"
                    @keyup.escape="cancelEditingTodo"
                />

                <UranusFieldLabel
                    id="todo-description"
                    :label="todoDescriptionLabel"
                >
                    <textarea
                        id="todo-description"
                        v-model="todoDraft.description"
                        class="todo-editor__textarea"
                        :placeholder="todoDescriptionPlaceholder"
                        rows="3"
                        :disabled="todoSaving"
                        @keyup.escape="cancelEditingTodo"
                    />
                </UranusFieldLabel>

                <UranusDateInput
                    id="todo-due-date"
                    v-model="todoDraft.dueDate"
                    :label="todoDueDateLabel"
                    :disabled="todoSaving"
                />

                <div v-if="todoDraftError" class="todo-feedback todo-feedback--error">
                    {{ todoDraftError }}
                </div>

                <div class="todo-editor__actions">
                    <button type="button" class="uranus-inline-cancel-button" @click="cancelEditingTodo"
                        :disabled="todoSaving">
                        {{ t('form_cancel') }}
                    </button>
                    <button type="button" class="uranus-inline-save-button" @click="saveTodo"
                        :disabled="todoSaving || !todoDraft.title.trim()">
                        <span v-if="!todoSaving">{{ t('form_save') }}</span>
                        <span v-else>{{ t('form_saving') }}</span>
                    </button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusTextInput from '@/components/uranus/UranusTextInput.vue'
import UranusDateInput from '@/components/uranus/UranusDateInput.vue'
import UranusFieldLabel from '@/components/uranus/UranusFieldLabel.vue'

interface Todo {
    todo_id: number
    title: string
    description?: string | null
    completed: boolean
    dueDate?: string | null
    createdAt?: string | null
    updatedAt?: string | null
}

interface TodoDraft {
    title: string
    description: string
    dueDate: string
}

const { t } = useI18n()
const todos = ref<Todo[]>([])
const todoLoading = ref(false)
const todoError = ref<string | null>(null)
const todoSaving = ref(false)
const todoDraftError = ref<string | null>(null)
const isEditingTodo = ref(false)
const isAddingTodo = ref(false)
const currentEditingTodo = ref<Todo | null>(null)
const todoDraft = ref<TodoDraft>({ title: '', description: '', dueDate: '' })

const todoListTitle = computed(() => t('dashboard_todo_list_title'))
const addTodoLabel = computed(() => t('dashboard_todo_add'))
const loadingTodoLabel = computed(() => t('dashboard_todo_loading'))
const todoEmptyLabel = computed(() => t('dashboard_todo_empty'))
const todoTitleLabel = computed(() => t('dashboard_todo_title'))
const todoTitlePlaceholder = computed(() => t('dashboard_todo_title_placeholder'))
const todoDescriptionLabel = computed(() => t('dashboard_todo_description'))
const todoDescriptionPlaceholder = computed(() => t('dashboard_todo_description_placeholder'))
const todoDueDateLabel = computed(() => t('dashboard_todo_due_date'))
const todoErrorFallback = computed(() => t('dashboard_todo_error'))

const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed.length) {
            return null
        }
        const parsed = Number(trimmed)
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

const normalizeDateInput = (value: unknown): string => {
    if (typeof value !== 'string') {
        return ''
    }
    const trimmed = value.trim()
    if (!trimmed.length) {
        return ''
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed
    }
    const parsed = new Date(trimmed)
    if (!Number.isNaN(parsed.getTime())) {
        return parsed.toISOString().slice(0, 10)
    }
    return trimmed
}

const normalizeTodos = (payload: unknown): Todo[] => {
    const items: unknown[] = []

    if (Array.isArray(payload)) {
        items.push(...payload)
    } else if (payload && typeof payload === 'object') {
        const obj = payload as Record<string, unknown>
        if (Array.isArray(obj.messages)) {
            items.push(...obj.messages)
        } else if (Array.isArray(obj.todos)) {
            items.push(...obj.todos)
        } else if (Array.isArray(obj.data)) {
            items.push(...obj.data)
        }
    }

    const todos: Todo[] = []
    items.forEach((entry) => {
        if (!entry || typeof entry !== 'object') {
            return
        }

        const raw = entry as Record<string, unknown>
        const idCandidate = raw.todo_id ?? raw.id
        const titleCandidate = raw.title

        if (typeof idCandidate !== 'number' || typeof titleCandidate !== 'string') {
            return
        }

        const todo: Todo = {
            todo_id: idCandidate,
            title: titleCandidate,
            description: typeof raw.description === 'string' ? raw.description : null,
            completed: Boolean(raw.completed),
            dueDate: typeof raw.due_date === 'string' ? raw.due_date : null,
            createdAt: typeof raw.created_at === 'string' ? raw.created_at : null,
            updatedAt: typeof raw.updated_at === 'string' ? raw.updated_at : null,
        }

        todos.push(todo)
    })

    return todos
}

const loadTodos = async (): Promise<void> => {
    todoError.value = null
    todoLoading.value = true

    try {
        const { data } = await apiFetch<unknown>('/api/admin/todos')
        const normalizedTodos = normalizeTodos(data)
        todos.value = normalizedTodos
    } catch (err: unknown) {
        console.error('Error loading todos:', err)
        todoError.value = resolveTodoErrorMessage(err, todoErrorFallback.value)
        todos.value = []
    } finally {
        todoLoading.value = false
    }
}

const resolveTodoErrorMessage = (err: unknown, fallback: string): string => {
    if (typeof err === 'string' && err.trim().length > 0) {
        return err
    }

    if (err && typeof err === 'object') {
        const maybeError = err as { message?: unknown; data?: unknown }

        if (maybeError.data && typeof maybeError.data === 'object' && 'error' in (maybeError.data as Record<string, unknown>)) {
            const apiMessage = (maybeError.data as Record<string, unknown>).error
            if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
                return apiMessage
            }
        }

        if (typeof maybeError.message === 'string' && maybeError.message.trim().length > 0) {
            return maybeError.message
        }
    }

    return fallback
}

const formatTodoDueDate = (value: string | null | undefined): string => {
    if (!value) {
        return ''
    }

    try {
        const parsed = new Date(value)
        if (Number.isNaN(parsed.getTime())) {
            return value
        }

        return new Intl.DateTimeFormat(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        }).format(parsed)
    } catch {
        return value
    }
}

const startAddingTodo = () => {
    todoDraft.value = { title: '', description: '', dueDate: '' }
    todoDraftError.value = null
    isAddingTodo.value = true
    isEditingTodo.value = false
    currentEditingTodo.value = null
}

const startEditingTodo = (todo: Todo) => {
    currentEditingTodo.value = { ...todo }
    todoDraft.value = {
        title: todo.title,
        description: todo.description ?? '',
        dueDate: normalizeDateInput(todo.dueDate),
    }
    todoDraftError.value = null
    isEditingTodo.value = true
    isAddingTodo.value = false
}

const cancelEditingTodo = () => {
    isEditingTodo.value = false
    isAddingTodo.value = false
    todoDraft.value = { title: '', description: '', dueDate: '' }
    currentEditingTodo.value = null
    todoDraftError.value = null
}

const saveTodo = async (): Promise<void> => {
    const title = todoDraft.value.title.trim()
    const description = todoDraft.value.description.trim()

    if (!title) {
        todoDraftError.value = t('dashboard_todo_title_required')
        return
    }

    todoSaving.value = true
    todoDraftError.value = null

    try {
        const payload: Record<string, unknown> = {
            title,
            description: description || null,
        }

        if (todoDraft.value.dueDate) {
            payload.due_date = todoDraft.value.dueDate
        }

        if (isEditingTodo.value && currentEditingTodo.value) {
            const todoId = toNumberOrNull(currentEditingTodo.value.todo_id)

            if (todoId === null) {
                throw new Error('Invalid todo identifier')
            }

            await apiFetch(`/api/admin/todo/${todoId}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            })
        } else {
            await apiFetch('/api/admin/todo', {
                method: 'POST',
                body: JSON.stringify(payload),
            })
        }

        isEditingTodo.value = false
        isAddingTodo.value = false
        todoDraft.value = { title: '', description: '', dueDate: '' }
        currentEditingTodo.value = null
        await loadTodos()
    } catch (err: unknown) {
        console.error('Failed to save todo:', err)
        todoDraftError.value = resolveTodoErrorMessage(err, t('dashboard_todo_save_error'))
    } finally {
        todoSaving.value = false
    }
}

const toggleTodo = async (todo: Todo): Promise<void> => {
    todoError.value = null

    try {
        await apiFetch(`/api/admin/todo/${todo.todo_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                title: todo.title,
                description: todo.description || null,
                completed: !todo.completed,
            }),
        })

        todo.completed = !todo.completed
    } catch (err: unknown) {
        console.error('Failed to toggle todo:', err)
        todoError.value = resolveTodoErrorMessage(err, t('dashboard_todo_toggle_error'))
    }
}

const deleteTodo = async (todo: Todo): Promise<void> => {
    if (!confirm(t('dashboard_todo_delete_confirm'))) {
        return
    }

    todoError.value = null
    todoLoading.value = true

    try {
        await apiFetch(`/api/admin/todo/${todo.todo_id}`, {
            method: 'DELETE',
        })

        todos.value = todos.value.filter(t => t.todo_id !== todo.todo_id)
    } catch (err: unknown) {
        console.error('Failed to delete todo:', err)
        todoError.value = resolveTodoErrorMessage(err, t('dashboard_todo_delete_error'))
    } finally {
        todoLoading.value = false
    }
}

onMounted(() => {
    void loadTodos()
})

defineExpose({
    loadTodos,
})
</script>

<style scoped lang="scss">
.todo-panel__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 1rem;
}

.todo-panel__title {
    font-size: clamp(1.1rem, 2.2vw, 1.4rem);
    font-weight: 700;
    margin: 0;
    color: var(--uranus-color);
}

.todo-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.todo-list__loading,
.todo-list__empty {
    margin: 0;
    padding: 1rem;
    border-radius: 8px;
    color: var(--uranus-low-contrast-color);
    font-size: 0.95rem;
    text-align: center;
}

.todo-item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-radius: 8px;
    background: var(--uranus-bg-color);
    border: 1px solid var(--uranus-disabled-color);
    transition: all 0.2s ease;

    &:hover {
        border-color: var(--uranus-ia-color);
        box-shadow: 0 4px 12px rgba(0, 92, 230, 0.1);
    }
}

.todo-item__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.todo-item__checkbox {
    cursor: pointer;
    width: 1.2rem;
    height: 1.2rem;
    flex-shrink: 0;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.todo-item__label {
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    flex: 1;
    color: var(--uranus-color);
}

.todo-item__description {
    margin: 0;
    font-size: 0.85rem;
    color: var(--uranus-low-contrast-color);
    line-height: 1.4;
}

.todo-item__due-date {
    margin: 0;
    font-size: 0.8rem;
    color: var(--uranus-medium-contrast-color);
    font-weight: 500;
}

.todo-item__footer {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
}

.todo-item__delete-button {
    color: var(--uranus-error-color);
    border-color: rgba(243, 87, 73, 0.35);

    &:hover:not(:disabled) {
        background: rgba(243, 87, 73, 0.1);
        border-color: var(--uranus-error-color);
    }
}

.todo-editor {
    margin-top: 0.5rem;
    border-radius: 12px;
    border: 1px solid var(--uranus-low-contrast-color);
}

.todo-editor__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.todo-editor__form :deep(.uranus-label) {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--uranus-color);
}

.todo-editor__textarea {
    width: 100%;
    padding: 0.65rem 0.9rem;
    border: 1px solid var(--uranus-input-border-color);
    border-radius: var(--uranus-form-field-border-radius);
    background: var(--input-bg);
    color: var(--color-text);
    font-size: 0.95rem;
    font-family: inherit;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    resize: vertical;
    min-height: 96px;

    &:focus-visible {
        outline: none;
        border-color: var(--accent-primary);
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
    }

    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }
}

.todo-editor__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding-top: 0.5rem;
}

.todo-feedback {
    margin: 0;
    border-radius: 8px;
    padding: 0.85rem 1rem;
    text-align: left;
    font-weight: 600;
    font-size: 0.9rem;
}

.todo-feedback--error {
    color: #991b1b;
    background: rgba(254, 202, 202, 0.45);
    border: 1px solid rgba(248, 113, 113, 0.35);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 640px) {
    .todo-panel__header {
        flex-direction: column;
        align-items: stretch;
    }

    .uranus-inline-save-button {
        width: 100%;
        justify-content: center;
    }

    .todo-item {
        padding: 0.75rem;
    }
}
</style>

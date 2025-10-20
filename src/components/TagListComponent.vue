<template>
    <div class="tag-list" ref="containerRef">
        <ComboTagComponent
            v-for="option in selectedOptions"
            :key="option.id"
            :label="option.name"
            theme="light"
            @remove="remove(option.id)"
        />

        <button
            type="button"
            class="tag-picker"
            :disabled="!availableOptions.length"
            @click="toggleDropdown"
        >
            {{ placeholder }}
            <span class="caret" aria-hidden="true">▾</span>
        </button>

        <transition name="fade">
            <ul v-if="dropdownOpen" class="tag-dropdown" role="listbox">
                <li
                    v-for="option in availableOptions"
                    :key="option.id"
                    class="tag-dropdown__item"
                    @click="select(option.id)"
                >
                    {{ option.name }}
                </li>
                <li v-if="!availableOptions.length" class="tag-dropdown__empty">
                    {{ tNoMoreOptions }}
                </li>
            </ul>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import ComboTagComponent from './ComboTagComponent.vue'

interface Option {
    id: number
    name: string
}

const props = defineProps<{
    modelValue: number[]
    options: Option[]
    placeholder?: string
    emptyText?: string
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number[]): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const dropdownOpen = ref(false)

const internalValue = ref<number[]>([])
const { t } = useI18n({ useScope: 'global' })

watch(
    () => props.modelValue,
    (value) => {
        internalValue.value = Array.isArray(value) ? [...value] : []
    },
    { immediate: true, deep: true }
)

const optionsList = computed<Option[]>(() => (Array.isArray(props.options) ? props.options : []))

const selectedOptions = computed(() =>
    optionsList.value.filter((option) => internalValue.value.includes(option.id))
)

const availableOptions = computed(() =>
    optionsList.value.filter((option) => !internalValue.value.includes(option.id))
)

const placeholder = computed(() => props.placeholder || t('tag_select_placeholder'))
const tNoMoreOptions = computed(() => props.emptyText || t('tag_no_more_options'))

const select = (id: number) => {
    if (!internalValue.value.includes(id)) {
        const updated = [...internalValue.value, id]
        internalValue.value = updated
        emit('update:modelValue', updated)
    }
    dropdownOpen.value = false
}

const remove = (id: number) => {
    const updated = internalValue.value.filter((value) => value !== id)
    internalValue.value = updated
    emit('update:modelValue', updated)
}

const toggleDropdown = () => {
    if (!availableOptions.value.length) return
    dropdownOpen.value = !dropdownOpen.value
}

const handleClickOutside = (event: MouseEvent) => {
    if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
        dropdownOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    position: relative;
}

.tag-picker {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 6px 12px;
    border-radius: 999px;
    border: 1px solid rgba(79, 70, 229, 0.4);
    background-color: rgba(243, 244, 246, 0.5);
    color: #4f46e5;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.tag-picker:hover:not(:disabled) {
    background-color: rgba(79, 70, 229, 0.12);
}

.tag-picker:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.caret {
    font-size: 0.7rem;
}

.tag-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.4rem;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 12px 24px rgba(15, 23, 42, 0.18);
    padding: 0.4rem;
    list-style: none;
    min-width: 220px;
    max-height: 220px;
    overflow-y: auto;
    z-index: 20;
}

.tag-dropdown__item {
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease, color 0.2s ease;
}

.tag-dropdown__item:hover {
    background-color: rgba(79, 70, 229, 0.12);
    color: #4338ca;
}

.tag-dropdown__empty {
    padding: 0.6rem 0.75rem;
    border-radius: 8px;
    color: rgba(107, 114, 128, 0.9);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

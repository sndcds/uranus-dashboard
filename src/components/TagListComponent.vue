<template>
    <div class="tag-list" ref="containerRef" @mouseenter="isHovered = true" @mouseleave="isHovered = false">
        <ComboTagComponent
            v-for="option in selectedOptions"
            :key="option.id"
            :label="option.name"
            theme="light"
            @remove="remove(option.id)"
        />

        <div v-if="selectedOptions.length === 0" class="tag-placeholder">
            {{ t('tag_no_tags') }}
        </div>

        <input
            v-if="isHovered"
            type="text"
            class="tag-input"
            :placeholder="placeholder"
            v-model="searchQuery"
            @keydown.enter="addTag"
        />
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import ComboTagComponent from './ComboTagComponent.vue'

const props = defineProps<{
    modelValue: number[]
    placeholder?: string
    eventId: number
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: number[]): void
}>()

const containerRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const customTagNames = ref<Record<number, string>>({})
const isHovered = ref(false)

const internalValue = ref<number[]>([])
const { t } = useI18n({ useScope: 'global' })

const selectedOptions = computed(() => {
    return internalValue.value.map((id) => ({
        id,
        name: customTagNames.value[id] || ''
    }))
})

const placeholder = computed(() => props.placeholder || t('tag_select_placeholder'))

const addTag = async () => {
    if (searchQuery.value.trim() === '') return
    
    const tagName = searchQuery.value.trim()
    const customId = Math.min(...internalValue.value, 0) - 1
    
    if (!internalValue.value.includes(customId)) {
        const updated = [...internalValue.value, customId]
        internalValue.value = updated
        emit('update:modelValue', updated)
        
        // Store the custom tag name for display
        customTagNames.value[customId] = tagName
        
        // Save to API
        try {
            await apiFetch(`/api/admin/event/${props.eventId}/tags`, {
                method: 'PUT',
                body: JSON.stringify({
                    tags: updated.map(id => customTagNames.value[id] || '').filter(name => name)
                }),
            })
        } catch (err) {
            console.error('Failed to save tags', err)
        }
    }
    
    searchQuery.value = ''
}

const remove = async (id: number) => {
    const updated = internalValue.value.filter((value) => value !== id)
    internalValue.value = updated
    emit('update:modelValue', updated)
    
    // Clean up custom tag name if it exists
    delete customTagNames.value[id]
    
    // Save to API
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/tags`, {
            method: 'PUT',
            body: JSON.stringify({
                tags: updated.map(id => customTagNames.value[id] || '').filter(name => name)
            }),
        })
    } catch (err) {
        console.error('Failed to save tags', err)
    }
}
</script>

<style scoped lang="scss">
.tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    position: relative;
}

.tag-input {
    @include form-control();
    flex: 1;
    min-width: 180px;
}

.tag-placeholder {
    color: var(--muted-text);
    font-size: 0.9rem;
    font-style: italic;
    margin-right: 0.5rem;
}
</style>

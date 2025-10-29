<template>
    <TagManagerComponent
        class="event-tags-section"
        :tags="tags"
        :is-saving="isSaving"
        :error="error"
        :title="t('event_teaser_tags')"
        :edit-label="t('event_tags_edit')"
        :empty-label="t('tag_no_tags')"
        :add-placeholder="t('tag_select_placeholder')"
        :add-button-label="t('tag_selector_add')"
        :save-label="t('form_save')"
        :cancel-label="t('form_cancel')"
        :saving-label="t('form_saving')"
        @save="handleSave"
        @cancel="handleCancel"
    />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import TagManagerComponent from '@/components/TagManagerComponent.vue'

const props = defineProps<{
    eventId: number
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const tags = ref<string[]>([])
const isSaving = ref(false)
const error = ref('')

const normalizeTag = (value: string): string => value.replace(/\s+/g, ' ').trim()

const uniqueNormalized = (values: unknown[]): string[] =>
    Array.from(
        new Set(
            values
                .map((value) => (typeof value === 'string' ? normalizeTag(value) : normalizeTag(String(value ?? ''))))
                .filter((value) => value.length > 0)
        )
    )

const handleSave = async (draft: string[]) => {
    if (isSaving.value) return

    isSaving.value = true
    error.value = ''

    try {
        const payload = uniqueNormalized(draft)

        await apiFetch(`/api/admin/event/${props.eventId}/tags`, {
            method: 'PUT',
            body: JSON.stringify({ tags: payload }),
        })

        tags.value = [...payload]
        emit('updated')
    } catch (err) {
        console.error('Failed to save tags', err)
        error.value = t('event_links_save_error')
    } finally {
        isSaving.value = false
    }
}

const handleCancel = () => {
    error.value = ''
}

watch(
    () => props.eventId,
    () => {
        tags.value = []
    }
)

onMounted(() => {
    tags.value = []
})
</script>

<style scoped lang="scss">
.event-tags-section {
    width: 100%;
}
</style>

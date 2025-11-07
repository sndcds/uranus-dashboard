<template>
    <UranusInlineEditSection :active="isActive">
        <UranusInlineEditLabel
            :label-text="t('hashtags')"
            :edit-button-text="t('edit')"
            @edit-started="startEditing"
        />
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
            :is-editing="isActive"
            @save="handleSave"
            @cancel="handleCancel"
        />
</UranusInlineEditSection>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import TagManagerComponent from '@/components/TagManagerComponent.vue'
import UranusInlineEditSection from "@/components/uranus/UranusInlineEditSection.vue";
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue";

const props = defineProps<{
    eventId: number
    tags?: string[] | null
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const tags = ref<string[]>([])
const isActive = ref(false)
const isSaving = ref(false)
const error = ref('')

const normalizeTag = (value: string): string => value.replace(/\s+/g, ' ').trim()

const uniqueNormalized = (values: readonly unknown[] = []): string[] => {
    return Array.from(
        new Set(
            values
                .map((value) =>
                    typeof value === 'string'
                        ? normalizeTag(value)
                        : normalizeTag(String(value ?? ''))
                )
                .filter((value) => value.length > 0)
        )
    )
}

const applyTags = (incoming: readonly unknown[] | null | undefined) => {
    tags.value = uniqueNormalized(Array.isArray(incoming) ? incoming : [])
}

// --- Editing control ---
const startEditing = () => {
    isActive.value = true
}

const handleCancel = () => {
    error.value = ''
    applyTags(props.tags)
    isActive.value = false
}

const handleSave = async (draft: string[]) => {
    if (isSaving.value) return
    isSaving.value = true
    error.value = ''

    const payload = uniqueNormalized(draft)

    try {
        const response = await apiFetch<{ tags?: unknown[] }>(`/api/admin/event/${props.eventId}/tags`, {
            method: 'PUT',
            body: JSON.stringify({ tags: payload }),
        })

        const serverTags = Array.isArray(response.data?.tags) ? response.data?.tags : payload
        applyTags(serverTags)
        emit('updated')
    } catch (err) {
        console.error('Failed to save tags', err)
        error.value = t('event_links_save_error')
    } finally {
        isSaving.value = false
    }
}

watch(
    () => props.tags,
    (value) => {
        if (Array.isArray(value)) {
            applyTags(value)
        } else if (value == null) {
            applyTags([])
        }
    },
    { immediate: true }
)

onMounted(() => {
    applyTags(props.tags)
})
</script>

<style scoped lang="scss">
.event-tags-section {
    align-self: stretch;
    width: 100%;
}
</style>

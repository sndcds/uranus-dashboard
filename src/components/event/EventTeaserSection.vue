<template>
    <article class="event-teaser">
        <img class="event-teaser__image" :src="imageSrc" alt="Event teaser image" width="1200" height="200"
            loading="lazy" />
        <div class="event-teaser__content">
            <template v-if="isEditing">
                <MarkdownEditorComponent v-model="editedTeaser" class="event-teaser__markdown"
                    :placeholder="t('event_teaser_placeholder')" />
                <div class="event-teaser__actions">
                    <button type="button" class="event-teaser__button event-teaser__button--cancel"
                        @click="cancelEditing">
                        {{ t('event_teaser_cancel') }}
                    </button>
                    <button type="button" class="event-teaser__button" :disabled="isSaving" @click="saveTeaser">
                        <span v-if="!isSaving">{{ t('event_teaser_save') }}</span>
                        <span v-else>{{ t('saving') }}</span>
                    </button>
                </div>
            </template>
            <template v-else>
                <p class="event-teaser__text">
                    {{ teaserText || t('event_teaser_fallback') }}
                </p>
                <button type="button" class="event-teaser__edit" @click="startEditing">
                    {{ t('event_teaser_edit') }}
                </button>
            </template>
        </div>

        <div class="event-teaser__tags" :class="{ 'event-teaser__tags--editing': isEditingTags }">
            <header class="event-teaser__tags-header">
                <h4 class="event-teaser__subtitle">{{ t('event_teaser_tags') }}</h4>
                <button
                    v-if="!isEditingTags"
                    type="button"
                    class="event-teaser__tags-edit"
                    @click="startEditingTags"
                >
                    {{ t('event_tags_edit') }}
                </button>
            </header>

            <template v-if="isEditingTags">
                <div class="event-teaser__tags-editor">
                    <div class="event-teaser__tag-editor-list">
                        <span
                            v-for="(tag, index) in draftTags"
                            :key="`${tag}-${index}`"
                            class="event-teaser__tag-chip"
                        >
                            {{ tag }}
                            <button type="button" class="event-teaser__tag-remove" @click="removeDraftTag(index)">
                                ×
                            </button>
                        </span>
                        <span v-if="!draftTags.length" class="event-teaser__tags-empty">{{ t('tag_no_tags') }}</span>
                    </div>
                    <div class="event-teaser__tag-add">
                        <input
                            v-model="newTagName"
                            type="text"
                            class="event-teaser__tag-input"
                            :placeholder="t('tag_select_placeholder')"
                            @keydown.enter.prevent="addDraftTag"
                        />
                        <button type="button" class="event-teaser__tag-add-button" @click="addDraftTag">
                            {{ t('tag_selector_add') }}
                        </button>
                    </div>
                    <p v-if="tagsError" class="event-teaser__tags-error">{{ tagsError }}</p>
                    <div class="event-teaser__tags-actions">
                        <button
                            type="button"
                            class="event-teaser__button event-teaser__button--cancel"
                            @click="cancelEditingTags"
                        >
                            {{ t('event_tags_cancel') }}
                        </button>
                        <button
                            type="button"
                            class="event-teaser__button"
                            :disabled="isSavingTags"
                            @click="saveTags"
                        >
                            <span v-if="!isSavingTags">{{ t('event_tags_save') }}</span>
                            <span v-else>{{ t('saving') }}</span>
                        </button>
                    </div>
                </div>
            </template>
            <template v-else>
                <div v-if="savedTags.length" class="event-teaser__tag-list">
                    <span v-for="(tag, index) in savedTags" :key="`${tag}-${index}`" class="event-teaser__tag">
                        {{ tag }}
                    </span>
                </div>
                <p v-else class="event-teaser__tags-empty">{{ t('tag_no_tags') }}</p>
            </template>
        </div>
    </article>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'

const props = defineProps<{
    eventId: number
    teaserText: string | null
    hasMainImage?: boolean | null
    imageId?: number | null
    imageFocusX?: number | null
    imageFocusY?: number | null
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const isEditing = ref(false)
const isSaving = ref(false)
const editedTeaser = ref(props.teaserText ?? '')
const isEditingTags = ref(false)
const isSavingTags = ref(false)
const savedTags = ref<string[]>([])
const draftTags = ref<string[]>([])
const newTagName = ref('')
const tagsError = ref('')

const fallbackImageUrl = 'https://uranus2.oklabflensburg.de/api/image/47?mode=cover&width=400&ratio=3by2&focusx=0.5&focusy=0.5&type=webp&quality=90'
const apiBase = ((import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://uranus2.oklabflensburg.de')

const normalizeFocus = (value?: number | null): number => {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return 0.5
    }

    if (value > 1) {
        if (value >= 0 && value <= 1000) {
            return Math.min(Math.max(value / 1000, 0), 1)
        }
        return Math.min(Math.max(value, 0), 1)
    }

    if (value < 0) {
        return 0
    }

    return Math.min(Math.max(value, 0), 1)
}

const hasTeaserImage = computed(() => Boolean(props.hasMainImage && props.imageId != null))

const imageSrc = computed(() => {
    if (!hasTeaserImage.value) {
        return fallbackImageUrl
    }

    const focusX = normalizeFocus(props.imageFocusX).toFixed(3)
    const focusY = normalizeFocus(props.imageFocusY).toFixed(3)

    return `${apiBase}/api/image/${props.imageId}?mode=cover&width=400&ratio=3by2&focusx=${focusX}&focusy=${focusY}&type=webp&quality=90`
})

watch(
    () => props.teaserText,
    (value) => {
        if (!isEditing.value) {
            editedTeaser.value = value ?? ''
        }
    }
)

const startEditing = () => {
    editedTeaser.value = props.teaserText ?? ''
    isEditing.value = true
}

const cancelEditing = () => {
    editedTeaser.value = props.teaserText ?? ''
    isEditing.value = false
}

const normalizeTag = (value: string): string => value.replace(/\s+/g, ' ').trim()

const startEditingTags = () => {
    draftTags.value = [...savedTags.value]
    newTagName.value = ''
    tagsError.value = ''
    isEditingTags.value = true
}

const cancelEditingTags = () => {
    draftTags.value = []
    newTagName.value = ''
    tagsError.value = ''
    isEditingTags.value = false
}

const addDraftTag = () => {
    const normalized = normalizeTag(newTagName.value)
    if (!normalized) return

    if (!draftTags.value.includes(normalized)) {
        draftTags.value.push(normalized)
    }

    newTagName.value = ''
}

const removeDraftTag = (index: number) => {
    draftTags.value.splice(index, 1)
}

const saveTags = async () => {
    if (isSavingTags.value) return

    isSavingTags.value = true
    tagsError.value = ''

    try {
        const payload = Array.from(
            new Set(
                draftTags.value
                    .map((tag) => normalizeTag(tag))
                    .filter((tag) => tag.length > 0)
            )
        )

        await apiFetch(`/api/admin/event/${props.eventId}/tags`, {
            method: 'PUT',
            body: JSON.stringify({ tags: payload })
        })

        savedTags.value = [...payload]
        cancelEditingTags()
        emit('updated')
    } catch (err) {
        console.error('Failed to save tags', err)
        tagsError.value = t('event_links_save_error')
    } finally {
        isSavingTags.value = false
    }
}

const loadTags = async () => {
    try {
        const { data } = await apiFetch<unknown>(`/api/admin/event/${props.eventId}/tags`)
        let tags: unknown = data

        if (!Array.isArray(tags)) {
            if (tags && typeof tags === 'object' && 'tags' in (tags as Record<string, unknown>)) {
                tags = (tags as { tags?: unknown }).tags ?? []
            } else {
                tags = []
            }
        }

        savedTags.value = Array.from(
            new Set(
                (tags as unknown[])
                    .map((tag) => (typeof tag === 'string' ? normalizeTag(tag) : normalizeTag(String(tag))))
                    .filter((tag) => tag.length > 0)
            )
        )
    } catch (err) {
        console.error('Failed to load tags', err)
        savedTags.value = []
    }
}

watch(
    () => props.eventId,
    () => {
        void loadTags()
    }
)

const saveTeaser = async () => {
    isSaving.value = true
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/teaser`, {
            method: 'PUT',
            body: JSON.stringify({
                teaser_text: editedTeaser.value,
            }),
        })
        isEditing.value = false
        emit('updated')
    } catch (err) {
        console.error('Failed to update teaser', err)
    } finally {
        isSaving.value = false
    }
}

onMounted(() => {
    void loadTags()
})
</script>

<style scoped lang="scss">
.event-teaser {
    background: var(--card-bg);
    border-radius: 24px;
    padding: clamp(1.75rem, 3vw, 2.4rem);
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
}

.event-teaser__image {
    width: min(520px, 100%);
    border-radius: 20px;
    object-fit: cover;
}

.event-teaser__content {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

.event-teaser__text {
    margin: 0;
    color: var(--muted-text);
    font-size: 1.05rem;
    line-height: 1.6;
}

.event-teaser__edit {
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-teaser:hover .event-teaser__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-teaser__actions {
    align-self: stretch;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.event-teaser__markdown {
    align-self: stretch;
}

.event-teaser__button {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-teaser__button--cancel {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-teaser__tags {
    align-self: stretch;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    position: relative;
}

.event-teaser__tags-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.event-teaser__tags-edit {
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-teaser__tags:hover .event-teaser__tags-edit,
.event-teaser__tags--editing .event-teaser__tags-edit {
    opacity: 1;
    transform: translateY(0);
}

.event-teaser__tag-list {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
}

.event-teaser__tag,
.event-teaser__tag-chip {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.8rem;
    border-radius: 999px;
    background: rgba(79, 70, 229, 0.1);
    color: var(--color-text);
    font-size: 0.9rem;
}

.event-teaser__tag-editor-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.event-teaser__tag-remove {
    border: none;
    background: transparent;
    color: var(--muted-text);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0;
}

.event-teaser__tag-remove:hover {
    color: var(--color-text);
}

.event-teaser__tag-add {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.event-teaser__tag-input {
    @include form-control();
    flex: 1;
}

.event-teaser__tag-add-button {
    @include form-secondary-button($padding-y: 0.45rem, $padding-x: 1rem);
}

.event-teaser__tags-editor {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.event-teaser__tags-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.event-teaser__tags-empty {
    margin: 0;
    color: var(--muted-text);
    font-style: italic;
}

.event-teaser__tags-error {
    @include form-feedback-error();
    margin: 0;
}

.event-teaser__subtitle {
    margin: 0 0 0.75rem 0;
    color: var(--color-text);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.01em;
}
</style>

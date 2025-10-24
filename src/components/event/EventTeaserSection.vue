<template>
    <article class="event-teaser">
        <img
            class="event-teaser__image"
            src="https://uranus2.oklabflensburg.de/api/image/47?mode=cover&width=400&ratio=3by2&focusx=0.5&focusy=0.5&type=webp&quality=90"
            alt="Event teaser image"
            width="1200"
            height="200"
            loading="lazy"
        />
        <div class="event-teaser__content">
            <template v-if="isEditing">
                <MarkdownEditorComponent
                    v-model="editedTeaser"
                    :placeholder="t('event_teaser_placeholder')"
                />
                <div class="event-teaser__actions">
                    <button
                        type="button"
                        class="event-teaser__button event-teaser__button--cancel"
                        @click="cancelEditing"
                    >
                        {{ t('event_teaser_cancel') }}
                    </button>
                    <button
                        type="button"
                        class="event-teaser__button"
                        :disabled="isSaving"
                        @click="saveTeaser"
                    >
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

        <div>
            <h4 class="event-teaser__subtitle">{{ t('event_teaser_tags') }}</h4>
            <TagListComponent
                :model-value="selectedTagIds"
                :event-id="eventId"
                @update:model-value="updateTags"
            />
        </div>
    </article>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'
import TagListComponent from '@/components/TagListComponent.vue'

const props = defineProps<{
    eventId: number
    teaserText: string | null
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const isEditing = ref(false)
const isSaving = ref(false)
const editedTeaser = ref(props.teaserText ?? '')
const selectedTagIds = ref<number[]>([])

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

const updateTags = (tagIds: number[]) => {
    selectedTagIds.value = tagIds
}

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
</script>

<style scoped lang="scss">
.event-teaser {
    background: var(--card-bg);
    border-radius: 24px;
    padding: clamp(1.75rem, 3vw, 2.4rem);
    box-shadow: 0 24px 50px rgba(31, 41, 55, 0.12);
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
    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.18);
}

.event-teaser__content {
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
    display: flex;
    justify-content: center;
    gap: 0.75rem;
}

.event-teaser__button {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-teaser__button--cancel {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-teaser__subtitle {
    margin: 0 0 0.75rem 0;
    color: var(--color-text);
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.01em;
}
</style>

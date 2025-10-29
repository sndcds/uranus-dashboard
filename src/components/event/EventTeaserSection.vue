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
                        {{ t('form_cancel') }}
                    </button>
                    <button type="button" class="event-teaser__button" :disabled="isSaving" @click="saveTeaser">
                        <span v-if="!isSaving">{{ t('form_save') }}</span>
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

        <EventTagsSection
            class="event-teaser__tags"
            :event-id="eventId"
            :tags="tags ?? undefined"
            @updated="emit('updated')"
        />
    </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'
import EventTagsSection from '@/components/event/EventTagsSection.vue'

const props = defineProps<{
    eventId: number
    teaserText: string | null
    hasMainImage?: boolean | null
    imageId?: number | null
    imageFocusX?: number | null
    imageFocusY?: number | null
    tags?: string[] | null
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const isEditing = ref(false)
const isSaving = ref(false)
const editedTeaser = ref(props.teaserText ?? '')

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
    align-items: stretch;
}

.event-teaser__text {
    margin: 0;
    color: var(--color-text);
    font-size: 1.05rem;
    line-height: 1.6;
}

.event-teaser__edit {
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
    align-self: flex-end;
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
</style>

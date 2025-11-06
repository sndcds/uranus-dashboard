<template>
    <article>
        <EventImageUploadComponent v-model="eventImage" v-model:alt-text="imageAltText"
            v-model:copyright="imageCopyright" v-model:license="imageLicense" v-model:created-by="imageCreatedBy"
            :event-id="eventId" :max-size="5 * 1024 * 1024" :accepted-types="['image/jpeg', 'image/png', 'image/webp']"
            :existing-image-url="existingImagePreviewUrl" :upload-url="`/api/admin/event/${eventId}/image`"
            :delete-url="`/api/admin/event/${eventId}/image`" :get-url="`/api/admin/event/${eventId}/image`"
            @updated="emit('updated')" />
        <div class="uranus-hover-section">
            <template v-if="isEditing">
                <MarkdownEditorComponent v-model="editedTeaser" class="event-teaser__markdown"
                    :placeholder="t('event_teaser_placeholder')" />
                <div class="event-teaser__actions">
                    <button type="button" class="uranus-inline-cancel-button" @click="cancelEditing">
                        {{ t('form_cancel') }}
                    </button>
                    <button type="button" class="uranus-inline-save-button" :disabled="isSaving" @click="saveTeaser">
                        <span v-if="!isSaving">{{ t('form_save') }}</span>
                        <span v-else>{{ t('saving') }}</span>
                    </button>
                </div>
            </template>
            <template v-else>
                <UranusInlineEditLabel :label-text="t('teaser_text')" :edit-button-text="t('edit')"
                    @edit-started="startEditing" />
                <p class="event-teaser__text">
                    {{ teaserText || t('event_teaser_fallback') }}
                </p>
            </template>
        </div>

        <EventTagsSection class="event-teaser__tags" :event-id="eventId" :tags="tags ?? undefined"
            @updated="emit('updated')" />
    </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import EventImageUploadComponent from '@/components/event/EventImageUploadComponent.vue'
import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'
import EventTagsSection from '@/components/event/EventTagsSection.vue'
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue"

const props = defineProps<{
    eventId: number
    teaserText: string | null
    tags?: string[] | null
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const isEditing = ref(false)
const isSaving = ref(false)
const editedTeaser = ref(props.teaserText ?? '')
const eventImage = ref<File | null>(null)
const imageAltText = ref('')
const imageCopyright = ref('')
const imageLicense = ref('')
const imageCreatedBy = ref('')

watch(
    () => props.teaserText,
    (value) => {
        if (!isEditing.value) {
            editedTeaser.value = value ?? ''
        }
    }
)

const existingImagePreviewUrl = computed(() => {
    if (props.eventId && !eventImage.value) {
        return `/api/image/event/${props.eventId}?mode=cover&width=400&ratio=3by2&focusx=0.5&focusy=0.5&type=webp&quality=90`
    }
    return null
})

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
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
    text-align: left;
    margin: 0;
    color: var(--color-text);
    font-size: 1.0rem;
    line-height: 1.6;
    border: 2px solid #eee;
    border-radius: 6px;
    padding: 0.25rem 1rem;
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

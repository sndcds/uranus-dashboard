<template>
    <article class="event-teaser">
        <img
            class="event-teaser__image"
            src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
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
    </article>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'

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
    background: #fff;
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
    color: rgba(31, 41, 55, 0.8);
    font-size: 1.05rem;
    line-height: 1.6;
}

.event-teaser__edit {
    border: none;
    border-radius: 999px;
    padding: 0.35rem 0.85rem;
    background: rgba(79, 70, 229, 0.12);
    color: #4338ca;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
    opacity: 0;
    transform: translateY(-4px);
}

.event-teaser:hover .event-teaser__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-teaser__edit:hover {
    background: rgba(79, 70, 229, 0.2);
}

.event-teaser__actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
}

.event-teaser__button {
    border: none;
    border-radius: 999px;
    padding: 0.5rem 1.3rem;
    background: linear-gradient(135deg, #485dff, #60a5fa);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-teaser__button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 25px rgba(72, 93, 255, 0.35);
}

.event-teaser__button:disabled {
    opacity: 0.6;
    cursor: wait;
}

.event-teaser__button--cancel {
    background: rgba(99, 102, 241, 0.12);
    color: #4338ca;
}

.event-teaser__button--cancel:hover {
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.18);
}
</style>

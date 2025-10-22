<template>
    <div class="event-header-section">
        <template v-if="isEditing">
            <EventTitleFieldsComponent
                :title="editedTitle"
                :subtitle="editedSubtitle"
                @update:title="editedTitle = $event"
                @update:subtitle="editedSubtitle = $event"
            />
            <div class="event-header-section__actions">
                <button
                    type="button"
                    class="event-header-section__button event-header-section__button--cancel"
                    @click="cancelEditing"
                >
                    {{ t('event_header_cancel') }}
                </button>
                <button type="button" class="event-header-section__button" @click="saveHeader" :disabled="isSaving">
                    <span v-if="!isSaving">{{ t('event_header_save') }}</span>
                    <span v-else>{{ t('saving') }}</span>
                </button>
            </div>
        </template>
        <template v-else>
            <h1 class="event-header-section__title">{{ title }}</h1>
            <p v-if="subtitle" class="event-header-section__subtitle">{{ subtitle }}</p>
            <button type="button" class="event-header-section__edit" @click="startEditing">
                {{ t('event_header_edit') }}
            </button>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import EventTitleFieldsComponent from '@/components/EventTitleFieldsComponent.vue'

const props = defineProps<{
    eventId: number
    title: string
    subtitle: string | null
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const isEditing = ref(false)
const isSaving = ref(false)
const editedTitle = ref(props.title)
const editedSubtitle = ref(props.subtitle ?? '')

watch(
    () => props.title,
    (value) => {
        if (!isEditing.value) {
            editedTitle.value = value
        }
    }
)

watch(
    () => props.subtitle,
    (value) => {
        if (!isEditing.value) {
            editedSubtitle.value = value ?? ''
        }
    }
)

const startEditing = () => {
    editedTitle.value = props.title
    editedSubtitle.value = props.subtitle ?? ''
    isEditing.value = true
}

const cancelEditing = () => {
    editedTitle.value = props.title
    editedSubtitle.value = props.subtitle ?? ''
    isEditing.value = false
}

const saveHeader = async () => {
    if (!editedTitle.value.trim()) {
        return
    }

    isSaving.value = true
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/header`, {
            method: 'PUT',
            body: JSON.stringify({
                title: editedTitle.value.trim(),
                subtitle: editedSubtitle.value.trim() || null,
            }),
        })
        isEditing.value = false
        emit('updated')
    } catch (err) {
        console.error('Failed to update header', err)
    } finally {
        isSaving.value = false
    }
}
</script>

<style scoped lang="scss">
.event-header-section {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
    text-align: center;
}

.event-header-section__title {
    font-size: clamp(2rem, 4vw, 2.8rem);
    margin: 0;
    color: var(--color-text);
}

.event-header-section__subtitle {
    margin: 0;
    color: var(--muted-text);
    font-size: 1.05rem;
}

.event-header-section__edit {
    border: none;
    border-radius: 999px;
    padding: 0.35rem 0.85rem;
    background: var(--accent-muted);
    color: var(--accent-primary);
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
    opacity: 0;
    transform: translateY(-4px);
}

.event-header-section:hover .event-header-section__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-header-section__edit:hover {
    background: var(--accent-muted-hover);
}

.event-header-section__actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
}

.event-header-section__button {
    border: none;
    border-radius: 999px;
    padding: 0.5rem 1.3rem;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-header-section__button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 25px rgba(72, 93, 255, 0.35);
}

.event-header-section__button:disabled {
    opacity: 0.6;
    cursor: wait;
}

.event-header-section__button--cancel {
    background: var(--accent-muted);
    color: var(--accent-primary);
}

.event-header-section__button--cancel:hover {
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.18);
}
</style>

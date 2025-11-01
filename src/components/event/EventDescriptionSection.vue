<template>
    <article class="event-description">
      <div class="uranus-hover-section">
        <InlineEditorLabel
            :label-text="t('description')"
            :edit-button-text="t('edit')"
            @edit-started="startEditingDescription" />

        <div class="event-description__content">
          <template v-if="isEditingDescription">
            <MarkdownEditorComponent v-model="editedDescription"
                                     :placeholder="t('event_description_placeholder')" />
            <div class="event-description__actions">
              <button type="button" class="uranus-inline-cancel-button"
                      @click="cancelEditingDescription">
                {{ t('form_cancel') }}
              </button>
              <button type="button" class="uranus-inline-save-button" :disabled="isSavingDescription"
                      @click="saveDescription">
                <span v-if="!isSavingDescription">{{ t('form_save') }}</span>
                <span v-else>{{ t('saving') }}</span>
              </button>
            </div>
          </template>
          <template v-else>
            <MarkdownPreviewComponent v-if="description" :value="description" />
            <p v-else class="empty">{{ t('event_details_empty') }}</p>
          </template>
        </div>

      </div>
        <EventTypeSection
            :event-id="eventId" :locale="locale"
            :event-types="eventTypes"
            @updated="emit('updated')" />

        <EventLanguageSection
            :event-id="eventId"
            :locale="locale"
            :languages="languages"
            @updated="emit('updated')" />

      <!-- Additional Info -->
        <div class="event-additional">
            <p v-if="participationInfo">
                <strong>{{ t('event_participation_label') }}:</strong>
                {{ participationInfo }}
            </p>
            <p v-if="meetingPoint">
                <strong>{{ t('event_meeting_point') }}:</strong>
                {{ meetingPoint }}
            </p>
        </div>
    </article>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'
import MarkdownPreviewComponent from '@/components/MarkdownPreviewComponent.vue'
import EventTypeSection from '@/components/event/EventTypeSection.vue'
import EventLanguageSection from '@/components/event/EventLanguageSection.vue'
import InlineEditorLabel from "@/components/InlineEditorLabel.vue";
import EventUrlSection from "@/components/event/EventUrlSection.vue";

interface EventType { type_id: number; type_name: string; genre_id: number | null; genre_name: string | null }

const props = defineProps<{
    eventId: number
    description: string | null
    participationInfo: string | null
    meetingPoint: string | null
    eventTypes: EventType[]
    languages: string[] | null
    locale: string
}>()

const emit = defineEmits<{ (e: 'updated'): void }>()

const { t } = useI18n({ useScope: 'global' })

// Description state
const isEditingDescription = ref(false)
const isSavingDescription = ref(false)
const editedDescription = ref(props.description ?? '')

// Watch props for description
watch(() => props.description, v => {
    if (!isEditingDescription.value) editedDescription.value = v ?? ''
})

// Description actions
const startEditingDescription = () => { editedDescription.value = props.description ?? ''; isEditingDescription.value = true }
const cancelEditingDescription = () => { editedDescription.value = props.description ?? ''; isEditingDescription.value = false }
const saveDescription = async () => {
    if (!props.eventId) return
    isSavingDescription.value = true
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/description`, {
            method: 'PUT',
            body: JSON.stringify({ description: editedDescription.value }),
        })
        emit('updated')
        isEditingDescription.value = false
    } catch (err) { console.error(err) }
    finally { isSavingDescription.value = false }
}
</script>

<style scoped lang="scss">
.event-description {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    position: relative;
}

.event-description__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.event-description__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-description__edit {
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-description:hover .event-description__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-description__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.event-description__button {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-description__button--cancel {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-additional {
    font-size: 0.95rem;
    color: var(--muted-text);
}

.event-additional p {
    margin: 0.4rem 0;
}
</style>

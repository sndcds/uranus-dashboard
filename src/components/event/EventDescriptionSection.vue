<template>
    <UranusInlineEditSection :active="isEditingDescription">
        <UranusInlineEditLabel
            :label-text="t('description')"
            :edit-button-text="t('edit')"
            @edit-started="startEditingDescription" />

        <div class="event-description__content">
          <div v-if="isEditingDescription">
            <MarkdownEditorComponent v-model="editedDescription"
                                     :placeholder="t('event_description_placeholder')" />

            <UranusInlineActionBar>
              <UranusInlineCancelButton
                  :label="t('button_cancel')"
                  :onClick="cancelEditingDescription"
              />

              <UranusInlineOKButton
                  :label="t('button_save')"
                  :disabled="isSavingDescription"
                  :onClick="saveDescription"
              />
            </UranusInlineActionBar>

          </div>
          <template v-else>
            <MarkdownPreviewComponent v-if="description" :value="description" />
            <p v-else class="empty">{{ t('event_details_empty') }}</p>
          </template>
        </div>

      </UranusInlineEditSection>

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

</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'
import MarkdownPreviewComponent from '@/components/MarkdownPreviewComponent.vue'
import EventTypeSection from '@/components/event/EventTypeSection.vue'
import EventLanguageSection from '@/components/event/EventLanguageSection.vue'
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue";
import EventUrlSection from "@/components/event/EventUrlSection.vue";
import UranusInlineEditSection from "@/components/uranus/UranusInlineEditSection.vue";
import UranusInlineCancelButton from "@/components/uranus/UranusInlineCancelButton.vue";
import UranusInlineActionBar from "@/components/uranus/UranusInlineActionBar.vue";
import UranusInlineOKButton from "@/components/uranus/UranusInlineOKButton.vue";

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
.event-description__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-description__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.event-additional {
    font-size: 0.95rem;
    color: var(--muted-text);
}

.event-additional p {
    margin: 0.4rem 0;
}
</style>

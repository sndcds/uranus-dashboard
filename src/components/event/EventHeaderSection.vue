<template>
    <UranusInlineEditSection :active="isEditing">

    <UranusInlineEditLabel
        :label-text="t('event_title')"
        :edit-button-text="t('edit')"
        @edit-started="startEditing" />

    <div v-if="isEditing">
      <EventTitleFieldsComponent
          :title="editedTitle"
          :subtitle="editedSubtitle"
          @update:title="editedTitle = $event"
          @update:subtitle="editedSubtitle = $event" />

      <UranusInlineActionBar>
        <UranusInlineCancelButton
            :label="t('button_cancel')"
            :disabled="isSaving"
            :onClick="cancelEditing"
        />

        <UranusInlineOKButton
            :label="t('button_save')"
            :busyLabel="t('saving')"
            :onClick="saveHeader"
        />
      </UranusInlineActionBar>

    </div>

    <template v-else>
      <h1 class="event-header-section__title">{{ title }}</h1>
      <p v-if="subtitle" class="event-header-section__subtitle">{{ subtitle }}</p>
    </template>
  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import EventTitleFieldsComponent from '@/components/EventTitleFieldsComponent.vue'
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue";
import UranusInlineEditSection from "@/components/uranus/UranusInlineEditSection.vue";
import UranusInlineActionBar from "@/components/uranus/UranusInlineActionBar.vue";
import UranusInlineCancelButton from "@/components/uranus/UranusInlineCancelButton.vue";
import UranusInlineOKButton from "@/components/uranus/UranusInlineOKButton.vue";

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
.event-header-section__title {
    font-size: clamp(2rem, 4vw, 2.8rem);
    margin: 0;
    color: var(--color-text);
}

.event-header-section__subtitle {
    margin: 0;
    color: var(--color-text);
    font-size: 1.2rem;
}
</style>

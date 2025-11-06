<template>
  <div :class="{ 'event-header-section--editing': isEditing }">
    <UranusInlineEditLabel
        :label-text="t('event_title')"
        :edit-button-text="t('edit')"
        @edit-started="startEditing" />

    <template v-if="isEditing">
      <EventTitleFieldsComponent
          :title="editedTitle"
          :subtitle="editedSubtitle"
          @update:title="editedTitle = $event"
          @update:subtitle="editedSubtitle = $event" />
      <div class="event-header-section__actions">
        <button
            type="button"
            class="uranus-inline-cancel-button"
            @click="cancelEditing">
          {{ t('form_cancel') }}
        </button>
        <button
            type="button"
            class="uranus-inline-save-button"
            @click="saveHeader"
            :disabled="isSaving">
          <span v-if="!isSaving">{{ t('form_save') }}</span>
          <span v-else>{{ t('saving') }}</span>
        </button>
      </div>
    </template>

    <template v-else>
      <h1 class="event-header-section__title">{{ title }}</h1>
      <p v-if="subtitle" class="event-header-section__subtitle">{{ subtitle }}</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import EventTitleFieldsComponent from '@/components/EventTitleFieldsComponent.vue'
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue";

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
    width: 100%;
}

.event-header-section--editing {
    align-items: stretch;
    text-align: left;
}

.event-header-section--editing .title-fields {
    width: 100%;
}

.event-header-section--editing .event-header-section__actions {
    justify-content: flex-end;
    width: 100%;
}

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


.event-header-section:hover .event-header-section__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-header-section__actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
}

.event-header-section__button {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-header-section__button--cancel {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}
</style>

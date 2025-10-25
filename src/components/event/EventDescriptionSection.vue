<template>
  <article class="event-description">
    <!-- Description Header -->
    <header class="event-description__header">
      <h2>{{ t('event_details_heading') }}</h2>
      <button
          v-if="!isEditingDescription"
          type="button"
          class="event-description__edit"
          @click="startEditingDescription"
      >
        {{ t('event_description_edit') }}
      </button>
    </header>

    <!-- Description Content -->
    <div class="event-description__content">
      <template v-if="isEditingDescription">
        <MarkdownEditorComponent
            v-model="editedDescription"
            :placeholder="t('event_description_placeholder')"
        />
        <div class="event-description__actions">
          <button
              type="button"
              class="event-description__button event-description__button--cancel"
              @click="cancelEditingDescription"
          >
            {{ t('event_description_cancel') }}
          </button>
          <button
              type="button"
              class="event-description__button"
              :disabled="isSavingDescription"
              @click="saveDescription"
          >
            <span v-if="!isSavingDescription">{{ t('event_description_save') }}</span>
            <span v-else>{{ t('saving') }}</span>
          </button>
        </div>
      </template>
      <template v-else>
        <MarkdownPreviewComponent v-if="description" :value="description" />
        <p v-else class="empty">{{ t('event_details_empty') }}</p>
      </template>
    </div>

    <!-- Tags Section -->
    <div class="event-tags">
      <template v-if="isEditingTags">
        <TwoStageTagListComponent
            :fetchPrimaries="fetchEventTypes"
            :fetchSecondaries="fetchEventGenres"
            :initialSelection="tagInitialSelection"
            labelPrimary="Event Type"
            labelSecondary="Genre"
            @update="onTagSelectionUpdate"
        />
        <div class="event-tags__actions">
          <button
              type="button"
              class="event-tags__button event-tags__button--cancel"
              @click="cancelEditingTags"
          >
            {{ t('event_tags_cancel') }}
          </button>
          <button
              type="button"
              class="event-tags__button"
              :disabled="isSavingTags"
              @click="saveTags"
          >
            <span v-if="!isSavingTags">{{ t('event_tags_save') }}</span>
            <span v-else>{{ t('saving') }}</span>
          </button>
        </div>
      </template>
      <template v-else>
        <div class="event-tags__lists">
          <div v-if="eventTypes.length">
            <h3>{{ t('event_types_heading') }}</h3>
            <!--ul>
              <li v-for="type in eventTypes" :key="type.id">{{ type.name }}</li>
            </ul-->
          </div>
        </div>
        <button type="button" class="event-tags__edit" @click="startEditingTags">
          {{ t('event_tags_edit') }}
        </button>
      </template>
    </div>

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
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'
import MarkdownPreviewComponent from '@/components/MarkdownPreviewComponent.vue'
import TwoStageTagListComponent from '@/components/TwoStageTagListComponent.vue'

interface EventType { type_id: number; type_name: string; genre_id: number | null; genre_name: string | null }
interface Selection { primaryId: number; secondaryId: number | null }
interface SelectOption { id: number; name: string }

const props = defineProps<{
  eventId: number
  description: string | null
  participationInfo: string | null
  meetingPoint: string | null
  eventTypes: EventType[]
  locale: string
}>()

const emit = defineEmits<{ (e: 'updated'): void }>()

const { t } = useI18n({ useScope: 'global' })

// Description state
const isEditingDescription = ref(false)
const isSavingDescription = ref(false)
const editedDescription = ref(props.description ?? '')

// Tags state
const isEditingTags = ref(false)
const isSavingTags = ref(false)
const tagInitialSelection = ref<Selection[] | undefined>(undefined)

// Watch props for description
watch(() => props.description, v => {
  if (!isEditingDescription.value) editedDescription.value = v ?? ''
})

// Watchers for event types to rebuild selection if not editing
watch(() => props.eventTypes, () => { if (!isEditingTags.value) buildInitialSelection() }, { deep: true })

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

// Build initial selection for the component
const buildInitialSelection = () => {
  if (!props.eventTypes?.length) {
    tagInitialSelection.value = []
    return
  }

  const selections: Selection[] = props.eventTypes.map(t => ({
    primaryId: t.type_id,
    secondaryId: t.genre_id || null, // set null if genre_id is 0 or missing
  }))

  tagInitialSelection.value = selections
}

// Tags actions
const startEditingTags = () => {
  buildInitialSelection()
  isEditingTags.value = true
}

const cancelEditingTags = () => {
  buildInitialSelection()
  isEditingTags.value = false
}

const onTagSelectionUpdate = (payload: Selection[]) => {
  tagInitialSelection.value = payload
}

// Fetch options
async function fetchEventTypes(): Promise<SelectOption[]> {
  const { data } = await apiFetch<SelectOption[]>('/api/choosable-event-types?lang=de')
  return Array.isArray(data) ? data : []
}
async function fetchEventGenres(typeId: number): Promise<SelectOption[]> {
  const { data } = await apiFetch<SelectOption[]>(`/api/choosable-event-genres/event-type/${typeId}?lang=de`)
  return Array.isArray(data) ? data : []
}

// Save tags
const saveTags = async () => {
  if (!props.eventId || !tagInitialSelection.value) return
  isSavingTags.value = true
  try {
    await apiFetch(`/api/admin/event/${props.eventId}/types`, {
      method: 'PUT',
      body: JSON.stringify({
        event_type_ids: Array.from(new Set(tagInitialSelection.value.map(s => s.primaryId))),
        genre_type_ids: Array.from(new Set(tagInitialSelection.value.map(s => s.secondaryId).filter(g => g != null)))
      }),
    })
    emit('updated')
    isEditingTags.value = false
  } catch (err) {
    console.error(err)
    isEditingTags.value = false
  } finally { isSavingTags.value = false }
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

.event-tags__edit {
    align-self: center;
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-description:hover .event-tags__edit,
.event-tags:hover .event-tags__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-tags__actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
}

.event-tags__button {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-tags__button--cancel {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-tags {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-tags__lists {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    justify-content: center;
}

.event-tags__lists h3 {
    margin: 0 0 0.35rem 0;
    font-size: 1rem;
    color: var(--color-text);
}

.event-tags__lists ul {
    margin: 0;
    padding-left: 1.1rem;
    color: var(--muted-text);
}

.event-tags__edit {
    align-self: center;
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-description:hover .event-tags__edit,
.event-tags:hover .event-tags__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-tags__actions {
    display: flex;
    justify-content: center;
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

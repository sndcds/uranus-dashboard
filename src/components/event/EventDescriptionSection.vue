<template>
    <article class="event-description">
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

        <div class="event-tags">
            <template v-if="isEditingTags">
                <TwoStageTagListComponent
                  :fetchPrimaries="fetchEventTypes"
                  :fetchSecondaries="fetchEventGenres"
                  :initialSelection="tagInitialSelection?.map(s => ({ primaryId: s.primaryId, secondaryId: s.secondaryId }))"
                  labelPrimary="Event Type"
                  labelSecondary="Genre"
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
                        <ul>
                            <li v-for="type in eventTypes" :key="type.id">{{ type.name }}</li>
                        </ul>
                    </div>
                    <div v-if="genreTypes.length">
                        <h3>{{ t('event_genres_heading') }}</h3>
                        <ul>
                            <li v-for="genre in genreTypes" :key="genre.id">{{ genre.name }}</li>
                        </ul>
                    </div>
                </div>
                <button type="button" class="event-tags__edit" @click="startEditingTags">
                    {{ t('event_tags_edit') }}
                </button>
            </template>
        </div>

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

interface EventType {
  id: number
  name: string
}

interface EventGenreType {
  id: number
  name: string
  event_type_id?: number | null
  type_id?: number | null
}

interface SelectionPreset {
  typeId: number
  genreId: number | null
}

interface Selection {
  primaryId: number
  secondaryId: number | null
}

interface SelectOption {
  id: number
  name: string
}

const props = defineProps<{
  eventId: number
  description: string | null
  participationInfo: string | null
  meetingPoint: string | null
  eventTypes: EventType[]
  genreTypes: EventGenreType[]
  locale: string
}>()

const emit = defineEmits<{
  (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

// Description editing
const isEditingDescription = ref(false)
const isSavingDescription = ref(false)
const editedDescription = ref(props.description ?? '')

// Tags editing
const isEditingTags = ref(false)
const isSavingTags = ref(false)
const selectedTypeIds = ref<number[]>([])
const selectedGenreIds = ref<number[]>([])
const tagInitialSelection = ref<Selection[] | undefined>(undefined)

// Watchers for props
watch(() => props.description, v => {
  if (!isEditingDescription.value) editedDescription.value = v ?? ''
})
watch(() => props.eventTypes, v => {
  if (!isEditingTags.value) selectedTypeIds.value = Array.from(new Set((v ?? []).map(t => t.id)))
}, { deep: true })
watch(() => props.genreTypes, v => {
  if (!isEditingTags.value) selectedGenreIds.value = Array.from(new Set((v ?? []).map(g => g.id)))
}, { deep: true })

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
    isEditingDescription.value = false
    emit('updated')
  } catch (err) {
    console.error(err)
  } finally {
    isSavingDescription.value = false
  }
}

// Build initial selection for TwoStageTagListComponent
const buildTagSelection = computed<SelectionPreset[]>(() => {
  const selections: SelectionPreset[] = []
  const genreMap = new Map<number, number[]>()
  props.genreTypes.forEach(g => {
    const typeId = g.event_type_id ?? g.type_id ?? null
    if (typeof typeId !== 'number') return
    const list = genreMap.get(typeId) ?? []
    list.push(g.id)
    genreMap.set(typeId, list)
  })
  props.eventTypes.forEach(t => {
    const genreList = genreMap.get(t.id)
    if (genreList?.length) genreList.forEach(gid => selections.push({ typeId: t.id, genreId: gid }))
    else selections.push({ typeId: t.id, genreId: null })
  })
  return selections
})

// Tags actions
const startEditingTags = () => {

  const selections = buildTagSelection.value ?? []

  // Deduplicate and normalize
  const normalized: SelectionPreset[] = selections
      .map(s => ({ typeId: s.typeId, genreId: s.genreId ?? null }))
      .filter(s => Number.isFinite(s.typeId) && s.typeId > 0)

  const unique = Array.from(
      new Map(normalized.map(s => [`${s.typeId}-${s.genreId ?? 'null'}`, s])).values()
  )


  // Convert to Selection for component
  tagInitialSelection.value = unique.map(s => ({ primaryId: s.typeId, secondaryId: s.genreId }))

  // Update selected IDs
  selectedTypeIds.value = tagInitialSelection.value.map(s => s.primaryId)
  selectedGenreIds.value = tagInitialSelection.value.map(s => s.secondaryId).filter(g => g != null)

  isEditingTags.value = true
}

const cancelEditingTags = () => {
  selectedTypeIds.value = props.eventTypes.map(t => t.id)
  selectedGenreIds.value = props.genreTypes.map(g => g.id)
  tagInitialSelection.value = undefined
  isEditingTags.value = false
}

const onTagSelectionUpdate = (payload: Selection[]) => {
  selectedTypeIds.value = payload.map(s => s.primaryId)
  selectedGenreIds.value = payload.map(s => s.secondaryId).filter(g => g != null)
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

const saveTags = async () => {
  if (!props.eventId) return
  isSavingTags.value = true
  try {
    await apiFetch(`/api/admin/event/${props.eventId}/types`, {
      method: 'PUT',
      body: JSON.stringify({
        event_type_ids: Array.from(new Set(selectedTypeIds.value)),
        genre_type_ids: Array.from(new Set(selectedGenreIds.value))
      }),
    })
    isEditingTags.value = false
    tagInitialSelection.value = undefined
    emit('updated')
  } catch (err) {
    console.error(err)
    isEditingTags.value = false
  } finally {
    isSavingTags.value = false
  }
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

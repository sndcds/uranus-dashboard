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
                    :fetch-stage1="fetchEventTypesOptions"
                    :fetch-stage2="fetchEventGenresOptions"
                    :initial-selection="tagInitialSelection"
                    @update-selection="onTagSelectionUpdate"
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
import { computed, reactive, ref, watch } from 'vue'
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

const isEditingDescription = ref(false)
const isSavingDescription = ref(false)
const editedDescription = ref(props.description ?? '')

const isEditingTags = ref(false)
const isSavingTags = ref(false)
const selectedTypeIds = ref<number[]>([])
const selectedGenreIds = ref<number[]>([])
const tagInitialSelection = ref<SelectionPreset[] | null>(null)

watch(
    () => props.description,
    (value) => {
        if (!isEditingDescription.value) {
            editedDescription.value = value ?? ''
        }
    }
)

watch(
    () => props.eventTypes,
    (value) => {
        if (!isEditingTags.value) {
            selectedTypeIds.value = Array.from(new Set((value ?? []).map((type) => type.id)))
        }
    },
    { deep: true }
)

watch(
    () => props.genreTypes,
    (value) => {
        if (!isEditingTags.value) {
            selectedGenreIds.value = Array.from(new Set((value ?? []).map((genre) => genre.id)))
        }
    },
    { deep: true }
)

const startEditingDescription = () => {
    editedDescription.value = props.description ?? ''
    isEditingDescription.value = true
}

const cancelEditingDescription = () => {
    editedDescription.value = props.description ?? ''
    isEditingDescription.value = false
}

const saveDescription = async () => {
    if (!props.eventId) return

    isSavingDescription.value = true
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/description`, {
            method: 'PUT',
            body: JSON.stringify({
                description: editedDescription.value,
            }),
        })
        isEditingDescription.value = false
        emit('updated')
    } catch (err) {
        console.error('Failed to update description', err)
    } finally {
        isSavingDescription.value = false
    }
}

const buildTagSelection = computed(() => {
    const selections: SelectionPreset[] = []
    const genreMap = new Map<number, number[]>()

    props.genreTypes.forEach((genre) => {
        const typeId = genre.event_type_id ?? genre.type_id ?? null
        if (typeof typeId !== 'number') return
        const list = genreMap.get(typeId) ?? []
        list.push(genre.id)
        genreMap.set(typeId, list)
    })

    props.eventTypes.forEach((type) => {
        const genreList = genreMap.get(type.id)
        if (genreList && genreList.length) {
            genreList.forEach((genreId) => selections.push({ typeId: type.id, genreId }))
        } else {
            selections.push({ typeId: type.id, genreId: null })
        }
    })

    return selections
})

const startEditingTags = async () => {
  // buildTagSelection already returns an array of { typeId, genreId }
  const selections = buildTagSelection.value ?? []

  // Normalize and deduplicate (in case of duplicates or malformed input)
  const normalized = selections
      .map((s) => ({
        typeId: s.typeId ?? (s as any).type_id ?? 0,
        genreId: s.genreId ?? (s as any).genre_id ?? null,
      }))
      .filter((s) => Number.isFinite(s.typeId) && s.typeId > 0)

  const unique = Array.from(
      new Map(normalized.map((s) => [`${s.typeId}-${s.genreId ?? 'null'}`, s])).values()
  )

  // Set for <TwoStageTagListComponent>
  tagInitialSelection.value = unique

  // Derive selected IDs for other logic / UI
  selectedTypeIds.value = Array.from(new Set(unique.map((s) => s.typeId)))
  selectedGenreIds.value = Array.from(new Set(unique.map((s) => s.genreId).filter((g) => g != null)))

  // Enter edit mode
  isEditingTags.value = true
}

const cancelEditingTags = () => {
    selectedTypeIds.value = Array.from(new Set(props.eventTypes.map((type) => type.id)))
    selectedGenreIds.value = Array.from(new Set(props.genreTypes.map((genre) => genre.id)))
    tagInitialSelection.value = null
    isEditingTags.value = false
}

const onTagSelectionUpdate = (payload: { typeIds: number[]; genreIds: number[] }) => {
    selectedTypeIds.value = payload.typeIds
    selectedGenreIds.value = payload.genreIds
}

const fetchEventTypesOptions = async () => {
    const { data } = await apiFetch<Array<{ id: number; name: string } | { type_id: number; name: string }>>(
        `/api/choosable-event-types?lang=${props.locale}`
    )
    return Array.isArray(data) ? data : []
}

const fetchEventGenresOptions = async (typeId: number) => {
    const { data } = await apiFetch<Array<{ id: number; name: string } | { type_id: number; name: string }>>(
        `/api/choosable-event-genres/event-type/${typeId}?lang=${props.locale}`
    )
    return Array.isArray(data) ? data : []
}

const saveTags = async () => {
    if (!props.eventId) return

    isSavingTags.value = true
    const uniqueTypeIds = Array.from(new Set(selectedTypeIds.value))
    const uniqueGenreIds = Array.from(new Set(selectedGenreIds.value))

    try {
        await apiFetch(`/api/admin/event/${props.eventId}/types`, {
            method: 'PUT',
            body: JSON.stringify({
                event_type_ids: uniqueTypeIds,
                genre_type_ids: uniqueGenreIds,
            }),
        })
        isEditingTags.value = false
        tagInitialSelection.value = null
        emit('updated')
    } catch (err) {
        console.error('Failed to update event types', err)
        isEditingTags.value = false
    } finally {
        isSavingTags.value = false
    }
}
</script>

<style scoped lang="scss">
.event-description {
    background: var(--card-bg);
    border-radius: 24px;
    padding: clamp(1.75rem, 3vw, 2.4rem);
    box-shadow: 0 24px 50px rgba(31, 41, 55, 0.12);
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

.event-description:hover .event-description__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-description__edit:hover {
    background: var(--accent-muted-hover);
}

.event-description__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.event-description__button {
    border: none;
    border-radius: 999px;
    padding: 0.5rem 1.3rem;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-description__button:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 25px rgba(72, 93, 255, 0.35);
}

.event-description__button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.event-description__button--cancel {
    background: var(--accent-muted);
    color: var(--accent-primary);
}

.event-description__button--cancel:hover {
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.18);
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

.event-description:hover .event-tags__edit,
.event-tags:hover .event-tags__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-tags__edit:hover {
    background: rgba(79, 70, 229, 0.2);
}

.event-tags__actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
}

.event-tags__button {
    border: none;
    border-radius: 999px;
    padding: 0.5rem 1.3rem;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-tags__button:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 25px rgba(72, 93, 255, 0.35);
}

.event-tags__button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.event-tags__button--cancel {
    background: var(--accent-muted);
    color: var(--accent-primary);
}

.event-tags__button--cancel:hover {
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.18);
}

.event-additional {
    font-size: 0.95rem;
    color: var(--muted-text);
}

.event-additional p {
    margin: 0.4rem 0;
}
</style>

<template>
    <article class="event-description">
        <header class="event-description__header">
            <h2>{{ t('event_details_heading') }}</h2>
            <button v-if="!isEditingDescription" type="button" class="event-description__edit"
                @click="startEditingDescription">
                {{ t('event_description_edit') }}
            </button>
        </header>

        <div class="event-description__content">
            <template v-if="isEditingDescription">
                <MarkdownEditorComponent v-model="editedDescription"
                    :placeholder="t('event_description_placeholder')" />
                <div class="event-description__actions">
                    <button type="button" class="event-description__button event-description__button--cancel"
                        @click="cancelEditingDescription">
                        {{ t('form_cancel') }}
                    </button>
                    <button type="button" class="event-description__button" :disabled="isSavingDescription"
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

        <!-- Tags Section -->
        <div class="event-tags">
            <div class="event-tags__header">
                <h3>{{ t('event_tags_heading') }}</h3>
                <button v-if="!isEditingTags" type="button" class="event-tags__edit" @click="startEditingTags">
                    {{ t('event_tags_edit') }}
                </button>
            </div>

            <TwoStageTagListComponent v-if="tagInitialSelection" :fetchPrimaries="fetchEventTypes"
                :fetchSecondaries="fetchEventGenres" :initialSelection="tagInitialSelection" labelPrimary="Event Type"
                labelSecondary="Genre" :editable="true" :isEditing="isEditingTags"
                @update-selection="onTagSelectionUpdate" />

            <!-- Edit actions -->
            <div v-if="isEditingTags" class="event-tags__actions">
                <button type="button" class="event-tags__button event-tags__button--cancel" @click="cancelEditingTags">
                    {{ t('form_cancel') }}
                </button>
                <button type="button" class="event-tags__button" :disabled="isSavingTags" @click="saveTags">
                    <span v-if="!isSavingTags">{{ t('form_save') }}</span>
                    <span v-else>{{ t('saving') }}</span>
                </button>
            </div>
        </div>

        <!-- Language selection Section -->
        <div class="event-language">
            <div class="event-language__header">
                <h3>{{ t('event_language_heading') }}</h3>
                <button v-if="!isEditingLanguage" type="button" class="event-language__edit" @click="startEditingLanguage">
                    {{ t('event_language_edit') }}
                </button>
            </div>

            <TwoStageTagListComponent v-if="languageInitialSelection" :fetchPrimaries="fetchLanguages"
                :initialSelection="languageInitialSelection" :labelPrimary="t('event_language_label')" :editable="true"
                :isEditing="isEditingLanguage" @update-selection="onLanguageSelectionUpdate" />

            <!-- Edit actions -->
            <div v-if="isEditingLanguage" class="event-language__actions">
                <button type="button" class="event-language__button event-language__button--cancel" @click="cancelEditingLanguage">
                    {{ t('form_cancel') }}
                </button>
                <button type="button" class="event-language__button" :disabled="isSavingLanguage" @click="saveLanguage">
                    <span v-if="!isSavingLanguage">{{ t('form_save') }}</span>
                    <span v-else>{{ t('saving') }}</span>
                </button>
            </div>
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
import { ref, watch, onMounted, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'
import MarkdownPreviewComponent from '@/components/MarkdownPreviewComponent.vue'
import TwoStageTagListComponent from '@/components/TwoStageTagListComponent.vue'
import type { Selection as TagSelection } from '@/components/TwoStageTagListComponent.vue'

interface EventType { type_id: number; type_name: string; genre_id: number | null; genre_name: string | null }
interface SelectOption { id: number; name: string }

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

// Tags state
const isEditingTags = ref(false)
const isSavingTags = ref(false)
const tagInitialSelection = ref<TagSelection[] | undefined>(undefined)

// Language state
const isEditingLanguage = ref(false)
const isSavingLanguage = ref(false)
const languageInitialSelection = ref<TagSelection[] | undefined>(undefined)
const selectedLanguageCodes = ref<string[]>([])

interface LanguageApiResponse {
    id?: string | null
    name?: string | null
}

const languageOptions = ref<SelectOption[]>([])

// Watch props for description
watch(() => props.description, v => {
    if (!isEditingDescription.value) editedDescription.value = v ?? ''
})

// Watch event types to rebuild initial selection
watch(
    () => props.eventTypes,
    () => { if (!isEditingTags.value) buildTagSelection() },
    { deep: true }
)

watch(
    () => props.languages,
    () => { if (!isEditingLanguage.value) void rebuildLanguageSelection() },
    { deep: true }
)

onMounted(() => {
    buildTagSelection()
    void rebuildLanguageSelection()
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

// Build initial tag selection
const buildTagSelection = () => {
    if (!props.eventTypes?.length) {
        tagInitialSelection.value = []
        return
    }
    tagInitialSelection.value = props.eventTypes.map<TagSelection>(t => ({
        primaryId: t.type_id,
        secondaryId: t.genre_id || null,
    }))
}

// Tags actions
const startEditingTags = () => { buildTagSelection(); isEditingTags.value = true }
const cancelEditingTags = () => { buildTagSelection(); isEditingTags.value = false }
const onTagSelectionUpdate = (payload: TagSelection[]) => { tagInitialSelection.value = payload }

// Fetch options
async function fetchEventTypes(): Promise<SelectOption[]> {
    const { data } = await apiFetch<SelectOption[]>(`/api/choosable-event-types?lang=${props.locale}`)
    return Array.isArray(data) ? data : []
}

async function fetchEventGenres(typeId: number | string): Promise<SelectOption[]> {
    const numericId = normalizeId(typeId)
    if (numericId === null) {
        return []
    }
    const { data } = await apiFetch<SelectOption[]>(`/api/choosable-event-genres/event-type/${numericId}?lang=${props.locale}`)
    return Array.isArray(data) ? data : []
}

const fetchLanguages = async (): Promise<SelectOption[]> => {
    if (!languageOptions.value.length) {
        try {
            const { data } = await apiFetch<LanguageApiResponse[]>(`/api/choosable-languages?lang=${props.locale}`)
            languageOptions.value = (Array.isArray(data) ? data : [])
                .filter((item): item is Required<LanguageApiResponse> => Boolean(item?.id && item?.name))
                .map((item) => ({ id: item.id!, name: item.name! }))
        } catch (error) {
            console.error('Failed to load languages', error)
            languageOptions.value = []
        }
    }
    return languageOptions.value
}

const saveTags = async () => {
    if (!props.eventId || !tagInitialSelection.value) return
    isSavingTags.value = true
    try {
        const typeIds = Array.from(
            new Set(
                tagInitialSelection.value
                    .map(s => normalizeId(s.primaryId))
                    .filter((id): id is number => id !== null)
            )
        )

        const genreIds = Array.from(
            new Set(
                tagInitialSelection.value
                    .map(s => normalizeId(s.secondaryId))
                    .filter((id): id is number => id !== null)
            )
        )

        await apiFetch(`/api/admin/event/${props.eventId}/types`, {
            method: 'PUT',
            body: JSON.stringify({
                types: {
                    event_type_ids: typeIds,
                    genre_type_ids: genreIds,
                }
            })
        })
        emit('updated')
        isEditingTags.value = false
    } catch (err) {
        console.error(err)
        isEditingTags.value = false
    } finally { isSavingTags.value = false }
}

function normalizeId(value: number | string | null | undefined): number | null {
    if (value === null || value === undefined) {
        return null
    }
    const numeric = typeof value === 'string' ? Number(value) : value
    return Number.isFinite(numeric) ? numeric : null
}

const normalizeLanguageCode = (value: number | string | null | undefined): string | null => {
    if (value === null || value === undefined) return null
    const code = String(value).trim()
    return code.length ? code : null
}

const rebuildLanguageSelection = async () => {
    const codes = Array.isArray(props.languages)
        ? props.languages
            .map((code) => normalizeLanguageCode(code))
            .filter((code): code is string => code !== null && code.length > 0)
        : []
    selectedLanguageCodes.value = codes
    languageInitialSelection.value = undefined
    await nextTick()
    languageInitialSelection.value = codes.map<TagSelection>((code) => ({
        primaryId: code,
        secondaryId: null,
    }))
}

const startEditingLanguage = async () => {
    await rebuildLanguageSelection()
    isEditingLanguage.value = true
    void fetchLanguages()
}

const cancelEditingLanguage = async () => {
    await rebuildLanguageSelection()
    isEditingLanguage.value = false
}

const onLanguageSelectionUpdate = (payload: TagSelection[]) => {
    languageInitialSelection.value = payload
    selectedLanguageCodes.value = payload
        .map((item) => normalizeLanguageCode(item.primaryId))
        .filter((code): code is string => code !== null)
}

const saveLanguage = async () => {
    if (!props.eventId) return
    isSavingLanguage.value = true
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/languages`, {
            method: 'PUT',
            body: JSON.stringify({
                languages: selectedLanguageCodes.value,
            }),
        })
        emit('updated')
        isEditingLanguage.value = false
    } catch (error) {
        console.error(error)
        isEditingLanguage.value = false
    } finally {
        isSavingLanguage.value = false
    }
}

watch(
    () => props.locale,
    () => {
        languageOptions.value = []
        if (isEditingLanguage.value) {
            void fetchLanguages()
        }
    }
)
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
    margin-left: auto;
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

.event-language {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-language__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.event-language__edit {
    margin-left: auto;
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-description:hover .event-language__edit,
.event-language:hover .event-language__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-language__actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
}

.event-language__button {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-language__button--cancel {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-tags__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
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

.event-additional {
    font-size: 0.95rem;
    color: var(--muted-text);
}

.event-additional p {
    margin: 0.4rem 0;
}
</style>

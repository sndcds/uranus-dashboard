<template>
    <section class="event-section">
        <header class="event-section__header">
            <h2>{{ t('event_section_details') }}</h2>
            <p>{{ t('event_section_details_subtitle') }}</p>
        </header>

        <div class="event-section__form">
            <div class="event-section__grid event-section__grid--two">
                <div class="form-field form-field--wide">
                    <label for="description">
                        {{ t('event_description_label') }}<span class="required">*</span>
                    </label>
                    <MarkdownEditorComponent id="description" v-model="details.description"
                        :placeholder="t('event_description_placeholder')" />
                    <p v-if="errors.description" class="field-error">{{ errors.description }}</p>
                </div>

                <div class="form-field form-field--wide">
                    <label for="teaser-text">{{ t('event_teaser_label') }}</label>
                    <input id="teaser-text" v-model="details.teaserText" type="text"
                        :placeholder="t('event_teaser_placeholder')" />
                </div>
            </div>

            <TwoStageTagListComponent :fetchPrimaries="fetchLanguages" :initialSelection="[]"
                :labelPrimary="t('event_language_label')" :editable="true" :isEditing="true"
                @update-selection="onSelectionUpdate" />

            <div class="event-section__grid event-section__grid--two">

                <div class="form-field">
                    <label for="min-age">{{ t('event_min_age') }}</label>
                    <input id="min-age" v-model.number="details.minAge" type="number" min="0"
                        :placeholder="t('event_min_age_placeholder')" />
                </div>

                <div class="form-field">
                    <label for="max-age">{{ t('event_max_age') }}</label>
                    <input id="max-age" v-model.number="details.maxAge" type="number" min="0"
                        :placeholder="t('event_max_age_placeholder')" />
                </div>

                <div class="form-field form-field--wide">
                    <label for="participation-info">{{ t('event_participation_label') }}</label>
                    <textarea id="participation-info" v-model="details.participationInfo" rows="3"
                        :placeholder="t('event_participation_placeholder')"></textarea>
                </div>

                <div class="form-field">
                    <label for="organizer">{{ t('event_presented_by_label') }}</label>
                    <input id="organizer" v-model="details.presenter" type="text"
                        :placeholder="t('event_presented_by_placeholder')" />
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'
import TwoStageTagListComponent from "@/components/TwoStageTagListComponent.vue"

const props = defineProps<{
    organizerId: number | null
    modelValue: EventDetailsModel
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: EventDetailsModel): void
}>()

const { t, locale } = useI18n({ useScope: 'global' })

interface EventDetailsModel {
    description: string
    teaserText: string
    languages: string | null
    minAge: number | null
    maxAge: number | null
    participationInfo: string
    presenter: string
}

const emptyDetails = (): EventDetailsModel => ({
    description: '',
    teaserText: '',
    languages: null,
    minAge: null,
    maxAge: null,
    participationInfo: '',
    presenter: '',
})

const details = reactive<EventDetailsModel>(emptyDetails())
const errors = reactive<{ description: string | null; language: string | null }>({
    description: null,
    language: null,
})

interface Selection {
    primaryId: string | number | null | undefined
}

interface LanguageOption {
    code: string
    name: string
}

interface LanguageApiResponse {
    id?: string | null
    name?: string | null
}

const languages = ref<LanguageOption[]>([])

const fetchLanguages = async () => {
    if (!languages.value.length) {
        try {
            const { data } = await apiFetch<LanguageApiResponse[]>(`/api/choosable-languages?lang=${locale.value}`)
            languages.value = data
                .filter((lang): lang is LanguageApiResponse & { id: string; name: string } => Boolean(lang.id && lang.name))
                .map((lang) => ({ code: lang.id!, name: lang.name! }))
        } catch (err) {
            languages.value = []
            console.error('Failed to load languages', err)
        }
    }

    return languages.value.map((lang) => ({ id: lang.code, name: lang.name }))
}

const selectedLanguageCodes = ref<string[]>([])

const onSelectionUpdate = (selection: Selection[]) => {
    // selectedLanguageCodes is ref<string[]>
    selectedLanguageCodes.value = selection
        .map(pair => pair.primaryId)
        .filter((id): id is number | string => id !== undefined && id !== null)
        .map(id => String(id)) // convert all IDs to strings

    if (!selectedLanguageCodes.value.length) {
        return
    }

    languages.value = languages.value
        .filter((lang) => selectedLanguageCodes.value.includes(lang.code))
        .concat(
            selectedLanguageCodes.value
                .filter((code) => !languages.value.some((lang) => lang.code === code))
                .map((code) => ({ code, name: code }))
        )
}

onMounted(() => {
    void fetchLanguages()
})

watch(
    () => locale.value,
    () => {
        languages.value = []
        void fetchLanguages()
    }
)

watch(
    () => props.modelValue,
    (value) => {
        Object.assign(details, emptyDetails(), value || {})
    },
    { deep: true, immediate: true }
)

watch(
    details,
    (value) => {
        emit('update:modelValue', { ...value })
    },
    { deep: true }
)

const validate = () => {
    errors.description = details.description.trim() ? null : t('event_error_required')
    errors.language = details.language ? null : t('event_error_required')
    return Object.values(errors).every((msg) => !msg)
}

watch(
    details,
    () => {
        if (errors.description && details.description.trim()) errors.description = null
        if (errors.language && details.language) errors.language = null
    },
    { deep: true }
)

defineExpose({ validate })
</script>

<style scoped lang="scss">
.event-section {
    @include form-section();
}

.event-section__header {
    @include form-section-header();
}

.event-section__form {
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
}

.event-section__grid {
    display: grid;
    gap: clamp(1rem, 2vw, 1.5rem);
}

.event-section__grid--two {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}

.form-field {
    @include form-group();

    textarea {
        resize: vertical;
    }
}

.form-field--wide {
    grid-column: 1 / -1;
}

.field-error {
    margin: 0;
    font-size: 0.85rem;
    color: #b91c1c;
    font-weight: 600;
}

@media (max-width: 540px) {
    .event-section {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }

    .event-section__grid--two {
        grid-template-columns: 1fr;
    }
}
</style>

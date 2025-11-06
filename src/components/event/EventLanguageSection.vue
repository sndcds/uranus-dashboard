<template>
    <section class="uranus-hover-section">
      <UranusInlineEditLabel
          :label-text="t('languages')"
          :edit-button-text="t('edit')"
          @edit-started="startEditing"
      />

        <TwoStageTagListComponent
            v-if="selection"
            :fetchPrimaries="fetchLanguages"
            :initialSelection="selection"
            :labelPrimary="t('language')"
            :placeholderPrimary="t('choose_language')"
            :editable="true"
            :isEditing="isEditing"
            @update-selection="onSelectionUpdate"
        />

      <div
            v-if="isEditing">
            <button
                type="button"
                class="uranus-inline-cancel-button"
                @click="cancelEditing"
                :disabled="isSaving"
            >
                {{ t('form_cancel') }}
            </button>
            <button
                type="button"
                class="uranus-inline-save-button"
                @click="saveLanguages"
                :disabled="isSaving"
            >
                <span v-if="!isSaving">{{ t('form_save') }}</span>
                <span v-else>{{ t('saving') }}</span>
            </button>
        </div>
    </section>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import TwoStageTagListComponent from '@/components/TwoStageTagListComponent.vue'
import type { Selection as TagSelection } from '@/components/TwoStageTagListComponent.vue'
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue";

interface LanguageApiResponse {
    id?: string | null
    name?: string | null
}

const props = defineProps<{
    eventId: number
    languages: string[] | null
    locale: string
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const isEditing = ref(false)
const isSaving = ref(false)
const selection = ref<TagSelection[] | undefined>(undefined)
const cachedLanguages = ref<Array<{ id: string; name: string }>>([])
const selectedCodes = ref<string[]>([])

const buildSelection = () => {
    const codes = Array.isArray(props.languages)
        ? props.languages
            .map((code) => normalizeLanguageCode(code))
            .filter((code): code is string => code !== null)
        : []

    selectedCodes.value = codes
    selection.value = codes.map<TagSelection>((code) => ({
        primaryId: code,
        secondaryId: null,
    }))
}

const startEditing = async () => {
    buildSelection()
    isEditing.value = true
    await nextTick()
    void fetchLanguages()
}

const cancelEditing = () => {
    buildSelection()
    isEditing.value = false
}

const onSelectionUpdate = (payload: TagSelection[]) => {
    selection.value = payload
    selectedCodes.value = payload
        .map((item) => normalizeLanguageCode(item.primaryId))
        .filter((code): code is string => code !== null)
}

const fetchLanguages = async (): Promise<Array<{ id: string; name: string }>> => {
    if (!cachedLanguages.value.length) {
        try {
            const { data } = await apiFetch<LanguageApiResponse[]>(`/api/choosable-languages?lang=${props.locale}`)
            cachedLanguages.value = (Array.isArray(data) ? data : [])
                .filter((item): item is Required<LanguageApiResponse> => Boolean(item?.id && item?.name))
                .map((item) => ({ id: item.id!, name: item.name! }))
        } catch (err) {
            console.error('Failed to load languages', err)
            cachedLanguages.value = []
        }
    }
    return cachedLanguages.value
}

const saveLanguages = async () => {
    if (!props.eventId) return
    isSaving.value = true
    try {
        await apiFetch(`/api/admin/event/${props.eventId}/languages`, {
            method: 'PUT',
            body: JSON.stringify({ languages: selectedCodes.value }),
        })
        emit('updated')
        isEditing.value = false
    } catch (err) {
        console.error('Failed to save languages', err)
        isEditing.value = false
    } finally {
        isSaving.value = false
    }
}

const normalizeLanguageCode = (value: number | string | null | undefined): string | null => {
    if (value === null || value === undefined) return null
    const code = String(value).trim()
    return code.length ? code : null
}

watch(
    () => props.languages,
    () => {
        if (!isEditing.value) {
            buildSelection()
        }
    },
    { deep: true }
)

watch(
    () => props.locale,
    () => {
        cachedLanguages.value = []
        if (isEditing.value) {
            void fetchLanguages()
        }
    }
)

onMounted(() => {
    buildSelection()
})
</script>

<style scoped lang="scss">
.event-language-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-language-section__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.event-language-section__edit {
    margin-left: auto;
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-language-section:hover .event-language-section__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-language-section__actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
}

.event-language-section__button {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-language-section__button--cancel {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}
</style>

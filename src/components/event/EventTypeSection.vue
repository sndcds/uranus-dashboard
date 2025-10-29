<template>
    <section class="event-type-section">
        <div class="event-type-section__header">
            <h3>{{ t('event_tags_heading') }}</h3>
            <button
                v-if="!isEditing"
                type="button"
                class="event-type-section__edit"
                @click="startEditing"
            >
                {{ t('event_tags_edit') }}
            </button>
        </div>

        <TwoStageTagListComponent
            v-if="selection"
            :fetchPrimaries="fetchEventTypes"
            :fetchSecondaries="fetchEventGenres"
            :initialSelection="selection"
            :labelPrimary="t('event_type_label')"
            :labelSecondary="t('event_genre_label')"
            :editable="true"
            :isEditing="isEditing"
            @update-selection="onSelectionUpdate"
        />

        <div v-if="isEditing" class="event-type-section__actions">
            <button
                type="button"
                class="event-type-section__button event-type-section__button--cancel"
                @click="cancelEditing"
                :disabled="isSaving"
            >
                {{ t('form_cancel') }}
            </button>
            <button
                type="button"
                class="event-type-section__button"
                @click="saveTypes"
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

interface EventType {
    type_id: number
    genre_id: number | null
}

interface SelectOption {
    id: number | string
    name: string
}

const props = defineProps<{
    eventId: number
    locale: string
    eventTypes: EventType[]
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const isEditing = ref(false)
const isSaving = ref(false)
const selection = ref<TagSelection[] | undefined>(undefined)

const buildSelection = () => {
    if (!Array.isArray(props.eventTypes) || !props.eventTypes.length) {
        selection.value = []
        return
    }

    selection.value = props.eventTypes.map<TagSelection>((type) => ({
        primaryId: type.type_id,
        secondaryId: type.genre_id ?? null,
    }))
}

const startEditing = async () => {
    buildSelection()
    isEditing.value = true
    await nextTick()
}

const cancelEditing = () => {
    buildSelection()
    isEditing.value = false
}

const onSelectionUpdate = (payload: TagSelection[]) => {
    selection.value = payload
}

async function fetchEventTypes(): Promise<SelectOption[]> {
    const { data } = await apiFetch<SelectOption[]>(`/api/choosable-event-types?lang=${props.locale}`)
    return Array.isArray(data) ? data : []
}

async function fetchEventGenres(primaryId: number | string): Promise<SelectOption[]> {
    const normalizedId = normalizeId(primaryId)
    if (normalizedId === null) {
        return []
    }
    const { data } = await apiFetch<SelectOption[]>(`/api/choosable-event-genres/event-type/${normalizedId}?lang=${props.locale}`)
    return Array.isArray(data) ? data : []
}

const saveTypes = async () => {
    if (!props.eventId || !selection.value) return
    isSaving.value = true
    try {
        const payload = selection.value
            .map((item) => ({
                type_id: normalizeId(item.primaryId),
                genre_id: normalizeId(item.secondaryId),
            }))
            .filter(
                (pair): pair is { type_id: number; genre_id: number | null } =>
                    pair.type_id !== null
            )

        await apiFetch(`/api/admin/event/${props.eventId}/types`, {
            method: 'PUT',
            body: JSON.stringify({ types: payload }),
        })
        emit('updated')
        isEditing.value = false
    } catch (err) {
        console.error('Failed to save event types', err)
        isEditing.value = false
    } finally {
        isSaving.value = false
    }
}

const normalizeId = (value: number | string | null | undefined): number | null => {
    if (value === null || value === undefined) return null
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

watch(
    () => props.eventTypes,
    () => {
        if (!isEditing.value) {
            buildSelection()
        }
    },
    { deep: true }
)

onMounted(() => {
    buildSelection()
})
</script>

<style scoped lang="scss">
.event-type-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-type-section__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
}

.event-type-section__edit {
    margin-left: auto;
    @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
}

.event-type-section:hover .event-type-section__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-type-section__actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
}

.event-type-section__button {
    @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}

.event-type-section__button--cancel {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
}
</style>

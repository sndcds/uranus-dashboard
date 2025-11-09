<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('event_tags_heading')"
        :edit-button-text="t('edit')"
        @edit-started="startEditing"
    />
    <TwoStageTagListComponent
        v-if="selection"
        :fetchPrimaries="fetchEventTypes"
        :fetchSecondaries="fetchEventGenres"
        :initialSelection="selection"
        :labelPrimary="t('event_type')"
        :labelSecondary="t('genre')"
        :placeholderPrimary="t('choose_event_type')"
        :placeholderSecondary="t('choose_genre')"
        :editable="true"
        :isEditing="isEditing"
        @update-selection="onSelectionUpdate"/>

    <UranusInlineActionBar v-if="isEditing">
      <UranusInlineCancelButton
          :label="t('button_cancel')"
          :onClick="cancelEditing"
      />

      <UranusInlineOKButton
          :label="t('button_save')"
          :onClick="saveTypes"
      />
    </UranusInlineActionBar>

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import TwoStageTagListComponent from '@/components/TwoStageTagListComponent.vue'
import type { Selection as TagSelection } from '@/components/TwoStageTagListComponent.vue'
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue";
import UranusInlineEditSection from "@/components/uranus/UranusInlineEditSection.vue";
import UranusInlineCancelButton from "@/components/uranus/UranusInlineCancelButton.vue";
import UranusInlineActionBar from "@/components/uranus/UranusInlineActionBar.vue";
import UranusInlineOKButton from "@/components/uranus/UranusInlineOKButton.vue";

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
</style>

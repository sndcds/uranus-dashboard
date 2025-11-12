<template>
    <UranusCard>
    <UranusCardHeader :title="t('event_section_basic')" />

        <div class="event-section__form">
            <EventTitleFieldsComponent
                :title="basicInfo.title"
                :subtitle="basicInfo.subtitle"
                :title-error="errors.title"
                @update:title="basicInfo.title = $event"
                @update:subtitle="basicInfo.subtitle = $event"
            />

            <div class="event-section__grid">
                <UranusFieldLabel id="organizer" :label="t('event_organizer_label')" required :error="errors.organizerId">
                    <select id="organizer" v-model="basicInfo.organizerId">
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="org in organizers" :key="org.id" :value="org.id">
                            {{ org.name }}
                        </option>
                    </select>
                </UranusFieldLabel>

                <UranusFieldLabel id="event-venue" :label="t('venue')" required :error="errors.venueId">
                    <select id="event-venue" v-model="basicInfo.venueId">
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="ven in venues" :key="ven.id" :value="ven.id">
                            {{ ven.name }}
                        </option>
                    </select>
                </UranusFieldLabel>

                <UranusFieldLabel id="event-space" :label="t('event_space_label')">
                    <select id="event-space" v-model="basicInfo.spaceId">
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="sp in spaces" :key="sp.id" :value="sp.id">
                            {{ sp.name }}
                        </option>
                    </select>
                </UranusFieldLabel>
            </div>

              <TwoStageTagListComponent
                  :fetchPrimaries="fetchEventTypes"
                  :fetchSecondaries="fetchEventGenres"
                  :initialSelection="[]"
                  :editable="true"
                  :isEditing="true"
                  :labelPrimary="t('event_type')"
                  :labelSecondary="t('genre')"
                  :placeholderPrimary="t('choose_event_type')"
                  :placeholderSecondary="t('choose_genre')"
                  @update-selection="onSelectionUpdate"
              />
        </div>
    </UranusCard>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import type { EventBasicInfoModel } from '@/models/event'

import TwoStageTagListComponent from "@/components/TwoStageTagListComponent.vue"
import EventTitleFieldsComponent from '@/components/EventTitleFieldsComponent.vue'
import UranusCardHeader from "@/components/uranus/UranusCardHeader.vue";
import UranusFieldLabel from "@/components/uranus/UranusFieldLabel.vue";
import UranusCard from "@/components/uranus/UranusCard.vue";

interface Selection {
  primaryId: number
  secondaryId?: number | null
}

const onSelectionUpdate = (selection: Selection[]) => {
  // Map the emitted selection to your internal EventTypeGenrePair format
  basicInfo.typeGenrePairs = selection.map(pair => ({
    typeId: pair.primaryId,
    genreId: pair.secondaryId ?? null,
  }))

  console.log('Updated typeGenrePairs:', basicInfo.typeGenrePairs)
}

const props = defineProps<{
    organizerId: number | null
    modelValue: EventBasicInfoModel
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: EventBasicInfoModel): void
    (e: 'spaces-change', value: SelectOption[]): void
}>()

const { t } = useI18n({ useScope: 'global' })

interface SelectOption {
    id: number
    name: string
}

const emptyBasicInfo = (): EventBasicInfoModel => ({
    title: '',
    subtitle: '',
    organizerId: null,
    venueId: null,
    spaceId: null,
    typeGenrePairs: [],
})

const basicInfo = reactive<EventBasicInfoModel>(emptyBasicInfo())

const venues = ref<SelectOption[]>([])
const organizers = ref<SelectOption[]>([])
const spaces = ref<SelectOption[]>([])
const errors = reactive({
    title: null as string | null,
    subtitle: null as string | null,
    organizerId: null as string | null,
    venueId: null as string | null,
    spaceId: null as string | null,
})

watch(
    () => props.modelValue,
    (value) => {
        Object.assign(basicInfo, emptyBasicInfo(), value || {})
    },
    { deep: true, immediate: true }
)

watch(
    basicInfo,
    (value) => {
        emit('update:modelValue', { ...value })
    },
    { deep: true }
)

watch(
    () => props.organizerId,
    async (id) => {
        await fetchOrganizers(id ?? null)
        await fetchVenues(id ?? null)
        await fetchSpaces(basicInfo.venueId)
    },
    { immediate: true }
)

async function fetchOrganizers(contextId: number | null) {
    if (!contextId) {
        organizers.value = []
        basicInfo.organizerId = null
        return
    }

    try {
        const { data } = await apiFetch<SelectOption[]>(
            `/api/admin/user/me/choosable-event-organizers/organizer/${contextId}`
        )

        organizers.value = Array.isArray(data) ? data : []

        if (!organizers.value.find((org) => org.id === basicInfo.organizerId)) {
            basicInfo.organizerId = null
        }
    } catch (error) {
        console.error('Failed to load organizers', error)
        organizers.value = []
        basicInfo.organizerId = null
    }
}

watch(
    () => basicInfo.venueId,
    async (venueId) => {
        await fetchSpaces(venueId)
    }
)

async function fetchVenues(contextId: number | null) {
    if (!contextId) {
        venues.value = []
        basicInfo.venueId = null
        emit('spaces-change', [])
        return
    }

    try {
        const { data } = await apiFetch<SelectOption[]>(`/api/choosable-venues/organizer/${contextId}`)
        venues.value = Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Failed to load venues', error)
        venues.value = []
        basicInfo.venueId = null
        emit('spaces-change', [])
    }
}

async function fetchSpaces(contextId: number | null) {
    if (!contextId) {
        spaces.value = []
        emit('spaces-change', [])
        return
    }

    try {
        const { data } = await apiFetch<SelectOption[]>(`/api/choosable-spaces/venue/${contextId}`)
        spaces.value = Array.isArray(data) ? data : []

        if (!spaces.value.find((space) => space.id === basicInfo.spaceId)) {
            basicInfo.spaceId = null
        }

        emit('spaces-change', [...spaces.value])
    } catch (error) {
        console.error('Failed to load spaces', error)
        spaces.value = []
        basicInfo.spaceId = null
        emit('spaces-change', [])
    }
}

async function fetchEventTypes(): Promise<SelectOption[]> {
    const { data } = await apiFetch<SelectOption[]>('/api/choosable-event-types?lang=de')
    return Array.isArray(data) ? data : []
}

async function fetchEventGenres(typeId: number): Promise<SelectOption[]> {
    const { data } = await apiFetch<SelectOption[]>(`/api/choosable-event-genres/event-type/${typeId}?lang=de`)
    return Array.isArray(data) ? data : []
}

const validate = () => {
    errors.title = basicInfo.title.trim() ? null : t('event_error_required')
    errors.organizerId = basicInfo.organizerId ? null : t('event_error_required')
    errors.venueId = basicInfo.venueId ? null : t('event_error_required_optional')

    return Object.values(errors).every((msg) => !msg)
}

watch(
    basicInfo,
    () => {
        if (errors.title && basicInfo.title.trim()) errors.title = null
        if (errors.organizerId && basicInfo.organizerId) errors.organizerId = null
        if (errors.venueId && basicInfo.venueId) errors.venueId = null
    },
    { deep: true }
)

defineExpose({ validate })
</script>

<style scoped lang="scss">
.event-section__form {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2.5vw, 1.5rem);
}

.event-section__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: clamp(1rem, 2vw, 1.5rem);
}

</style>

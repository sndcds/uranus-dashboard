<template>
    <form class="uranus-form" @submit.prevent="handleSubmit" novalidate>
        <EventBasicInfoComponent ref="basicInfoRef" :model-value="basicInfo" :organizer-id="organizerId"
            @update:modelValue="onBasicInfoUpdate" @spaces-change="onSpacesChange" />

        <UranusCard>
            <UranusCardHeader :title="t('event_dates_and_times_title')"
                :subtitle="t('event_dates_and_times_subtitle')" />

            <EventDatesComponent ref="datesRef" :model-value="eventDates" :organizer-id="organizerId"
                :spaces="availableSpaces" @update:modelValue="onDatesUpdate" />
        </UranusCard>

        <EventDetailsComponent ref="detailsRef" :model-value="eventDetails" :organizer-id="organizerId"
            @update:modelValue="onDetailsUpdate" />

        <section class="uranus-form-action-footer">
            <button class="uranus-button" type="submit" :disabled="loading">{{ submitLabel }}</button>
        </section>
    </form>

    <transition name="fade">
        <p v-if="displayError" class="feedback feedback--error">{{ displayError }}</p>
    </transition>
    <transition name="fade">
        <p v-if="successMessage" class="feedback feedback--success">{{ successMessage }}</p>
    </transition>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import EventBasicInfoComponent from '@/components/EventBasicInfoComponent.vue'
import EventDatesComponent from '@/components/EventDatesComponent.vue'
import EventDetailsComponent from '@/components/EventDetailsComponent.vue'
import UranusCard from "@/components/ui/UranusCard.vue"
import UranusCardHeader from "@/components/ui/UranusCardHeader.vue"

interface SelectOption {
    id: number
    name: string
}

export interface EventBasicInfoModel {
    title: string
    subtitle: string
    organizerId: number | null
    venueId: number | null
    spaceId: number | null
    typeGenrePairs: EventTypeGenrePair[]
}

export interface EventTypeGenrePair {
    typeId: number | null
    genreId: number | null
}

export interface EventDateModel {
    startDate: string
    startTime: string
    endDate: string | null
    endTime: string | null
    entryTime: string | null
    venueId: number | null
    spaceId: number | null
    allDayEvent: boolean | null
    choosableSpaces: SelectOption[]
}

export interface EventDetailsModel {
    description: string
    teaserText: string
    languages: string[] | null
    minAge: number | null
    maxAge: number | null
    participationInfo: string
    presenter: string
}

export interface EventFormSubmitPayload {
    title: string
    subtitle: string | null
    organizerId: number
    venueId: number | null
    spaceId: number | null
    types: Array<{
        typeId: number | null
        genreId: number | null
    }>
    description: string
    teaserText: string | null
    languages: string[]
    minAge: number | null
    maxAge: number | null
    participationInfo: string | null
    presenter: string | null
    dates: Array<{
        startDate: string
        endDate: string | null
        startTime: string
        endTime: string | null
        entryTime: string | null
        space_id: number | null
        allDay: boolean
    }>
}

export interface EventFormInitialValues {
    basicInfo?: EventBasicInfoModel
    eventDates?: EventDateModel[]
    eventDetails?: EventDetailsModel
}

const props = withDefaults(defineProps<{
    submitLabel: string
    loading?: boolean
    errorMessage?: string | null
    successMessage?: string | null
    initialValues?: EventFormInitialValues
    organizerId: number | null
}>(), {
    loading: false,
    errorMessage: null,
    successMessage: null,
})

const emit = defineEmits<{
    (e: 'submit', payload: EventFormSubmitPayload): void
    (e: 'clear-error'): void
}>()

const { t } = useI18n({ useScope: 'global' })

const basicInfoRef = ref<InstanceType<typeof EventBasicInfoComponent> | null>(null)
const datesRef = ref<InstanceType<typeof EventDatesComponent> | null>(null)
const detailsRef = ref<InstanceType<typeof EventDetailsComponent> | null>(null)

const basicInfo = reactive<EventBasicInfoModel>({
    title: '',
    subtitle: '',
    organizerId: null,
    venueId: null,
    spaceId: null,
    typeGenrePairs: [],
})

const normalizeEventDate = (date: Partial<EventDateModel>): EventDateModel => ({
    startDate: date.startDate ?? '',
    startTime: date.startTime ?? '',
    endDate: date.endDate ?? null,
    endTime: date.endTime ?? null,
    entryTime: date.entryTime ?? null,
    venueId: date.venueId ?? null,
    spaceId: date.spaceId ?? null,
    allDayEvent: date.allDayEvent ?? null,
    choosableSpaces: Array.isArray(date.choosableSpaces) ? [...date.choosableSpaces] : [],
})

const eventDates = ref<EventDateModel[]>([])

const eventDetails = reactive<EventDetailsModel>({
    description: '',
    teaserText: '',
    languages: null,
    minAge: null,
    maxAge: null,
    participationInfo: '',
    presenter: '',
})

const availableSpaces = ref<SelectOption[]>([])
const localError = ref<string | null>(null)

const displayError = computed(() => localError.value ?? props.errorMessage ?? null)

const onBasicInfoUpdate = (value: EventBasicInfoModel) => {
    Object.assign(basicInfo, value)
}

const onDatesUpdate = (value: EventDateModel[]) => {
    eventDates.value = Array.isArray(value) ? value.map((date) => normalizeEventDate(date)) : []
}

const onDetailsUpdate = (value: EventDetailsModel) => {
    Object.assign(eventDetails, value)
}

const onSpacesChange = (options: SelectOption[]) => {
    const normalized = Array.isArray(options) ? [...options] : []
    availableSpaces.value = normalized

    const validIds = new Set(normalized.map((option) => option.id))

    if (!validIds.has(basicInfo.spaceId ?? -1)) {
        basicInfo.spaceId = null
    }

    let changed = false
    const updatedDates = eventDates.value.map((date) => {
        if (date.spaceId && !validIds.has(date.spaceId)) {
            changed = true
            return { ...date, spaceId: null }
        }
        return date
    })

    if (changed) {
        eventDates.value = updatedDates
    }
}

watch(
    () => props.organizerId,
    () => {
        basicInfo.organizerId = props.organizerId
    },
    { immediate: true }
)

const canSubmit = computed(() => {
    return (
        !!basicInfo.title &&
        basicInfo.organizerId !== null &&
        eventDates.value.length > 0 &&
        eventDates.value.every((date) => date.startDate && date.startTime)
    )
})

const handleSubmit = () => {
    if (props.loading) {
        return
    }

    localError.value = null

    const sectionResults = [
        basicInfoRef.value?.validate?.(),
        datesRef.value?.validate?.(),
        detailsRef.value?.validate?.(),
    ]

    const sectionsValid = sectionResults.every((result) => result !== false)

    if (!sectionsValid || !canSubmit.value) {
        localError.value = t('event_submit_missing_fields')
        return
    }

    if (basicInfo.organizerId === null) {
        localError.value = t('event_submit_missing_fields')
        return
    }

    emit('submit', {
        title: basicInfo.title,
        subtitle: basicInfo.subtitle || null,
        organizerId: basicInfo.organizerId,
        venueId: basicInfo.venueId,
        spaceId: basicInfo.spaceId,
        types: basicInfo.typeGenrePairs.map((pair: EventTypeGenrePair) => ({
            typeId: pair.typeId,
            genreId: pair.genreId ?? null,
        })),
        description: eventDetails.description,
        teaserText: eventDetails.teaserText || null,
        languages: eventDetails.languages || [],
        minAge: eventDetails.minAge,
        maxAge: eventDetails.maxAge,
        participationInfo: eventDetails.participationInfo || null,
        presenter: eventDetails.presenter || null,
        dates: eventDates.value.map((date) => ({
            startDate: date.startDate,
            endDate: date.endDate,
            startTime: date.startTime,
            endTime: date.endTime,
            entryTime: date.entryTime,
            space_id: date.spaceId,
            allDay: date.allDayEvent || null,
        })),
    })
}

const applyInitialValues = (values?: EventFormInitialValues) => {
    if (values?.basicInfo) {
        Object.assign(basicInfo, values.basicInfo)
    }
    if (values?.eventDates) {
        eventDates.value = values.eventDates.map((date) => normalizeEventDate(date))
    }
    if (values?.eventDetails) {
        Object.assign(eventDetails, values.eventDetails)
    }
    localError.value = null
}

watch(
    () => props.initialValues,
    (values) => {
        applyInitialValues(values)
    },
    { immediate: true, deep: true }
)

watch(
    () => props.errorMessage,
    () => {
        if (props.errorMessage) {
            localError.value = null
        }
    }
)

defineExpose({
    setValues: applyInitialValues,
})
</script>

<style scoped lang="scss">
.feedback {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.9rem;

    &--error {
        background-color: #fee;
        color: #c00;
        border: 1px solid #fcc;
    }

    &--success {
        background-color: #efe;
        color: #060;
        border: 1px solid #cfc;
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

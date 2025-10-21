<template>
    <div class="event-form-page">
        <section class="event-form-hero">
            <h1>{{ t('event_form_title') }}</h1>
            <p>{{ t('event_form_subtitle') }}</p>
        </section>

        <form class="event-form-grid" @submit.prevent="submitEvent">
            <EventBasicInfoComponent
                ref="basicInfoRef"
                :model-value="basicInfo"
                :organizer-id="appStore.organizerId ?? null"
                @update:modelValue="onBasicInfoUpdate"
            />
            <EventDatesComponent
                ref="datesRef"
                :model-value="eventDates"
                :organizer-id="appStore.organizerId ?? null"
                @update:modelValue="onDatesUpdate"
            />
            <EventDetailsComponent
                ref="detailsRef"
                :model-value="eventDetails"
                :organizer-id="appStore.organizerId ?? null"
                @update:modelValue="onDetailsUpdate"
            />

            <div class="event-form-actions">
                <transition name="fade">
                    <p v-if="submitError" class="feedback feedback--error" role="alert">
                        {{ submitError }}
                    </p>
                </transition>
                <transition name="fade">
                    <p v-if="submitSuccess" class="feedback feedback--success" role="status">
                        {{ submitSuccess }}
                    </p>
                </transition>
                <button type="submit" :disabled="isSubmitting">
                    <span v-if="!isSubmitting">{{ t('event_submit_button') }}</span>
                    <span v-else>{{ t('saving') }}</span>
                </button>
            </div>
        </form>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useAppStore } from '@/store/appStore'
import EventBasicInfoComponent from '@/components/EventBasicInfoComponent.vue'
import EventDatesComponent from '@/components/EventDatesComponent.vue'
import EventDetailsComponent from '@/components/EventDetailsComponent.vue'

const { t } = useI18n({ useScope: 'global' })
const appStore = useAppStore()
const basicInfoRef = ref<InstanceType<typeof EventBasicInfoComponent> | null>(null)
const datesRef = ref<InstanceType<typeof EventDatesComponent> | null>(null)
const detailsRef = ref<InstanceType<typeof EventDetailsComponent> | null>(null)

interface BasicInfoModel {
    title: string
    subtitle: string
    organizerId: number | null
    venueId: number | null
    spaceId: number | null
    eventTypeIds: number[]
    genreId: number | null
}

interface EventDateModel {
    startDate: string
    endDate: string | null
    startTime: string
    endTime: string
    entryTime: string | null
    spaceId: number | null
    allDayEvent: boolean
}

interface EventDetailsModel {
    description: string
    teaserText: string
    language: string | null
    minAge: number | null
    maxAge: number | null
    participationInfo: string
    presenter: string
}

const basicInfo = reactive<BasicInfoModel>({
    title: '',
    subtitle: '',
    organizerId: null,
    venueId: null,
    spaceId: null,
    eventTypeIds: [],
    genreId: null,
})

const eventDates = ref<EventDateModel[]>([])

const eventDetails = reactive<EventDetailsModel>({
    description: '',
    teaserText: '',
    language: null,
    minAge: null,
    maxAge: null,
    participationInfo: '',
    presenter: '',
})

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)

const onBasicInfoUpdate = (value: BasicInfoModel) => {
    Object.assign(basicInfo, value)
}

const onDatesUpdate = (value: EventDateModel[]) => {
    eventDates.value = Array.isArray(value) ? value : []
}

const onDetailsUpdate = (value: EventDetailsModel) => {
    Object.assign(eventDetails, value)
}

watch(
    () => appStore.organizerId,
    () => {
        basicInfo.organizerId = null
    }
)

const canSubmit = computed(() => {
    return (
        !!basicInfo.title &&
        basicInfo.organizerId !== null &&
        basicInfo.eventTypeIds.length > 0 &&
        eventDates.value.length > 0 &&
        eventDates.value.every((date) => date.startDate && date.startTime && date.endTime)
    )
})

const resetForm = () => {
    basicInfo.title = ''
    basicInfo.subtitle = ''
    basicInfo.venueId = null
    basicInfo.spaceId = null
    basicInfo.eventTypeIds = []
    basicInfo.genreId = null

    eventDates.value = []

    eventDetails.description = ''
    eventDetails.teaserText = ''
    eventDetails.language = null
    eventDetails.minAge = null
    eventDetails.maxAge = null
    eventDetails.participationInfo = ''
    eventDetails.presenter = ''
}

const submitEvent = async () => {
    const sectionResults = [
        basicInfoRef.value?.validate?.(),
        datesRef.value?.validate?.(),
        detailsRef.value?.validate?.(),
    ]

    const sectionsValid = sectionResults.every((result) => result !== false)

    if (!sectionsValid || !canSubmit.value) {
        submitError.value = t('event_submit_missing_fields')
        submitSuccess.value = null
        return
    }

    isSubmitting.value = true
    submitError.value = null
    submitSuccess.value = null

    const payload = {
        title: basicInfo.title,
        subtitle: basicInfo.subtitle || null,
        organizer_id: basicInfo.organizerId,
        venue_id: basicInfo.venueId,
        default_space_id: basicInfo.spaceId,
        event_type_ids: basicInfo.eventTypeIds,
        genre_id: basicInfo.genreId,
        details: {
            description: eventDetails.description,
            teaser_text: eventDetails.teaserText || null,
            language: eventDetails.language,
            min_age: eventDetails.minAge,
            max_age: eventDetails.maxAge,
            participation_info: eventDetails.participationInfo,
            presented_by: eventDetails.presenter,
        },
        occurrences: eventDates.value.map((date) => ({
            start_date: date.startDate,
            end_date: date.endDate,
            start_time: date.startTime,
            end_time: date.endTime,
            entry_time: date.entryTime,
            space_id: date.spaceId ?? basicInfo.spaceId,
            all_day: date.allDayEvent,
        })),
    }

    console.log(payload)

    try {
        const { status } = await apiFetch('/api/admin/event/create', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
        if (status >= 200 && status < 300) {
            submitSuccess.value = t('event_submit_success')
            resetForm()
        } else {
            submitError.value = t('event_submit_error', { status })
        }
    } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            submitError.value = e.data?.error || t('event_submit_error_generic')
        } else if (err instanceof Error) {
            submitError.value = err.message
        } else {
            submitError.value = t('event_submit_error_generic')
        }
    } finally {
        isSubmitting.value = false
    }
}
</script>

<style scoped lang="scss">
.event-form-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.5rem, 3vw, 2.5rem);
    padding: clamp(1.5rem, 4vw, 3rem);
    background: linear-gradient(135deg, rgba(72, 93, 255, 0.1), rgba(141, 233, 255, 0.15));
    backdrop-filter: blur(6px);
}

.event-form-hero {
    text-align: center;
    max-width: 560px;
    color: #1f2937;

    h1 {
        font-size: clamp(1.9rem, 3vw, 2.5rem);
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    p {
        margin: 0;
        font-size: clamp(1rem, 2.3vw, 1.15rem);
        color: rgba(31, 41, 55, 0.75);
        line-height: 1.6;
    }
}

.event-form-grid {
    width: min(1080px, 100%);
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.event-form-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-end;
}

button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.9rem 2.2rem;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #485dff, #60a5fa);
    color: #fff;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 12px 25px rgba(72, 93, 255, 0.35);
        filter: brightness(1.05);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px rgba(96, 165, 250, 0.35);
    }

    &:disabled {
        cursor: wait;
        opacity: 0.7;
        transform: none;
        box-shadow: none;
    }
}

.feedback {
    font-size: 0.95rem;
    font-weight: 600;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    margin: 0;
    text-align: right;
    border: 1px solid transparent;

    &--error {
        color: #991b1b;
        background: rgba(254, 202, 202, 0.45);
        border-color: rgba(248, 113, 113, 0.35);
    }

    &--success {
        color: #047857;
        background: rgba(167, 243, 208, 0.45);
        border-color: rgba(74, 222, 128, 0.35);
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

@media (max-width: 540px) {
    .event-form-actions {
        align-items: stretch;
    }

    button {
        width: 100%;
    }
}
</style>

<template>
    <div class="event-form-page">
        <section class="event-form-hero">
            <h1>{{ t('event_form_title') }}</h1>
            <p>{{ t('event_form_subtitle') }}</p>
        </section>

        <form class="event-form-grid" @submit.prevent="submitEvent">
            <EventBasicInfoComponent ref="basicInfoRef" :model-value="basicInfo"
                :organizer-id="appStore.organizerId ?? null" @update:modelValue="onBasicInfoUpdate"
                @spaces-change="onSpacesChange" />
            <EventDatesComponent ref="datesRef" :model-value="eventDates" :organizer-id="appStore.organizerId ?? null"
                :spaces="availableSpaces" @update:modelValue="onDatesUpdate" />
            <EventDetailsComponent ref="detailsRef" :model-value="eventDetails"
                :organizer-id="appStore.organizerId ?? null" @update:modelValue="onDetailsUpdate" />

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
import router from '@/router'
import type { EventBasicInfoModel, EventDateModel, EventDetailsModel } from '@/models/event'

const { t } = useI18n({ useScope: 'global' })
const appStore = useAppStore()
const basicInfoRef = ref<InstanceType<typeof EventBasicInfoComponent> | null>(null)
const datesRef = ref<InstanceType<typeof EventDatesComponent> | null>(null)
const detailsRef = ref<InstanceType<typeof EventDetailsComponent> | null>(null)

interface SelectOption {
    id: number
    name: string
}

const basicInfo = reactive<EventBasicInfoModel>({
    title: '',
    subtitle: '',
    organizerId: null,
    venueId: null,
    spaceId: null,
    typeGenrePairs: [],
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
const availableSpaces = ref<SelectOption[]>([])

const onBasicInfoUpdate = (value: EventBasicInfoModel) => {
    Object.assign(basicInfo, value)
}

const onDatesUpdate = (value: EventDateModel[]) => {
    eventDates.value = Array.isArray(value) ? value : []
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
    () => appStore.organizerId,
    () => {
        basicInfo.organizerId = null
    }
)

const canSubmit = computed(() => {
    return (
        !!basicInfo.title &&
        basicInfo.organizerId !== null &&
        eventDates.value.length > 0 &&
        eventDates.value.every((date) => date.startDate && date.startTime)
    )
})

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
        space_id: basicInfo.spaceId,
        types: basicInfo.typeGenrePairs.map(pair => ({
            type_id: pair.typeId,
            genre_id: pair.genreId,
        })),
        description: eventDetails.description,
        teaser_text: eventDetails.teaserText || null,
        language: eventDetails.language,
        min_age: eventDetails.minAge,
        max_age: eventDetails.maxAge,
        participation_info: eventDetails.participationInfo,
        dates: eventDates.value.map((date) => ({
            start_date: date.startDate,
            end_date: date.endDate,
            start_time: date.startTime,
            end_time: date.endTime,
            entry_time: date.entryTime,
            space_id: date.spaceId,
            all_day: date.allDayEvent,
        })),
    }

    try {
        const { status, data } = await apiFetch('/api/admin/event/create', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
        if (status >= 200 && status < 300) {
            submitSuccess.value = t('event_submit_success')
            router.push(`/event/${(data as any).event_id}`)
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
    @include form-page();
}

.event-form-hero {
    @include form-hero(560px);
}

.event-form-grid {
    width: min(1080px, 100%);
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
    padding-bottom: 30px;
}

.event-form-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-end;
}

button {
    @include form-primary-button($padding-y: 0.9rem, $padding-x: 2.2rem);
}

.feedback {
    @include form-feedback($text-align: right);

    &--error {
        @include form-feedback-error();
    }

    &--success {
        @include form-feedback-success();
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

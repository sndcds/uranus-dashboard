<template>
    <section class="uranus-card uranus-hover-section">
      <UranusInlineEditLabel
          :label-text="t('event_details_time')"
          :edit-button-text="t('edit')"
          @edit-started="startEditingSchedule"
      />

        <button
          v-if="isEditingSchedule"
          class="uranus-inline-cancel-button"
          @click="cancelEditingSchedule">
          {{ t('form_cancel') }}
        </button>

        <EventDatesComponent v-if="isEditingSchedule" ref="scheduleEditorRef" class="event-meta__editor"
            :model-value="scheduleDraft" :spaces="availableSpaces" :organizer-id="organizerId"
            @update:model-value="onScheduleDraftChange" />

        <p v-if="scheduleSaveError" class="event-meta__error event-meta__error--global">
            {{ scheduleSaveError }}
        </p>

        <div v-if="!isEditingSchedule && !eventScheduleDisplay.length" class="event-meta__empty">
            {{ t('event_schedule_empty') }}
        </div>

        <div v-if="!isEditingSchedule && eventScheduleDisplay.length" class="event-meta__list">
            <article v-for="entry in eventScheduleDisplay" :key="entry.key" class="event-meta__display">
                <div class="event-meta__row">
                    <span class="event-meta__label">{{ entry.startDate }}</span>
                    <p class="event-meta__value">
                        <template v-if="entry.allDay">
                            {{ t('event_schedule_all_day') }}
                        </template>
                        <template v-else>
                            {{ entry.startTime }}
                            <template v-if="entry.endTime">
                                &nbsp;– {{ entry.endTime }}
                            </template>
                        </template>
                    </p>
                </div>
                <p v-if="entry.endDate && entry.endDate !== entry.startDate" class="event-meta__value">
                    {{ t('event_schedule_until', { date: entry.endDate }) }}
                </p>
                <p v-if="entry.entryTime" class="event-meta__value">
                    {{ t('event_schedule_entry_time', { time: entry.entryTime }) }}
                </p>
                <p v-if="entry.spaceDisplay" class="event-meta__value">
                    {{ entry.spaceDisplay }}
                </p>
            </article>
        </div>

        <div v-if="isEditingSchedule" class="event-meta__actions">
            <button type="button" class="uranus-inline-cancel-button" @click="cancelEditingSchedule">
                {{ t('form_cancel') }}
            </button>
            <button type="button" class="uranus-inline-save-button" :disabled="isSavingSchedule" @click="saveSchedule">
                <span v-if="isSavingSchedule">{{ t('form_saving') }}</span>
                <span v-else>{{ t('form_save') }}</span>
            </button>
        </div>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import EventDatesComponent from '@/components/EventDatesComponent.vue'
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue";

interface EventDateApi {
    id?: number | null
    start_date?: string
    end_date?: string | null
    start_time?: string | null
    end_time?: string | null
    entry_time?: string | null
    all_day?: boolean | null
    space_id?: number | null
}

type EventDateSource = EventDateApi[] | Record<string, EventDateApi> | null | undefined

interface SelectOption {
    id: number
    name: string
}

interface EventScheduleEntry {
    id: number | null
    startDate: string
    startTime: string
    endDate: string | null
    endTime: string
    entryTime: string | null
    allDay: boolean
    spaceId: number | null
}

interface ScheduleDraftEntry {
    id: number | null
    startDate: string
    endDate: string | null
    startTime: string
    endTime: string
    entryTime: string | null
    spaceId: number | null
    allDayEvent: boolean
}

type EventDateModelValue = {
    startDate: string
    endDate: string | null
    startTime: string
    endTime: string | null
    entryTime: string | null
    spaceId: number | null
    allDayEvent: boolean
}

interface EventScheduleDisplay {
    key: string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    entryTime: string
    allDay: boolean
    spaceDisplay: string
}

const props = defineProps<{
    eventId: number
    organizerId: number | null
    venueId: number | null
    startDate?: string | null
    startTime?: string | null
    endDate?: string | null
    endTime?: string | null
    entryTime?: string | null
    dates?: EventDateSource
    eventDates?: EventDateSource
    spaceId: number | null
    spaceName?: string | null
}>()

const emit = defineEmits<{ (e: 'updated'): void }>()

const { t, locale } = useI18n({ useScope: 'global' })

const availableSpaces = ref<SelectOption[]>([])
const scheduleEntries = ref<EventScheduleEntry[]>([])
const scheduleDraft = ref<ScheduleDraftEntry[]>([])
const isEditingSchedule = ref(false)
const isSavingSchedule = ref(false)
const scheduleSaveError = ref<string | null>(null)
const scheduleEditorRef = ref<InstanceType<typeof EventDatesComponent> | null>(null)

const dateFormatter = computed(
    () =>
        new Intl.DateTimeFormat(locale.value, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
)

const dateFormatterWeekday = computed(
    () =>
        new Intl.DateTimeFormat(locale.value, {
            weekday: 'long'
        })
)

const timeFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }))

const normalizeCollection = <T>(collection: T[] | Record<string, T> | null | undefined): T[] => {
    if (Array.isArray(collection)) return collection
    if (collection && typeof collection === 'object') {
        return Object.values(collection as Record<string, T>)
    }
    return []
}

const formatDisplayDate = (value: string | null): string => {
    if (!value) return ''
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? value : dateFormatter.value.format(parsed)
}

const formatDisplayTime = (date: string | null, time: string | null): string => {
    if (!date || !time) return ''
    const parsed = new Date(`${date}T${time}`)
    if (Number.isNaN(parsed.getTime())) {
        return time
    }

    const weekday = dateFormatterWeekday.value.format(parsed)
    const timeLabel = timeFormatter.value.format(parsed)
    return `${weekday} ${timeLabel}`
}

const spaceLookup = computed<Record<number, string>>(() => {
    const map: Record<number, string> = {}
    availableSpaces.value.forEach((option) => {
        map[option.id] = option.name
    })

    if (props.spaceId !== null && props.spaceName) {
        map[props.spaceId] = props.spaceName
    }

    return map
})

const eventScheduleDisplay = computed<EventScheduleDisplay[]>(() =>
    scheduleEntries.value.map((entry, index) => {
        const key = entry.id !== null ? `schedule-${entry.id}` : `schedule-${index}`
        const startDateLabel = formatDisplayDate(entry.startDate)
        const endDateLabel = formatDisplayDate(entry.endDate)
        const allDay = !!entry.allDay
        return {
            key,
            startDate: startDateLabel,
            startTime: allDay ? '' : formatDisplayTime(entry.startDate, entry.startTime),
            endDate: endDateLabel,
            endTime: allDay ? '' : formatDisplayTime(entry.endDate || entry.startDate, entry.endTime),
            entryTime: allDay ? '' : formatDisplayTime(entry.startDate, entry.entryTime),
            allDay,
            spaceDisplay: entry.spaceId !== null ? spaceLookup.value[entry.spaceId] ?? '' : '',
        }
    })
)

const mapApiDateToEntry = (item: EventDateApi): EventScheduleEntry => ({
    id: typeof item.id === 'number' ? item.id : null,
    startDate: item.start_date ?? '',
    startTime: item.start_time ?? '',
    endDate: item.end_date ?? null,
    endTime: item.end_time ?? '',
    entryTime: item.entry_time ?? null,
    allDay: item.all_day ?? false,
    spaceId: typeof item.space_id === 'number' ? item.space_id : null,
})

const createScheduleEntryFromDraft = (entry: ScheduleDraftEntry): EventScheduleEntry => ({
    id: entry.id ?? null,
    startDate: entry.startDate,
    startTime: entry.startTime,
    endDate: entry.endDate,
    endTime: entry.endTime,
    entryTime: entry.entryTime,
    allDay: entry.allDayEvent,
    spaceId: entry.spaceId,
})

const deriveScheduleFromProps = (): EventScheduleEntry[] => {
    const fromDates = normalizeCollection<EventDateApi>(props.dates)
    const fromEventDates = normalizeCollection<EventDateApi>(props.eventDates)
    const normalized = fromDates.length ? fromDates : fromEventDates
    const mapped = normalized.map(mapApiDateToEntry).filter((entry) => entry.startDate || entry.startTime)

    if (mapped.length) {
        return mapped
    }

    const fallback: EventScheduleEntry = {
        id: null,
        startDate: props.startDate ?? '',
        startTime: props.startTime ?? '',
        endDate: props.endDate ?? null,
        endTime: props.endTime ?? '',
        entryTime: props.entryTime ?? null,
        allDay: false,
        spaceId: props.spaceId ?? null,
    }

    return fallback.startDate || fallback.startTime ? [fallback] : []
}

const syncScheduleEntries = (force = false) => {
    if (isEditingSchedule.value && !force) {
        return
    }

    scheduleEntries.value = deriveScheduleFromProps()
}

syncScheduleEntries(true)

const loadSpaces = async (venueId: number | null) => {
    if (venueId === null || !Number.isFinite(venueId)) {
        availableSpaces.value = []
        return
    }

    try {
        const { data } = await apiFetch<SelectOption[]>(`/api/choosable-spaces/venue/${venueId}`)
        availableSpaces.value = Array.isArray(data) ? data : []
    } catch (err) {
        console.error('Failed to load spaces', err)
        availableSpaces.value = []
    }
}

const onScheduleDraftChange = (value: EventDateModelValue[]) => {
    const previousDraft = scheduleDraft.value
    scheduleDraft.value = value.map((entry, index) => {
        const entryWithId = entry as EventDateModelValue & { id?: number | null }
        const preservedId = entryWithId.id ?? previousDraft[index]?.id ?? null

        return {
            id: preservedId,
            startDate: entry.startDate ?? '',
            endDate: entry.endDate ?? null,
            startTime: entry.startTime ?? '',
            endTime: entry.endTime ?? '',
            entryTime: entry.entryTime ?? null,
            spaceId: entry.spaceId ?? null,
            allDayEvent: entry.allDayEvent ?? false,
        }
    })
}

const createDraftEntryFromSchedule = (entry: EventScheduleEntry): ScheduleDraftEntry => ({
    id: entry.id,
    startDate: entry.startDate,
    endDate: entry.endDate,
    startTime: entry.startTime,
    endTime: entry.endTime,
    entryTime: entry.entryTime,
    spaceId: entry.spaceId,
    allDayEvent: entry.allDay,
})

const createEmptyDraftEntry = (): ScheduleDraftEntry => ({
    id: null,
    startDate: '',
    endDate: null,
    startTime: '',
    endTime: '',
    entryTime: null,
    spaceId: props.spaceId ?? null,
    allDayEvent: false,
})

const startEditingSchedule = async () => {
    if (!scheduleEntries.value.length) {
        scheduleEntries.value = deriveScheduleFromProps()
    }

    scheduleDraft.value = scheduleEntries.value.length
        ? scheduleEntries.value.map(createDraftEntryFromSchedule)
        : [createEmptyDraftEntry()]

    scheduleSaveError.value = null
    isEditingSchedule.value = true
    await loadSpaces(props.venueId ?? null)
}

const cancelEditingSchedule = () => {
    isEditingSchedule.value = false
    scheduleDraft.value = []
    scheduleSaveError.value = null
}

const saveSchedule = async () => {
    scheduleSaveError.value = null

    const validationResult = scheduleEditorRef.value?.validate?.()
    if (validationResult === false) {
        scheduleSaveError.value = t('event_submit_missing_fields')
        return
    }

    if (!scheduleDraft.value.length) {
        scheduleSaveError.value = t('event_submit_error_generic')
        return
    }

    if (!Number.isFinite(props.eventId)) {
        scheduleSaveError.value = t('event_submit_error_generic')
        return
    }

    isSavingSchedule.value = true

    try {
        const payload = {
            dates: scheduleDraft.value.map((entry) => {
                const body: Record<string, unknown> = {
                    start_date: entry.startDate,
                    start_time: entry.startTime,
                    end_date: entry.endDate || null,
                    end_time: entry.endTime || null,
                    entry_time: entry.entryTime || null,
                    all_day: entry.allDayEvent ?? false,
                    space_id: entry.spaceId ?? null,
                }

                if (entry.id !== null) {
                    body.id = entry.id
                }

                return body
            }),
        }

        await apiFetch(`/api/admin/event/${props.eventId}/dates`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })

        isEditingSchedule.value = false
        const updatedEntries = scheduleDraft.value
            .map(createScheduleEntryFromDraft)
            .filter((entry) => entry.startDate || entry.startTime)
        scheduleEntries.value = updatedEntries
        scheduleDraft.value = []
        await loadSpaces(props.venueId ?? null)
        emit('updated')
    } catch (err) {
        console.error('Failed to update event dates', err)
        scheduleSaveError.value = t('event_submit_error_generic')
    } finally {
        isSavingSchedule.value = false
    }
}

watch(
    () => props.eventId,
    () => {
        syncScheduleEntries(true)
    }
)

watch(
    () => props.venueId,
    (venueId) => {
        void loadSpaces(venueId ?? null)
    },
    { immediate: true }
)

watch(
    () => [props.startDate, props.startTime, props.endDate, props.endTime, props.entryTime, props.spaceId],
    () => {
        syncScheduleEntries()
    }
)

watch(
    () => props.dates,
    () => {
        syncScheduleEntries()
    },
    { deep: true }
)

watch(
    () => props.eventDates,
    () => {
        syncScheduleEntries()
    },
    { deep: true }
)

onMounted(() => {
    void loadSpaces(props.venueId ?? null)
    syncScheduleEntries(true)
})
</script>

<style scoped lang="scss">
.event-meta {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    &__header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.75rem;
    }

    &__edit {
        @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
        opacity: 0;
        transform: translateY(-4px);
        transition: opacity 0.2s ease, transform 0.2s ease;

        &--cancel {
            @include form-secondary-button($padding-y: 0.35rem, $padding-x: 0.85rem);
        }
    }

    &__empty {
        margin: 0;
        color: var(--muted-text);
        font-size: 0.95rem;
    }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    &__display {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    &__row {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
    }

    &__label {
        font-size: 1.85rem;
        font-weight: 600;
        color: var(--color-text);
    }

    &__value {
        margin: 0;
        color: var(--color-text);
        font-size: 0.9rem;
        line-height: 1.4;
    }

    &__actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.75rem;
    }

    &__button {
        @include form-primary-button($padding-y: 0.5rem, $padding-x: 1.3rem);

        &--cancel {
            @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1.3rem);
        }
    }

    &__error {
        margin: 0;
        color: #b91c1c;
        font-weight: 600;
        font-size: 0.85rem;

        &--global {
            align-self: flex-start;
        }
    }

    h3 {
        margin: 0;
        color: var(--color-text);
        font-size: 1.1rem;
    }
}

.event-meta:hover .event-meta__edit {
    opacity: 1;
    transform: translateY(0);
}

@media (min-width: 640px) {
    .event-meta {
        border-radius: 20px;
        padding: 1.25rem;

        &__label {
            font-size: 2rem;
        }

        h3 {
            font-size: 1.2rem;
        }
    }
}

@media (min-width: 1024px) {
    .event-meta {
        border-radius: 24px;
        padding: 1.4rem;

        &__label {
            font-size: 2.85rem;
        }

        h3 {
            font-size: 1.3rem;
        }

        p {
            font-size: 1rem;
        }
    }

    .event-meta__editor :deep(.event-dates__grid) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
}

@media (min-width: 1280px) {
    .event-meta {
        padding: 1.75rem;
    }
}
</style>

<template>
    <section class="event-meta">
        <header class="event-meta__header">
            <h3>{{ t('event_details_time') }}</h3>
            <button
                v-if="!isEditingDates"
                type="button"
                class="event-meta__edit"
                @click="startEditingDates"
            >
                {{ t('edit') }}
            </button>
        </header>

        <template v-if="isEditingDates">
            <div
                v-for="(entry, index) in scheduleEntries"
                :key="entry.id !== null ? `edit-schedule-${entry.id}` : `edit-schedule-${index}`"
                class="event-meta__item"
            >
                <div class="event-meta__meta">
                    <span class="event-meta__badge">#{{ index + 1 }}</span>
                    <button
                        v-if="scheduleEntries.length > 1"
                        type="button"
                        class="event-meta__remove"
                        @click="removeScheduleEntry(index)"
                        :disabled="isSavingDates"
                    >
                        {{ t('event_remove_date') }}
                    </button>
                </div>

                <div class="event-meta__grid">
                    <label class="event-meta__field">
                        <span>{{ t('event_start_date') }}<span class="required">*</span></span>
                        <input type="date" v-model="entry.startDate" />
                    </label>
                    <label class="event-meta__field">
                        <span>{{ t('event_start_time') }}<span class="required">*</span></span>
                        <input type="time" v-model="entry.startTime" />
                    </label>
                    <label class="event-meta__field">
                        <span>{{ t('event_end_date') }}</span>
                        <input type="date" v-model="entry.endDate" />
                    </label>
                    <label class="event-meta__field">
                        <span>{{ t('event_end_time') }}</span>
                        <input type="time" v-model="entry.endTime" />
                    </label>
                    <label class="event-meta__field">
                        <span>{{ t('event_entry_time') }}</span>
                        <input type="time" v-model="entry.entryTime" />
                    </label>
                    <label class="event-meta__field event-meta__field--checkbox">
                        <input type="checkbox" v-model="entry.allDay" />
                        <span>{{ t('event_all_day') }}</span>
                    </label>
                </div>

                <p v-if="scheduleErrors[index]" class="event-meta__error">
                    {{ scheduleErrors[index] }}
                </p>
            </div>

            <button
                type="button"
                class="event-meta__add"
                @click="addScheduleEntry"
                :disabled="isSavingDates"
            >
                {{ t('event_add_date') }}
            </button>

            <p v-if="scheduleSaveError" class="event-meta__error event-meta__error--global">
                {{ scheduleSaveError }}
            </p>

            <div class="event-meta__actions">
                <button
                    type="button"
                    class="event-meta__button event-meta__button--cancel"
                    @click="cancelEditingDates"
                    :disabled="isSavingDates"
                >
                    {{ t('event_header_cancel') }}
                </button>
                <button
                    type="button"
                    class="event-meta__button"
                    @click="saveSchedule"
                    :disabled="isSavingDates"
                >
                    <span v-if="!isSavingDates">{{ t('event_header_save') }}</span>
                    <span v-else>{{ t('saving') }}</span>
                </button>
            </div>
        </template>

        <template v-else>
            <div
                v-for="schedule in eventScheduleDisplay"
                :key="schedule.key"
                class="event-meta__display"
            >
                <div class="event-meta__row">
                    <span class="event-meta__label">{{ t('event_start_date') }}</span>
                    <p class="event-meta__value">
                        {{ schedule.startDate || '—' }}
                        <span v-if="schedule.startTime"> · {{ schedule.startTime }}</span>
                        <span v-else-if="schedule.allDay"> · {{ t('event_all_day') }}</span>
                    </p>
                </div>
                <div
                    class="event-meta__row"
                    v-if="schedule.endDate || schedule.endTime"
                >
                    <span class="event-meta__label">{{ t('event_end_date') }}</span>
                    <p class="event-meta__value">
                        {{ schedule.endDate || schedule.startDate || '—' }}
                        <span v-if="schedule.endTime"> · {{ schedule.endTime }}</span>
                    </p>
                </div>
                <div class="event-meta__row" v-if="schedule.entryTime">
                    <span class="event-meta__label">{{ t('event_entry_time') }}</span>
                    <p class="event-meta__value">{{ schedule.entryTime }}</p>
                </div>
            </div>
        </template>
    </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

interface EventDateApi {
    id?: number | null
    start_date?: string
    end_date?: string | null
    start_time?: string | null
    end_time?: string | null
    entry_time?: string | null
    all_day?: boolean | null
}

type EventDateSource = EventDateApi[] | Record<string, EventDateApi> | null | undefined

interface EventScheduleEntry {
    id: number | null
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    entryTime: string
    allDay: boolean
}

interface EventScheduleDisplay {
    key: string
    startDate: string
    startTime: string
    endDate: string
    endTime: string
    entryTime: string
    allDay: boolean
}

const props = defineProps<{
    eventId: number
    startDate: string
    startTime: string | null
    endDate: string | null
    endTime: string | null
    entryTime: string | null
    dates?: EventDateSource
    eventDates?: EventDateSource
}>()

const emit = defineEmits<{
    (e: 'updated'): void
}>()

const { t, locale } = useI18n({ useScope: 'global' })

const eventDates = ref<EventScheduleEntry[]>([])
const isEditingDates = ref(false)
const isSavingDates = ref(false)
const scheduleEntries = ref<EventScheduleEntry[]>([])
const scheduleErrors = ref<string[]>([])
const scheduleSaveError = ref<string | null>(null)

const dateFormatter = computed(
    () =>
        new Intl.DateTimeFormat(locale.value, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        })
)

const timeFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }))

const formatDisplayDate = (value: string): string => {
    if (!value) return ''
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? value : dateFormatter.value.format(date)
}

const formatDisplayTime = (date: string, time: string): string => {
    if (!date || !time) return ''
    const dateTime = new Date(`${date}T${time}`)
    return Number.isNaN(dateTime.getTime()) ? time : timeFormatter.value.format(dateTime)
}

const eventScheduleDisplay = computed<EventScheduleDisplay[]>(() =>
    eventDates.value.map((entry, index) => {
        const key = entry.id !== null ? `schedule-${entry.id}` : `schedule-${index}`
        const startDate = formatDisplayDate(entry.startDate)
        const endDate = formatDisplayDate(entry.endDate)
        const allDay = !!entry.allDay
        return {
            key,
            startDate,
            startTime: allDay ? '' : formatDisplayTime(entry.startDate, entry.startTime),
            endDate,
            endTime: allDay ? '' : formatDisplayTime(entry.endDate || entry.startDate, entry.endTime),
            entryTime: allDay ? '' : formatDisplayTime(entry.startDate, entry.entryTime),
            allDay,
        }
    })
)

const normalizeCollection = <T>(collection: T[] | Record<string, T> | null | undefined): T[] => {
    if (Array.isArray(collection)) return collection
    if (collection && typeof collection === 'object') {
        return Object.values(collection as Record<string, T>)
    }
    return []
}

const mapApiDateToEntry = (item: EventDateApi): EventScheduleEntry => ({
    id: typeof item.id === 'number' ? item.id : null,
    startDate: item.start_date ?? '',
    startTime: item.start_time ?? '',
    endDate: item.end_date ?? '',
    endTime: item.end_time ?? '',
    entryTime: item.entry_time ?? '',
    allDay: item.all_day ?? false,
})

const createEntryFromProps = (): EventScheduleEntry => ({
    id: null,
    startDate: props.startDate ?? '',
    startTime: props.startTime ?? '',
    endDate: props.endDate ?? '',
    endTime: props.endTime ?? '',
    entryTime: props.entryTime ?? '',
    allDay: false,
})

const deriveScheduleEntriesFromProps = (): EventScheduleEntry[] => {
    const fromDates = normalizeCollection<EventDateApi>(props.dates)
    const fromEventDates = normalizeCollection<EventDateApi>(props.eventDates)
    const normalized = fromDates.length ? fromDates : fromEventDates
    const mapped = normalized.map(mapApiDateToEntry).filter((entry) => entry.startDate || entry.startTime)

    if (mapped.length) {
        return mapped
    }

    return [createEntryFromProps()]
}

const fetchEventSchedule = async (id: number): Promise<EventScheduleEntry[] | null> => {
    if (!Number.isFinite(id) || id <= 0) return null

    try {
        const { data } = await apiFetch<EventDateApi[]>(`/api/admin/event/${id}/dates`)
        if (Array.isArray(data)) {
            const mapped = data.map(mapApiDateToEntry).filter((entry) => entry.startDate || entry.startTime)
            return mapped.length ? mapped : null
        }
    } catch (err) {
        console.error('Failed to load event dates', err)
    }

    return null
}

const syncFromProps = () => {
    if (isEditingDates.value) return
    const derived = deriveScheduleEntriesFromProps()
    eventDates.value = derived.length ? derived : []
}

const loadSchedule = async () => {
    if (isEditingDates.value) {
        return
    }

    syncFromProps()

    const remoteSchedule = await fetchEventSchedule(props.eventId)
    if (remoteSchedule && remoteSchedule.length && !isEditingDates.value) {
        eventDates.value = remoteSchedule
    }
}

const emptyScheduleEntry = (): EventScheduleEntry => ({
    id: null,
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    entryTime: '',
    allDay: false,
})

const startEditingDates = () => {
    const entries = eventDates.value.length ? eventDates.value : deriveScheduleEntriesFromProps()
    scheduleEntries.value = entries.length ? entries.map((entry) => ({ ...entry })) : [emptyScheduleEntry()]
    scheduleErrors.value = scheduleEntries.value.map(() => '')
    scheduleSaveError.value = null
    isEditingDates.value = true
}

const cancelEditingDates = () => {
    isEditingDates.value = false
    scheduleEntries.value = []
    scheduleErrors.value = []
    scheduleSaveError.value = null
}

const addScheduleEntry = () => {
    scheduleEntries.value.push(emptyScheduleEntry())
    scheduleErrors.value.push('')
    scheduleSaveError.value = null
}

const removeScheduleEntry = (index: number) => {
    if (scheduleEntries.value.length <= 1) return
    scheduleEntries.value.splice(index, 1)
    scheduleErrors.value.splice(index, 1)
    scheduleSaveError.value = null
}

const toMinutes = (time: string): number | null => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const h = Number(hours)
    const m = Number(minutes)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return h * 60 + m
}

const isAfter = (start: string, end: string): boolean => {
    if (!end) return false
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return false
    return endDate.getTime() < startDate.getTime()
}

const evaluateScheduleEntry = (entry: EventScheduleEntry): string => {
    if (!entry.startDate) return t('event_error_required')
    if (!entry.startTime) return t('event_error_required')

    const endTimeValue = entry.endTime || ''
    const entryTimeValue = entry.entryTime || ''

    if (endTimeValue) {
        const startMinutes = toMinutes(entry.startTime)
        const endMinutes = toMinutes(endTimeValue)

        if (startMinutes === null || endMinutes === null || startMinutes > endMinutes) {
            return t('event_error_time_order')
        }

        if (entryTimeValue) {
            const entryMinutes = toMinutes(entryTimeValue)
            if (entryMinutes === null || entryMinutes < startMinutes || entryMinutes > endMinutes) {
                return t('event_error_entry_range')
            }
        }
    } else if (entryTimeValue) {
        const startMinutes = toMinutes(entry.startTime)
        const entryMinutes = toMinutes(entryTimeValue)
        if (startMinutes === null || entryMinutes === null || entryMinutes < startMinutes) {
            return t('event_error_entry_range')
        }
    }

    if (entry.endDate && isAfter(entry.startDate, entry.endDate)) {
        return t('event_error_date_order')
    }

    return ''
}

const validateScheduleEntries = (): boolean => {
    const errors = scheduleEntries.value.map((entry) => evaluateScheduleEntry(entry))
    scheduleErrors.value = errors
    return errors.every((msg) => !msg)
}

watch(
    scheduleEntries,
    (value) => {
        if (scheduleErrors.value.length !== value.length) {
            scheduleErrors.value = value.map(() => '')
            return
        }

        scheduleErrors.value = scheduleErrors.value.map((error, index) => {
            if (!error) return ''
            const entry = value[index]
            return entry ? evaluateScheduleEntry(entry) : ''
        })
    },
    { deep: true }
)

watch(
    () => props.eventId,
    () => {
        void loadSchedule()
    }
)

watch(
    () => [props.startDate, props.startTime, props.endDate, props.endTime, props.entryTime],
    () => {
        void loadSchedule()
    }
)

watch(
    () => props.dates,
    () => {
        void loadSchedule()
    },
    { deep: true }
)

watch(
    () => props.eventDates,
    () => {
        void loadSchedule()
    },
    { deep: true }
)

const saveSchedule = async () => {
    if (!scheduleEntries.value.length) {
        scheduleSaveError.value = t('event_submit_error_generic')
        return
    }

    scheduleSaveError.value = null

    if (!validateScheduleEntries()) {
        return
    }

    if (!Number.isFinite(props.eventId)) {
        scheduleSaveError.value = t('event_submit_error_generic')
        return
    }

    isSavingDates.value = true

    try {
        const payload = {
            dates: scheduleEntries.value.map((entry) => {
                const body: Record<string, unknown> = {
                    start_date: entry.startDate,
                    start_time: entry.startTime,
                    end_date: entry.endDate || null,
                    end_time: entry.endTime || null,
                    entry_time: entry.entryTime || null,
                    all_day: entry.allDay ?? false,
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

        isEditingDates.value = false
        scheduleEntries.value = []
        scheduleErrors.value = []

        await loadSchedule()
        emit('updated')
    } catch (err) {
        console.error('Failed to update event dates', err)
        scheduleSaveError.value = t('event_submit_error_generic')
    } finally {
        isSavingDates.value = false
    }
}

onMounted(() => {
    loadSchedule()
})
</script>

<style scoped lang="scss">
.event-meta {
    background: var(--card-bg);
    border-radius: 16px;
    padding: 1rem;
    box-shadow: var(--card-shadow, 0 18px 40px rgba(31, 41, 55, 0.1));
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
    }

    &__item {
        border: 1px solid var(--border-soft);
        border-radius: 14px;
        padding: 0.75rem;
        background: var(--input-bg);
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

    &__meta {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.9rem;
        color: var(--muted-text);
    }

    &__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 0.25rem 0.6rem;
        border-radius: 999px;
        background: var(--accent-muted);
        color: var(--accent-primary);
        font-weight: 600;
        letter-spacing: 0.02em;
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 0.75rem;
    }

    &__field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        font-size: 0.9rem;
        color: var(--color-text);

        span {
            font-weight: 600;
        }

        input[type='date'],
        input[type='time'] {
            width: 100%;
            padding: 0.55rem 0.8rem;
            border-radius: 12px;
            border: 1px solid var(--input-border);
            background: var(--input-bg);
            color: var(--color-text);
        }
    }

    &__remove {
        background: none;
        border: none;
        color: var(--accent-primary);
        font-weight: 600;
        cursor: pointer;
        padding: 0;
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;

        &:hover {
            color: var(--accent-secondary);
            text-decoration: underline;
        }

        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            text-decoration: none;
        }
    }

    &__add {
        @include form-secondary-button($padding-y: 0.45rem, $padding-x: 1rem);
        align-self: flex-start;
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

    &__field--checkbox {
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;

        span {
            font-weight: 600;
        }

        input[type='checkbox'] {
            width: auto;
            padding: 0;
            border: none;
        }
    }

    &__display {
        border: 1px solid var(--border-soft);
        border-radius: 14px;
        padding: 0.75rem 0.85rem;
        background: var(--input-bg);
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
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text);
    }

    &__value {
        margin: 0;
        color: var(--muted-text);
        font-size: 0.9rem;
        line-height: 1.4;
    }

    h3 {
        margin: 0;
        color: var(--color-text);
        font-size: 1rem;
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

        h3 {
            font-size: 1.1rem;
        }

        p {
            font-size: 0.95rem;
        }
    }
}

@media (min-width: 1024px) {
    .event-meta {
        border-radius: 24px;
        padding: 1.4rem;

        h3 {
            font-size: 1.1rem;
        }

        p {
            font-size: 1rem;
        }
    }
}

@media (min-width: 1280px) {
    .event-meta {
        padding: 1.75rem;
    }
}
</style>

<template>
    <UranusCard>
        <UranusCardHeader :title="t('event_section_dates')" :subtitle="t('event_section_dates_subtitle')" />

        <div class="event-section__form">
            <div class="event-dates">
                <div v-for="(date, index) in localDates" :key="index" class="event-dates__card">
                    <div class="event-dates__meta">
                        <span class="badge">#{{ index + 1 }}</span>
                        <button type="button" class="link" @click="removeDate(index)" v-if="localDates.length > 1">
                            {{ t('event_remove_date') }}
                        </button>
                    </div>
                    <p v-if="errors[index]" class="field-error">{{ errors[index] }}</p>
                    <div class="event-dates__grid">
                        <UranusDateInput
                            id="`start-date-${index}`"
                            v-model="date.startDate"
                            :label="t('event_start_date')"
                            required
                        />

                        <UranusTimeInput
                            id="`start-time-${index}`"
                            v-model="date.startTime"
                            :label="t('event_start_time')"
                            required
                        />

                        <UranusDateInput
                            id="`end-date-${index}`"
                            v-model="date.endDate"
                            :label="t('event_end_date')"
                        />

                        <UranusTimeInput
                            id="`end-time-${index}`"
                            v-model="date.endTime"
                            :label="t('event_end_time')"
                        />

                        <UranusTimeInput
                            id="`entry-time-${index}`"
                            v-model="date.entryTime"
                            :label="t('event_entry_time')"
                        />

                        <UranusFieldLabel :id="`space-${index}`" :label="t('event_space_label')">
                            <select :id="`space-${index}`" v-model="date.spaceId">
                                <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                                <option v-for="sp in spaces" :key="sp.id" :value="sp.id">
                                    {{ sp.name }}
                                </option>
                            </select>
                        </UranusFieldLabel>

                        <div class="form-field form-field--checkbox">
                            <label :for="`all-day-${index}`">
                                <input type="checkbox" :id="`all-day-${index}`" v-model="date.allDayEvent" />
                                {{ t('event_all_day') }}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div class="event-section__actions">
                <button type="button" class="uranus-secondary-button" @click="addDate">
                    {{ t('event_add_date') }}
                </button>
            </div>
        </div>
    </UranusCard>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusCardHeader from "@/components/uranus/UranusCardHeader.vue";
import UranusCard from "@/components/uranus/UranusCard.vue";
import UranusDateInput from "@/components/uranus/UranusDateInput.vue";
import UranusTimeInput from "@/components/uranus/UranusTimeInput.vue";
import UranusFieldLabel from "@/components/uranus/UranusFieldLabel.vue";

const props = defineProps<{
    organizerId: number | null
    modelValue: EventDate[]
    spaces?: SelectOption[]
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: EventDate[]): void
}>()

const { t } = useI18n({ useScope: 'global' })

interface EventDate {
    startDate: string
    endDate: string | null
    startTime: string
    endTime: string | null
    entryTime: string | null
    spaceId: number | null
    allDayEvent: boolean
}

interface SelectOption {
    id: number
    name: string
}

const localDates = ref<EventDate[]>([])
const errors = ref<string[]>([])
const spaces = computed<SelectOption[]>(() => (Array.isArray(props.spaces) ? props.spaces : []))
let suppressEmit = false

const emptyDate = (): EventDate => ({
    startDate: '',
    endDate: null,
    startTime: '',
    endTime: null,
    entryTime: null,
    spaceId: null,
    allDayEvent: false,
})

const toMinutes = (time: string | null): number | null => {
    if (!time) return null
    const [hours, minutes] = time.split(':')
    const h = Number(hours)
    const m = Number(minutes)
    if (Number.isNaN(h) || Number.isNaN(m)) return null
    return h * 60 + m
}

const isAfter = (start: string, end: string | null): boolean => {
    if (!end) return false
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return false
    return endDate.getTime() < startDate.getTime()
}

const evaluateDateError = (date: EventDate): string => {
    if (!date.startDate) return t('event_error_required')
    if (!date.startTime) return t('event_error_required')
    const startMinutes = toMinutes(date.startTime)
    if (startMinutes === null) return t('event_error_required')

    if (date.entryTime) {
        const entryMinutes = toMinutes(date.entryTime)
        if (entryMinutes === null || entryMinutes >= startMinutes) {
            return t('event_error_entry_range')
        }
    }

    if (date.endTime) {
        const endMinutes = toMinutes(date.endTime)
        if (endMinutes === null || startMinutes > endMinutes) {
            return t('event_error_time_order')
        }
    }

    if (date.endDate && isAfter(date.startDate, date.endDate)) {
        return t('event_error_date_order')
    }

    return ''
}

const initializeDates = (value: EventDate[] | undefined) => {
    suppressEmit = true
    const incoming = Array.isArray(value) && value.length ? value : [emptyDate()]
    localDates.value = incoming.map((item) => ({ ...emptyDate(), ...item }))
    errors.value = incoming.map(() => '')
    nextTick(() => {
        suppressEmit = false
    })
}

watch(
    () => props.modelValue,
    (value) => {
        initializeDates(value)
    },
    { deep: true, immediate: true }
)

watch(
    localDates,
    (value) => {
        if (!suppressEmit) {
            emit(
                'update:modelValue',
                value.map((item) => ({ ...item }))
            )
        }
        errors.value = errors.value.map((error, index) => {
            if (!error) return ''
            const date = value[index]
            return date ? evaluateDateError(date) : ''
        })
    },
    { deep: true }
)

const addDate = () => {
    localDates.value = [...localDates.value, emptyDate()]
    errors.value = [...errors.value, '']
}

const removeDate = (index: number) => {
    const updated = [...localDates.value]
    updated.splice(index, 1)
    const updatedErrors = [...errors.value]
    updatedErrors.splice(index, 1)
    localDates.value = updated.length ? updated : [emptyDate()]
    errors.value = updated.length ? updatedErrors : ['']
}

const validate = () => {
    errors.value = localDates.value.map((date) => evaluateDateError(date))
    return errors.value.every((msg) => !msg)
}

defineExpose({ validate })
</script>

<style scoped lang="scss">
.event-section__form {
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 2.5vw, 1.75rem);
}

.event-dates {
    display: grid;
    gap: clamp(1rem, 2vw, 1.5rem);
}

.event-dates__card {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-dates__meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.9rem;
    color: var(--muted-text);
}

.badge {
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

.link {
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
}

.event-dates__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(0.75rem, 2vw, 1.2rem);
}

.form-field {
    @include form-group();
}

.form-field--checkbox {
    flex-direction: row;
    align-items: end;
    gap: 0.6rem;
    padding-bottom: 1rem;

    label {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 600;
        color: #374151;
    }
}

.event-section__actions {
    display: flex;
    justify-content: flex-end;
}

.secondary {
    @include form-secondary-button();
}

@media (max-width: 540px) {
    .event-dates__grid {
        grid-template-columns: 1fr;
    }

    .event-section__actions {
        justify-content: center;
    }
}

@media (min-width: 1024px) {
    .event-dates__grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
    }
}

.field-error {
    margin: 0;
    font-size: 0.85rem;
    color: #b91c1c;
    font-weight: 600;
}
</style>

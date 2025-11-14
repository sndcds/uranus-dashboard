<template>
  <UranusInlineSectionLayout>
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
              :id="`start-date-${index}`"
              v-model="date.startDate"
              :label="t('event_start_date')"
              required
          />

          <UranusTimeInput
              :id="`start-time-${index}`"
              v-model="date.startTime"
              :label="t('event_start_time')"
              required
          />

          <UranusDateInput
              :id="`end-date-${index}`"
              v-model="date.endDate"
              :label="t('event_end_date')"
          />

          <UranusTimeInput
              :id="`end-time-${index}`"
              v-model="date.endTime"
              :label="t('event_end_time')"
          />

          <label :for="`all-day-${index}`" class="checkbox-label">
            <input
                type="checkbox"
                :id="`all-day-${index}`"
                v-model="date.allDayEvent"
                class="checkbox-input"
            />
            <span class="checkbox-text">{{ t('event_all_day') }}</span>
          </label>

          <UranusTimeInput
              :id="`entry-time-${index}`"
              v-model="date.entryTime"
              :label="t('event_entry_time')"
          />

          <!-- Venue Selector -->
          <UranusFieldLabel :id="`venue-${index}`" :label="t('event_venue_label')">
            <select
                :id="`venue-${index}`"
                v-model="date.venueId"
                @change="() => onVenueSelected(date.venueId, date)"
            >
              <option :value="null" disabled>{{ t('select_placeholder') }}</option>
              <option v-for="venue in choosableVenues" :key="venue.id" :value="venue.id">
                {{ venue.name }}
              </option>
            </select>
          </UranusFieldLabel>

          <!-- Space Selector -->
          <UranusFieldLabel :id="`space-${index}`" :label="t('event_space_label')">
            <select
                :id="`space-${index}`"
                v-model="date.spaceId"
            >
              <option :value="null" disabled>{{ t('select_placeholder') }}</option>
              <option v-for="sp in date.choosableSpaces" :key="sp.id" :value="sp.id">
                {{ sp.name }}
              </option>
            </select>
          </UranusFieldLabel>

        </div>
      </div>
    </div>

    <div class="event-section__actions">
      <button type="button" class="uranus-secondary-button" @click="addDate">
        {{ t('event_add_date') }}
      </button>
    </div>
  </UranusInlineSectionLayout>
</template>

<script setup lang="ts">
import { ref, watch, inject, nextTick, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusDateInput from "@/components/uranus/UranusDateInput.vue"
import UranusTimeInput from "@/components/uranus/UranusTimeInput.vue"
import UranusFieldLabel from "@/components/uranus/UranusFieldLabel.vue"
import UranusInlineSectionLayout from "@/components/uranus/UranusInlineSectionLayout.vue"

interface ChoosableVenue { id: number; name: string; }
interface ChoosableSpace { id: number; name: string; }
interface SelectOption { id: number; name: string; }

interface EventDate {
  startDate: string
  endDate: string | null
  startTime: string
  endTime: string | null
  entryTime: string | null
  venueId: number | null
  spaceId: number | null
  allDayEvent: boolean
  choosableSpaces: SelectOption[]
}

const choosableVenues = inject<Ref<ChoosableVenue[]>>('choosableVenues') ?? ref([])

const props = defineProps<{ modelValue: EventDate[] }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: EventDate[]): void }>()

const { t } = useI18n({ useScope: 'global' })
const localDates = ref<EventDate[]>([])
const errors = ref<string[]>([])
let suppressEmit = false

const emptyDate = (): EventDate => ({
  startDate: '', endDate: null,
  startTime: '', endTime: null,
  entryTime: null, venueId: null,
  spaceId: null, allDayEvent: false,
  choosableSpaces: [],
})

// --- Helpers ---
const toMinutes = (time: string | null) => {
  if (!time) return null
  const [h, m] = time.split(':').map(Number)
  return isNaN(h) || isNaN(m) ? null : h * 60 + m
}
const isAfter = (start: string, end: string | null) => !end ? false : new Date(end).getTime() < new Date(start).getTime()
const evaluateDateError = (date: EventDate): string => {
  if (!date.startDate || !date.startTime) return t('event_error_required')
  const startMinutes = toMinutes(date.startTime)
  if (startMinutes === null) return t('event_error_required')
  if (date.entryTime && (toMinutes(date.entryTime) === null || toMinutes(date.entryTime)! >= startMinutes)) return t('event_error_entry_range')
  if (date.endTime && (toMinutes(date.endTime) === null || startMinutes > toMinutes(date.endTime)!)) return t('event_error_time_order')
  if (date.endDate && isAfter(date.startDate, date.endDate)) return t('event_error_date_order')
  return ''
}

// --- Initialize ---
const initializeDates = (value?: EventDate[]) => {
  suppressEmit = true
  const incoming = value && value.length ? value : [emptyDate()]
  localDates.value = incoming.map(d => ({ ...emptyDate(), ...d }))
  errors.value = incoming.map(() => '')
  nextTick(() => suppressEmit = false)
}

watch(() => props.modelValue, v => initializeDates(v), { deep: true, immediate: true })

watch(localDates, value => {
  if (!suppressEmit) emit('update:modelValue', value.map(d => ({ ...d })))
  errors.value = value.map((date, i) => errors.value[i] ? evaluateDateError(date) : '')
}, { deep: true })

// --- Add / Remove ---
const addDate = () => { localDates.value.push(emptyDate()); errors.value.push('') }
const removeDate = (index: number) => { localDates.value.splice(index,1); errors.value.splice(index,1); if(!localDates.value.length) localDates.value.push(emptyDate()) }

// --- Venue / Space ---
async function loadSpacesForDate(date: EventDate, venueId: number | null) {
  if (!venueId) { date.choosableSpaces = []; date.spaceId = null; return }
  try {
    const { data } = await apiFetch<SelectOption[]>(`/api/choosable-spaces/venue/${venueId}`)
    date.choosableSpaces = Array.isArray(data) ? data : []
    if (!date.choosableSpaces.find(s => s.id === date.spaceId)) date.spaceId = null
  } catch { date.choosableSpaces = []; date.spaceId = null }
}
function onVenueSelected(selectedVenueId: number | null, date: EventDate) {
  date.spaceId = null
  void loadSpacesForDate(date, selectedVenueId)
}

function validate() {
  errors.value = localDates.value.map(evaluateDateError)
  return errors.value.every(msg => !msg)
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
    gap: 8px;
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

/* Force inline horizontal layout */
.checkbox-label {
  display: inline-flex !important;   /* inline so it doesn't force a new line */
  flex-direction: row !important;
  align-items: center !important;
  gap: 1rem !important;
  cursor: pointer !important;
  width: auto !important;
  padding-left: 12px;
}

/* Make sure the input isn't being forced into block/full-width */
.checkbox-input,
.checkbox-label input[type="checkbox"] {
  transform: scale(1.5); /* 1 = normal size; 1.5 = 150% larger */
  transform-origin: left center;
  cursor: pointer;
  display: inline-block !important;
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
  vertical-align: middle !important;
  -webkit-appearance: checkbox !important;
  appearance: checkbox !important;
  flex-shrink: 0 !important; /* prevent flex from stretching it */
  box-sizing: content-box !important;
}

/* Ensure the label text sits inline */
.checkbox-text {
  display: inline-block !important;
  vertical-align: middle !important;
  white-space: nowrap; /* optional: keeps text on same line */
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

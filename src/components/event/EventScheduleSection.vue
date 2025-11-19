<template>
  <div>
    <p v-if="scheduleSaveError" class="event-meta__error event-meta__error--global">
      {{ scheduleSaveError }}
    </p>

    <div v-if="!eventScheduleDisplay.length" class="event-meta__empty">
      {{ t('event_schedule_empty') }}
    </div>

    <div v-else class="event-meta__list">
      <UranusInlineEditSection v-for="entry in eventScheduleDisplay" :active="editingKey === entry.displayKey">
        <UranusInlineEditLabel :label-text="formatDate(entry.startDate)" labelClass="big" :edit-button-text="t('edit')"
          @edit-started="onEditRequested(entry.displayKey)" />

        <!-- Read-only view -->
        <div v-if="editingKey !== entry.displayKey" class="event-meta__display">
          <div class="event-meta__row">
            <div v-html="formatEventDate2(entry)"></div>
            <div class="event-meta__entry-time" v-if="entry.entryTime">
              <span class="event-meta__time">{{ t('event_entry_time') }}: {{ entry.entryTime }}</span>
            </div>
          </div>
          <div v-if="entry.locationId" class="event-meta__row">
            Location
          </div>
          <div v-else class="event-meta__row">
            <strong>{{ entry.venueName || 'Unknown Venue' }}</strong>
            <div class="event-meta__space">{{ entry.spaceDisplay || '' }}</div>
          </div>
        </div>

        <!-- Editor view -->
        <form v-else class="event-meta__editor" @submit.prevent="saveRow(entry.displayKey)">
          <div class="event-dates__grid">
            <UranusDateInput :id="getFieldId(entry.displayKey, 'start-date')" v-model="editDraft.startDate"
              :label="t('event_start_date')" required />

            <UranusTimeInput :id="getFieldId(entry.displayKey, 'start-time')" v-model="editDraft.startTime"
              :label="t('event_start_time')" required />

            <UranusDateInput :id="getFieldId(entry.displayKey, 'end-date')" v-model="editDraft.endDate"
              :label="t('event_end_date')" />

            <UranusTimeInput :id="getFieldId(entry.displayKey, 'end-time')" v-model="editDraft.endTime"
              :label="t('event_end_time')" />

            <UranusTimeInput :id="getFieldId(entry.displayKey, 'entry-time')" v-model="editDraft.entryTime"
              :label="t('event_entry_time')" />

            <UranusButtonCheckbox :id="getFieldId(entry.displayKey, 'all-day')" v-model="editDraft.allDay"
              :label="t('event_schedule_all_day')" />
          </div>

          <div class="tabs-container">
            <div class="tabs-buttons flex gap-2 mb-4">
              <button type="button" :class="['tab-button', activeTab === 'venue' ? 'active' : '']"
                @click="activeTab = 'venue'">
                {{ t('venue') }}
              </button>
              <button type="button" :class="['tab-button', activeTab === 'location' ? 'active' : '']"
                @click="activeTab = 'location'">
                {{ t('location') }}
              </button>
            </div>

            <!-- Tab Panels -->
            <div v-show="activeTab === 'venue'" class="event-dates__grid">
              <UranusFieldLabel :id="getFieldId(entry.displayKey, 'venue')" :label="t('event_venue_label')">
                <select :id="getFieldId(entry.displayKey, 'venue')" v-model.number="editDraft.venueId"
                  @change="onRowVenueChange(editDraft.venueId)">
                  <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                  <option v-for="v in choosableVenues" :key="v.id" :value="v.id">{{ v.name }}</option>
                </select>
              </UranusFieldLabel>

              <UranusFieldLabel :id="getFieldId(entry.displayKey, 'space')" :label="t('event_space_label')">
                <select :id="getFieldId(entry.displayKey, 'space')" v-model.number="editDraft.spaceId">
                  <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                  <option v-for="sp in rowSpaces" :key="sp.id" :value="sp.id">{{ sp.name }}</option>
                </select>
              </UranusFieldLabel>
            </div>

            <!-- Tab Panels -->
            <!-- Location Tab -->
            <div v-show="activeTab === 'location'" class="event-dates__grid">
              <UranusTextInput v-for="field in locationFields" :key="field.key" :id="field.key"
                v-model="locationName[field.key]" :label="t(field.label)" :error="locationNameError" />
            </div>
          </div>
          <div class="event-meta__actions">
            <button type="button" class="uranus-inline-cancel-button" @click="cancelEdit">
              {{ t('form_cancel') }}
            </button>
            <button type="submit" class="uranus-inline-save-button" :disabled="isSavingRow">
              <span v-if="isSavingRow">{{ t('form_saving') }}</span>
              <span v-else>{{ t('form_save') }}</span>
            </button>
          </div>
        </form>
      </UranusInlineEditSection>
    </div>

    <div class="event-section__actions">
      <button type="button" class="uranus-secondary-button" @click="addDate">
        {{ t('event_add_date') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusDateInput from '@/components/uranus/UranusDateInput.vue'
import UranusTimeInput from '@/components/uranus/UranusTimeInput.vue'
import UranusInlineEditSection from '@/components/uranus/UranusInlineEditSection.vue'
import UranusInlineEditLabel from '@/components/uranus/UranusInlineEditLabel.vue'
import UranusFieldLabel from '@/components/uranus/UranusFieldLabel.vue'
import UranusButtonCheckbox from "@/components/uranus/UranusButtonCheckbox.vue"
import UranusTextInput from "@/components/uranus/UranusTextInput.vue"

interface EventScheduleEntry {
  id: number | null
  venueId: number | null
  venueName?: string | null
  spaceId: number | null
  spaceName?: string | null
  locationId: number | null
  startDate: string
  startTime: string
  endDate: string | null
  endTime: string | null
  entryTime: string | null
  allDay: boolean
}

interface SelectOption {
  id: number
  name: string
}

const props = defineProps<{
  eventId: number
  dates?: any[] | Record<string, any>
  eventDates?: any[] | Record<string, any>
  choosableVenues?: SelectOption[]
  initialSpaces?: SelectOption[]
  venueId?: number | null
  spaceId?: number | null
  venueName?: string | null
  spaceName?: string | null
}>()

const emit = defineEmits<{ (e: 'updated'): void }>()
const { t, locale } = useI18n({ useScope: 'global' })

// State
const scheduleEntries = ref<EventScheduleEntry[]>([])
const editingKey = ref<string | null>(null)
const editDraft = ref<EventScheduleEntry>({
  id: null,
  venueId: null,
  venueName: null,
  spaceId: null,
  spaceName: null,
  locationId: null,
  startDate: '',
  startTime: '',
  endDate: null,
  endTime: null,
  entryTime: null,
  allDay: false,
})
const rowSpaces = ref<SelectOption[]>(props.initialSpaces ?? [])
const choosableVenues = ref<SelectOption[]>(props.choosableVenues ?? [])
const isSavingRow = ref(false)
const scheduleSaveError = ref<string | null>(null)
const getFieldId = (key: string, field: string) => `${key}-${field}`

// Derived display with computed key
const eventScheduleDisplay = computed(() =>
  scheduleEntries.value.map((entry, idx) => ({
    ...entry,
    displayKey: entry.id !== null ? `id-${entry.id}` : `new-${idx}`,
    spaceDisplay: entry.spaceName ?? '',
  }))
)

const activeTab = ref<'venue' | 'location'>('venue')

type LocationKeys = keyof typeof locationName

const locationFields: { key: LocationKeys; label: string }[] = [
  { key: 'name', label: 'name' },
  { key: 'street', label: 'street' },
  { key: 'house_number', label: 'house_number' },
  { key: 'postal_code', label: 'postal_code' },
  { key: 'country_code', label: 'country_code' },
  { key: 'state_code', label: 'state_code' },
  { key: 'latitude', label: 'latitude' },
  { key: 'longitude', label: 'longitude' },
  { key: 'description', label: 'description' }
]

const locationName = reactive({
  name: '',
  street: '',
  house_number: '',
  postal_code: '',
  country_code: '',
  state_code: '',
  latitude: '',
  longitude: '',
  description: ''
})

const locationNameError = ref('')

// Normalize API collections
function normalizeCollection(collection?: any[] | Record<string, any>) {
  if (!collection) return []
  return Array.isArray(collection) ? collection : Object.values(collection)
}

function mapApiToEntry(item: any): EventScheduleEntry {
  return {
    id: item.id ?? null,
    venueId: item.venue_id ?? null,
    venueName: item.venue_name ?? null,
    spaceId: item.space_id ?? null,
    spaceName: item.space_name ?? null,
    locationId: item.location_id ?? null,
    startDate: item.start_date ?? '',
    startTime: item.start_time ?? '',
    endDate: item.end_date ?? null,
    endTime: item.end_time ?? null,
    entryTime: item.entry_time ?? null,
    allDay: item.all_day ?? false,
  }
}

function syncScheduleEntries() {
  const fromDates = normalizeCollection(props.dates)
  const fromEventDates = normalizeCollection(props.eventDates)
  const source = fromDates.length ? fromDates : fromEventDates
  scheduleEntries.value = source.map(mapApiToEntry)
}

// Edit handling
function onEditRequested(key: string) {
  if (editingKey.value === key) return cancelEdit()
  const entry = eventScheduleDisplay.value.find((e) => e.displayKey === key)
  if (!entry) return
  editDraft.value = { ...entry }
  editingKey.value = key
  void loadRowSpaces(editDraft.value.venueId ?? null)
}

function cancelEdit() {
  editingKey.value = null
  editDraft.value = {
    id: null,
    venueId: null,
    venueName: null,
    spaceId: null,
    spaceName: null,
    locationId: null,
    startDate: '',
    startTime: '',
    endDate: null,
    endTime: null,
    entryTime: null,
    allDay: false,
  }
  rowSpaces.value = []
  scheduleSaveError.value = null
}

// Venue & space selection
async function onRowVenueChange(venueId: number | null) {
  await loadRowSpaces(venueId)
  if (editDraft.value) editDraft.value.spaceId = null
}

async function loadRowSpaces(venueId: number | null) {
  if (!venueId) { rowSpaces.value = []; return }
  try {
    const { data } = await apiFetch<SelectOption[]>(`/api/choosable-spaces/venue/${venueId}`)
    rowSpaces.value = Array.isArray(data) ? data : []
  } catch {
    rowSpaces.value = []
  }
}

// Add new date
function addDate() {
  const newEntry: EventScheduleEntry = {
    id: null,
    venueId: props.venueId ?? null,
    venueName: props.venueName ?? null,
    spaceId: props.spaceId ?? null,
    spaceName: props.spaceName ?? null,
    locationId: null,
    startDate: '',
    startTime: '',
    endDate: null,
    endTime: null,
    entryTime: null,
    allDay: false,
  }
  scheduleEntries.value.push(newEntry)
  const newKey = `new-${scheduleEntries.value.length - 1}`
  onEditRequested(newKey)
}


interface ApiDateResponse {
  id: number
  start_date: string
  start_time: string
  end_date?: string | null
  end_time?: string | null
  entry_time?: string | null
  all_day: boolean
  venue_id: number | null
  space_id: number | null
}

// Save
async function saveRow(key: string) {
  if (!editDraft.value) return
  scheduleSaveError.value = null

  const isNew = editDraft.value.id === null
  const payload = {
    start_date: editDraft.value.startDate,
    start_time: editDraft.value.startTime,
    end_date: editDraft.value.endDate ?? null,
    end_time: editDraft.value.endTime ?? null,
    entry_time: editDraft.value.entryTime ?? null,
    all_day: !!editDraft.value.allDay,
    venue_id: editDraft.value.venueId ?? null,
    space_id: editDraft.value.spaceId ?? null,
  }

  try {
    if (isNew) {
      const { data } = await apiFetch<ApiDateResponse>(`/api/admin/event/${props.eventId}/dates`, {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      editDraft.value.id = data.id
    } else {
      await apiFetch(`/api/admin/event/${props.eventId}/dates/${editDraft.value.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    }

    // update local entry
    const idx = scheduleEntries.value.findIndex((e, i) =>
      e.id === editDraft.value?.id || `new-${i}` === key
    )
    if (idx !== -1) scheduleEntries.value[idx] = { ...editDraft.value }

    cancelEdit()
    emit('updated')
  } catch {
    scheduleSaveError.value = t('event_submit_error_generic')
  } finally {
    isSavingRow.value = false
  }
}

// Format helpers
function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const dt = parseDateTime(dateStr)
  if (!dt) return ''
  return dt.toLocaleDateString(locale.value, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatEventDate2(entry: EventScheduleEntry) {
  const start = parseDateTime(entry.startDate, entry.startTime)
  if (!start) return ''
  const end = entry.endDate && entry.endTime ? parseDateTime(entry.endDate, entry.endTime) : null

  const weekdayOpt = { weekday: 'short' } as const
  const dateOpt = { year: 'numeric', month: '2-digit', day: '2-digit' } as const
  const timeOpt = { hour: 'numeric', minute: '2-digit' } as const

  const startWeekday = capitalize(start.toLocaleDateString(locale.value, weekdayOpt))
  const startTimeStr = start.toLocaleTimeString(locale.value, timeOpt)
  let result = `${startWeekday}, ${startTimeStr}`

  if (end) {
    const endWeekday = capitalize(end.toLocaleDateString(locale.value, weekdayOpt))
    const endDateStr = end.toLocaleDateString(locale.value, dateOpt)
    const endTimeStr = end.toLocaleTimeString(locale.value, timeOpt)
    result += entry.startDate === entry.endDate ? ` - ${endTimeStr}` : ` - ${endWeekday} ${endDateStr}, ${endTimeStr}`
  }

  return result
}

function capitalize(str: string) { return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '' }
function parseDateTime(dateStr: string, timeStr?: string): Date | null {
  if (!dateStr) return null
  const [yearStr, monthStr, dayStr] = dateStr.split('-')
  const year = Number(yearStr), month = Number(monthStr), day = Number(dayStr)
  if ([year, month, day].some(Number.isNaN)) return null
  let hour = 0, minute = 0
  if (timeStr) {
    const [rawHour = '', rawMinute = ''] = timeStr.split(':')
    hour = Number(rawHour)
    minute = Number(rawMinute)
    if ([hour, minute].some(Number.isNaN)) return null
  }
  return new Date(year, month - 1, day, hour, minute)
}

// Init
onMounted(() => syncScheduleEntries())
watch(() => [props.dates, props.eventDates], syncScheduleEntries, { deep: true })
</script>

<style scoped lang="scss">
.event-meta__empty {
  color: var(--muted-text);
  font-size: 0.95rem;
}

.event-meta__list {
  display: flex;
  flex-direction: column;
  gap: var(--uranus-grid-gap);
}

.event-meta__entry {
  display: flex;
  align-items: stretch;
}

.uranus-inline-edit-section {
  width: 100%;
}

.event-meta__display {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.event-meta__editor {
  container-type: inline-size;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-dates__grid {
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 0.5rem;
}

.event-meta__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.event-meta__actions-inline {
  display: flex;
  gap: 0.5rem;
}

.event-meta__time {
  white-space: nowrap;
}

@container (min-width: 400px) {
  .event-dates__grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.5rem;
  }
}

@container (min-width: 800px) {
  .event-dates__grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 0.5rem;
  }
}
</style>

<style scoped>
.tabs-buttons {
  display: flex;
  gap: 0.5rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  /* gray-300 */
  border-radius: 0.5rem;
  background: #f9fafb;
  /* gray-50 */
  cursor: pointer;
  transition: all 0.2s;
}

.tab-button.active {
  border-color: #2563eb;
  /* blue-600 */
  background: #2563eb;
  color: white;
}

.tab-button:hover {
  background: #e5e7eb;
  /* gray-200 */
}
</style>

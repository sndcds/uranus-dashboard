<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('event_details_time')"
        :edit-button-text="t('edit')"
        @edit-started="startEditingSchedule"
    />

    <EventDatesComponent
        v-if="isEditing"
        ref="scheduleEditorRef"
        class="event-meta__editor"
        :model-value="scheduleDraft"
        :spaces="availableSpaces"
        :organizer-id="organizerId"
        @update:model-value="onScheduleDraftChange"
    />

    <p v-if="scheduleSaveError" class="event-meta__error event-meta__error--global">
      {{ scheduleSaveError }}
    </p>

    <div v-if="!isEditing && !eventScheduleDisplay.length" class="event-meta__empty">
      {{ t('event_schedule_empty') }}
    </div>

    <div v-if="!isEditing && eventScheduleDisplay.length" class="event-meta__list">
      <table class="event-schedule-table">
        <thead>
        <tr>
          <th>Date</th>
          <th></th>
          <th>Entry Time</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="entry in eventScheduleDisplay" :key="entry.key">
          <td><h2>{{ formatDate(entry.startDate) }}</h2></td>
          <td>{{ formatEventDate2(entry) }}</td>
          <td>{{ entry.endTime || '' }}</td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-if="isEditing" class="event-meta__actions">
      <button type="button" class="uranus-inline-cancel-button" @click="cancelEditingSchedule">
        {{ t('form_cancel') }}
      </button>
      <button type="button" class="uranus-inline-save-button" :disabled="isSavingSchedule" @click="saveSchedule">
        <span v-if="isSavingSchedule">{{ t('form_saving') }}</span>
        <span v-else>{{ t('form_save') }}</span>
      </button>
    </div>
  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import EventDatesComponent from '@/components/EventDatesComponent.vue'
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue"
import UranusInlineEditSection from "@/components/uranus/UranusInlineEditSection.vue"

interface EventScheduleEntry {
  id: number | null
  startDate: string
  startTime: string
  endDate: string | null
  endTime: string | null
  entryTime: string | null
  allDay: boolean
  spaceId: number | null
}

interface SelectOption {
  id: number
  name: string
}

interface EventScheduleDisplay extends EventScheduleEntry {
  key: string
  spaceDisplay: string
}

const props = defineProps<{
  eventId: number
  organizerId?: number | null
  venueId: number | null
  startDate?: string | null
  startTime?: string | null
  endDate?: string | null
  endTime?: string | null
  entryTime?: string | null
  dates?: Record<string, any> | any[]
  eventDates?: Record<string, any> | any[]
  spaceId: number | null
  spaceName?: string | null
}>()

const emit = defineEmits<{ (e: 'updated'): void }>()

const { t, locale } = useI18n({ useScope: 'global' })

// --- State ---
const availableSpaces = ref<SelectOption[]>([])
const scheduleEntries = ref<EventScheduleEntry[]>([])
const scheduleDraft = ref<any[]>([])
const isEditing = ref(false)
const isSavingSchedule = ref(false)
const scheduleSaveError = ref<string | null>(null)
const scheduleEditorRef = ref<InstanceType<typeof EventDatesComponent> | null>(null)

// --- Utilities ---
function parseDateTime(dateStr: string, timeStr?: string) {
  if (!dateStr) return null
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hour = 0, minute = 0] = timeStr?.split(':').map(Number) ?? []
  return new Date(year, month - 1, day, hour, minute)
}

function capitalize(str: string) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function formatWeekday(dateStr: string) {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-').map(Number)
  const dt = new Date(year, month - 1, day)
  const w = dt.toLocaleDateString(locale.value, { weekday: 'short' })
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const dt = parseDateTime(dateStr)
  if (!dt) return ''
  return dt.toLocaleDateString(locale.value, { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatEventDate(entry: EventScheduleEntry) {
  const start = parseDateTime(entry.startDate, entry.startTime)
  if (!start) return ''

  const end = entry.endDate && entry.endTime ? parseDateTime(entry.endDate, entry.endTime) : null

  const weekdayOpt = { weekday: 'short' } as const
  const dateOpt = { year: 'numeric', month: '2-digit', day: '2-digit' } as const
  const timeOpt = { hour: 'numeric', minute: '2-digit' } as const

  const startWeekday = capitalize(start.toLocaleDateString(locale.value, weekdayOpt))
  const startDateStr = start.toLocaleDateString(locale.value, dateOpt)
  const startTimeStr = start.toLocaleTimeString(locale.value, timeOpt)

  let result = `<strong>${startWeekday}, ${startDateStr}</strong>, ${startTimeStr}`

  if (end) {
    const endWeekday = capitalize(end.toLocaleDateString(locale.value, weekdayOpt))
    const endDateStr = end.toLocaleDateString(locale.value, dateOpt)
    const endTimeStr = end.toLocaleTimeString(locale.value, timeOpt)

    if (entry.startDate === entry.endDate) {
      result = `<strong>${startWeekday}, ${startDateStr}</strong>, ${startTimeStr} - ${endTimeStr}`
    } else {
      result = `<strong>${startWeekday}, ${startDateStr}</strong>, ${startTimeStr} - ${endWeekday}, ${endDateStr}, ${endTimeStr}`
    }
  }
  return result
}

function formatEventDate2(entry: EventScheduleEntry) {
  const start = parseDateTime(entry.startDate, entry.startTime)
  if (!start) return ''

  const end = entry.endDate && entry.endTime ? parseDateTime(entry.endDate, entry.endTime) : null

  const weekdayOpt = { weekday: 'short' } as const
  const dateOpt = { year: 'numeric', month: '2-digit', day: '2-digit' } as const
  const timeOpt = { hour: 'numeric', minute: '2-digit' } as const

  const startWeekday = capitalize(start.toLocaleDateString(locale.value, weekdayOpt))
  const startDateStr = start.toLocaleDateString(locale.value, dateOpt)
  const startTimeStr = start.toLocaleTimeString(locale.value, timeOpt)

  let result = `${startWeekday}, ${startTimeStr}`

  if (end) {
    const endWeekday = capitalize(end.toLocaleDateString(locale.value, weekdayOpt))
    const endDateStr = end.toLocaleDateString(locale.value, dateOpt)
    const endTimeStr = end.toLocaleTimeString(locale.value, timeOpt)

    if (entry.startDate === entry.endDate) {
      // same day
      result += ` - ${endTimeStr}`
    } else {
      // different days
      result += ` - ${endWeekday} ${endDateStr}, ${endTimeStr}`
    }
  }

  return result
}

function formatEntryTime(entry: EventScheduleEntry) {
  if (!entry.entryTime) return ''
  const dt = parseDateTime(entry.startDate, entry.entryTime)
  if (!dt) return entry.entryTime
  return dt.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
}

// --- Derived ---
const spaceLookup = computed(() => {
  const map: Record<number, string> = {}
  availableSpaces.value.forEach((s) => (map[s.id] = s.name))
  if (props.spaceId !== null && props.spaceName) map[props.spaceId] = props.spaceName
  return map
})

const eventScheduleDisplay = computed<EventScheduleDisplay[]>(() =>
    scheduleEntries.value.map((entry, index) => ({
      ...entry,
      key: entry.id ?? `schedule-${index}`,
      spaceDisplay: entry.spaceId !== null ? spaceLookup.value[entry.spaceId] ?? '' : '',
    }))
)

// --- Normalize API data ---
function normalizeCollection(collection?: any[] | Record<string, any>) {
  if (!collection) return []
  return Array.isArray(collection) ? collection : Object.values(collection)
}

function mapApiToEntry(item: any): EventScheduleEntry {
  return {
    id: typeof item.id === 'number' ? item.id : null,
    startDate: item.start_date ?? '',
    startTime: item.start_time ?? '',
    endDate: item.end_date ?? null,
    endTime: item.end_time ?? null,
    entryTime: item.entry_time ?? null,
    allDay: item.all_day ?? false,
    spaceId: typeof item.space_id === 'number' ? item.space_id : null,
  }
}

function deriveScheduleFromProps() {
  const fromDates = normalizeCollection(props.dates)
  const fromEventDates = normalizeCollection(props.eventDates)
  const source = fromDates.length ? fromDates : fromEventDates

  const mapped = source.map(mapApiToEntry).filter((e) => e.startDate && e.startTime)

  if (mapped.length) return mapped

  if (props.startDate && props.startTime) {
    return [
      {
        id: null,
        startDate: props.startDate,
        startTime: props.startTime,
        endDate: props.endDate ?? null,
        endTime: props.endTime ?? null,
        entryTime: props.entryTime ?? null,
        allDay: false,
        spaceId: props.spaceId ?? null,
      },
    ]
  }

  return []
}

function syncScheduleEntries() {
  scheduleEntries.value = deriveScheduleFromProps()
}

// --- Load spaces ---
async function loadSpaces(venueId: number | null) {
  if (!venueId) return
  try {
    const { data } = await apiFetch<SelectOption[]>(`/api/choosable-spaces/venue/${venueId}`)
    availableSpaces.value = Array.isArray(data) ? data : []
  } catch {
    availableSpaces.value = []
  }
}

// --- Editing functions ---
const startEditingSchedule = async () => {
  scheduleDraft.value = scheduleEntries.value.map((entry) => ({
    id: entry.id,
    startDate: entry.startDate,
    endDate: entry.endDate,
    startTime: entry.startTime,
    endTime: entry.endTime,
    entryTime: entry.entryTime,
    spaceId: entry.spaceId,
    allDayEvent: entry.allDay,
  }))
  isEditing.value = true
  scheduleSaveError.value = null
  await loadSpaces(props.venueId ?? null)
}

const cancelEditingSchedule = () => {
  isEditing.value = false
  scheduleDraft.value = []
}

const onScheduleDraftChange = (value: any[]) => {
  scheduleDraft.value = value
}

const saveSchedule = async () => {
  scheduleSaveError.value = null
  if (!scheduleDraft.value.length) {
    scheduleSaveError.value = t('event_submit_error_generic')
    return
  }

  isSavingSchedule.value = true

  try {
    const payload = {
      dates: scheduleDraft.value.map((entry) => ({
        id: entry.id ?? undefined,
        start_date: entry.startDate,
        start_time: entry.startTime,
        end_date: entry.endDate ?? null,
        end_time: entry.endTime ?? null,
        entry_time: entry.entryTime ?? null,
        all_day: entry.allDayEvent ?? false,
        space_id: entry.spaceId ?? null,
      })),
    }

    await apiFetch(`/api/admin/event/${props.eventId}/dates`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    scheduleEntries.value = scheduleDraft.value.map((entry) => ({
      id: entry.id,
      startDate: entry.startDate,
      endDate: entry.endDate,
      startTime: entry.startTime,
      endTime: entry.endTime,
      entryTime: entry.entryTime,
      allDay: entry.allDayEvent,
      spaceId: entry.spaceId,
    }))

    scheduleDraft.value = []
    isEditing.value = false
    emit('updated')
  } catch {
    scheduleSaveError.value = t('event_submit_error_generic')
  } finally {
    isSavingSchedule.value = false
  }
}

// --- Watch props and sync ---
watch(
    () => [props.dates, props.eventDates, props.startDate, props.startTime, props.endDate, props.endTime],
    () => syncScheduleEntries(),
    { deep: true }
)

onMounted(() => {
  void loadSpaces(props.venueId ?? null)
  syncScheduleEntries()
})
</script>

<style scoped lang="scss">
.event-meta__empty {
  color: var(--muted-text);
  font-size: 0.95rem;
}

.event-meta__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.event-meta__display {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.event-meta__row {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.event-meta__value {
  margin: 0;
  color: var(--color-text);
  font-size: 0.9rem;
  line-height: 1.4;
}

.event-meta__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.event-meta__error {
  color: #b91c1c;
  font-weight: 600;
  font-size: 0.85rem;
}

.event-meta__inline {
  display: flex;
  white-space: nowrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}

.event-schedule-table {
  border-collapse: collapse; // remove extra spacing between cells
  table-layout: auto;        // columns size themselves based on content
  width: auto;               // do not stretch table to container
}

.event-schedule-table th,
.event-schedule-table td {
  padding: 0.25rem 0.5rem;   // adjust padding as needed
  white-space: nowrap;       // prevent text from wrapping
  text-align: left;          // optional
}

</style>
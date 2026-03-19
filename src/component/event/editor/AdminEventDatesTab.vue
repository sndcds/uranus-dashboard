<!-- src/component/event/editor/AdminEventDatesTab.vue -->

<template>
  <section class="dates-tab">

    <UranusCard
        v-for="(date, index) in store.draft?.eventDates"
        :key="index"
        class="date-card"
    >
      <div v-if="date.venueId" class="date-venue-name">
        <h2>{{ t('venue') }}: <strong>{{ venueInfoStore.getVenueLabel(date.venueId, date.spaceId) }}</strong></h2>
      </div>

      <div class="date-pair">
        <UranusDateInput id="start-date" v-model="date.startDate" :label="t('event_start_date')" style="width: 100%;"/>
        <UranusTimeInput id="start-time" v-model="date.startTime" :label="t('event_start_time')" style="width: 100%;"/>
      </div>

      <div class="date-pair">
        <UranusDateInput id="end-date" v-model="date.endDate" :label="t('event_end_date')" style="width: 100%;"/>
        <UranusTimeInput id="end-time" v-model="date.endTime" :label="t('event_end_time')" style="width: 100%;"/>
      </div>

      <div class="date-pair">
        <UranusTimeInput id="entry-time" v-model="date.entryTime" :label="t('event_entry_time')" style="width: 100%;"/>
        <UranusNumberInput id="duration" v-model="date.duration!" min="0" :label="t('event_duration')" />
      </div>

      <div class="date-pair" style="padding-top: 1.6rem;">
        <UranusCheckbox
            id="todo_completed"
            v-model="date.allDay!"
            :label="t('all_day')"
        />
      </div>

      <div class="date-actions">
        <UranusButton size="small" variant="tertiary" @click="openVenueModal(date)">
          {{ t('event_select_venue') }}
        </UranusButton>

        <UranusButton size="small" variant="tertiary" @click="clearVenue(date)">
          {{ t('event_remove_venue') }}
        </UranusButton>

        <UranusButton
            v-if="store.hasMultipleDates"
            size="small"
            variant="tertiary"
            @click="removeDate(index)">
          {{ t('event_remove_date') }}
        </UranusButton>
      </div>
    </UranusCard>


    <!-- Save / Discard buttons -->
    <div class="tab-actions">
      <UranusButton size="medium" variant="cta" @click="addDate">
        {{ t('event_add_date') }}
      </UranusButton>

      <UranusButton
          variant="cta"
          :disabled="store.saving || !isDirty"
          @click="resetDates"
      >
        <template #icon><Undo /></template>
        {{ t('discard')}}
      </UranusButton>

      <UranusButton
          variant="cta"
          :disabled="store.saving || !isDirty"
          :loading="store.saving"
          loading-text="Saving..."
          @click="commitDates"
      >
        <template #icon><Save /></template>
        {{ t('save')}}
      </UranusButton>
    </div>

    <!-- Venue selection modal -->
    <UranusVenueSelectModal
        :show="showModal"
        :venueInfos="venueInfos"
        v-model="selectedPlace"
        @close="showModal = false"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from "@/api.ts";
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import { useUranusEventVenueInfoStore } from '@/store/uranusEventVenueInfoStore.ts'
import UranusVenueSelectModal from "@/component/venue/UranusVenueSelectModal.vue";
import UranusCard from "@/component/ui/UranusCard.vue";
import UranusButton from "@/component/ui/UranusButton.vue";
import {Save, Undo} from "lucide-vue-next";
import UranusDateInput from "@/component/ui/UranusDateInput.vue";
import UranusTimeInput from "@/component/ui/UranusTimeInput.vue";
import UranusNumberInput from "@/component/ui/UranusNumberInput.vue";
import UranusCheckbox from "@/component/ui/UranusCheckbox.vue";

const { t } = useI18n({ useScope: 'global' })

const store = useUranusAdminEventStore()
const venueInfoStore = useUranusEventVenueInfoStore()

interface SelectedPlace {
  venueId: number | null
  spaceId: number | null
}

const selectedPlace = ref<SelectedPlace>({ venueId: null, spaceId: null })
const showModal = ref(false)
const activeDate = ref<any | null>(null)

// Computed list of venues for modal
const venueInfos = computed(() => venueInfoStore.items)

// Compute if dates tab is dirty
const isDirty = computed(() => {
  const draft = store.draft?.eventDates
  const original = store.original?.eventDates
  if (!draft || !original) return false
  return JSON.stringify(draft) !== JSON.stringify(original)
})

onMounted(() => {
  venueInfoStore.fetchAll()
})

function openVenueModal(date: any) {
  activeDate.value = date
  showModal.value = true
}

// Sync selected venue back to the active date
watch(selectedPlace, (val) => {
  if (!activeDate.value || !val) return
  activeDate.value.venueId = val.venueId
  activeDate.value.spaceId = val.spaceId
}, { deep: true })

// Reset active date when modal closes
watch(showModal, (val) => {
  if (!val) activeDate.value = null
})

function clearVenue(date: any) {
  date.venueId = null
  date.spaceId = null
  if (activeDate.value === date) {
    selectedPlace.value = { venueId: null, spaceId: null }
  }
}

function addDate() {
  store.addEventDate()
}

function removeDate(index: number) {
  store.removeEventDate(index)
}

function toSnakeCase(str: string) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
}

async function commitDates() {
  if (!store.draft || !store.original) return
  store.saving = true
  store.error = null

  try {
    const payload = store.draft.eventDates?.map(date => {
      const result: Record<string, any> = {}
      for (const key of Object.keys(date)) {
        const value = (date as any)[key]
        if (value !== null && value !== undefined) {
          result[toSnakeCase(key)] = value
        }
      }
      return result
    }) ?? []

    const wrappedPayload = { event_dates: payload }

    const apiPath = `/api/admin/event/${store.draft.id}/dates`
    await apiFetch(apiPath, {
      method: 'PUT',
      body: JSON.stringify(wrappedPayload),
    })

    store.original.eventDates = store.draft.eventDates
        ? store.draft.eventDates.map(d => ({ ...d }))
        : []
  } catch (err) {
    console.error(err)
    store.error = 'Failed to save event dates'
  } finally {
    store.saving = false
  }
}

function resetDates() {
  if (!store.draft || !store.original) return
  store.draft.eventDates = store.original.eventDates
      ? store.original.eventDates.map(d => ({ ...d }))
      : []
}
</script>

<style scoped lang="scss">
.dates-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: var(--uranus-dashboard-content-width);

  .date-pair {
    display: flex;
    gap: 12px;
    width: 40%;
    max-width: 400px;
    min-width: 300px;
    > * {
      flex: 1;
      min-width: 0;
    }
  }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}

.date-card {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.4rem;
  width: 100%;
}

.date-venue-name {
  font-weight: 500;
  flex-basis: 100%;
  h2 {
    font-weight: 500;
  }
}

.date-actions {
  display: flex;
  flex-basis: 100%;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
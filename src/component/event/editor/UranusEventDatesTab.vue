<!-- src/component/event/editor/UranusEventDatesTab.vue -->
<template>
  <section class="dates-tab">

    <!-- No dates info -->
    <UranusCard v-if="!store.hasDates" type="info">
      <UranusInfoHeading :icon="Info">
        {{ t('event_no_dates_defined') }}
      </UranusInfoHeading>
    </UranusCard>

    <UranusFeedback :show="!!store.error" type="error">
      {{ store.error }}
    </UranusFeedback>

    <!-- Event dates -->
    <UranusCard
        v-for="(date, index) in store.draft?.eventDates"
        :key="index"
        class="date-card"
    >
      <UranusInfoHeading
          v-if="date.venueUuid"
          :icon="MapPin"
          :strokeWidth="1.5"
          class="date-venue-name"
      >
        {{ choosableVenuesStore.getVenueLabel(date.venueUuid, date.spaceUuid) }}
      </UranusInfoHeading>

      <div class="date-pair">
        <UranusDateInput id="start-date" v-model="date.startDate" :label="t('event_start_date')" required style="width: 100%;"/>
        <UranusTimeInput id="start-time" v-model="date.startTime" :label="t('event_start_time')" required style="width: 100%;"/>
      </div>

      <div class="date-pair">
        <UranusDateInput id="end-date" v-model="date.endDate" :label="t('event_end_date')" style="width: 100%;"/>
        <UranusTimeInput id="end-time" v-model="date.endTime" :label="t('event_end_time')" style="width: 100%;"/>
      </div>

      <div class="date-pair">
        <UranusTimeInput id="entry-time" v-model="date.entryTime" :label="t('event_entry_time')" style="width: 100%;"/>
        <UranusNumberInput id="duration" v-model="date.duration!" min="1" :label="t('event_duration')" />
      </div>

      <div class="date-pair" style="padding-top: 1.6rem;">
        <UranusCheckbox id="todo_completed" v-model="date.allDay" :label="t('event_all_day')" />
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
            @click="removeDate(index)"
        >
          {{ t('event_remove_date') }}
        </UranusButton>
      </div>
    </UranusCard>

    <!-- Save / Discard buttons -->
    <div class="tab-actions">
      <UranusButton @click="addDate">
        <template #icon><Plus /></template>{{ t('event_add_date') }}
      </UranusButton>

      <UranusButton :disabled="store.saving || !isDirty" @click="resetDates">
        <template #icon><Undo /></template>{{ t('discard')}}
      </UranusButton>

      <UranusButton
          :disabled="store.saving || !isDirty"
          :loading="store.saving"
          loading-text="Saving..."
          @click="commitDates"
      >
        <template #icon><Save /></template>{{ t('save')}}
      </UranusButton>
    </div>

    <!-- Venue selection modal -->
    <UranusVenueSelectModal
        :show="showModal"
        :venueSpaceInfos="venueSpacesInfos"
        v-model="selectedPlace"
        @close="closeVenueModal"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAdminEventStore } from '@/store/adminEventStore.ts'
import { useChoosableVenuesStore } from '@/store/choosableVenuesStore.ts'
import UranusVenueSelectModal from '@/component/venue/UranusVenueSelectModal.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusDateInput from '@/component/ui/UranusDateInput.vue'
import UranusTimeInput from '@/component/ui/UranusTimeInput.vue'
import UranusNumberInput from '@/component/ui/UranusNumberInput.vue'
import UranusCheckbox from '@/component/ui/UranusCheckbox.vue'
import UranusInfoHeading from '@/component/ui/UranusInfoHeading.vue'
import { Save, Undo, Plus, MapPin, Info } from 'lucide-vue-next'
import { apiFetch } from '@/api.ts'
import UranusFeedback from "@/component/uranus/UranusFeedback.vue";

const { t } = useI18n({ useScope: 'global' })
const store = useAdminEventStore()
const choosableVenuesStore = useChoosableVenuesStore()

// ---- Venue modal state ----
const showModal = ref(false)
const activeDate = ref<any | null>(null)
const selectedPlace = ref<{ venueUuid: string | null, spaceUuid: string | null }>({ venueUuid: null, spaceUuid: null })

// ---- Computed ----
const isDirty = computed(() => {
  const draft = store.draft?.eventDates
  const original = store.original?.eventDates
  if (!draft || !original) return false
  return JSON.stringify(draft) !== JSON.stringify(original)
})

// Refresh venues on mount
onMounted(async () => {
  await choosableVenuesStore.refresh()
})

// Compute venue spaces for modal
const venueSpacesInfos = computed(() =>
    choosableVenuesStore.getVenueSpacesInfos()
)

// ---- Event handlers ----
function openVenueModal(date: any) {
  activeDate.value = date
  selectedPlace.value = {
    venueUuid: date.venueUuid ?? null,
    spaceUuid: date.spaceUuid ?? null,
  }
  showModal.value = true
}

function closeVenueModal() {
  if (activeDate.value && selectedPlace.value) {
    activeDate.value.venueUuid = selectedPlace.value.venueUuid
    activeDate.value.spaceUuid = selectedPlace.value.spaceUuid
  }
  activeDate.value = null
  showModal.value = false
}

function clearVenue(date: any) {
  date.venueUuid = null
  date.spaceUuid = null
  if (activeDate.value === date) {
    selectedPlace.value = { venueUuid: null, spaceUuid: null }
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

    await apiFetch(`/api/admin/event/${store.draft.uuid}/dates`, {
      method: 'PUT',
      body: JSON.stringify({ event_dates: payload }),
    })

    store.original.eventDates = store.draft.eventDates
        ? store.draft.eventDates.map(d => ({ ...d }))
        : []
  } catch (err) {
    console.error(err)
    store.error = t('stage_failed_check_data')
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
  gap: 0.5rem;
  margin-top: 1rem;
}
</style>
<!--
  src/component/event/editor/UranusAdminEventDatesTab.vue
-->

<template>
  <section class="dates-tab">

    <!-- No dates info -->
    <UranusCard v-if="!store.hasDates" type="info">
      <UranusInfoHeading :icon="Info">
        {{ t('event_no_dates_defined') }}
      </UranusInfoHeading>
    </UranusCard>

    <UranusFeedback v-if="!!store.error" type="error">
      {{ store.error }}
    </UranusFeedback>

    <!-- Event dates -->
    <div v-if="store.hasDates" class="date-cards">
      <UranusAdminEventDateTableRow
          v-for="(date, index) in store.draft?.eventDates"
          :key="date.uuid || index"
          :date="date"
          :index="index"
          :open="openDateIndex === index"
          :venue-label="venueLabels[makeKey(date.venueUuid, date.spaceUuid)] || ''"
          :can-remove="store.hasMultipleDates"
          @toggle="toggleDate(index)"
          @select-venue="openVenueModal(date)"
          @clear-venue="clearVenue(date)"
          @select-location="openLocationModal(date)"
          @remove="removeDate(index)"
      />
    </div>

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
    <UranusAdminVenueSelectModal
        :show="showModal"
        :venueSpaceInfos="venueSpacesInfos"
        v-model="selectedPlace"
        @close="closeVenueModal"
    />

    <UranusModal
        :show="showLocationModal"
        :title="t('event_date_select_location')"
        max-width="960px"
        @close="closeLocationModal"
    >
      <UranusLocationForm
          v-model:modelValueLat="selectedLocation.lat"
          v-model:modelValueLon="selectedLocation.lon"
      />

      <template #actions>
        <UranusButton variant="tertiary" @click="clearLocation">
          {{ t('clear') }}
        </UranusButton>
        <UranusButton variant="tertiary" @click="closeLocationModal">
          {{ t('close') }}
        </UranusButton>
        <UranusButton @click="saveLocation">
          {{ t('save') }}
        </UranusButton>
      </template>
    </UranusModal>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import { Save, Undo, Plus, Info } from 'lucide-vue-next'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import { useAdminEventStore } from '@/store/adminEventStore.ts'
import { useChoosableVenuesStore } from '@/store/choosableVenuesStore.ts'
import { useVenueSpaceLabelStore } from '@/store/venueSpaceLabelsStore.ts'
import UranusAdminVenueSelectModal from '@/component/venue/UranusAdminVenueSelectModal.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusInfoHeading from '@/component/ui/UranusInfoHeading.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusAdminEventDateTableRow from '@/component/event/editor/UranusAdminEventDateTableRow.vue'
import UranusLocationForm from '@/component/uranus/UranusLocationForm.vue'
import UranusModal from '@/component/uranus/UranusModal.vue'
import type { AdminEventDate } from '@/domain/event/adminEventDate.model.ts'

const { t } = useI18n({ useScope: 'global' })
const store = useAdminEventStore()
const emit = defineEmits<{
  (event: 'dirty-change', value: boolean): void
}>()
const appStore = useAppStore()
const choosableVenuesStore = useChoosableVenuesStore()
const venueLabelStore = useVenueSpaceLabelStore()


// ---- Venue modal state ----
const showModal = ref(false)
const activeDate = ref<any | null>(null)
const selectedPlace = ref<{ venueUuid: string | null, spaceUuid: string | null }>({ venueUuid: null, spaceUuid: null })
const venueLabels = ref<Record<string, string>>({})
const openDateIndex = ref<number | null>(null)
const showLocationModal = ref(false)
const activeLocationDate = ref<AdminEventDate | null>(null)
const selectedLocation = ref<{ lat: number | null, lon: number | null }>({ lat: null, lon: null })

const isDirty = computed(() => {
  const draft = store.draft?.eventDates
  const original = store.original?.eventDates
  if (!draft || !original) return false
  return JSON.stringify(draft) !== JSON.stringify(original)
})

watch(isDirty, (value) => {
  emit('dirty-change', value)
}, { immediate: true })


function makeKey(venueUuid: string | null, spaceUuid: string | null) {
  return `${venueUuid ?? 'null'}:${spaceUuid ?? 'null'}`
}

watchEffect(async () => {
  const dates = store.draft?.eventDates ?? []

  for (const date of dates) {
    if (!date.venueUuid) continue

    const key = makeKey(date.venueUuid, date.spaceUuid)

    if (venueLabels.value[key]) continue

    venueLabels.value[key] =
        await venueLabelStore.getVenueSpaceLabel(
            date.venueUuid,
            date.spaceUuid
        )
  }
})

onMounted(async () => {
  await choosableVenuesStore.refresh(appStore.orgUuid)
})

// Compute venue spaces for modal
const venueSpacesInfos = computed(() =>
    choosableVenuesStore.getVenueSpacesInfos()
)

// ---- Event handlers ----
function toggleDate(index: number) {
  openDateIndex.value = openDateIndex.value === index ? null : index
}

function openVenueModal(date: AdminEventDate) {
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

function clearVenue(date: AdminEventDate) {
  date.venueUuid = null
  date.spaceUuid = null
  if (activeDate.value === date) {
    selectedPlace.value = { venueUuid: null, spaceUuid: null }
  }
}

function openLocationModal(date: AdminEventDate) {
  activeLocationDate.value = date
  selectedLocation.value = {
    lat: date.dateVenueLat,
    lon: date.dateVenueLon,
  }
  showLocationModal.value = true
}

function closeLocationModal() {
  activeLocationDate.value = null
  showLocationModal.value = false
}

function clearLocation() {
  selectedLocation.value = { lat: null, lon: null }
}

function saveLocation() {
  if (activeLocationDate.value) {
    activeLocationDate.value.dateVenueLat = selectedLocation.value.lat
    activeLocationDate.value.dateVenueLon = selectedLocation.value.lon
  }
  closeLocationModal()
}

function addDate() {
  store.addEventDate()
  openDateIndex.value = (store.draft?.eventDates?.length ?? 1) - 1
}

function removeDate(index: number) {
  store.removeEventDate(index)
  if (openDateIndex.value === index) openDateIndex.value = null
  else if (openDateIndex.value !== null && openDateIndex.value > index) openDateIndex.value -= 1
}

async function commitDates() {
  if (!store.draft || !store.original) return
  store.saving = true
  store.error = null

  const emptyToNull = (v: unknown) => {
    if (v === null || v === undefined) return null
    if (typeof v === "string" && v.trim() === "") return null
    return v
  }

  try {
    const payload = store.draft.eventDates?.map(date => ({
      start_date: emptyToNull(date.startDate),
      start_time: emptyToNull(date.startTime),
      end_date: emptyToNull(date.endDate),
      end_time: emptyToNull(date.endTime),
      entry_time: emptyToNull(date.entryTime),
      duration: date.duration ?? null,
      all_day: date.allDay ?? null,
      venue_uuid: date.venueUuid ?? null,
      space_uuid: date.spaceUuid ?? null,
      ticket_link: emptyToNull(date.ticketLink),
      date_description: emptyToNull(date.dateDescription),
      date_venue_name: emptyToNull(date.dateVenueName),
      date_venue_lat: date.dateVenueLat ?? null,
      date_venue_lon: date.dateVenueLon ?? null,
      release_status: date.releaseStatus ?? null,
    })) ?? []

    await apiFetch(`/api/admin/event/${store.draft.uuid}/dates`, {
      method: 'PUT',
      body: JSON.stringify({ event_dates: payload }),
    })

    store.original.eventDates = store.draft.eventDates
        ? store.draft.eventDates.map(d => ({ ...d }))
        : []
  } catch (err) {
    console.error(err)
    store.error = t('form_validation_failed')
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

defineExpose({
  commitTab: commitDates,
})
</script>

<style scoped lang="scss">
.dates-tab {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: var(--uranus-dashboard-content-width);

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }
}

.date-cards {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
</style>

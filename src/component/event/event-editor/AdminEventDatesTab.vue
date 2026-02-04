<template>
  <section class="dates-tab">
    <div
        v-for="(date, index) in store.draft?.eventDates"
        :key="index"
        class="event-date"
    >
      <div class="two-fields">
        <label>Beginn
          <input type="date" v-model="date.startDate" />
        </label>
        <label>Zeit
          <input type="time" v-model="date.startTime" />
        </label>
      </div>

      <div class="two-fields">
        <label>Ende
          <input type="date" v-model="date.endDate" />
        </label>
        <label>Zeit
          <input type="time" v-model="date.endTime" />
        </label>
      </div>

      <div class="two-fields">
        <label>Einlass
          <input type="time" v-model="date.entryTime" placeholder="Entry Time" />
        </label>
        <label>Dauer
          <input type="number" v-model.number="date.duration" min="0" placeholder="Duration (min)" />
        </label>
      </div>

      <label class="all-day">
        <input type="checkbox" v-model="date.allDay" />
        All Day
      </label>

      <div class="full-width">
        <span v-if="date.venueId" class="venue_name">
          {{ getVenueLabel(date.venueId, date.spaceId) }}
        </span>
      </div>

      <div class="full-width">
        <button type="button" @click="openVenueModal(date)">
          Select Venue
        </button>

        <button type="button" @click="clearVenue(date)">
          Clear Venue
        </button>

        <button
            v-if="store.hasMultipleDates"
            @click="removeDate(index)"
            type="button"
        >
          Remove
        </button>
      </div>

    </div>

    <button @click="addDate" type="button">
      Add date
    </button>

    <!-- Save / Discard buttons -->
    <div class="tab-actions">
      <button @click="resetDates" :disabled="store.saving || !isDirty">
        Discard
      </button>
      <button @click="commitDates" :disabled="store.saving || !isDirty">
        Save Tab
      </button>
    </div>
  </section>

  <UranusVenueSelectModal
      :show="showModal"
      :venueInfos="venueInfos"
      v-model="selectedPlace"
      @close="showModal = false"
  />

</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue'
import { useUranusAdminEventStore } from '@/store/uranusAdminEventStore.ts'
import {apiFetch} from "@/api.ts";
import UranusVenueSelectModal from "@/component/venue/UranusVenueSelectModal.vue";
import { useUranusUserOrgVenueStore } from '@/store/uranusUserOrgVenueStore.ts'

const store = useUranusAdminEventStore()
const venueStore = useUranusUserOrgVenueStore()

// Compute if dates tab is dirty
const isDirty = computed(() => {
  const draft = store.draft?.eventDates
  const original = store.original?.eventDates
  if (!draft || !original) return false

  return JSON.stringify(draft) !== JSON.stringify(original)
})


interface SelectedPlace {
  venueId: number | null
  spaceId: number | null
}

const selectedPlace = ref<SelectedPlace>({
  venueId: null,
  spaceId: null,
})


const showModal = ref(false)
const venueInfos = computed(() => venueStore.venueInfos)

// keep a reference to the date being edited
const activeDate = ref<any | null>(null)

// fetch venues on mounted
onMounted(() => {
  venueStore.fetchVenues()
   console.log(JSON.stringify(venueStore.venueInfos, null, 2))
})

function getVenueLabel(
    venueId: number | null,
    spaceId: number | null
): string {
  if (!venueId) return ''

  // exact match (venue + space)
  const exact = venueStore.venueInfos.find(v =>
      v.venue_id === venueId &&
      (spaceId == null ? v.space_id == null : v.space_id === spaceId)
  )

  if (exact) {
    return exact.space_name
        ? `${exact.venue_name} – ${exact.space_name}`
        : exact.venue_name
  }

  // fallback: venue only
  const venueOnly = venueStore.venueInfos.find(v => v.venue_id === venueId)
  return venueOnly ? venueOnly.venue_name : ''
}

function openVenueModal(date: any) {
  activeDate.value = date

  selectedPlace.value.venueId = date.venueId ?? null
  selectedPlace.value.spaceId = date.spaceId ?? null

  showModal.value = true

  watch(selectedPlace, (val) => {
    if (!activeDate.value || !val) return
    activeDate.value.venueId = val.venueId
    activeDate.value.spaceId = val.spaceId
  }, { deep: true }) // <- important if you want Vue to track changes inside the object

  watch(showModal, (show) => {
    if (!show) {
      activeDate.value = null
    }
  })
}

function clearVenue(date: any) {
  date.venueId = null
  date.spaceId = null

  // Also reset selectedPlace if this date is active
  if (activeDate.value === date) {
    selectedPlace.value.venueId = null
    selectedPlace.value.spaceId = null
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

    console.log('Payload to send:', JSON.stringify(wrappedPayload, null, 2))

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
  gap: 12px;

  .two-fields {
    display: flex;
    gap: 12px;
    width: 40%;
    max-width: 400px;
    min-width: 280px;

    label {
      display: flex;
      flex-direction: column;
      gap: 4px;
      width: calc(50% - 6px);
      font-size: 0.85rem;

      input[type="date"],
      input[type="time"],
      input[type="number"] {
        font-size: 1rem;
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        border: 0px solid #ccc;
        width: 100%;
        height: 100%;
      }
    }
  }

  .full-width {
    display: flex;
    gap: 8px;
    padding-top: 12px;
    width: 100%;
  }

  .event-date {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
    padding: 16px;
    border-radius: 7px;
    border: 1px solid #ccc;

    input[type="date"],
    input[type="time"],
    input[type="number"] {
      font-size: 1rem;
      padding: 0.4rem 0.8rem;
      border-radius: 4px;
      border: 0px solid #ccc;
      width: calc(50% - 6px);
    }

    .all-day {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.9rem;
    }

    button {
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      border: 1px solid #aaa;
      cursor: pointer;
      background: #fff;

      &:hover {
        background: #e0e0e0;
      }
    }

    .venue_name {
      align-content: center;
      padding: 0.4rem 0.8rem;
      font-weight: 600;
      font-size: 1.2rem
    }
  }

  .tab-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;

    button {
      padding: 0.5rem 1rem;
      border-radius: 4px;
      border: 2px solid #888;
      background-color: #f5f5f5;
      cursor: pointer;

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
  }
}
</style>
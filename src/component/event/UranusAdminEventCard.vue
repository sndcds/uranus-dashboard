<!-- src/component/event/UranusAdminEventCard.vue -->
<template>
  <UranusCard class="uranus-dashboard-event-card">
    <div class="uranus-dashboard-event-card-layout">

      <!-- Event Image -->
      <img
          v-if="event.imageUrl"
          class="uranus-dashboard-event-card-image"
          :src="event.imageUrl"
          :alt="event.title"
      />

      <!-- Event Info -->
      <div>
        <h3>{{ event.title }}</h3>
        <span>
          {{ uranusFormatEventDateTime(
            event.startDate,
            event.startTime,
            event.endDate,
            event.endTime,
            locale
        ) }}
        </span><br>
        <span>{{ t('event_organizer')}}: {{ event.organizationName }}</span><br>

        <span v-if="hasVenue">
          {{ t('venue')}}: {{ event.venueName }}
          <template v-if="hasSpace"> / {{ event.spaceName }}</template>
        </span>
      </div>

      <!-- Event Types -->
      <span class="uranus-dashboard-chip-wrapper">
        <span
            v-for="eventType in event.eventTypes ?? []"
            :key="eventType?.typeId ?? ''"
            class="uranus-dashboard-chip tiny"
        >
          {{ eventTypeGenreString(eventType) }}
        </span>
      </span>

      <!-- Actions -->
      <div class="uranus-dashboard-event-card-actions">
        <UranusDashboardButton
            v-if="event.canEditEvent"
            class="uranus-button tiny"
            icon="edit"
            :to="`/admin/event/${event.id}`"
        >
          {{ t('edit') }}
        </UranusDashboardButton>

        <UranusDashboardButton
            v-if="event.canDeleteEvent"
            class="uranus-button tiny"
            icon="delete"
            @click.prevent.stop="requestDelete(event)"
        >
          {{ t('delete') }}
        </UranusDashboardButton>
      </div>

    </div>

    <!-- Release / Series Status -->
    <div class="_status-box">
      <UranusEventReleaseChip :releaseStatus="event.releaseStatus ?? ''" :tiny="true"/>
      <span v-if="event.seriesTotal && event.seriesTotal > 1">
        {{ event.seriesIndex }} {{ t('one_of_n') }} {{ event.seriesTotal }}
      </span>
    </div>
  </UranusCard>

  <UranusPasswordConfirmModal
      :show="showDeleteModal"
      :title="t('delete_event')"
      :error="deleteError"
      :question="deleteQuestion"
      :options="seriesOptions"
      confirm-text="Delete"
      loading-text="Deleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
  />

</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { ApiError } from '@/api.ts'
import {
  uranusFormatEventDateTime
} from '@/util/UranusUtils.ts'

import type { UranusAdminListEvent } from '@/model/uranusAdminEventModel.ts'
import type { UranusEventTypePair } from '@/model/uranusEventModel.ts'
import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import UranusCard from "@/component/ui/UranusCard.vue";
import UranusEventReleaseChip from "@/component/event/UranusEventReleaseChip.vue";
import UranusDashboardButton from "@/component/dashboard/UranusDashboardButton.vue";
import { useEventTypeLookupStore } from "@/store/uranusEventTypeGenreLookup.ts";

const emit = defineEmits<{
  deleted: [payload: { eventId: number; dateId: number | null; deleteSeries: boolean }]
}>()

const props = defineProps<{ event: UranusAdminListEvent }>()

const { t, locale } = useI18n({ useScope: 'global' })
const typeLookupStore = useEventTypeLookupStore()

const eventTypeGenreString = (type: UranusEventTypePair) => {
  const name = typeLookupStore.getTypeGenreName(type.typeId, type.genreId ?? null, locale.value)
  return name || 'Unknown'
}

// Computed for presence checks
const hasVenue = computed(() => !!props.event.venueId)
const hasSpace = computed(() => !!props.event.spaceId)

// Delete modal state
const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)
const pendingDeleteId = ref<number | null>(null)
const pendingDeleteTitle = ref('')
const pendingTimeSeriesTotal = ref(1)
const pendingEventDateId = ref<number | null>(null)


const deleteQuestion = computed(() => {
  if ((props.event.seriesTotal ?? 1) > 1) {
    return t('delete_single_or_serie')
  }
  return t('confirm_delete_event')
})

const seriesOptions = computed(() => {
  if ((props.event.seriesTotal ?? 1) > 1) {
    return [
      { label: t('delete_time_series_option_single'), value: 'single' },
      { label: t('delete_time_series_option_series', { count: props.event.seriesTotal }) , value: 'series' },
    ]
  }
  return null
})

// Request deletion
const requestDelete = (event: UranusAdminListEvent) => {
  if (!event.canDeleteEvent) return
  pendingDeleteId.value = event.id
  pendingDeleteTitle.value = event.title
  pendingTimeSeriesTotal.value = event.seriesTotal ?? 1
  pendingEventDateId.value = event.dateId
  deleteError.value = ''
  showDeleteModal.value = true
}

// Cancel deletion
const cancelDelete = () => {
  showDeleteModal.value = false
  deleteError.value = ''
  pendingDeleteId.value = null
  pendingDeleteTitle.value = ''
  pendingTimeSeriesTotal.value = 1
  pendingEventDateId.value = null
}

const confirmDelete = async ({password, selectedOption}: {
  password: string
  selectedOption?: string | number
}) => {
  if (!password || !pendingDeleteId.value) return

  isDeleting.value = true
  deleteError.value = ''

  try {
    const deleteEntireSeries = selectedOption === 'series'

    const body: Record<string, unknown> = { password }
    if (deleteEntireSeries) body.delete_series = true

    let url: string
    if (deleteEntireSeries) {
      url = `/api/admin/delete/event/${pendingDeleteId.value}`
    } else if (pendingEventDateId.value !== null) {
      url = `/api/admin/delete/event/${pendingDeleteId.value}/date/${pendingEventDateId.value}`
    } else {
      url = `/api/admin/delete/event/${pendingDeleteId.value}`
    }

    const response = await apiFetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    // Success → emit deleted
    emit('deleted', {
      eventId: pendingDeleteId.value,
      dateId: pendingEventDateId.value,
      deleteSeries: deleteEntireSeries,
    })

    cancelDelete()
  } catch (err) {
    if (err instanceof ApiError) {
      // Show error from server
      console.error(err)
      deleteError.value = err.message || t('failed_to_delete_event')
    } else {
      console.error("unknown error", err)
      // Show fallback error
      deleteError.value = t('failed_to_delete_event')
    }
  } finally {
    isDeleting.value = false
  }
}
</script>

<style scoped lang="scss">
.uranus-dashboard-event-card {
  display: flex;
  flex-direction: column;
  position: relative;
  margin-top: auto;
  padding: 16px;
  padding-bottom: 48px;
  overflow: hidden;
}

.uranus-dashboard-event-card-layout {
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    font-size: 0.9em;
  }
}

.uranus-dashboard-event-card-image {
  display: block;
  width: 160px;
  aspect-ratio: 3 / 2;
  border-radius: var(--uranus-tiny-border-radius);
  object-fit: cover;
  margin-bottom: 8px;
}

.uranus-dashboard-event-card-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  gap: 4px;
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 8px;
}

._status-box {
  display: flex;
  flex-direction: column;
  position: absolute;
  top: 12px;
  right: 12px;
  align-items: center;
  gap: 8px;
}
</style>
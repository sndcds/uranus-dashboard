<!--
  src/component/event/card/UranusAdminEventCard.vue

  Dashboard card displaying basic event information.

  2026-02-05, Roald
-->

<template>
  <UranusCard class="uranus-dashboard-card">
    <div class="card-head">
      <div class="card-status">
        <UranusEventReleaseChip :releaseStatus="event.releaseStatus ?? ''" :tiny="true"/>
        <UranusEventCategoryDisplay v-if="event.categories" :categories="event.categories" />
        <span v-if="event.seriesTotal && event.seriesTotal > 1">
          {{ event.seriesIndex }} {{ t('one_of_n') }} {{ event.seriesTotal }}
        </span>
        <span v-else>1</span>
      </div>
      <h2 class="event-title">{{ event.title }}</h2>
    </div>

    <div class="uranus-event-card-layout">
      <div class="event-image-and-types">
        <img
            v-if="event.imageUrl"
            class="uranus-event-card-image"
            :src="event.imageUrl + '?width=160&ratio=16:9'"
            :alt="event.title"
            @error="onImageError"
        />

        <div class="uranus-dashboard-chip-wrapper">
          <span
              v-for="eventType in event.eventTypes ?? []"
              :key="eventType?.typeId ?? ''"
              class="uranus-dashboard-chip tiny"
          >
            {{ eventTypeGenreString(eventType) }}
          </span>
        </div>
      </div>

      <div>
        <span><strong>
          {{ uranusFormatEventDateTime(
            event.startDate,
            event.startTime,
            event.endDate,
            event.endTime,
            locale
        ) }}
        </strong></span><br>
        <span v-if="hasVenue">
          {{ t('venue')}}: {{ event.venueName }}
          <template v-if="hasSpace"> / {{ event.spaceName }}</template>
        </span><br>
        <span>{{ t('event_organizer')}}: {{ event.orgName }}</span>
      </div>

      <div class="uranus-event-card-actions">
        <UranusButton
            variant="secondary" size="small"
            :to="`/event/${event.uuid}/date/${event.dateUuid}`"
        >
          <template #icon><Eye /></template>
          {{ t('preview') }}
        </UranusButton>

        <UranusButton
            v-if="event.canEditEvent"
            variant="secondary" size="small"
            :to="`/admin/event/${event.uuid}`"
        >
          <template #icon><Pencil /></template>
          {{ t('edit') }}
        </UranusButton>

        <UranusButton
            v-if="event.canDeleteEvent"
            variant="secondary" size="small"
            @click.prevent.stop="requestDelete(event)"
        >
          <template #icon><Trash /></template>
          {{ t('delete') }}
        </UranusButton>
      </div>

    </div>

    <!-- Release / Series Status -->
    <div class="_status-box">

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
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { ApiError } from '@/api.ts'
import {uranusFormatEventDateTime } from '@/util/UranusUtils.ts'

import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import UranusCard from "@/component/ui/UranusCard.vue";
import UranusEventReleaseChip from '@/component/event/ui/UranusEventReleaseChip.vue'
import { useEventTypeLookupStore } from '@/store/uranusEventTypeGenreLookup.ts'
import type { AdminEventListItemModel } from '@/domain/event/adminEventListItem.model.ts'
import type { EventTypePairModel } from '@/domain/event/eventTypePair.model.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import { Eye, Pencil, Trash } from 'lucide-vue-next'
import UranusEventCategoryDisplay from "@/component/event/ui/UranusEventCategoryDisplay.vue";

const placeholderImage = '/assets/event-dummy.png'

const onImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = placeholderImage
}

const emit = defineEmits<{
  deleted: [payload: { eventUuid: string; dateUuid: string | null; deleteSeries: boolean }]
}>()

const props = defineProps<{ event: AdminEventListItemModel }>()

const { t, locale } = useI18n({ useScope: 'global' })
const typeLookupStore = useEventTypeLookupStore()

const eventTypeGenreString = (type: EventTypePairModel) => {
  const name = typeLookupStore.getTypeGenreName(type.typeId, type.genreId ?? null, locale.value)
  return name || 'Unknown'
}

// Computed for presence checks
const hasVenue = computed(() => !!props.event.venueUuid)
const hasSpace = computed(() => !!props.event.spaceUuid)

// Delete modal state
const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)
const pendingDeleteUuid = ref<string | null>(null)
const pendingDeleteTitle = ref('')
const pendingTimeSeriesTotal = ref(1)
const pendingEventDateUuid = ref<string | null>(null)


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
const requestDelete = (event: AdminEventListItemModel) => {
  if (!event.canDeleteEvent) return
  pendingDeleteUuid.value = event.uuid
  pendingDeleteTitle.value = event.title
  pendingTimeSeriesTotal.value = event.seriesTotal ?? 1
  pendingEventDateUuid.value = event.dateUuid
  deleteError.value = ''
  showDeleteModal.value = true
}

// Cancel deletion
const cancelDelete = () => {
  showDeleteModal.value = false
  deleteError.value = ''
  pendingDeleteUuid.value = null
  pendingDeleteTitle.value = ''
  pendingTimeSeriesTotal.value = 1
  pendingEventDateUuid.value = null
}

const confirmDelete = async ({password, selectedOption}: {
  password: string
  selectedOption?: string | number
}) => {
  if (!password || !pendingDeleteUuid.value) return

  isDeleting.value = true
  deleteError.value = ''

  try {
    const deleteEntireSeries = selectedOption === 'series'

    const body: Record<string, unknown> = { password }
    if (deleteEntireSeries) body.delete_series = true

    let url: string
    if (deleteEntireSeries) {
      url = `/api/admin/delete/event/${pendingDeleteUuid.value}`
    } else if (pendingEventDateUuid.value !== null) {
      url = `/api/admin/delete/event/${pendingDeleteUuid.value}/date/${pendingEventDateUuid.value}`
    } else {
      url = `/api/admin/delete/event/${pendingDeleteUuid.value}`
    }

    const response = await apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(body),
    })

    console.log(response) // TODO: Validate response

    // Success → emit deleted
    emit('deleted', {
      eventUuid: pendingDeleteUuid.value,
      dateUuid: pendingEventDateUuid.value,
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
<style>
.uranus-dashboard-card {
  padding: 0 !important;
  gap: 0 !important;
}
</style>

<style scoped lang="scss">
.uranus-event-card-layout {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  padding-bottom: 40px;
  gap: 6px;
  span {
    font-size: 1em;
  }
}

.uranus-event-card-image {
  display: block;
  width: 160px;
  aspect-ratio: 16 / 9;
  border-radius: var(--uranus-tiny-border-radius);
  object-fit: cover;
}

.uranus-event-card-actions {
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


.card-head {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  padding-bottom: 0;
}

.card-status {
  display: flex;
  justify-items: center;
  align-items: center;
  gap: 0.5rem;
  min-height:32px;
}

.card-status > :last-child {
  margin-left: auto;
}

.event-title {
  font-weight: 500;
}

.event-image-and-types {
  display: flex;
  align-items: start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.link {
  display: flex;
  align-items: center;
  margin-right: 1rem;
}

</style>
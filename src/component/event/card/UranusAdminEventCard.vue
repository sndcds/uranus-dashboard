<!--
  src/component/event/card/UranusAdminEventCard.vue

  Dashboard card displaying basic event information.
-->

<template>
  <UranusCard
      v-if="canPreviewEvent"
      class="uranus-dashboard-card"
      :class="event.releaseStatus ?? 'default'"
  >
    <div class="card-head">
      <UranusFeedback v-if="!event.seriesTotal" type="error">{{ t('event_without_date_message') }}</UranusFeedback>

      <div class="card-status">
        <UranusEventReleaseChip :releaseStatus="event.releaseStatus ?? ''" :tiny="true"/>
        <UranusEventCategoryDisplay v-if="event.categories" :categories="event.categories" />
        <span v-if="grouped">
          {{ uranusPluralizedText(t, 'count_event_date', 'count_event_dates', event.seriesTotal ?? 1) }}
        </span>
        <span v-else-if="event.seriesTotal && event.seriesTotal > 1">
          {{ event.seriesIndex }} {{ eventSeriesLabel(event) }} {{ event.seriesTotal }}
        </span>
        <span v-else></span>
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
        <div class="icon-and-info">
          <Calendar class="small-icon"/>
            {{ uranusFormatEventDateTime(
              event.startDate,
              event.startTime,
              event.endDate,
              event.endTime,
              locale
          ) }}
        </div>
        <div v-if="event.isOnlineEvent" class="icon-and-info">
          <Video class="small-icon"/> {{ t('online_event')}}
        </div>
        <div v-if="hasVenue" class="icon-and-info">
          <MapPin class="small-icon"/> {{ event.venueName }}
          <template v-if="hasSpace"> / {{ event.spaceName }}</template>
        </div>
        <div v-if="hasVenue" class="icon-and-info">
          <Building class="small-icon"/> {{ event.orgName }}
        </div>
      </div>

      <div class="uranus-event-card-actions">
        <UranusButton
            v-if="canPreviewEvent"
            variant="secondary"
            size="small"
            :to="`/event/${event.uuid}/date/${event.dateUuid}/preview`"
            target="_blank"
        >
          <template #icon><Eye /></template>
          {{ t('preview') }}
        </UranusButton>

        <UranusButton
            v-if="event.canEditEvent"
            variant="secondary"
            size="small"
            :to="`/admin/event/${event.uuid}`"
        >
          <template #icon><Pencil /></template>
          {{ t('edit') }}
        </UranusButton>

        <UranusButton
            v-if="event.canDeleteEvent"
            variant="secondary"
            size="small"
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
import {uranusFormatEventDateTime } from '@/util/util.ts'

import UranusPasswordConfirmModal from '@/component/uranus/UranusPasswordConfirmModal.vue'
import UranusCard from "@/component/ui/UranusCard.vue";
import UranusEventReleaseChip from '@/component/event/ui/UranusEventReleaseChip.vue'
import { useEventTypeLookupStore } from '@/store/eventTypeGenreLookupStore.ts'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem.ts'
import type { EventTypePairModel } from '@/domain/event/eventTypePair.model.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import { Eye, Pencil, Trash, Calendar, MapPin, Building, Video } from 'lucide-vue-next'
import UranusEventCategoryDisplay from '@/component/event/ui/UranusEventCategoryDisplay.vue'
import { uranusPluralizedText, uranusStringInterpolate } from '@/util/string.ts'
import { apiErrorI18nKey } from '@/util/apiError.ts'
import UranusFeedback from "@/component/uranus/UranusFeedback.vue";

const placeholderImage = '/assets/event-dummy.png'

const onImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = placeholderImage
}

const emit = defineEmits<{
  deleted: [payload: { eventUuid: string; dateUuid: string | null; deleteSeries: boolean }]
}>()

const props = withDefaults(defineProps<{
  event: AdminEventListItem
  grouped?: boolean
}>(), {
  grouped: false,
})

const { t, locale } = useI18n({ useScope: 'global' })
const typeLookupStore = useEventTypeLookupStore()

const eventTypeGenreString = (type: EventTypePairModel) => {
  const name = typeLookupStore.getTypeGenreName(type.typeId, type.genreId ?? null, locale.value)
  return name || 'Unknown'
}

const eventSeriesLabel = (event: AdminEventListItem) =>
    uranusStringInterpolate(t('one_of_n'), {
      seriesIndex: event.seriesIndex,
      seriesTotal: event.seriesTotal
    })

// Computed for presence checks
const hasVenue = computed(() => !!props.event.venueUuid)
const hasSpace = computed(() => !!props.event.spaceUuid)


const canPreviewEvent = computed(() => {
  const event = props.event
  if (event.canViewEventInsights || event.canEditEvent || event.canDeleteEvent) return true
  else if (event.releaseStatus == 'draft' || event.releaseStatus == 'review') return false
  return true
})


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
    return t('delete_event_single_or_serie')
  }
  return t('confirm_delete_event')
})

const seriesOptions = computed(() => {
  if ((props.event.seriesTotal ?? 1) > 1) {
    return [
      {
        label: t('delete_event_occurrence'),
        value: 'single'
      },
      {
        label: uranusStringInterpolate(
            t('delete_event_series'),
            { count: props.event.seriesTotal }
        ),
        value: 'series'
      }
    ]
  }
  return null
})

// Request deletion
const requestDelete = (event: AdminEventListItem) => {
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
  if (!props.event.seriesTotal || !password || !pendingDeleteUuid.value) return

  isDeleting.value = true
  deleteError.value = ''

  try {
    const deleteEntireSeries = selectedOption === 'series'

    const body: Record<string, unknown> = { password }
    if (deleteEntireSeries) body.delete_series = true

    let apiPath = `/api/admin/event/${pendingDeleteUuid.value}`
    if (!deleteEntireSeries && pendingEventDateUuid.value !== null && props.event.seriesTotal > 1) {
      apiPath = `/api/admin/event/${pendingDeleteUuid.value}/date/${pendingEventDateUuid.value}`
    }

    const apiResponse = await apiFetch(apiPath, {
      method: 'DELETE',
      body: JSON.stringify(body),
    })

    // Success → emit deleted
    emit('deleted', {
      eventUuid: pendingDeleteUuid.value,
      dateUuid: pendingEventDateUuid.value,
      deleteSeries: deleteEntireSeries,
    })

    cancelDelete()
  } catch (err) {
    if (err instanceof ApiError) {
      deleteError.value = t(apiErrorI18nKey(err.status, 'failed_to_delete_event'))
    } else {
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

.icon-and-info {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.small-icon {
  width: 20px;
  height: 20px;
  color: var(--uranus-color-3)
}

</style>

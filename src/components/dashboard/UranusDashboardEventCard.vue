<!--
  UranusDashboardEventCard.vue
-->
<template>
  <UranusCard class="uranus-dashboard-event-card">
    <router-link v-if="props.event.canEditEvent" :to="`/admin/event/${props.event.eventId}`">
      <div class="uranus-dashboard-event-card-layout">
        <img
            class="uranus-dashboard-event-card-image"
            v-if="props.event.imageIds[0]"
            :src="buildPlutoPreviewImageUrl(props.event.imageIds[0])"
            :alt="props.event.title" />

        <div>
          <h3>{{ props.event.title }}</h3>
          <span>{{ uranusFormatEventDateTime(props.event.startDate, props.event.startTime, props.event.endDate, props.event.endTime, locale) }} </span><br>
          <span>{{ props.event.organizationName }}</span><br>
          <span v-if="hasVenue">{{ props.event.venueName }}
            <template v-if="hasSpace">
              / {{ props.event.spaceName }}
            </template>
          </span>
          <span v-else-if="hasLocation">
            {{ props.event.locationName }}
          </span>
        </div>

        <span class="uranus-dashboard-chip-wrapper">
          <span
              class="uranus-dashboard-chip tiny"
              v-for="eventType in props.event.eventTypes ?? []"
              :key="eventType?.typeId ?? ''"
          >
            {{ uranusEventTypeGenreString(eventType) }}
          </span>
        </span>

        <div class="uranus-dashboard-event-card-actions">
          <UranusButton
              v-if="props.event.canDeleteEvent"
              class="uranus-tertiary-button"
              icon="delete"
              @click.prevent.stop="requestDelete(props.event)"
          >
            {{ t('delete') }}
          </UranusButton>
        </div>
      </div>
      <!--UranusEventReleaseChip :releaseDisplay="props.event.releaseStatusName" size="big" /-->
      <div class="_status-box">
        <UranusEventReleaseChip :releaseStatusId="props.event.releaseStatusId" :tiny="true"/>
        <span v-if="props.event.timeSeries > 1">
          {{ props.event.timeSeriesIndex }} {{ t('one_of_n') }} {{ props.event.timeSeries }}
        </span>
      </div>
    </router-link>
  </UranusCard>

  <PasswordConfirmModal
      :show="showDeleteModal"
      :title="t('confirm_delete_event')"
      :description="pendingDeleteTitle"
      :confirm-text="t('delete_event')"
      :loading-text="t('deleting')"
      :error="deleteError"
      :is-submitting="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
      :time-series="pendingTimeSeriesCount" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import {
  buildPlutoPreviewImageUrl,
  uranusEventTypeGenreString,
  uranusFormatEventDateTime
} from '@/utils/UranusUtils.ts'

import { type UranusEventBase } from '@/models/UranusEventModel.ts'
import PasswordConfirmModal from '@/components/PasswordConfirmModal.vue'
import UranusCard from "@/components/ui/UranusCard.vue";
import UranusEventReleaseChip from "@/components/ui/UranusEventReleaseChip.vue";
import UranusIconAction from "@/components/ui/UranusIconAction.vue";
import UranusButton from "@/components/ui/UranusButton.vue";

const emit = defineEmits<{
  deleted: [payload: { eventId: number; eventDateId: number | null; deleteSeries: boolean }]
}>()

interface PasswordConfirmPayload {
  password: string
  deleteSeries?: boolean
}

const { t, locale } = useI18n({ useScope: 'global' })

const props = defineProps<{ event: UranusEventBase }>()
const error = ref<string | null>(null)
const isLoading = ref(false)
error.value = t('events_loading')

const showDeleteModal = ref(false)
const deleteError = ref('')
const isDeleting = ref(false)
const pendingDeleteId = ref<number | null>(null)
const pendingDeleteTitle = ref('')
const pendingTimeSeriesCount = ref(1)
const pendingEventDateId = ref<number | null>(null)

const hasVenue = computed(() => props.event.venueId)
const hasSpace = computed(() => props.event.spaceId)
const hasLocation = computed(() => props.event.locationId)

const requestDelete = (event: UranusEventBase) => {
  if (!event.canDeleteEvent) {
    return
  }
  pendingDeleteId.value = event.eventId
  pendingDeleteTitle.value = event.title
  pendingTimeSeriesCount.value = event.timeSeries ?? 1
  pendingEventDateId.value = event.eventDateId
  deleteError.value = ''
  showDeleteModal.value = true
}

const cancelDelete = () => {
  showDeleteModal.value = false
  deleteError.value = ''
  pendingDeleteId.value = null
  pendingDeleteTitle.value = ''
  pendingTimeSeriesCount.value = 1
  pendingEventDateId.value = null
}

const confirmDelete = async ({ password, deleteSeries }: PasswordConfirmPayload) => {
  if (!pendingDeleteId.value) {
    return
  }

  deleteError.value = ''
  isDeleting.value = true

  try {
    const body: Record<string, unknown> = { password }
    const deleteEntireSeries = Boolean(deleteSeries)
    if (deleteEntireSeries) {
      body.delete_series = true
    }
    let url: string
    if (deleteEntireSeries) {
      url = `/api/admin/event/${pendingDeleteId.value}`
    } else if (pendingEventDateId.value !== null) {
      url = `/api/admin/event/${pendingDeleteId.value}/date/${pendingEventDateId.value}`
    } else {
      url = `/api/admin/event/${pendingDeleteId.value}`
    }
    await apiFetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    emit('deleted', {
      eventId: pendingDeleteId.value,
      eventDateId: pendingEventDateId.value,
      deleteSeries: deleteEntireSeries,
    })
    cancelDelete()
  } catch (err: unknown) {
    console.error('Failed to delete event:', err)
    const status = typeof err === 'object' && err !== null ? (err as { status?: number }).status : undefined
    if (status === 401 || status === 403) {
      deleteError.value = t('incorrect_password')
    } else {
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
  padding-bottom: 40px;
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
  margin-top: 10px;
  gap: 12px;
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

.release-status-chip {
  top: 0.75rem;
  right: 0.75rem;
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: var(--uranus-surface-muted);
  color: var(--color-text);
  font-weight: 600;
  font-size: 0.75rem;
  letter-spacing: 0.02em;
  // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;

  &--red {
    background: #fee2e2;
    color: #991b1b;
  }

  &--orange {
    background: #ffedd5;
    color: #9a3412;
  }

  &--green {
    background: #dcfce7;
    color: #166534;
  }

  &--blue {
    background: #dbeafe;
    color: #1e40af;
  }

  &--pink {
    background: #fce7f3;
    color: #9d174d;
  }
}

</style>

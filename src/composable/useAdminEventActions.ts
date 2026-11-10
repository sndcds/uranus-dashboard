import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ApiError, apiFetch } from '@/api'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem'
import { apiErrorI18nKey } from '@/util/apiError'

export function useAdminEventActions(
  event: () => AdminEventListItem,
  onDeleted: (payload: { eventUuid: string; dateUuid: string | null; deleteSeries: boolean }) => void,
) {
  const { t } = useI18n({ useScope: 'global' })
  const canPreviewEvent = computed(() => {
    const current = event()
    return current.canViewEventInsights || current.canEditEvent || current.canDeleteEvent
      || (current.releaseStatus !== 'draft' && current.releaseStatus !== 'review')
  })
  const showDeleteModal = ref(false)
  const deleteError = ref('')
  const isDeleting = ref(false)
  const pendingEvent = ref<{ uuid: string; dateUuid: string | null; seriesTotal: number } | null>(null)
  const deleteQuestion = computed(() => t((event().seriesTotal ?? 1) > 1
    ? 'delete_event_single_or_serie' : 'confirm_delete_event'))
  const seriesOptions = computed(() => (event().seriesTotal ?? 1) > 1 ? [
    { label: t('delete_event_occurrence'), value: 'single' },
    { label: t('delete_event_series', { count: event().seriesTotal ?? 1 }), value: 'series' },
  ] : null)

  function requestDelete() {
    const current = event()
    if (!current.canDeleteEvent) return
    pendingEvent.value = { uuid: current.uuid, dateUuid: current.dateUuid, seriesTotal: current.seriesTotal ?? 1 }
    deleteError.value = ''
    showDeleteModal.value = true
  }

  function cancelDelete() {
    showDeleteModal.value = false
    deleteError.value = ''
    pendingEvent.value = null
  }

  async function confirmDelete({ password, selectedOption }: { password: string; selectedOption?: string | number }) {
    const pending = pendingEvent.value
    if (!password || !pending || isDeleting.value) return
    isDeleting.value = true
    deleteError.value = ''
    try {
      const deleteSeries = selectedOption === 'series'
      const body: Record<string, unknown> = { password }
      if (deleteSeries) body.delete_series = true
      const path = `/api/admin/event/${pending.uuid}`
        + (pending.seriesTotal > 1 && !deleteSeries && pending.dateUuid !== null ? `/date/${pending.dateUuid}` : '')
      await apiFetch(path, { method: 'DELETE', body: JSON.stringify(body) })
      onDeleted({ eventUuid: pending.uuid, dateUuid: pending.dateUuid, deleteSeries })
      cancelDelete()
    } catch (error) {
      deleteError.value = t(error instanceof ApiError
        ? apiErrorI18nKey(error.status, 'failed_to_delete_event') : 'failed_to_delete_event')
    } finally {
      isDeleting.value = false
    }
  }

  return { canPreviewEvent, showDeleteModal, deleteError, isDeleting, deleteQuestion, seriesOptions, requestDelete, cancelDelete, confirmDelete }
}

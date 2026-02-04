<!--
  UranusEditEventRelease.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('event_release_date')"
        :edit-button-text="t('edit')"
        @edit-started="startEdit"
    />

    <UranusInlineSectionLayout v-if="isEditing">

      <UranusEventReleaseSelect v-model="draft.releaseStatus" />

      <UranusDateInput
          id="release-date"
          v-model="draft.releaseDate"
          :label="t('event_release_date')"
      />

      <UranusInlineEditActions
          :isSaving="isSaving"
          :canSave="canSave"
          @save="save"
          @cancel="cancelEdit"
      />

    </UranusInlineSectionLayout>
    <template v-else>
      <UranusEventReleaseChip :releaseStatus="draft.releaseStatus" />
      <span v-if="draft.releaseDate">
        {{ t('event_release_date') }}: {{ dateString }}
      </span>
      <span v-else>
        <span class="uranus-not-set-info">{{ t('event_no_release_date') }}</span>
      </span>
    </template>

  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import UranusInlineEditSection from "@/component/ui/UranusInlineEditSection.vue"
import UranusInlineEditLabel from "@/component/ui/UranusInlineEditLabel.vue"
import UranusEventReleaseChip from "@/component/event/UranusEventReleaseChip.vue"
import type { UranusEventDetail } from "@/model/uranusEventModel.ts"
import UranusInlineActionBar from "@/component/ui/UranusInlineActionBar.vue";
import UranusInlineEditActions from "@/component/ui/UranusInlineEditActions.vue";
import {uranusFormatFullDate, uranusFormatSimpleDate} from "@/util/UranusStringUtils.ts";
import UranusDateInput from "@/component/ui/UranusDateInput.vue";
import UranusEventReleaseSelect from "@/component/event/UranusEventReleaseSelect.vue";
import UranusInlineSectionLayout from "@/component/ui/UranusInlineSectionLayout.vue";

interface Release {
  id: number
  name: string
  description?: string
  date?: string
}

// Inject parent event
const event = inject<{ value: UranusEventDetail | null }>('event')
if (!event) throw new Error("UranusEditEventRelease requires 'event' injection")

const { t } = useI18n({ useScope: 'global' })
const { locale } = useI18n({ useScope: 'global' })

const availableReleases = ref<Release[]>([])
const isLoading = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const canSave = ref(true)
const releaseError = ref<string | null>(null)

// Local draft state
const draft = reactive({
  releaseStatus: null as number | null,
  releaseDate: null as string | null
})

const dateString = computed(() => {
  return uranusFormatFullDate(draft.releaseDate ?? '', locale.value)
})

const initDraft = () => {
  if (!event?.value) return
  draft.releaseStatus = event.value.releaseStatus ?? null
  draft.releaseDate = event.value.releaseDate ?? null
}

const startEdit = async () => {
  if (!event?.value) return
  initDraft()
  isEditing.value = true
}

const cancelEdit = () => {
  if (!event?.value) return
  initDraft()
  isEditing.value = false
}

const save = async () => {
  if (!event?.value) return
  isSaving.value = true

  try {
    await apiFetch(`/api/admin/event/${event.value.eventId}/release-status`, {
      method: 'PUT',
      body: JSON.stringify({
        release_status: draft.releaseStatus,
        release_date: draft.releaseDate || null,
      }),
    })

    // Disable edit mode and update the reactive event directly
    isEditing.value = false
    event.value.releaseStatus = draft.releaseStatus
    event.value.releaseDate = draft.releaseDate || null

  } catch (err) {
    console.error('Failed to update header', err)
  } finally {
    isSaving.value = false
  }

  isEditing.value = false
}

onMounted(() => {
  initDraft()
})


</script>

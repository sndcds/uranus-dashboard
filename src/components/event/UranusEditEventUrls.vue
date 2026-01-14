<template>
  <UranusInlineEditSection>
    <!-- Only show URLs that have an id -->
    <template
        v-for="(url, index) in (event?.eventUrls ?? []).filter(u => u.id !== null)"
        :key="url.id ?? index">
      <UranusEditEventUrlDisplay
          :url="url"
          :can-edit="true"
          @edit="() => onOpenModal(url, index)"
          @remove="() => onRemoveUrl(index)"
      />
    </template>

    <div style="margin-top: 8px;">
      <button class="uranus-inline-edit-button" @click="onAddEventUrl">
        {{ t('event_add_url') }}
      </button>
    </div>
  </UranusInlineEditSection>

  <!-- Modal -->
  <UranusModal
      :show="editingUrl !== null"
      :title="t('event_edit_url_title')"
      :close-on-backdrop="false"
      @close="onCancelEdit">
    <div class="uranus-form" v-if="editingUrl">
      <UranusFormRow>
        <UranusTextInput
            id="url-input"
            v-model="editingUrl.url!"
            :label="t('event_url')"
            placeholder="https://example.com"
            required
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextInput
            id="url-title-input"
            v-model="editingUrl.title!"
            :label="t('event_url_title')"
            placeholder="Link title"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusEventLinkTypeSelect
            id="event-url-type"
            v-model="editingUrl.urlType" />
      </UranusFormRow>

      <UranusInlineEditActions
          :isSaving="isSaving"
          :canSave="canSave"
          @save="onSaveModal"
          @cancel="onCancelEdit"
      />
    </div>
  </UranusModal>
</template>

<script setup lang="ts">
import { ref, inject, computed, nextTick, reactive, type Ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import type { UranusEventDetail } from '@/models/UranusEventModel.ts'
import { UranusEventUrl } from '@/models/UranusEventModel.ts'

import UranusEditEventUrlDisplay from '@/components/event/UranusEditEventUrlDisplay.vue'
import UranusModal from '@/components/uranus/UranusModal.vue'
import UranusFormRow from '@/components/ui/UranusFormRow.vue'
import UranusTextInput from '@/components/ui/UranusTextInput.vue'
import UranusInlineEditActions from '@/components/ui/UranusInlineEditActions.vue'
import UranusInlineEditSection from '@/components/ui/UranusInlineEditSection.vue'
import UranusEventLinkTypeSelect from "@/components/selects/UranusEventLinkTypeSelect.vue";

// i18n
const { t } = useI18n({ useScope: 'global' })

// Inject the event object
const event = inject<Ref<UranusEventDetail | null>>('event')

// Modal / editing state
const editingUrl = ref<UranusEventUrl | null>(null)
const editingIndex = ref<number | null>(null)
const isSaving = ref(false)
const canSave = computed(() => !isSaving.value)

/**
 * Open modal for editing a URL
 */
function onOpenModal(url: UranusEventUrl, index: number) {
  editingUrl.value = reactive({
    id: url.id,
    url: url.url ?? '',
    title: url.title ?? '',
    urlType: url.urlType ?? 0, // <-- Zahl erzwingen, nicht String
  })
  editingIndex.value = index
}

/**
 * Cancel modal edit
 */
function onCancelEdit() {
  editingUrl.value = null
  editingIndex.value = null
}

/**
 * Add a new URL (hidden in list until saved)
 */
function onAddEventUrl() {
  const evt = event?.value
  if (!evt) return

  const newUrl = new UranusEventUrl(null, '', '', 0) // urlType = 0 als Zahl
  editingIndex.value = null

  nextTick(() => {
    onOpenModal(newUrl, -1)
  })
}

/**
 * Remove a URL
 */
function onRemoveUrl(index: number) {
  event?.value?.eventUrls.splice(index, 1)
}

/**
 * Save modal (both new and existing URLs)
 */
async function onSaveModal() {
  if (!editingUrl.value || !event?.value) return
  isSaving.value = true

  try {
    const payload = {
      url: editingUrl.value.url,
      title: editingUrl.value.title,
      url_type: Number(editingUrl.value.urlType ?? 0),
    }

    const response = await apiFetch(
        `/api/admin/event/${event.value.eventId}/link${editingUrl.value.id ? '/' + editingUrl.value.id : ''}`,
        { method: 'PUT', body: JSON.stringify(payload) }
    )

    const data = (response.data as any) ?? {}
    const savedId = data.url_id ?? editingUrl.value.id

    if (editingUrl.value.id === null) {
      // New URL: replace the placeholder in array with actual saved URL
      const placeholderIndex = event.value.eventUrls.findIndex(u => u === editingUrl.value)
      if (placeholderIndex !== -1) {
        event.value.eventUrls[placeholderIndex] = {
          id: savedId,
          url: editingUrl.value.url,
          title: editingUrl.value.title,
          urlType: editingUrl.value.urlType,
        }
      } else {
        // fallback
        event.value.eventUrls.push({
          id: savedId,
          url: editingUrl.value.url,
          title: editingUrl.value.title,
          urlType: editingUrl.value.urlType,
        })
      }
    } else if (editingIndex.value !== null) {
      // Existing URL: update in-place
      event.value.eventUrls[editingIndex.value] = {
        id: savedId,
        url: editingUrl.value.url,
        title: editingUrl.value.title,
        urlType: editingUrl.value.urlType,
      }
    }

    if (editingIndex.value === null) {
      // New URL: push to eventUrls after saving
      event.value.eventUrls.push({
        id: savedId,
        url: editingUrl.value.url,
        title: editingUrl.value.title,
        urlType: editingUrl.value.urlType,
      })
    }

    onCancelEdit()
  } finally {
    isSaving.value = false
  }
}
</script>
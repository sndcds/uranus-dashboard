<!--
  UranusEditEventLinks.vue
-->
<template>
  <UranusInlineEditSection :active="isEditing">
    <UranusInlineEditLabel
        :label-text="t('event_links')"
        :edit-button-text="t('edit')"
        @edit-started="startEdit"
    />

    <!-- Edit form -->
    <UranusInlineSectionLayout v-if="isEditing">
      <!-- Add/Edit new link -->
      <UranusFormRow>
        <UranusEventLinkTypeSelect v-model="newLink.urlType" flex="1" />
        <UranusTextInput
            v-model="newLink.title"
            flex="3"
            id="link-title"
            :label="t('event_link_title')"
            :placeholder="t('event_link_title_placeholder')"
        />
      </UranusFormRow>
      <UranusTextInput
          style="margin-bottom: var(--uranus-grid-gap)"
          v-model="newLink.url"
          id="link-url"
          type="url"
          :label="t('event_link_url')"
          :placeholder="t('event_link_url_placeholder')"
          required
      />

      <div style="margin-bottom: var(--uranus-grid-gap)">
        <button
            v-if="isEditingExistingLink"
            type="button"
            class="uranus-secondary-button"
            @click="cancelEdit"
        >
          {{ t('event_link_cancel_edit') }}
        </button>
        <button
            type="button"
            class="uranus-secondary-button"
            :disabled="!canAddLink"
            @click="addLink"
        >
          {{ addButtonText }}
        </button>
      </div>

      <p v-if="error" class="uranus-text-error">{{ error }}</p>
    </UranusInlineSectionLayout>

    <!-- List of links -->
    <div class="_links_view" v-if="(isEditing ? draftLinks : event?.eventUrls)?.length">
      <div
          v-for="(link, index) in isEditing ? draftLinks : event?.eventUrls"
          :key="index"
      >
        <div>
          <span><strong>{{ link.title || getUrlTypeLabel(link.urlType) }}: </strong></span>
          <a :href="link.url" target="_blank" rel="noopener noreferrer" class="uranus-link">
            {{ link.url }}
          </a>

          <!-- Only show edit/remove buttons in edit mode -->
          <button
              v-if="isEditing"
              type="button"
              class="uranus-secondary-button"
              :disabled="isEditingExistingLink"
              @click="startEditLink(index)"
          >
            {{ t('event_link_edit') }}
          </button>

          <button
              v-if="isEditing"
              type="button"
              class="uranus-secondary-button"
              @click="removeLink(index)"
          >
            {{ t('event_link_remove') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Save/Cancel actions -->
    <UranusInlineEditActions
        v-if="isEditing"
        :isSaving="isSaving"
        :canSave="canSave"
        @save="save"
        @cancel="cancelEditAll"
    />
  </UranusInlineEditSection>
</template>

<script setup lang="ts">
import { ref, reactive, computed, inject, type Ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import type { UranusEventDetail, UranusEventUrl } from '@/models/UranusEventModel'

import UranusInlineEditSection from '@/components/ui/UranusInlineEditSection.vue'
import UranusInlineEditLabel from '@/components/ui/UranusInlineEditLabel.vue'
import UranusInlineEditActions from '@/components/ui/UranusInlineEditActions.vue'
import UranusInlineSectionLayout from '@/components/ui/UranusInlineSectionLayout.vue'
import UranusTextInput from '@/components/ui/UranusTextInput.vue'
import UranusEventLinkTypeSelect from "@/components/selects/UranusEventLinkTypeSelect.vue"
import UranusFormRow from "@/components/ui/UranusFormRow.vue"

const { t, locale } = useI18n({ useScope: 'global' })
const event = inject<Ref<UranusEventDetail | null>>('event')

const isEditing = ref(false)
const isSaving = ref(false)
const error = ref('')

interface DraftEventUrl {
  id?: number | null
  title: string
  url: string
  urlType: string
}

const draftLinks = ref<DraftEventUrl[]>([])
const newLink = reactive<DraftEventUrl>({ id: null, url: '', title: '', urlType: '' })
const editingIndex = ref<number | null>(null)
const urlTypeOptions = ref<Array<{ value: string; label: string }>>([])

const canAddLink = computed(() => newLink.url.trim().length > 0)
const isEditingExistingLink = computed(() => editingIndex.value !== null)
const addButtonText = computed(() => isEditingExistingLink.value ? t('event_link_update') : t('event_link_add'))
const canSave = computed(() => !isSaving.value && draftLinks.value.length > 0)

function getUrlTypeLabel(urlType: string | null) {
  return urlTypeOptions.value.find(o => o.value === urlType)?.label ?? urlType
}

function startEdit() {
  draftLinks.value = event?.value?.eventUrls?.map(l => ({ ...l })) ?? []
  cancelEdit()
  isEditing.value = true
}

function cancelEditAll() {
  cancelEdit()
  draftLinks.value = []
  isEditing.value = false
  error.value = ''
}

function startEditLink(index: number) {
  const link = draftLinks.value[index]
  if (!link) return
  Object.assign(newLink, link)
  editingIndex.value = index
}

function cancelEdit() {
  newLink.url = ''
  newLink.title = ''
  newLink.urlType = ''
  editingIndex.value = null
}

function addLink() {
  if (!canAddLink.value) return
  const linkCopy: DraftEventUrl = { ...newLink }
  if (editingIndex.value !== null) draftLinks.value.splice(editingIndex.value, 1, linkCopy)
  else draftLinks.value.push(linkCopy)
  cancelEdit()
}

function removeLink(index: number) {
  draftLinks.value.splice(index, 1)
  if (editingIndex.value !== null) {
    if (editingIndex.value === index) cancelEdit()
    else if (editingIndex.value > index) editingIndex.value -= 1
  }
}

async function save() {
  if (!event?.value) return
  isSaving.value = true
  error.value = ''
  try {
    await apiFetch(`/api/admin/event/${event.value.eventId}/links`, {
      method: 'PUT',
      body: JSON.stringify({ links: draftLinks.value }),
    })
    event.value.eventUrls = draftLinks.value.map(l => ({ ...l }))
    isEditing.value = false
  } catch (err) {
    console.error(err)
    error.value = t('event_links_save_error')
  } finally {
    isSaving.value = false
  }
}

onMounted(async () => {
  try {
    const { data } = await apiFetch(`/api/choosable-url-types/event?lang=${locale.value}`)
    urlTypeOptions.value = (Array.isArray(data) ? data : []).map(item => ({ value: item.id, label: item.name }))
  } catch {
    urlTypeOptions.value = []
  }
})
</script>

<style scoped>
._links_view {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
</style>
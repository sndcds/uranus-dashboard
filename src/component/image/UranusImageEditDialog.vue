<!--
  src/component/image/UranusImageEditDialog.vue
-->

<template>
  <!-- Modal overlay -->
  <div class="uranus-modal-backdrop uranus-form">
    <UranusCard class="uranus-modal-card">
      <!-- Title -->
      <h2>{{ title }}</h2>
      <!-- Image preview -->
      <div class="uranus-image-preview" @click="onImageClick($event)">
        <img
            v-if="localImageMeta.url"
            :src="localImageMeta.url"
            class="uranus-preview-img"
            :style="{ objectFit: previewFitMode }"
        />
        <div v-else class="uranus-no-img">{{ t('click_to_upload') }}</div>
        <input
            ref="fileInput"
            type="file"
            accept="image/*"
            class="uranus-hidden-file"
            @change="onFileSelected"
        />
        <div v-if="localImageMeta.focusX !== null && localImageMeta.focusY !== null"
             class="focus-point"
             :style="{ left: `${localImageMeta.focusX * 100}%`, top: `${localImageMeta.focusY * 100}%`}">
        </div>
      </div>


      <!-- Metadata fields -->
      <UranusFormRow>
        <UranusTextInput
            id="alt-text"
            v-model="localImageMeta.alt as string | undefined"
            :label="t('image_alt_text')"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextInput
            id="creator-name"
            v-model="localImageMeta.creator as string | undefined"
            :label="t('image_creator_name')"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextInput
            id="copyright"
            v-model="localImageMeta.copyright as string | undefined"
            :label="t('image_copyright')"
        />

        <UranusLicenseSelect
            id="license-select"
            v-model:license="localImageMeta.license"
            :label="t('image_license')"
        />

        <UranusTextInput
            id="focus-x"
            v-model.number="localImageMeta.focusX as number | undefined"
            :label="t('image_focus_x')"
        />

        <UranusTextInput
            id="focus-y"
            v-model.number="localImageMeta.focusY as number | undefined"
            :label="t('image_focus_y')"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextarea
            id="description"
            v-model:model-value="descriptionValue"
            :label="t('image_description')"
        />
      </UranusFormRow>

      <!-- Actions -->
      <UranusInlineActionBar style="margin-top:12px;">
        <UranusInlineCancelButton
            :label="t('cancel')"
            :onClick="onCancel"
        />

        <UranusInlineSaveButton
            :label="t('save')"
            :onClick="onSave"
        />
      </UranusInlineActionBar>
    </UranusCard>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PlutoImageMeta } from '@/model/plutoImageModel.ts'
import { apiFetch, ApiError } from '@/api.ts'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusTextInput from '@/component/ui/UranusTextInput.vue'
import UranusFormRow from "@/component/ui/UranusFormRow.vue";
import { buildPlutoEditImageUrl } from "@/util/UranusUtils.ts";
import UranusInlineSaveButton from "@/component/ui/UranusInlineSaveButton.vue";
import UranusInlineCancelButton from "@/component/ui/UranusInlineCancelButton.vue";
import UranusInlineActionBar from "@/component/ui/UranusInlineActionBar.vue";
import UranusTextarea from "@/component/ui/UranusTextarea.vue";
import UranusLicenseSelect from "@/component/selects/UranusLicenseSelect.vue";

const props = defineProps<{
  addModeTitle?: string | null
  editModeTitle?: string | null
  context: string                 // "event", "venue"
  contextId: number               // DB id
  identifier: string              // "main", "gallery1"
  fitMode?: 'cover' | 'contain'
}>()


const title = computed(() => {
  const used_title = localImageMeta.url ? props.editModeTitle : props.addModeTitle
  return used_title != null ? used_title : t('edit_image')
})

const descriptionValue = computed({
  get: () => localImageMeta.description ?? undefined,
  set: (val: string | undefined) => {
    localImageMeta.description = val ?? null
  }
})

const apiUrl = computed(() => {
  return `/api/image/meta/${props.context}/${props.contextId}/${props.identifier}`
})

const previewFitMode = computed(() => props.fitMode ?? 'contain')

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', imageMeta: PlutoImageMeta, file: File | null, ctx: {
    context: string
    contextId: number
    identifier: string
  }): void
}>()

const { t } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)
const localImageMeta = reactive(new PlutoImageMeta())
const localImageFile = ref<File | null>(null)


function clearLocalImageMeta() {
  localImageMeta.id = null
  localImageMeta.url = null
  localImageMeta.alt = null
  localImageMeta.description = null
  localImageMeta.copyright = null
  localImageMeta.creator = null
  localImageMeta.license = null
  localImageMeta.focusX = null
  localImageMeta.focusY = null
}

function triggerFileSelect() {
  fileInput.value?.click()
}

function onImageClick(e: MouseEvent) {
  if (e.metaKey) {
    // Command+click → set focus point
    const img = e.currentTarget as HTMLDivElement
    const rect = img.getBoundingClientRect()

    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    localImageMeta.focusX = Math.min(Math.max(x, 0), 1)
    localImageMeta.focusY = Math.min(Math.max(y, 0), 1)
    console.log('Focus point set:', localImageMeta.focusX, localImageMeta.focusY)
  } else {
    // Normal click → trigger file input
    triggerFileSelect()
  }
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) {
    localImageFile.value = null
    localImageMeta.url = null
    return
  }

  // Revoke old URL if present
  if (localImageFile.value) {
    URL.revokeObjectURL(localImageMeta.url!)
  }
  localImageFile.value = file

  // Convert file to object URL and store in localImageMeta.url
  localImageMeta.url = URL.createObjectURL(file)
}

function onCancel() {
  emit('close')
}

function onSave() {
  emit('save', localImageMeta, localImageFile.value, {
    context: props.context,
    contextId: props.contextId,
    identifier: props.identifier,
  })
}

onMounted(async () => {
    try {
      const response = await apiFetch<any>(apiUrl.value)
      const data = response.data
      if (!data) return

      localImageMeta.id = data.id ?? null
      localImageMeta.url = localImageMeta.id !== null
          ? buildPlutoEditImageUrl(localImageMeta.id, 800)
          : null
      localImageMeta.alt = data.alt_text ?? null
      localImageMeta.description = data.description ?? null
      localImageMeta.copyright = data.copyright ?? null
      localImageMeta.creator = data.creator ?? null
      localImageMeta.license = data.license ?? null
      localImageMeta.focusX = data.focus_x ?? null
      localImageMeta.focusY = data.focus_y ?? null
    } catch (err) {
      console.log("onMounted error")
      if (err instanceof ApiError && err.status === 404) {
        clearLocalImageMeta()
        return
      }
    }
})
</script>

<style scoped>
.uranus-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--uranus-backdrop-color);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.uranus-modal-card {
  width: 90%;
  max-width: 600px;
  border-radius: 16px;
  padding: var(--uranus-dialog-padding);
}

.uranus-image-preview {
  display: flex;
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  justify-content: center;
  margin-bottom: 1rem;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  background: var(--uranus-bg);
  border-radius: var(--uranus-tiny-border-radius);
}

.uranus-preview-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  border-radius: var(--uranus-tiny-border-radius);
  padding: 0;
}

.uranus-no-img {
  width: 100%;
  height: 250px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #888;
  border-radius: 6px;
}

.uranus-hidden-file {
  display: none;
}

.uranus-fields {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.uranus-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.focus-point {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: red;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

</style>
<!--
  src/component/image/UranusImageEditDialog.vue
-->

<template>
  <UranusModal
      :show="true"
      :title="title"
      max-width="600px"
      :close-on-escape="!isSaving"
      @close="onCancel"
  >
    <UranusForm class="uranus-form-wide" :aria-busy="isSaving">
      <fieldset class="uranus-image-fields" :disabled="isSaving">

      <UranusFormRow>
        <div class="uranus-image-actions">
          <div
              class="uranus-image-preview checker-bg"
              @click="onImageClick($event)"
          >
          <img
              v-if="localImageMeta.url"
              :src="cacheBustedUrl"
              class="uranus-preview-img checker-bg"
              @load="updatePreviewImageDimensions"
          />

          <div v-else class="uranus-no-img">
            {{ t('click_to_upload') }}
          </div>

          <input
              ref="fileInput"
              type="file"
              accept="image/*"
              class="uranus-hidden-file"
              @change="onFileSelected"
          />

            <div
                v-if="localImageMeta.url && previewImageDimensions"
                class="uranus-image-crop-preview"
                :style="cropPreviewStyle"
                aria-hidden="true"
            />

            <div
                v-if="hasFocusPoint && previewImageDimensions"
                class="focus-point"
                :style="focusPointStyle"
                aria-hidden="true"
            />
          </div>

          <div class="uranus-image-preview-controls">
            <UranusLabel
                id="image-crop-preview-ratio"
                class="uranus-image-ratio-control"
                :label="t('image_crop_preview_aspect_ratio')"
            >
              <select
                  id="image-crop-preview-ratio"
                  v-model="selectedCropAspectRatio"
                  class="uranus-admin-select"
              >
                <option
                    v-for="aspectRatio in cropAspectRatios"
                    :key="aspectRatio.label"
                    :value="aspectRatio.label"
                >
                  {{ aspectRatio.label }}
                </option>
              </select>
            </UranusLabel>

            <div class="uranus-image-action-row">
              <UranusButton
                  v-if="hasFocusPoint"
                  size="small"
                  variant="secondary"
                  type="button"
                  @click="removeFocusPoint"
              >
                {{ t('remove_focus_point') }}
              </UranusButton>

              <UranusButton
                  v-else
                  size="small"
                  variant="secondary"
                  type="button"
                  class="set-focus-button"
                  @click="toggleFocusPointMode"
              >
                {{ focusPointModeActive ? t('cancel_focus_point') : t('set_focus_point') }}
              </UranusButton>
            </div>
          </div>
        </div>
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextfield
            id="alt-text"
            v-model="localImageMeta.altText as string"
            :label="t('image_alt_text')"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextfield
            id="creator-name"
            v-model="localImageMeta.creator as string"
            :label="t('image_creator_name')"
        />
      </UranusFormRow>

      <UranusFormRow :cols="2">
        <UranusTextfield
            id="copyright"
            v-model="localImageMeta.copyright as string"
            :label="t('image_copyright')"
        />

        <UranusLabel id="event-license" :label="t('license')">
          <UranusLicenseSelect v-model="localImageMeta.licenseType" />
        </UranusLabel>
      </UranusFormRow>

      <UranusFormRow>
        <UranusLabel id="ai-label" :label="t('image_ai_label')">
          <select
              id="ai-label"
              v-model="localImageMeta.aiLabel"
              class="uranus-admin-select"
          >
            <option value="none">{{ t('ai_label_none') }}</option>
            <option value="ai">{{ t('ai_label_ai') }}</option>
            <option value="ai_generated">{{ t('ai_label_ai_generated') }}</option>
            <option value="ai_modified">{{ t('ai_label_ai_modified') }}</option>
          </select>
        </UranusLabel>
      </UranusFormRow>

      <UranusTextarea
          id="event-description"
          v-model="descriptionValue"
          :label="t('image_description')"
          height="100px"
          resize="none"
      />
      </fieldset>
    </UranusForm>

    <template #actions>
      <div v-if="isSaving" class="uranus-image-save-status">
        <span role="status">{{ saveStatus }}</span>
        <progress
            v-if="isUploading"
            :value="uploadProgress ?? undefined"
            max="100"
            :aria-label="t('image_uploading')"
        />
      </div>

      <UranusFeedback v-if="!!errorMessage" type="error">
        {{ errorMessage }}
      </UranusFeedback>

      <UranusFormActions>
        <UranusButton :disabled="isSaving" :onClick="onCancel">
          {{ t('cancel') }}
        </UranusButton>

        <UranusButton :loading="isSaving" :loading-text="t('saving')" :onClick="onSave">
          {{ t('save') }}
        </UranusButton>
      </UranusFormActions>
    </template>
  </UranusModal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch, ApiError } from '@/api.ts'
import { createPlutoImage } from '@/domain/image/plutoImage.model.ts'
import type { PlutoImageDTO } from '@/api/dto/plutoImage.dto.ts'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import { buildPlutoEditImageUrl } from '@/util/util.ts'
import UranusTextarea from '@/component/ui/UranusTextarea.vue'
import UranusLicenseSelect from '@/component/select/UranusLicenseSelect.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusModal from "@/component/uranus/UranusModal.vue";
import UranusFormActions from "@/component/ui/UranusFormActions.vue";
import UranusFeedback from "@/component/uranus/UranusFeedback.vue";

const props = defineProps<{
  addModeTitle?: string | null
  editModeTitle?: string | null
  context: string
  contextUuid: string
  identifier: string
  fitMode?: 'cover' | 'contain'
  errorMessage?: string | null
  isSaving?: boolean
  isUploading?: boolean
  uploadProgress?: number | null
}>()

const saveStatus = computed(() => {
  if (!props.isUploading || props.uploadProgress === 100) return t('image_processing')
  if (props.uploadProgress == null) return t('image_uploading')
  return t('image_upload_progress', { progress: props.uploadProgress })
})

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

const apiPath = computed(() => {
  return `/api/image/meta/${props.context}/${props.contextUuid}/${props.identifier}`
})


const cacheBustedUrl = computed(() => {
  if (!localImageMeta.url) return ''

  // If a new file was selected, use that URL directly
  if (localImageFile.value) {
    return localImageMeta.url
  }

  // Otherwise, use API URL with cache-busting
  const separator = localImageMeta.url.includes('?') ? '&' : '?'
  return `${localImageMeta.url}${separator}t=${Date.now()}`
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', imageMeta: PlutoImageDTO, file: File | null, ctx: {
    context: string
    contextUuid: string
    identifier: string
  }): void
}>()

const { t } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)
const localImageMeta = reactive(createPlutoImage())
const localImageFile = ref<File | null>(null)
const previewImageDimensions = ref<{ width: number; height: number } | null>(null)
const focusPointModeActive = ref(false)

const cropAspectRatios = [
  { label: '16/9', value: 16 / 9 },
  { label: '9/16', value: 9 / 16 },
  { label: '4/3', value: 4 / 3 },
  { label: '4/5', value: 4 / 5 },
  { label: '1/1', value: 1 },
] as const
type CropAspectRatioLabel = (typeof cropAspectRatios)[number]['label']
const selectedCropAspectRatio = ref<CropAspectRatioLabel>('16/9')
const selectedCropRatio = computed(() =>
  cropAspectRatios.find(({ label }) => label === selectedCropAspectRatio.value)?.value
    ?? cropAspectRatios[0].value
)

const hasFocusPoint = computed(() => {
  return localImageMeta.focusX !== null && localImageMeta.focusY !== null
})

interface PreviewImageBounds {
  left: number
  top: number
  width: number
  height: number
}

function getContainedImageBounds(
  containerWidth: number,
  containerHeight: number,
  imageWidth: number,
  imageHeight: number
): PreviewImageBounds | null {
  if (containerWidth <= 0 || containerHeight <= 0 || imageWidth <= 0 || imageHeight <= 0) {
    return null
  }

  const scale = Math.min(containerWidth / imageWidth, containerHeight / imageHeight)
  const width = imageWidth * scale
  const height = imageHeight * scale
  return {
    left: (containerWidth - width) / 2,
    top: (containerHeight - height) / 2,
    width,
    height,
  }
}

const cropPreviewStyle = computed(() => {
  const dimensions = previewImageDimensions.value
  if (!dimensions) return {}

  const previewWidth = 2
  const previewHeight = 1
  const imageBounds = getContainedImageBounds(
    previewWidth,
    previewHeight,
    dimensions.width,
    dimensions.height
  )
  if (!imageBounds) return {}

  const sourceRatio = dimensions.width / dimensions.height
  const targetRatio = selectedCropRatio.value
  const cropHeight = sourceRatio > targetRatio
    ? dimensions.height
    : Math.max(1, Math.floor(dimensions.width / targetRatio))
  const cropWidth = sourceRatio > targetRatio
    ? Math.max(1, Math.floor(cropHeight * targetRatio))
    : dimensions.width

  const centerX = Math.floor((localImageMeta.focusX ?? 0.5) * dimensions.width)
  const centerY = Math.floor((localImageMeta.focusY ?? 0.5) * dimensions.height)
  const cropX = Math.min(Math.max(centerX - Math.floor(cropWidth / 2), 0), dimensions.width - cropWidth)
  const cropY = Math.min(Math.max(centerY - Math.floor(cropHeight / 2), 0), dimensions.height - cropHeight)

  return {
    left: `${((imageBounds.left + cropX / dimensions.width * imageBounds.width) / previewWidth) * 100}%`,
    top: `${(imageBounds.top + cropY / dimensions.height * imageBounds.height) * 100}%`,
    width: `${((cropWidth / dimensions.width * imageBounds.width) / previewWidth) * 100}%`,
    height: `${(cropHeight / dimensions.height * imageBounds.height) * 100}%`,
  }
})

const focusPointStyle = computed(() => {
  const dimensions = previewImageDimensions.value
  if (!dimensions) return {}

  const imageBounds = getContainedImageBounds(2, 1, dimensions.width, dimensions.height)
  if (!imageBounds) return {}

  const focusX = Math.min(Math.max(localImageMeta.focusX ?? 0.5, 0), 1)
  const focusY = Math.min(Math.max(localImageMeta.focusY ?? 0.5, 0), 1)
  return {
    left: `${((imageBounds.left + focusX * imageBounds.width) / 2) * 100}%`,
    top: `${(imageBounds.top + focusY * imageBounds.height) * 100}%`,
  }
})

function updatePreviewImageDimensions(event: Event) {
  const image = event.currentTarget as HTMLImageElement
  previewImageDimensions.value = image.naturalWidth > 0 && image.naturalHeight > 0
    ? { width: image.naturalWidth, height: image.naturalHeight }
    : null
}


function clearLocalImageMeta() {
  localImageMeta.uuid = null
  localImageMeta.url = null
  localImageMeta.altText = null
  localImageMeta.description = null
  localImageMeta.copyright = null
  localImageMeta.creator = null
  localImageMeta.licenseType = null
  localImageMeta.aiLabel = null
  localImageMeta.focusX = null
  localImageMeta.focusY = null
}

function triggerFileSelect() {
  fileInput.value?.click()
}

function toggleFocusPointMode() {
  focusPointModeActive.value = !focusPointModeActive.value
}

function removeFocusPoint() {
  localImageMeta.focusX = null
  localImageMeta.focusY = null
}

function onImageClick(e: MouseEvent) {
  if (props.isSaving) return
  if (focusPointModeActive.value) {
    const preview = e.currentTarget as HTMLDivElement
    const rect = preview.getBoundingClientRect()
    const dimensions = previewImageDimensions.value
    if (!dimensions) return

    const imageBounds = getContainedImageBounds(
      rect.width,
      rect.height,
      dimensions.width,
      dimensions.height
    )
    if (!imageBounds) return

    const x = (e.clientX - rect.left - imageBounds.left) / imageBounds.width
    const y = (e.clientY - rect.top - imageBounds.top) / imageBounds.height

    localImageMeta.focusX = Math.min(Math.max(x, 0), 1)
    localImageMeta.focusY = Math.min(Math.max(y, 0), 1)

    focusPointModeActive.value = false
    return
  }

  triggerFileSelect()
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) {
    localImageFile.value = null
    localImageMeta.url = null
    previewImageDimensions.value = null
    return
  }

  // Revoke old URL if present
  if (localImageFile.value) {
    URL.revokeObjectURL(localImageMeta.url!)
  }
  localImageFile.value = file
  previewImageDimensions.value = null

  // Convert file to object URL and store in localImageMeta.url
  localImageMeta.url = URL.createObjectURL(file)
}

function onCancel() {
  if (props.isSaving) return
  emit('close')
}

function onSave() {
  if (props.isSaving) return
  const payload = {
    uuid: localImageMeta.uuid,
    alt_text: localImageMeta.altText,
    description: localImageMeta.description,
    copyright: localImageMeta.copyright,
    creator: localImageMeta.creator,
    license: localImageMeta.licenseType,
    ai_label: localImageMeta.aiLabel,
    focus_x: localImageMeta.focusX,
    focus_y: localImageMeta.focusY,
  }

  emit('save', payload, localImageFile.value, {
    context: props.context,
    contextUuid: props.contextUuid,
    identifier: props.identifier,
  })
}

onMounted(async () => {
  try {
    const apiResponse = await apiFetch<PlutoImageDTO>(apiPath.value)
    if (!apiResponse.data) return

    const meta = apiResponse.data

    localImageMeta.uuid = meta.uuid ?? null
    localImageMeta.url = localImageMeta.uuid !== null
        ? buildPlutoEditImageUrl(localImageMeta.uuid, 800)
        : null
    localImageMeta.altText = meta.alt_text ?? null
    localImageMeta.description = meta.description ?? null
    localImageMeta.copyright = meta.copyright ?? null
    localImageMeta.creator = meta.creator ?? null
    localImageMeta.licenseType = meta.license ?? null
    localImageMeta.aiLabel = meta.ai_label ?? null
    localImageMeta.focusX = meta.focus_x ?? null
    localImageMeta.focusY = meta.focus_y ?? null
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      clearLocalImageMeta()
      return
    }
  }
})
</script>

<style lang="scss">
.uranus-image-fields {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;

  &:disabled .uranus-image-preview {
    cursor: wait;
  }
}

.uranus-image-save-status {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;

  progress {
    display: block;
    width: 100%;
    height: 0.75rem;
    accent-color: var(--uranus-color);
  }
}

.uranus-image-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
}

.uranus-image-action-row {
  display: flex;
  justify-content: flex-start;
}

.uranus-image-preview-controls {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.uranus-image-ratio-control {
  flex: 0 1 12rem;
  max-width: 100%;
}

.uranus-image-preview {
  display: flex;
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 1;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  overflow: hidden;
  background: var(--uranus-bg);
  border-radius: var(--uranus-tiny-border-radius);
}

.uranus-preview-img {
  display: block;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  border-radius: var(--uranus-tiny-border-radius);
  padding: 0;
}

.uranus-image-crop-preview {
  position: absolute;
  z-index: 1;
  box-sizing: border-box;
  outline: 1px solid #fff;
  outline-offset: -1px;
  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.48);
  pointer-events: none;
}

.uranus-no-img {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--uranus-color);
  background: var(--uranus-bg);
  padding: 0.6rem;
  border-radius: 6px;
}

.uranus-hidden-file {
  display: none;
}

.uranus-admin-select {
  flex: 0 0 auto;
  width: 100%;
}

.focus-point {
  position: absolute;
  z-index: 2;
  width: 16px;
  height: 16px;
  border: 3px solid red;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.checker-bg {
  background-color: #fff;
  background-image:
      linear-gradient(45deg, #ddd 25%, transparent 25%),
      linear-gradient(-45deg, #ddd 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #ddd 75%),
      linear-gradient(-45deg, transparent 75%, #ddd 75%);
  background-size: 16px 16px;
  background-position: 0 0, 0 8px, 8px -8px, -8px 0px;
}
</style>

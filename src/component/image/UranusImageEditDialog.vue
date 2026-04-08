<!--
  src/component/image/UranusImageEditDialog.vue
-->

<template>
  <div class="uranus-modal-backdrop">
    <UranusCard class="uranus-modal-card">
      <UranusForm class="uranus-form-wide" style="max-height: 800px;">
        <h2>{{ title }}</h2>

        <UranusFormRow>

          <!-- TODO: dark mode, light mode -->
          <div class="uranus-image-preview" @click="onImageClick($event)">
            <img
                v-if="localImageMeta.url"
                :src="cacheBustedUrl"
                class="uranus-preview-img"
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

          <UranusLabel id="event-description" :label="t('license')">
            <UranusLicenseSelect v-model="localImageMeta.licenseType" />
          </UranusLabel>
        </UranusFormRow>

        <!--UranusFormRow :cols="2">
          <UranusTextfield
              id="focus-x"
              v-model.number="localImageMeta.focusX as number"
              :label="t('image_focus_x')"
          />

          <UranusTextfield
              id="focus-y"
              v-model.number="localImageMeta.focusY as number"
              :label="t('image_focus_y')"
          />
        </UranusFormRow-->

        <UranusFormRow>
          <UranusTextarea
              id="description"
              v-model="descriptionValue"
              :label="t('image_description')"
          />
        </UranusFormRow>

        <!-- Actions -->
        <UranusFormActions>
          <UranusButton :onClick="onCancel">{{ t('cancel') }}</UranusButton>
          <UranusButton :onClick="onSave">{{ t('save') }}</UranusButton>
        </UranusFormActions>
      </UranusForm>
    </UranusCard>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch, ApiError } from '@/api.ts'
import { createPlutoImage } from '@/domain/image/plutoImage.model.ts'
import type { PlutoImageDTO } from "@/api/dto/plutoImage.dto.ts";
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import { buildPlutoEditImageUrl } from '@/util/UranusUtils.ts'
import UranusInlineSaveButton from '@/component/ui/UranusInlineSaveButton.vue'
import UranusInlineCancelButton from '@/component/ui/UranusInlineCancelButton.vue'
import UranusInlineActionBar from '@/component/ui/UranusInlineActionBar.vue'
import UranusTextarea from '@/component/ui/UranusTextarea.vue'
import UranusLicenseSelect from '@/component/select/UranusLicenseSelect.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusForm from "@/component/ui/UranusForm.vue";
import UranusLabel from "@/component/ui/UranusLabel.vue";
import UranusFormActions from "@/component/ui/UranusFormActions.vue";
import UranusButton from "@/component/ui/UranusButton.vue";

const props = defineProps<{
  addModeTitle?: string | null
  editModeTitle?: string | null
  context: string
  contextUuid: string
  identifier: string
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
  (e: 'save', imageMeta: any, file: File | null, ctx: {
    context: string
    contextUuid: string
    identifier: string
  }): void
}>()

const { t } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)
const localImageMeta = reactive(createPlutoImage())
const localImageFile = ref<File | null>(null)


function clearLocalImageMeta() {
  localImageMeta.uuid = null
  localImageMeta.url = null
  localImageMeta.altText = null
  localImageMeta.description = null
  localImageMeta.copyright = null
  localImageMeta.creator = null
  localImageMeta.licenseType = null
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
  const payload = {
    uuid: localImageMeta.uuid,
    alt_text: localImageMeta.altText,
    description: localImageMeta.description,
    copyright: localImageMeta.copyright,
    creator: localImageMeta.creator,
    license: localImageMeta.licenseType,
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
      localImageMeta.altText = meta.alt ?? null
      localImageMeta.description = meta.description ?? null
      localImageMeta.copyright = meta.copyright ?? null
      localImageMeta.creator = meta.creator ?? null
      localImageMeta.licenseType = meta.license ?? null
      localImageMeta.focusX = meta.focus_x ?? null
      localImageMeta.focusY = meta.focus_y ?? null
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

.uranus-form {
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
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  border-radius: var(--uranus-tiny-border-radius);
  padding: 8px;
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
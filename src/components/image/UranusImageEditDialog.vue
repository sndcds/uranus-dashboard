<!--
  UranusImageEditDialog.vue
-->
<template>
  <!-- Modal overlay -->
  <div class="uranus-modal-backdrop uranus-form">
    <UranusCard class="uranus-modal-card">
      <!-- Title -->
      <h2>{{ localImageMeta.id ? t('edit_event_image') : t('add_event_image') }}</h2>

      <!-- Image preview -->
      <div class="uranus-image-preview" @click="onImageClick($event)">
        <img v-if="localImageMeta.url" :src="localImageMeta.url" class="uranus-preview-img" />
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
            v-model="localImageMeta.altText as string | undefined"
            :label="t('alt_text')"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextInput
            id="creator-name"
            v-model="localImageMeta.creatorName as string | undefined"
            :label="t('creator_name')"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextInput
            id="copyright"
            v-model="localImageMeta.copyright as string | undefined"
            :label="t('copyright')"
        />

        <UranusLicenseSelect
            id="license-select"
            v-model:license-id="localImageMeta.licenseId"
            :label="t('license')"
        />

        <UranusTextInput
            id="focus-x"
            v-model.number="localImageMeta.focusX as number | undefined"
            :label="t('focus_x')"
        />

        <UranusTextInput
            id="focus-y"
            v-model.number="localImageMeta.focusY as number | undefined"
            :label="t('focus_y')"
        />
      </UranusFormRow>

      <UranusFormRow>
        <UranusTextarea
            id="description"
            v-model:model-value="descriptionValue"
            :label="t('info_text')"
            placeholder="Schreibe etwas über das Motiv ..."
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
import { UranusImageMeta } from '@/models/UranusEventModel'
import { apiFetch } from '@/api.ts'
import UranusCard from '@/components/ui/UranusCard.vue'
import UranusTextInput from '@/components/ui/UranusTextInput.vue'
import UranusFormRow from "@/components/ui/UranusFormRow.vue";
import { buildPlutoEditImageUrl } from "@/utils/UranusUtils.ts";
import UranusInlineSaveButton from "@/components/ui/UranusInlineSaveButton.vue";
import UranusInlineCancelButton from "@/components/ui/UranusInlineCancelButton.vue";
import UranusInlineActionBar from "@/components/ui/UranusInlineActionBar.vue";
import UranusTextarea from "@/components/ui/UranusTextarea.vue";
import UranusLicenseSelect from "@/components/selects/UranusLicenseSelect.vue";

const props = defineProps<{
  imageIndex: number | null
  apiUrl?: string
}>()

const descriptionValue = computed({
  get: () => localImageMeta.description ?? undefined,
  set: (val: string | undefined) => {
    localImageMeta.description = val ?? null
  }
})

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', imageMeta: UranusImageMeta, file: File | null, imageIndex: number | null): void
}>()

const { t } = useI18n()
const fileInput = ref<HTMLInputElement | null>(null)
const localImageMeta = reactive(new UranusImageMeta())
const localImageFile = ref<File | null>(null)


watchEffect(async () => {
  if (!props.imageIndex || !props.apiUrl) return

  try {
    const response = await apiFetch<any>(props.apiUrl)
    const data = response.data
    if (!data) return

    localImageMeta.id = data.id ?? null
    localImageMeta.url = localImageMeta.id !== null
        ? buildPlutoEditImageUrl(localImageMeta.id, 800)
        : null
    localImageMeta.altText = data.alt_text ?? null
    localImageMeta.description = data.description ?? null
    localImageMeta.copyright = data.copyright ?? null
    localImageMeta.creatorName = data.creator_name ?? null
    localImageMeta.licenseId = data.license_id ?? null
    localImageMeta.focusX = data.focus_x ?? null
    localImageMeta.focusY = data.focus_y ?? null
  } catch (err) {
    console.error('Error loading image:', err)
  }
})

function triggerFileSelect() {
  fileInput.value?.click()
}

function onImageClick(event: MouseEvent) {
  if (event.metaKey) {
    // Command+click → set focus point
    const img = event.currentTarget as HTMLDivElement
    const rect = img.getBoundingClientRect()

    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height

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
    return
  }

  localImageFile.value = file

  // Store locally to show a preview
  const reader = new FileReader()
  reader.onload = () => {
    localImageMeta.url = reader.result as string
  }
  reader.readAsDataURL(file)
}

function onCancel() {
  emit('close')
}

function onSave() {
  emit('save', localImageMeta, localImageFile.value, props.imageIndex)
}

onMounted(() => {
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
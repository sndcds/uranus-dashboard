<!--
  EventImageUploadComponent

  A Vue 3 component for uploading and managing event images with drag & drop support.

  Usage:
    <EventImageUploadComponent
      v-model="eventImage"
      v-model:alt-text="imageAltText"
      v-model:copyright="imageCopyright"
      v-model:license="imageLicense"
      v-model:created-by="imageCreatedBy"
      :max-size="5 * 1024 * 1024"
      :accepted-types="['image/jpeg', 'image/png', 'image/webp']"
    />

  Props:
    - modelValue: File | null - The selected image file (v-model binding)
    - altText: string - Alt text for the image (v-model:alt-text)
    - copyright: string - Copyright information (v-model:copyright)
    - license: string - License type (v-model:license)
    - createdBy: string - Creator name (v-model:created-by)
    - maxSize: number - Maximum file size in bytes (default: 5MB)
    - acceptedTypes: string[] - Accepted MIME types (default: ['image/jpeg', 'image/png', 'image/webp'])

  Events:
    - update:modelValue - Emitted when a file is selected or removed
    - update:altText - Emitted when alt text changes
    - update:copyright - Emitted when copyright changes
    - update:license - Emitted when license changes
    - update:createdBy - Emitted when created by changes
-->
<template>
    <div class="event-image-upload">
        <div class="upload-area" :class="{ 'has-image': hasImage, 'drag-over': isDragOver }" @dragover.prevent
            @dragleave.prevent @drop.prevent="handleDrop">
            <div v-if="!hasImage" class="upload-placeholder">
                <div class="upload-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M14,4L20,10H14V4Z"
                            fill="currentColor" />
                    </svg>
                </div>
                <div class="upload-text">
                    <p class="upload-title">{{ t('event_image_upload_title') }}</p>
                    <p class="upload-subtitle">{{ t('event_image_upload_subtitle') }}</p>
                </div>
                <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" class="file-input" />
                <button type="button" class="upload-button" @click="fileInput?.click()">
                    {{ t('event_image_choose_file') }}
                </button>
            </div>

            <div v-else class="image-preview">
                <img :src="previewUrl" :alt="t('event_image_preview')" class="preview-image" />
                <div class="preview-overlay">
                    <button type="button" class="change-button" @click="fileInput?.click()">
                        {{ t('event_image_change') }}
                    </button>
                    <button type="button" class="remove-button" @click="removeImage">
                        {{ t('event_image_remove') }}
                    </button>
                </div>
                <input ref="fileInput" type="file" accept="image/*" @change="handleFileSelect" class="file-input" />
            </div>
        </div>

        <div v-if="error" class="upload-error">
            {{ error }}
        </div>

        <div v-if="hasImage" class="image-info">
            <span class="file-name">{{ fileName }}</span>
            <span class="file-size">({{ formatFileSize(fileSize) }})</span>
        </div>
    </div>

    <!-- Image metadata form -->
    <div v-if="hasImage" class="image-metadata">
        <div class="metadata-grid">
            <div class="form-field full-width">
                <label for="image-alt-text">{{ t('event_image_alt_text') }}</label>
                <input id="image-alt-text" v-model="localAltText" type="text"
                    :placeholder="t('event_image_alt_text_placeholder')" />
            </div>
            <div class="form-field">
                <label for="image-created-by">{{ t('event_image_created_by') }}</label>
                <input id="image-created-by" v-model="localCreatedBy" type="text"
                    :placeholder="t('event_image_created_by_placeholder')" />
            </div>

            <div class="form-field">
                <label for="image-copyright">{{ t('event_image_copyright') }}</label>
                <select id="image-copyright" v-model="localCopyright">
                    <option value="">{{ t('event_image_copyright_select') }}</option>
                    <option v-for="option in copyrightOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>

            <div class="form-field">
                <label for="image-license">{{ t('event_image_license') }}</label>
                <select id="image-license" v-model="localLicense">
                    <option value="">{{ t('event_image_license_select') }}</option>
                    <option v-for="option in licenseOptions" :key="option.value" :value="option.value">
                        {{ option.label }}
                    </option>
                </select>
            </div>
        </div>

        <!-- Save button -->
        <div class="metadata-actions">
            <button
                type="button"
                class="save-button"
                @click="saveImage"
                :disabled="isSaving || !canSave"
            >
                <span v-if="!isSaving">{{ t('event_image_save') }}</span>
                <span v-else>{{ t('saving') }}</span>
            </button>
        </div>
    </div>

    <div v-if="error" class="upload-error">
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

interface Props {
    modelValue?: File | null
    altText?: string
    copyright?: string
    license?: string
    createdBy?: string
    eventId?: number
    maxSize?: number // in bytes, default 5MB
    acceptedTypes?: string[] // default ['image/jpeg', 'image/png', 'image/webp']
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    altText: '',
    copyright: '',
    license: '',
    createdBy: '',
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: () => ['image/jpeg', 'image/png', 'image/webp']
})

const emit = defineEmits<{
    'update:modelValue': [file: File | null]
    'update:altText': [value: string]
    'update:copyright': [value: string]
    'update:license': [value: string]
    'update:createdBy': [value: string]
    'updated': []
}>()

const { t } = useI18n()

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const error = ref<string>('')
const isSaving = ref(false)

const hasImage = computed(() => !!props.modelValue)
const previewUrl = ref<string>('')
const fileName = ref<string>('')
const fileSize = ref<number>(0)

// Local reactive variables for form fields
const localAltText = ref(props.altText)
const localCopyright = ref(props.copyright)
const localLicense = ref(props.license)
const localCreatedBy = ref(props.createdBy)

// Computed property to check if we can save
const canSave = computed(() => {
    return hasImage.value && props.eventId && (
        localAltText.value.trim() ||
        localCopyright.value ||
        localLicense.value ||
        localCreatedBy.value.trim()
    )
})

// Watch for prop changes to sync local values
watch(() => props.altText, (newVal) => { localAltText.value = newVal })
watch(() => props.copyright, (newVal) => { localCopyright.value = newVal })
watch(() => props.license, (newVal) => { localLicense.value = newVal })
watch(() => props.createdBy, (newVal) => { localCreatedBy.value = newVal })

// Watch local values and emit changes
watch(localAltText, (newVal) => emit('update:altText', newVal))
watch(localCopyright, (newVal) => emit('update:copyright', newVal))
watch(localLicense, (newVal) => emit('update:license', newVal))
watch(localCreatedBy, (newVal) => emit('update:createdBy', newVal))

// Dropdown options
const copyrightOptions = [
    { value: 'all-rights-reserved', label: t('event_image_copyright_all_rights') },
    { value: 'cc-by', label: t('event_image_copyright_cc_by') },
    { value: 'cc-by-sa', label: t('event_image_copyright_cc_by_sa') },
    { value: 'cc-by-nc', label: t('event_image_copyright_cc_by_nc') },
    { value: 'cc-by-nc-sa', label: t('event_image_copyright_cc_by_nc_sa') },
    { value: 'public-domain', label: t('event_image_copyright_public_domain') },
]

const licenseOptions = [
    { value: 'copyright', label: t('event_image_license_copyright') },
    { value: 'cc-by-4.0', label: t('event_image_license_cc_by_4') },
    { value: 'cc-by-sa-4.0', label: t('event_image_license_cc_by_sa_4') },
    { value: 'cc-by-nc-4.0', label: t('event_image_license_cc_by_nc_4') },
    { value: 'cc-by-nc-sa-4.0', label: t('event_image_license_cc_by_nc_sa_4') },
    { value: 'public-domain', label: t('event_image_license_public_domain') },
]

const createPreview = (file: File) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
        previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

const clearPreview = () => {
    if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
        previewUrl.value = ''
    }
    fileName.value = ''
    fileSize.value = 0
}

// Watch for external changes to modelValue
watch(() => props.modelValue, (newFile) => {
    if (newFile && newFile instanceof File) {
        createPreview(newFile)
        fileName.value = newFile.name
        fileSize.value = newFile.size
    } else {
        clearPreview()
    }
}, { immediate: true })

const validateFile = (file: File): boolean => {
    error.value = ''

    if (!file || !(file instanceof File)) {
        error.value = t('event_image_invalid_file')
        return false
    }

    if (!props.acceptedTypes.includes(file.type)) {
        error.value = t('event_image_invalid_type', { types: props.acceptedTypes.join(', ') })
        return false
    }

    if (file.size > props.maxSize) {
        error.value = t('event_image_too_large', { maxSize: formatFileSize(props.maxSize) })
        return false
    }

    return true
}

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]

    if (file && file instanceof File) {
        if (validateFile(file)) {
            emit('update:modelValue', file)
        }
    } else {
        // User cancelled file selection or invalid file
        target.value = ''
    }
}

const handleDrop = (event: DragEvent) => {
    isDragOver.value = false
    const file = event.dataTransfer?.files?.[0]

    if (file && file instanceof File && validateFile(file)) {
        emit('update:modelValue', file)
    }
}

const removeImage = () => {
    emit('update:modelValue', null)
    if (fileInput.value) {
        fileInput.value.value = ''
    }
}

const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Cleanup on unmount
import { onUnmounted } from 'vue'
onUnmounted(() => {
    clearPreview()
})

const saveImage = async () => {
    if (!props.modelValue || !props.eventId || isSaving.value) {
        return
    }

    isSaving.value = true
    error.value = ''

    try {
        const formData = new FormData()
        formData.append('image', props.modelValue)

        if (localAltText.value.trim()) {
            formData.append('alt_text', localAltText.value.trim())
        }
        if (localCopyright.value) {
            formData.append('copyright', localCopyright.value)
        }
        if (localLicense.value) {
            formData.append('license', localLicense.value)
        }
        if (localCreatedBy.value.trim()) {
            formData.append('created_by', localCreatedBy.value.trim())
        }

        await apiFetch(`/api/admin/event/${props.eventId}/image`, {
            method: 'POST',
            body: formData,
        })

        emit('updated')
    } catch (err) {
        console.error('Failed to save image', err)
        error.value = t('event_image_save_error')
    } finally {
        isSaving.value = false
    }
}
</script>

<style scoped lang="scss">
.event-image-upload {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.upload-area {
    position: relative;
    border: 2px dashed var(--input-border);
    border-radius: 12px;
    background: var(--card-bg);
    transition: all 0.2s ease;
    cursor: pointer;

    &.has-image {
        border-style: solid;
        border-color: var(--accent-primary);
        background: var(--surface-muted);
    }

    &.drag-over {
        border-color: var(--accent-primary);
        background: rgba(var(--accent-primary-rgb, 79, 70, 229), 0.05);
    }

    &:hover:not(.has-image) {
        border-color: var(--accent-primary);
        background: var(--surface-muted);
    }
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    gap: 1rem;
    text-align: center;
}

.upload-icon {
    color: var(--muted-text);
    opacity: 0.7;
}

.upload-text {
    .upload-title {
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
    }

    .upload-subtitle {
        color: var(--muted-text);
        margin: 0;
        font-size: 0.9rem;
        line-height: 1.4;
    }
}

.upload-button {
    @include form-secondary-button($padding-y: 0.75rem, $padding-x: 1.5rem);
    font-size: 0.9rem;
}

.image-preview {
    position: relative;
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 8px;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    opacity: 0;
    transition: opacity 0.2s ease;

    .image-preview:hover & {
        opacity: 1;
    }
}

.change-button,
.remove-button {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.change-button {
    background: var(--accent-primary);
    color: white;

    &:hover {
        background: var(--accent-secondary);
    }
}

.remove-button {
    background: rgba(239, 68, 68, 0.9);
    color: white;

    &:hover {
        background: rgba(239, 68, 68, 1);
    }
}

.file-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

.upload-error {
    @include form-feedback-error();
    text-align: center;
}

.image-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: var(--muted-text);

    .file-name {
        font-weight: 500;
    }

    .file-size {
        color: var(--muted-text);
        opacity: 0.8;
    }
}

.image-metadata {
    margin-top: 1rem;
    padding: 1rem;
    background: var(--card-bg);
    border-radius: 12px;
    border: 1px solid var(--input-border);
}

.metadata-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
}

.form-field {
    @include form-group();

    &.full-width {
        grid-column: span 3;
    }
}

.metadata-actions {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
}

.save-button {
    @include form-primary-button();
    font-size: 0.9rem;
    padding: 0.75rem 1.5rem;

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
}

.upload-error {
    .upload-placeholder {
        padding: 2rem 1.5rem;
    }

    .image-preview {
        height: 150px;
    }

    .preview-overlay {
        gap: 0.5rem;

        .change-button,
        .remove-button {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
        }
    }
}
</style>
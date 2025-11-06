<template>
    <div class="uranus-event-image-upload-layout">

        <!-- Image Upload Section -->
        <div class="event-image-upload__upload-section">
            <div
                class="event-image-upload__upload-area"
                :class="{ 'event-image-upload__upload-area--has-image' : hasImage, 'event-image-upload__upload-area--drag-over': isDragOver }"
                @dragover.prevent @dragleave.prevent @drop.prevent="handleDrop">

                <!-- Upload Placeholder -->
                <div v-if="!hasImage" class="event-image-upload__placeholder">
                    <div class="event-image-upload__icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M14,4L20,10H14V4Z"
                                  fill="currentColor" />
                        </svg>
                    </div>
                    <div class="event-image-upload__text">
                        <p class="event-image-upload__title">{{ t('event_image_upload_title') }}</p>
                        <p class="event-image-upload__subtitle">{{ t('event_image_upload_subtitle') }}</p>
                    </div>
                    <input
                        ref="fileInput"
                        type="file"
                        accept="image/*" @change="handleFileSelect"
                        class="event-image-upload__file-input"
                    />
                    <button type="button" class="event-image-upload__upload-btn" @click="fileInput?.click()">
                        {{ t('event_image_choose_file') }}
                    </button>
                </div>

                <!-- Image Preview -->
                <div v-else class="event-image-upload__preview">
                    <img
                        :src="previewUrl"
                        :alt="t('event_image_preview')"
                        class="event-image-upload__preview-image" />

                    <div class="event-image-upload__preview-overlay">
                        <button type="button" class="event-image-upload__change-btn" @click="fileInput?.click()">
                            {{ t('event_image_change') }}
                        </button>
                        <button type="button" class="event-image-upload__remove-btn" @click="removeImage">
                            {{ t('event_image_remove') }}
                        </button>
                    </div>
                    <input
                        type="file"
                        ref="fileInput"
                        accept="image/*" @change="handleFileSelect"
                        class="event-image-upload__file-input"
                    />
                </div>
            </div>

            <!-- Upload Error -->
            <div v-if="error" class="event-image-upload__error">
                <p class="form-feedback-error">{{ error }}</p>
            </div>
        </div>

        <UranusInlineEditSection :active="showMetadata">
            <UranusInlineEditLabel
                :label-text="t('image_details')"
                :edit-button-text="t('edit')"
                @edit-started="showMetadata = true" />

            <div v-if="!showMetadata"
                class="uranus-event-image-upload__meta-display"
            >
                <span>
                    <strong>{{ t('event_image_alt_text') }}:</strong> {{ localAltText }}
                </span>
                <span>
                    <strong>{{ t('event_image_copyright') }}:</strong> {{ localCopyright }}
                </span>
                <span>
                    <strong>{{ t('event_image_license') }}:</strong>
                        {{
                            licenseOptions.find((l) => l.value === localLicense)?.label ||
                            t('event_image_license_unknown')
                        }}
                </span>
                <span>
                    <strong>{{ t('event_image_created_by') }}:</strong> {{ localCreatedBy }}
                </span>
            </div>

            <!-- Image Metadata Form -->
            <div v-if="hasImage && showMetadata">
                <UranusTextInput id="image-alt-text"
                                 v-model="localAltText"
                                 :label="t('event_image_alt_text')"
                />

                <UranusTextInput id="image-copyright"
                                 v-model="localCopyright"
                                 :label="t('event_image_copyright')"
                />

                <UranusTextInput id="image-created-by"
                                 v-model="localCreatedBy"
                                 :label="t('event_image_created_by')"
                                 :placeholder="t('event_image_created_by_placeholder')"
                />

                <UranusFieldLabel
                    id="image-license"
                    :label="t('event_image_license')"
                    :error="licenseError"
                >
                <div class="event-image-upload__field">
                    <select
                        id="image-license"
                        v-model.number="localLicense"
                        class="event-image-upload__select"
                        :disabled="licenseLoading"
                    >
                    <option :value="null">
                        {{ licenseLoading ? t('loading') : t('event_image_license_select') }}
                    </option>
                    <option
                        v-for="option in licenseOptions"
                        :key="option.value"
                        :value="option.value"
                    >
                        {{ option.label }}
                    </option>
                    </select>
                    <div v-if="licenseError" class="event-image-upload__field-error">
                        <p class="form-feedback-error">{{ licenseError }}</p>
                    </div>
                </div>
                    </UranusFieldLabel>

                <!-- Save Action -->
                <div class="event-image-upload__actions">
                    <button
                        type="button"
                        class="uranus-inline-cancel-button" @click="showMetadata = false"
                        :disabled="isSaving">
                        {{ t('form_cancel') }}
                    </button>
                    <button
                        type="button"
                        class="uranus-inline-save-button"
                        @click="saveImage"
                        :disabled="isSaving || !canSave">
                        <span v-if="!isSaving">{{ t('event_image_save') }}</span>
                        <span v-else>{{ t('saving') }}</span>
                    </button>
                </div>
            </div>
        </UranusInlineEditSection>
    </div>
</template>


<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
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
    existingImageUrl?: string | null
    uploadUrl?: string // URL for POST/PUT operations
    deleteUrl?: string // URL for DELETE operation
    getUrl?: string // URL for GET operation (if needed)
}

const props = withDefaults(defineProps<Props>(), {
    modelValue: null,
    altText: '',
    copyright: '',
    license: '',
    createdBy: '',
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptedTypes: () => ['image/jpeg', 'image/png', 'image/webp'],
    existingImageUrl: null,
    uploadUrl: '',
    deleteUrl: '',
    getUrl: '',
})

const emit = defineEmits<{
    'update:modelValue': [file: File | null]
    'update:altText': [value: string]
    'update:copyright': [value: string]
    'update:license': [value: string]
    'update:createdBy': [value: string]
    'updated': []
}>()

const { t, locale } = useI18n()

const existingImageUrl = ref<string | null>(props.existingImageUrl ?? null)
const currentImageId = ref<number | null>(null)

const fileInput = ref<HTMLInputElement>()
const isDragOver = ref(false)
const error = ref<string>('')
const isSaving = ref(false)
const isDeleting = ref(false)
const showMetadata = ref(false)

const hasImage = computed(() => !!props.modelValue || !!existingImageUrl.value)
const previewUrl = ref<string>('')
const fileName = ref<string>('')
const fileSize = ref<number>(0)

// Local reactive variables for form fields
const localAltText = ref(props.altText)
const localCopyright = ref(props.copyright)
const localLicense = ref<number | null>(
    props.license ? Number(props.license) : null
)
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

const computedUploadUrl = computed(() => {
    if (props.uploadUrl) {
        return props.uploadUrl
    }
})

const computedDeleteUrl = computed(() => {
    if (props.deleteUrl) {
        return props.deleteUrl
    }
})

const computedGetUrl = computed(() => {
    if (props.getUrl) {
        return props.getUrl
    }
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
const licenseOptions = ref<Array<{ value: string; label: string }>>([])
const licenseLoading = ref(false)
const licenseError = ref<string>('')

const createPreview = (file: File) => {
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
        previewUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

const clearPreview = () => {
    if (previewUrl.value && previewUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl.value)
    }
    previewUrl.value = ''
    fileName.value = ''
    fileSize.value = 0
}

const deriveFileName = (source: string): string => {
    if (!source) return t('event_image_existing_file')
    const withoutQuery = source.split('?')[0] ?? ''
    const segments = withoutQuery.split('/').filter(Boolean)
    const candidate = segments.pop()?.trim()
    return candidate && candidate.length ? candidate : t('event_image_existing_file')
}

const applyExistingImagePreview = (url: string) => {
    previewUrl.value = url
    fileName.value = deriveFileName(url)
    fileSize.value = 0
}

const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() !== '') {
        const parsed = Number(value)
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

watch(() => props.modelValue, (newFile) => {
    showMetadata.value = !!newFile

    if (newFile && newFile instanceof File) {
        existingImageUrl.value = null
        currentImageId.value = null
        createPreview(newFile)
        fileName.value = newFile.name
        fileSize.value = newFile.size
        return
    }

    if (existingImageUrl.value) {
        applyExistingImagePreview(existingImageUrl.value)
    } else {
        clearPreview()
    }
}, { immediate: true })

watch(() => props.existingImageUrl, (newUrl) => {
    existingImageUrl.value = newUrl ?? null

    if (props.modelValue) {
        return
    }

    if (existingImageUrl.value) {
        applyExistingImagePreview(existingImageUrl.value)
    } else {
        clearPreview()
        currentImageId.value = null
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
            existingImageUrl.value = null
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
        existingImageUrl.value = null
    }
}

const removeImage = async () => {
    if (isDeleting.value) return

    if (!computedDeleteUrl.value) {
        error.value = t('event_image_delete_url_missing')
        return
    }

    error.value = ''
    isDeleting.value = true

    try {
        await apiFetch(computedDeleteUrl.value, {
            method: 'DELETE',
        })

        existingImageUrl.value = null
        showMetadata.value = false
        emit('update:modelValue', null)

        if (fileInput.value) {
            fileInput.value.value = ''
        }

        clearPreview()
        emit('updated')
    } catch (err) {
        console.error('Failed to remove image', err)
        error.value = t('event_image_remove_error')
    } finally {
        isDeleting.value = false
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
import UranusInlineEditLabel from "@/components/uranus/UranusInlineEditLabel.vue"
import UranusInlineEditSection from "@/components/uranus/UranusInlineEditSection.vue";
import UranusTextInput from "@/components/uranus/UranusTextInput.vue";
import UranusFieldLabel from "@/components/uranus/UranusFieldLabel.vue";
onUnmounted(() => {
    clearPreview()
})

const resolveLicenseLabel = (license: Record<string, any>): string => {
    if (!license) return ''

    const currentLocale = (locale.value || '').toLowerCase()
    const shortLocale = currentLocale.split('-')[0]
    const localeCandidates = [currentLocale, shortLocale].filter((val, index, arr) => !!val && arr.indexOf(val) === index)

    const translationSources = ['names', 'translations', 'localized_names', 'license_translations', 'license_names']
        .map((key) => license[key])
        .filter((source): source is Record<string, string> => !!source && typeof source === 'object')

    const tryGetFromSources = (lang?: string): string | undefined => {
        if (!lang) return undefined
        const normalized = lang.toLowerCase()

        for (const source of translationSources) {
            const match = source[normalized] || source[normalized.toUpperCase()]
            if (typeof match === 'string' && match.trim()) {
                return match.trim()
            }
        }

        const directKeys = [`license_name_${normalized}`, `name_${normalized}`, normalized]
        for (const key of directKeys) {
            const value = license[key]
            if (typeof value === 'string' && value.trim()) {
                return value.trim()
            }
        }

        return undefined
    }

    for (const candidate of localeCandidates) {
        const translation = tryGetFromSources(candidate)
        if (translation) {
            return translation
        }
    }

    const englishFallback = tryGetFromSources('en') || tryGetFromSources('english')
    if (englishFallback) {
        return englishFallback
    }

    for (const source of translationSources) {
        const value = Object.values(source).find((val) => typeof val === 'string' && val.trim())
        if (value) {
            return value.trim()
        }
    }

    if (typeof license.license_name === 'string' && license.license_name.trim()) {
        return license.license_name.trim()
    }

    if (typeof license.name === 'string' && license.name.trim()) {
        return license.name.trim()
    }

    return ''
}

const fetchLicenses = async () => {
    licenseLoading.value = true
    licenseError.value = ''

    try {
        const { data } = await apiFetch(`/api/choosable-licenses?lang=${locale.value}`)

        if (Array.isArray(data)) {
            licenseOptions.value = data.map((license: any) => ({
                value: Number(license.license_id), // ensure number type
                label: resolveLicenseLabel(license),
            }))
        } else {
            licenseOptions.value = []
        }
    } catch (err) {
        console.error('Failed to fetch licenses', err)
        licenseError.value = t('event_image_license_load_error')
        licenseOptions.value = []
    } finally {
        licenseLoading.value = false
    }
}

onMounted(() => {
    fetchLicenses()
})

const saveImage = async () => {
  if (!props.modelValue || !props.eventId || isSaving.value) return

  if (!computedUploadUrl.value) {
    error.value = t('event_image_upload_url_missing')
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
      if (localLicense.value !== null) {
            formData.append('license_id', String(localLicense.value))
        }
        if (localCreatedBy.value.trim()) {
            formData.append('created_by', localCreatedBy.value.trim())
        }

        await apiFetch(computedUploadUrl.value, {
            method: 'POST',
            body: formData,
        })

        showMetadata.value = false
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
// Mobile-first responsive EventImageUploadComponent
.uranus-event-image-upload-layout {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 4vw, 1.5rem);
}

.uranus-event-image-upload__meta-display {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

// Upload Section
.event-image-upload__upload-section {
  display: flex;
  flex-direction: column;
  gap: clamp(0.75rem, 4vw, 1rem);
  max-width: 500px;
}

// Upload Area - Mobile first
.event-image-upload__upload-area {
  position: relative;
  border: 2px dashed var(--input-border);
  border-radius: var(--uranus-card-border-radius);
  background: var(--card-bg);
  transition: all 0.2s ease;
  cursor: pointer;
  width: 100%;
  aspect-ratio: 4 / 3;

    &--has-image {
      border-style: solid;
      border-width: 0px;
      background: var(--surface-muted);
    }

    &--drag-over {
        border-color: var(--accent-primary);
        background: rgba(79, 70, 229, 0.05);
        transform: scale(1.02);
    }

    &:hover:not(.event-image-upload__upload-area--has-image) {
        border-color: var(--accent-primary);
        background: var(--surface-muted);
    }
}

// Upload Placeholder
.event-image-upload__placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: clamp(1.5rem, 5vw, 2.5rem) clamp(1rem, 4vw, 2rem);
    gap: clamp(0.75rem, 3vw, 1.25rem);
    text-align: center;
    height: 100%;
}

.event-image-upload__icon {
    color: var(--muted-text);
    opacity: 0.7;
    transition: all 0.2s ease;

    .event-image-upload__upload-area:hover & {
        color: var(--accent-primary);
        opacity: 1;
    }
}

.event-image-upload__text {
    .event-image-upload__title {
        font-weight: 600;
        color: var(--color-text);
        margin: 0 0 0.25rem 0;
        font-size: clamp(1.1rem, 3vw, 1.25rem);
        line-height: 1.3;
    }

    .event-image-upload__subtitle {
        color: var(--muted-text);
        margin: 0;
        font-size: clamp(0.9rem, 2.5vw, 1rem);
        line-height: 1.4;
    }
}

.event-image-upload__upload-btn {
    @include form-secondary-button($padding-y: 0.75rem, $padding-x: 1.5rem);
    font-size: clamp(0.9rem, 2vw, 1rem);
    align-self: center;
}

// Image Preview
.event-image-upload__preview {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.event-image-upload__preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;

    .event-image-upload__upload-area:hover & {
        transform: scale(1.05);
    }
}

.event-image-upload__preview-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(0.5rem, 2vw, 0.75rem);
    opacity: 0;
    transition: opacity 0.2s ease;

    .event-image-upload__preview:hover & {
        opacity: 1;
    }
}

.event-image-upload__change-btn,
.event-image-upload__remove-btn {
    padding: clamp(0.5rem, 2vw, 0.75rem) clamp(0.75rem, 3vw, 1rem);
    border-radius: 8px;
    font-size: clamp(0.85rem, 2vw, 0.95rem);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
}

.event-image-upload__change-btn {
    background: var(--accent-primary);
    color: white;

    &:hover {
        background: var(--accent-secondary);
        transform: translateY(-1px);
    }
}

.event-image-upload__remove-btn {
    background: rgba(239, 68, 68, 0.9);
    color: white;

    &:hover {
        background: rgba(239, 68, 68, 1);
        transform: translateY(-1px);
    }
}

// File Input (hidden)
.event-image-upload__file-input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
}

// Error and Info
.event-image-upload__error {
    width: 100%;
    max-width: 600px;
}

.form-feedback-error {
    @include form-feedback();
    @include form-feedback-error();
    text-align: center;
}

.event-image-upload__info {
    display: flex;
    gap: 0.5rem;
    font-size: clamp(0.85rem, 2vw, 0.95rem);
    color: var(--muted-text);
    flex-wrap: wrap;
}

.event-image-upload__file-name {
  font-weight: 500;
}

.event-image-upload__file-size {
    color: var(--muted-text);
    opacity: 0.8;
}

// Metadata Grid - Mobile first
.event-image-upload__metadata-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: clamp(1rem, 4vw, 1.5rem);
}

.event-image-upload__field {
    @include form-group();

    &--full-width {
        grid-column: 1 / -1;
    }
}

.event-image-upload__label {
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: 0.01em;
    display: block;
    font-size: clamp(0.9rem, 2vw, 1rem);
}

.event-image-upload__input,
.event-image-upload__select {
    width: 100%;
    font-size: clamp(0.95rem, 2vw, 1rem);
}

.event-image-upload__field-error {
    margin-top: 0.5rem;
}

.event-image-upload__toggle-btn {
    margin-top: clamp(1rem, 3vw, 1.5rem);
    @include form-secondary-button($padding-y: 0.65rem, $padding-x: 1.5rem);
    align-self: flex-start;
}

.event-image-upload__actions {
    margin-top: clamp(1.25rem, 4vw, 2rem);
    display: flex;
    justify-content: flex-end;
    gap: clamp(0.5rem, 2vw, 0.75rem);
}

.event-image-upload__cancel-btn {
    @include form-secondary-button($padding-y: 0.65rem, $padding-x: 1.5rem);
}

.event-image-upload__save-btn {
    @include form-primary-button();
    font-size: clamp(0.9rem, 2vw, 1rem);
    padding: clamp(0.75rem, 2vw, 1rem) clamp(1.5rem, 4vw, 2rem);

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
}

@media (min-width: 640px) {
    .event-image-upload__metadata-grid {
        gap: clamp(1.25rem, 3vw, 1.75rem);
    }

    .event-image-upload__field--full-width {
        grid-column: span 2;
    }

    .event-image-upload__actions {
        justify-content: flex-end;
    }
}

@media (min-width: 1024px) {
    .event-image-upload__metadata-grid {
        gap: clamp(1.5rem, 3vw, 2rem);
    }
}

@media (min-width: 1280px) {
    .event-image-upload__metadata-grid {
        grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
    }
}
</style>

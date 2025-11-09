<template>
    <aside class="profile-photo-panel">
        <span class="profile-photo-panel__label">{{ label }}</span>

        <div class="profile-photo-wrapper" :class="{
            'profile-photo-wrapper--has-image': !!displayAvatar,
            'profile-photo-wrapper--dragover': isDragOver && !isInputDisabled
        }" @dragenter.prevent="onDragEnter" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
            @dragend.prevent="onDragLeave" @drop.prevent="onDrop">
            <img v-if="displayAvatar" :src="displayAvatar" alt="" />
            <div v-else class="profile-photo-placeholder" aria-hidden="true">
                <span class="profile-photo-initial">{{ initialsText }}</span>
                <span class="profile-photo-placeholder__hint">{{ label }}</span>
            </div>
        </div>

        <div class="profile-photo-actions">
            <label class="profile-upload" :class="{ 'profile-upload--disabled': isInputDisabled }">
                <input class="profile-upload__input" type="file" accept="image/*" :disabled="isInputDisabled"
                    @change="onFileChange" />
                <span>{{ uploadLabel }}</span>
            </label>
            <button v-if="displayAvatar" class="profile-remove" type="button" :disabled="isInputDisabled"
                @click="removePhoto">
                {{ removeLabel }}
            </button>
        </div>

        <p class="profile-photo-hint">{{ hint }}</p>
    </aside>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useUserStore } from '@/store/userStore'
import { useTokenStore } from '@/store/tokenStore'
import { apiFetch } from '@/api'

const props = withDefaults(
    defineProps<{
        label: string
        hint: string
        uploadLabel: string
        removeLabel: string
        initials: string
        disabled?: boolean
    }>(),
    {
        disabled: false
    }
)

const emit = defineEmits<{
    (e: 'busy-change', value: boolean): void
    (e: 'error', value: string | null): void
    (e: 'clear-feedback'): void
    (e: 'avatar-updated'): void
}>()

const userStore = useUserStore()
const tokenStore = useTokenStore()

const currentAvatarUrl = ref<string | null>(null)
const avatarPreviewUrl = ref<string | null>(null)
const loadedAvatarObjectUrl = ref<string | null>(null)
const avatarExistsOnServer = ref(false)
const dragCounter = ref(0)
const isDragOver = ref(false)
const isUploading = ref(false)
const isLoadingAvatar = ref(false)

const initialsText = computed(() => (props.initials || '?').trim() || '?')
const displayAvatar = computed(() => avatarPreviewUrl.value || currentAvatarUrl.value || null)
const isInputDisabled = computed(() => props.disabled || isUploading.value || isLoadingAvatar.value)

const updateAvatarFromServer = (url: string | null) => {
    if (loadedAvatarObjectUrl.value) {
        URL.revokeObjectURL(loadedAvatarObjectUrl.value)
        loadedAvatarObjectUrl.value = null
    }

    if (url) {
        loadedAvatarObjectUrl.value = url
    }

    currentAvatarUrl.value = url
    avatarExistsOnServer.value = !!url
}

const revokePreview = () => {
    if (avatarPreviewUrl.value) {
        URL.revokeObjectURL(avatarPreviewUrl.value)
        avatarPreviewUrl.value = null
    }
}

const resolveErrorMessage = (err: unknown): string => {
    if (typeof err === 'object' && err && 'data' in err) {
        const apiErr = err as { data?: { error?: string } }
        if (apiErr.data?.error) {
            return apiErr.data.error
        }
    }

    if (err instanceof Error && err.message) {
        return err.message
    }

    return 'Failed to update avatar.'
}

const notifyBusy = (value: boolean) => {
    emit('busy-change', value)
}

watch(
    () => isUploading.value,
    (value) => {
        notifyBusy(value)
    },
    { immediate: true }
)

const loadAvatar = async () => {
    const userId = userStore.userId

    if (!userId) {
        updateAvatarFromServer(null)
        return
    }

    const headers: Record<string, string> = {}
    if (tokenStore.accessToken) {
        headers.Authorization = `Bearer ${tokenStore.accessToken}`
    }

    isLoadingAvatar.value = true

    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/${userId}/avatar/256`, {
            method: 'GET',
            headers: Object.keys(headers).length ? headers : undefined,
            cache: 'no-store',
        })

        if (!response.ok) {
            if (response.status === 404) {
                updateAvatarFromServer(null)
            }
            return
        }

        const blob = await response.blob()
        if (loadedAvatarObjectUrl.value) {
            URL.revokeObjectURL(loadedAvatarObjectUrl.value)
        }
        const objectUrl = URL.createObjectURL(blob)
        loadedAvatarObjectUrl.value = objectUrl
        currentAvatarUrl.value = objectUrl
        avatarExistsOnServer.value = true
    } catch (err) {
        console.error('Failed to load avatar', err)
    } finally {
        isLoadingAvatar.value = false
    }
}

watch(
    () => userStore.userId,
    (id) => {
        if (id) {
            void loadAvatar()
        } else {
            updateAvatarFromServer(null)
        }
    },
    { immediate: true }
)

const uploadAvatar = async (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    const method = avatarExistsOnServer.value ? 'PUT' : 'POST'

    await apiFetch<unknown>('/api/admin/user/me/avatar', {
        method: 'POST',
        body: formData,
    })

    avatarExistsOnServer.value = true
}

const deleteAvatar = async () => {
    await apiFetch<unknown>('/api/admin/user/me/avatar', {
        method: 'DELETE',
    })
    avatarExistsOnServer.value = false
}

const clearFeedback = () => {
    emit('clear-feedback')
}

const isImageFile = (file: File) => {
    if (file.type) {
        return file.type.startsWith('image/')
    }

    return /\.(avif|bmp|gif|jpe?g|png|webp|svg)$/i.test(file.name)
}

const processSelectedFile = (file: File) => {
    if (!file || !isImageFile(file)) {
        return
    }

    clearFeedback()
    revokePreview()
    avatarPreviewUrl.value = URL.createObjectURL(file)

    void uploadAvatarFromSelection(file)
}

const uploadAvatarFromSelection = async (file: File) => {
    if (isUploading.value) return

    isUploading.value = true
    const previewSnapshot = avatarPreviewUrl.value

    try {
        await uploadAvatar(file)
        await loadAvatar()
        emit('avatar-updated')

        if (avatarPreviewUrl.value === previewSnapshot) {
            revokePreview()
        }

    } catch (err) {
        emit('error', resolveErrorMessage(err))
    } finally {
        isUploading.value = false
    }
}

const onFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file || isInputDisabled.value) {
        if (input) input.value = ''
        return
    }

    processSelectedFile(file)
    input.value = ''
}

const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes('Files')

const onDragEnter = (event: DragEvent) => {
    if (isInputDisabled.value || !hasFiles(event)) return
    dragCounter.value += 1
    isDragOver.value = true
}

const onDragOver = (event: DragEvent) => {
    if (isInputDisabled.value || !hasFiles(event)) return
    const dataTransfer = event.dataTransfer
    if (!dataTransfer) return
    dataTransfer.dropEffect = 'copy'
    isDragOver.value = true
}

const onDragLeave = () => {
    if (dragCounter.value > 0) {
        dragCounter.value -= 1
    }
    if (dragCounter.value <= 0) {
        dragCounter.value = 0
        isDragOver.value = false
    }
}

const onDrop = (event: DragEvent) => {
    if (isInputDisabled.value) return
    const files = event.dataTransfer?.files
    if (!files || files.length === 0) {
        dragCounter.value = 0
        isDragOver.value = false
        return
    }

    const droppedFile = Array.from(files).find((file) => isImageFile(file))
    if (droppedFile) {
        processSelectedFile(droppedFile)
    }

    dragCounter.value = 0
    isDragOver.value = false
    if (hasFiles(event)) {
        event.dataTransfer?.clearData()
    }
}

const removePhoto = async () => {
    if (isInputDisabled.value) return
    clearFeedback()

    if (avatarPreviewUrl.value) {
        revokePreview()
        return
    }

    if (!avatarExistsOnServer.value) {
        return
    }

    isUploading.value = true
    try {
        await deleteAvatar()
        updateAvatarFromServer(null)
        emit('avatar-updated')
    } catch (err) {
        emit('error', resolveErrorMessage(err))
    } finally {
        isUploading.value = false
    }
}

onBeforeUnmount(() => {
    revokePreview()
    if (loadedAvatarObjectUrl.value) {
        URL.revokeObjectURL(loadedAvatarObjectUrl.value)
        loadedAvatarObjectUrl.value = null
    }
})
</script>

<style scoped lang="scss">
.profile-photo-panel {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    background: var(--input-bg);
    border: 1px dashed var(--border-soft);
    border-radius: 20px;
    padding: clamp(1.25rem, 3vw, 1.75rem);
    margin-bottom: 1.5rem;
}

.profile-photo-panel__label {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--muted-text);
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.profile-photo-wrapper {
    position: relative;
    width: min(220px, 100%);
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    border: 1px dashed var(--border-soft);
    background: var(--card-bg);
    overflow: hidden;
    display: grid;
    place-items: center;
    align-self: center;
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.profile-photo-wrapper--has-image {
    border-style: solid;
    border-color: transparent;
    box-shadow: 0 18px 38px rgba(31, 41, 55, 0.14);
}

.profile-photo-wrapper--dragover {
    border-style: solid;
    border-color: var(--accent-primary);
    background: var(--accent-muted);
}

.profile-photo-wrapper--dragover .profile-photo-placeholder__hint {
    color: var(--accent-primary);
}

.profile-photo-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.profile-photo-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    text-align: center;
}

.profile-photo-initial {
    font-size: clamp(2.5rem, 8vw, 3.25rem);
    font-weight: 700;
    color: var(--muted-text);
}

.profile-photo-placeholder__hint {
    font-size: 0.85rem;
    color: var(--muted-text);
    text-align: center;
}

.profile-photo-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    justify-content: center;
    align-items: center;
}

.profile-upload {
    @include form-secondary-button($padding-y: 0.65rem, $padding-x: 1.4rem);
    cursor: pointer;
}

.profile-upload--disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
}

.profile-upload__input {
    display: none;
}

.profile-remove {
    border: none;
    background: transparent;
    color: var(--muted-text);
    font-weight: 600;
    cursor: pointer;
    padding: 0.65rem 0.75rem;
    border-radius: 999px;
    transition: color 0.2s ease, background 0.2s ease;
}

.profile-remove:hover:not(:disabled) {
    color: var(--color-text);
    background: rgba(148, 163, 184, 0.12);
}

.profile-remove:disabled {
    cursor: not-allowed;
    opacity: 0.6;
}

.profile-photo-hint {
    margin: 0;
    font-size: 0.85rem;
    color: var(--muted-text);
    line-height: 1.5;
    text-align: center;
}
</style>

<template>
    <div class="profile-page">
        <section class="profile-hero">
            <h1>{{ heroTitle }}</h1>
            <p>{{ heroSubtitle }}</p>
        </section>

        <section class="profile-card">
            <transition name="fade">
                <p v-if="loadError" class="feedback feedback--error" role="alert">
                    {{ loadError }}
                </p>
            </transition>

            <form class="profile-form" @submit.prevent="submitProfile">
                <div v-if="isLoading" class="profile-loading">
                    <span class="profile-loading__text">{{ loadingLabel }}</span>
                </div>

                <div v-else class="profile-layout">
                    <aside class="profile-photo-panel">
                        <span class="profile-photo-panel__label">{{ photoLabel }}</span>
                        <div class="profile-photo-wrapper" :class="{
                            'profile-photo-wrapper--has-image': !!displayAvatar,
                            'profile-photo-wrapper--dragover': isDragOver && !isSubmitting,
                        }" @dragenter.prevent="onDragEnter" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
                            @dragend.prevent="onDragLeave" @drop.prevent="onDrop">
                            <img v-if="displayAvatar" :src="displayAvatar" alt="" />
                            <div v-else class="profile-photo-placeholder" aria-hidden="true">
                                <span class="profile-photo-initial">{{ avatarInitial }}</span>
                                <span class="profile-photo-placeholder__hint">{{ photoLabel }}</span>
                            </div>
                        </div>
                        <div class="profile-photo-actions">
                            <label class="profile-upload" :class="{ 'profile-upload--disabled': isSubmitting }">
                                <input class="profile-upload__input" type="file" accept="image/*"
                                    :disabled="isSubmitting" @change="onFileChange" />
                                <span>{{ uploadLabel }}</span>
                            </label>
                            <button v-if="displayAvatar" class="profile-remove" type="button" :disabled="isSubmitting"
                                @click="removePhoto">
                                {{ removeLabel }}
                            </button>
                        </div>
                        <p class="profile-photo-hint">{{ photoHint }}</p>
                    </aside>

                    <div class="profile-fields">
                        <div class="form-grid">
                            <div class="form-group">
                                <label for="profile_display_name">{{ t('user_profile_display_name') }}</label>
                                <input id="profile_display_name" v-model="profile.displayName" type="text"
                                    autocomplete="nickname" :disabled="isSubmitting" required />
                            </div>
                            <div class="form-group">
                                <label for="profile_first_name">{{ t('user_profile_first_name') }}</label>
                                <input id="profile_first_name" v-model="profile.firstName" type="text"
                                    autocomplete="given-name" :disabled="isSubmitting" />
                            </div>
                            <div class="form-group">
                                <label for="profile_last_name">{{ t('user_profile_last_name') }}</label>
                                <input id="profile_last_name" v-model="profile.lastName" type="text"
                                    autocomplete="family-name" :disabled="isSubmitting" />
                            </div>
                            <div class="form-group">
                                <label for="profile_email">{{ t('user_profile_email') }}</label>
                                <input id="profile_email" v-model="profile.email" type="email" autocomplete="email"
                                    :disabled="isSubmitting" required />
                            </div>
                        </div>

                        <div class="profile-preferences">
                            <div class="profile-preferences__header">
                                <h4>{{ preferencesHeading }}</h4>
                                <p>{{ preferencesDescription }}</p>
                            </div>
                            <div class="profile-preferences__grid">
                                <div class="form-group">
                                    <label for="profile_language">{{ t('select_language') }}</label>
                                    <select id="profile_language" v-model="selectedLocale" :disabled="isSubmitting">
                                        <option v-for="option in localeOptions" :key="option.value"
                                            :value="option.value">
                                            {{ option.label }}
                                        </option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="profile_theme">{{ t('settings_theme') }}</label>
                                    <select id="profile_theme" v-model="selectedTheme" :disabled="isSubmitting">
                                        <option v-for="option in themeOptions" :key="option.value"
                                            :value="option.value">
                                            {{ t(option.label) }}
                                        </option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="profile-actions">
                    <transition name="fade">
                        <p v-if="submitError" class="feedback feedback--error" role="alert">
                            {{ submitError }}
                        </p>
                    </transition>
                    <transition name="fade">
                        <p v-if="submitSuccess" class="feedback feedback--success" role="status">
                            {{ submitSuccess }}
                        </p>
                    </transition>

                    <button type="submit" :disabled="saveDisabled">
                        <span v-if="!isSubmitting">{{ saveButtonLabel }}</span>
                        <span v-else>{{ savingLabel }}</span>
                    </button>
                </div>
            </form>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/store/themeStore'
import type { ThemeMode } from '@/utils/theme'
import { apiFetch } from '@/api'

interface UserProfilePayload {
    display_name?: string | null
    email?: string | null
    first_name?: string | null
    last_name?: string | null
    avatar_url?: string | null
    locale?: string | null
    theme?: ThemeMode | null
}

const { t, te, locale } = useI18n({ useScope: 'global' })
const themeStore = useThemeStore()

const isThemeMode = (value: unknown): value is ThemeMode => value === 'light' || value === 'dark'

const profile = reactive({
    displayName: '',
    email: '',
    firstName: '',
    lastName: '',
})

const initialAvatarUrl = ref<string | null>(null)
const currentAvatarUrl = ref<string | null>(null)
const avatarPreviewUrl = ref<string | null>(null)
const avatarFile = ref<File | null>(null)
const removeAvatar = ref(false)
const dragCounter = ref(0)
const isDragOver = ref(false)

const isLoading = ref(true)
const isSubmitting = ref(false)
const loadError = ref<string | null>(null)
const submitError = ref<string | null>(null)
const submitSuccess = ref<string | null>(null)

const localeOptions: Array<{ value: string; label: string }> = [
    { value: 'en', label: 'English' },
    { value: 'da', label: 'Dansk' },
    { value: 'de', label: 'Deutsch' },
]

const themeOptions: Array<{ value: ThemeMode; label: string }> = [
    { value: 'light', label: 'settings_theme_light' },
    { value: 'dark', label: 'settings_theme_dark' },
]

const heroTitle = computed(() => (te('user_profile_title') ? t('user_profile_title') : 'Update your profile'))
const heroSubtitle = computed(() => (te('user_profile_subtitle') ? t('user_profile_subtitle') : 'Manage how others see your information.'))
const photoLabel = computed(() => (te('user_profile_photo_label') ? t('user_profile_photo_label') : 'Profile picture'))
const photoHint = computed(() => (te('user_profile_photo_hint') ? t('user_profile_photo_hint') : 'JPG or PNG, max 5 MB.'))
const uploadLabel = computed(() => (te('user_profile_upload') ? t('user_profile_upload') : 'Upload new photo'))
const removeLabel = computed(() => (te('user_profile_remove_photo') ? t('user_profile_remove_photo') : 'Remove photo'))
const saveButtonLabel = computed(() => (te('user_profile_save') ? t('user_profile_save') : 'Save profile'))
const successMessage = computed(() => (te('user_profile_save_success') ? t('user_profile_save_success') : 'Profile updated successfully.'))
const saveErrorMessage = computed(() => (te('user_profile_save_error') ? t('user_profile_save_error') : 'Could not save your profile.'))
const loadErrorMessage = computed(() => (te('user_profile_load_error') ? t('user_profile_load_error') : 'Could not load your profile.'))
const loadingLabel = computed(() => (te('user_profile_loading') ? t('user_profile_loading') : 'Loading profile…'))
const validationMessage = computed(() => (te('user_profile_validation_error') ? t('user_profile_validation_error') : 'Please provide a display name and email address.'))
const savingLabel = computed(() => (te('form_saving') ? t('form_saving') : 'Saving…'))
const preferencesHeading = computed(() => (te('user_profile_preferences_heading') ? t('user_profile_preferences_heading') : 'Workspace preferences'))
const preferencesDescription = computed(() => (te('user_profile_preferences_description') ? t('user_profile_preferences_description') : 'Choose your language and theme for the dashboard.'))
const selectedLocale = computed({
    get: () => locale.value,
    set: (value: string) => {
        locale.value = value
    },
})

const selectedTheme = computed({
    get: () => themeStore.theme,
    set: (value: ThemeMode) => themeStore.setTheme(value),
})

const displayAvatar = computed(() => avatarPreviewUrl.value || currentAvatarUrl.value || null)
const avatarInitial = computed(() => {
    const source = (profile.displayName || `${profile.firstName} ${profile.lastName}`).trim()
    if (!source) return '?'
    return source.charAt(0).toUpperCase()
})

const saveDisabled = computed(() => {
    if (isLoading.value || isSubmitting.value) return true
    return !profile.displayName.trim() || !profile.email.trim()
})

const revokePreview = () => {
    if (avatarPreviewUrl.value) {
        URL.revokeObjectURL(avatarPreviewUrl.value)
        avatarPreviewUrl.value = null
    }
}

const hasFiles = (event: DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes('Files')

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

    revokePreview()
    avatarFile.value = file
    avatarPreviewUrl.value = URL.createObjectURL(file)
    removeAvatar.value = false
    submitError.value = null
    submitSuccess.value = null
}

const onFileChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return

    processSelectedFile(file)

    input.value = ''
}

const onDragEnter = (event: DragEvent) => {
    if (isSubmitting.value) return
    if (!hasFiles(event)) return
    dragCounter.value += 1
    isDragOver.value = true
}

const onDragOver = (event: DragEvent) => {
    if (isSubmitting.value) return
    if (!hasFiles(event)) return
    const dataTransfer = event.dataTransfer
    if (!dataTransfer) return
    dataTransfer.dropEffect = 'copy'
    isDragOver.value = true
}

const onDragLeave = (event: DragEvent) => {
    if (dragCounter.value > 0) {
        dragCounter.value -= 1
    }
    if (dragCounter.value <= 0) {
        dragCounter.value = 0
        isDragOver.value = false
    }
}

const onDrop = (event: DragEvent) => {
    if (isSubmitting.value) return
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

const removePhoto = () => {
    if (avatarPreviewUrl.value) {
        revokePreview()
        avatarFile.value = null
        currentAvatarUrl.value = initialAvatarUrl.value
        removeAvatar.value = false
        return
    }

    if (currentAvatarUrl.value) {
        currentAvatarUrl.value = null
        removeAvatar.value = initialAvatarUrl.value !== null
        return
    }

    removeAvatar.value = false
}

const mapResponseToState = (payload: UserProfilePayload | null | undefined) => {
    if (payload) {
        profile.displayName = payload.display_name ?? ''
        profile.email = payload.email ?? ''
        profile.firstName = payload.first_name ?? ''
        profile.lastName = payload.last_name ?? ''
        initialAvatarUrl.value = payload.avatar_url ?? null
        currentAvatarUrl.value = initialAvatarUrl.value

        if (payload.locale) {
            locale.value = payload.locale
        }

        if (payload.theme && isThemeMode(payload.theme)) {
            themeStore.setTheme(payload.theme)
        }
    }

    removeAvatar.value = false
    revokePreview()
    avatarFile.value = null
}

const loadProfile = async () => {
    isLoading.value = true
    loadError.value = null

    try {
        const { data } = await apiFetch<UserProfilePayload>('/api/admin/user/me')
        mapResponseToState(data)
    } catch (err: unknown) {
        if (err instanceof Error && err.message) {
            loadError.value = err.message
        } else {
            loadError.value = loadErrorMessage.value
        }
    } finally {
        isLoading.value = false
    }
}

const submitProfile = async () => {
    submitError.value = null
    submitSuccess.value = null

    if (!profile.displayName.trim() || !profile.email.trim()) {
        submitError.value = validationMessage.value
        return
    }

    isSubmitting.value = true

    const formData = new FormData()
    formData.append('display_name', profile.displayName.trim())
    formData.append('email', profile.email.trim())
    formData.append('first_name', profile.firstName.trim())
    formData.append('last_name', profile.lastName.trim())
    formData.append('locale', selectedLocale.value)
    formData.append('theme', selectedTheme.value)

    const requestedRemoval = removeAvatar.value

    if (avatarFile.value) {
        formData.append('avatar', avatarFile.value)
    } else if (requestedRemoval) {
        formData.append('remove_avatar', 'true')
    }

    try {
        const { data } = await apiFetch<UserProfilePayload>('/api/admin/user/me', {
            method: 'PUT',
            body: formData,
        })

        mapResponseToState(data)

        if (requestedRemoval && (!data || !data.avatar_url)) {
            initialAvatarUrl.value = null
            currentAvatarUrl.value = null
        }

        submitSuccess.value = successMessage.value
    } catch (err: unknown) {
        if (err instanceof Error && err.message) {
            submitError.value = err.message
        } else {
            submitError.value = saveErrorMessage.value
        }
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    void loadProfile()
})

onBeforeUnmount(() => {
    revokePreview()
})
</script>

<style scoped lang="scss">
.profile-page {
    @include form-page();
}

.profile-hero {
    @include form-hero(520px);
}

.profile-card {
    @include form-card(920px, clamp(1.75rem, 4vw, 2.5rem), clamp(1.25rem, 3vw, 1.75rem));
    position: relative;
}

.profile-form {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.profile-loading {
    min-height: 240px;
    border-radius: 18px;
    background: var(--input-bg);
    display: grid;
    place-items: center;
    color: var(--muted-text);
    font-weight: 600;
}

.profile-loading__text {
    text-align: center;
}

.profile-layout {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2rem);
    grid-template-columns: minmax(260px, 0.9fr) minmax(0, 1.1fr);
    align-items: start;
}

.profile-photo-panel {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    background: var(--input-bg);
    border: 1px dashed var(--border-soft);
    border-radius: 20px;
    padding: clamp(1.25rem, 3vw, 1.75rem);
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

.profile-fields {
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 3vw, 1.75rem);
}

.profile-preferences {
    display: flex;
    flex-direction: column;
    gap: clamp(0.75rem, 2vw, 1.1rem);
    padding: clamp(1rem, 3vw, 1.5rem);
    border-radius: 18px;
    border: 1px solid var(--border-soft);
    background: var(--input-bg);
}

.profile-preferences__header {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
}

.profile-preferences__header h4 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: var(--color-text);
}

.profile-preferences__header p {
    margin: 0;
    color: var(--muted-text);
    font-size: 0.9rem;
    line-height: 1.5;
}

.profile-preferences__grid {
    @include form-grid(220px, clamp(0.9rem, 2vw, 1.2rem));
}

.form-grid {
    @include form-grid(220px, clamp(1rem, 2vw, 1.25rem));
}

.form-group {
    @include form-group();
}

.profile-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-end;
}

.profile-actions button {
    @include form-primary-button($padding-y: 0.85rem, $padding-x: 2.2rem);
}

.feedback {
    @include form-feedback($text-align: right);

    &.feedback--error {
        @include form-feedback-error();
    }

    &.feedback--success {
        @include form-feedback-success();
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 900px) {
    .profile-layout {
        grid-template-columns: 1fr;
    }

    .profile-photo-wrapper {
        margin-inline: auto;
    }

    .profile-actions {
        align-items: stretch;
    }
}

@media (max-width: 540px) {
    .profile-card {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }

    .profile-photo-panel {
        align-items: center;
    }

    .profile-photo-panel__label {
        align-self: flex-start;
    }

    .profile-photo-hint {
        text-align: center;
    }

    .profile-actions button {
        width: 100%;
    }
}
</style>

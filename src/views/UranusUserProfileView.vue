<template>
    <div class="uranus-main-layout">
        <UranusDashboardHero :title="heroTitle" :subtitle="heroSubtitle" />

        <section class="uranus-card">
            <transition name="fade">
                <p v-if="loadError" class="feedback feedback--error" role="alert">
                    {{ loadError }}
                </p>
            </transition>

            <form class="uranus-form profile-form" @submit.prevent="submitProfile">
                <div v-if="isLoading" class="profile-loading">
                    <span class="profile-loading__text">{{ loadingLabel }}</span>
                </div>

                <div v-else>
                    <UserAvatarUpload :label="photoLabel" :hint="photoHint" :upload-label="uploadLabel"
                        :remove-label="removeLabel" :initials="avatarInitial" :disabled="isSubmitting"
                        @busy-change="handleAvatarBusyChange" @error="handleAvatarError"
                        @clear-feedback="handleAvatarFeedbackClear" @avatar-updated="handleAvatarUpdated" />

                    <div class="profile-fields">
                        <UranusFormRow class="profile-field-row">
                            <UranusTextInput id="profile_display_name" v-model="profile.displayName"
                                :label="t('user_profile_display_name')" required autocomplete="nickname"
                                :disabled="isSubmitting" />
                            <UranusTextInput id="profile_email" v-model="profile.emailAddress" type="email"
                                :label="t('user_profile_email')" required autocomplete="email"
                                :disabled="isSubmitting" />
                        </UranusFormRow>
                        <UranusFormRow class="profile-field-row">
                            <UranusTextInput id="profile_first_name" v-model="profile.firstName"
                                :label="t('user_profile_first_name')" autocomplete="given-name"
                                :disabled="isSubmitting" />
                            <UranusTextInput id="profile_last_name" v-model="profile.lastName"
                                :label="t('user_profile_last_name')" autocomplete="family-name"
                                :disabled="isSubmitting" />
                        </UranusFormRow>
                        <UranusFormRow class="profile-field-row">
                            <UranusTextInput id="profile_username" v-model="profile.username"
                                :label="t('user_profile_username')" />
                        </UranusFormRow>

                        <div class="profile-preferences">
                            <div class="profile-preferences__header">
                                <h4>{{ preferencesHeading }}</h4>
                                <p>{{ preferencesDescription }}</p>
                            </div>
                            <UranusFormRow class="profile-preferences__grid">
                                <UranusFieldLabel id="profile_language" :label="t('language')">
                                    <select id="profile_language" v-model="selectedLocale" class="uranus-select"
                                        :disabled="isSubmitting">
                                        <option v-for="option in localeOptions" :key="option.value"
                                            :value="option.value">
                                            {{ option.label }}
                                        </option>
                                    </select>
                                </UranusFieldLabel>
                                <UranusFieldLabel id="profile_theme" :label="t('settings_theme')">
                                    <select id="profile_theme" v-model="selectedTheme" class="uranus-select"
                                        :disabled="isSubmitting">
                                        <option v-for="option in themeOptions" :key="option.value"
                                            :value="option.value">
                                            {{ t(option.label) }}
                                        </option>
                                    </select>
                                </UranusFieldLabel>
                            </UranusFormRow>
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

                    <button class="uranus-button" type="submit" :disabled="saveDisabled">
                        <span v-if="!isSubmitting">{{ saveButtonLabel }}</span>
                        <span v-else>{{ savingLabel }}</span>
                    </button>
                </div>
            </form>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/store/themeStore.ts'
import { useUserStore } from '@/store/userStore.ts'
import type { ThemeMode } from '@/utils/theme.ts'
import { apiFetch } from '@/api.ts'
import UserAvatarUpload from '@/components/UserAvatarUpload.vue'
import UranusDashboardHero from "@/components/dashboard/UranusDashboardHero.vue"
import UranusTextInput from "@/components/ui/UranusTextInput.vue"
import UranusFormRow from "@/components/ui/UranusFormRow.vue"
import UranusFieldLabel from "@/components/ui/UranusFieldLabel.vue"
import { use } from 'marked'

interface UserProfilePayload {
    user_id?: string | number | null
    display_name?: string | null
    email_address?: string | null
    first_name?: string | null
    last_name?: string | null
    username?: string | null
    locale?: string | null
    theme?: ThemeMode | null
}

const { t, locale } = useI18n({ useScope: 'global' })
const themeStore = useThemeStore()
const userStore = useUserStore()

const isThemeMode = (value: unknown): value is ThemeMode => value === 'light' || value === 'dark'

const profile = reactive({
    displayName: '',
    emailAddress: '',
    firstName: '',
    lastName: '',
    username: ''
})

const isLoading = ref(true)
const isSubmitting = ref(false)
const isAvatarBusy = ref(false)
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

const heroTitle = computed(() => t('user_profile_title'))
const heroSubtitle = computed(() => t('user_profile_subtitle'))
const photoLabel = computed(() => t('user_profile_photo_label'))
const photoHint = computed(() => t('user_profile_photo_hint'))
const uploadLabel = computed(() => t('user_profile_upload'))
const removeLabel = computed(() => t('user_profile_remove_photo'))
const saveButtonLabel = computed(() => t('user_profile_save'))
const successMessage = computed(() => t('user_profile_save_success'))
const saveErrorMessage = computed(() => t('user_profile_save_error'))
const loadErrorMessage = computed(() => t('user_profile_load_error'))
const loadingLabel = computed(() => t('user_profile_loading'))
const validationMessage = computed(() => t('user_profile_validation_error'))
const savingLabel = computed(() => t('form_saving'))
const preferencesHeading = computed(() => t('user_profile_preferences_heading'))
const preferencesDescription = computed(() => t('user_profile_preferences_description'))
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

const avatarInitial = computed(() => {
    const source = (profile.displayName || `${profile.firstName} ${profile.lastName}`).trim()
    if (!source) return '?'
    return source.charAt(0).toUpperCase()
})

const saveDisabled = computed(() => {
    if (isLoading.value || isSubmitting.value || isAvatarBusy.value) return true
    return !profile.displayName.trim() || !profile.emailAddress.trim()
})

const resolveProfileError = (err: unknown): string => {
    if (typeof err === 'object' && err && 'data' in err) {
        const apiErr = err as { data?: { error?: string } }
        if (apiErr.data?.error) {
            return apiErr.data.error
        }
    }

    if (err instanceof Error && err.message) {
        return err.message
    }

    return saveErrorMessage.value
}

const mapResponseToState = (payload: UserProfilePayload | null | undefined) => {
    if (!payload || typeof payload !== 'object') {
        return
    }

    if ('display_name' in payload) {
        profile.displayName = typeof payload.display_name === 'string' ? payload.display_name : ''
    }

    if ('email_address' in payload) {
        profile.emailAddress = typeof payload.email_address === 'string' ? payload.email_address : ''
    }

    if ('first_name' in payload) {
        profile.firstName = typeof payload.first_name === 'string' ? payload.first_name : ''
    }

    if ('last_name' in payload) {
        profile.lastName = typeof payload.last_name === 'string' ? payload.last_name : ''
    }

    if ('username' in payload) {
        profile.username = typeof payload.username === 'string' ? payload.username : ''
    }

    const userIdValue = payload.user_id
    if ((typeof userIdValue === 'string' || typeof userIdValue === 'number') && userIdValue !== '') {
        userStore.setUserId(String(userIdValue))
    }

    if (typeof payload.display_name === 'string') {
        userStore.setDisplayName(payload.display_name)
    }

    if (typeof payload.locale === 'string' && payload.locale.trim()) {
        locale.value = payload.locale
    }

    if (typeof payload.theme === 'string' && isThemeMode(payload.theme)) {
        themeStore.setTheme(payload.theme)
    }
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

    if (!profile.displayName.trim() || !profile.emailAddress.trim()) {
        submitError.value = validationMessage.value
        return
    }

    if (isAvatarBusy.value) {
        return
    }

    isSubmitting.value = true

    const trimmedEmail = profile.emailAddress.trim()

    const payload = {
        display_name: profile.displayName.trim(),
        email_address: trimmedEmail,
        first_name: profile.firstName.trim() || null,
        last_name: profile.lastName.trim() || null,
        username: profile.username.trim() || null,
        locale: selectedLocale.value,
        theme: selectedTheme.value,
    }

    try {
        const { data } = await apiFetch<UserProfilePayload>('/api/admin/user/me', {
            method: 'PUT',
            body: JSON.stringify(payload),
        })

        mapResponseToState(data)
        userStore.setDisplayName(payload.display_name)
        submitSuccess.value = successMessage.value
    } catch (err: unknown) {
        submitError.value = resolveProfileError(err)
    } finally {
        isSubmitting.value = false
    }
}

onMounted(() => {
    void loadProfile()
})

const handleAvatarBusyChange = (value: boolean) => {
    isAvatarBusy.value = value
}

const handleAvatarError = (message: string | null) => {
    if (message) {
        submitError.value = message
        submitSuccess.value = null
    }
}

const handleAvatarFeedbackClear = () => {
    submitError.value = null
    submitSuccess.value = null
}

const handleAvatarUpdated = () => {
    userStore.bumpAvatarVersion()
}
</script>

<style scoped lang="scss">
.profile-form {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.profile-loading {
    min-height: 240px;
    border-radius: 18px;
    background: var(--surface-primary, var(--input-bg));
    display: grid;
    place-items: center;
    color: var(--uranus-muted-text);
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

.profile-fields {
    display: flex;
    flex-direction: column;
    gap: var(--uranus-grid-gap);
}

.profile-field-row {
    gap: var(--uranus-grid-gap);
}

.profile-preferences {
    display: flex;
    flex-direction: column;
    gap: clamp(0.75rem, 2vw, 1.1rem);
    padding: clamp(1rem, 3vw, 1.5rem);
    border-radius: 18px;
    border: 1px solid var(--border-soft);
    background: var(--surface-primary, var(--input-bg));
    margin-top: clamp(0.5rem, 2vw, 0.75rem);
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
}

.profile-preferences__header p {
    margin: 0;
    color: var(--uranus-muted-text);
    font-size: 0.9rem;
    line-height: 1.5;
}

.profile-preferences__grid {
    gap: clamp(0.9rem, 2vw, 1.2rem);
}

.profile-preferences__grid .uranus-label {
    flex: 1;
}

.profile-preferences__grid select {
    width: 100%;
}

.profile-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-end;
}

.profile-actions .uranus-button {
    min-width: 200px;
}

.feedback {
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

    .profile-actions {
        align-items: stretch;
    }
}

@media (max-width: 540px) {
    .profile-actions .uranus-button {
        width: 100%;
    }
}
</style>

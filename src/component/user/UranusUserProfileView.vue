<!--
  src/view/UranusUserProfileView.vue

  2026-03-25
-->

<template>
  <div class="uranus-main-layout" style="max-width: var(--uranus-compact-card-width);">
    <UranusDashboardHero
        :title="t('user_profile_title')"
        :subtitle="t('user_profile_subtitle')"
    />

    <UranusCard>
      <UranusFeedback :message="loadError" type="error" />

      <UranusForm @submit.prevent="submitProfile">
        <UserAvatarUpload
            :hint="t('user_profile_photo_hint')"
            :upload-label="t('user_profile_upload')"
            :remove-label="t('user_profile_remove_photo')"
            :initials="avatarInitial"
            :disabled="isSubmitting"
            @busy-change="handleAvatarBusyChange"
            @error="handleAvatarError"
            @clear-feedback="handleAvatarFeedbackClear"
            @avatar-updated="handleAvatarUpdated"
          />

        <div class="profile-fields">
          <UranusFormRow :cols="2">
            <UranusTextfield
                id="profile_display_name"
                v-model="profile.displayName"
                :label="t('user_profile_display_name')"
                required autocomplete="nickname"
                :disabled="isSubmitting"
            />
            <UranusTextfield
                id="profile_email"
                v-model="profile.email"
                type="email"
                :label="t('user_profile_email')"
                required autocomplete="email"
                :disabled="isSubmitting"
            />
          </UranusFormRow>

          <UranusFormRow :cols="2">
            <UranusTextfield
                id="profile_first_name"
                v-model="profile.firstName"
                :label="t('user_profile_first_name')"
                autocomplete="given-name"
                :disabled="isSubmitting"
            />
            <UranusTextfield
                id="profile_last_name"
                v-model="profile.lastName"
               :label="t('user_profile_last_name')"
                autocomplete="family-name"
                :disabled="isSubmitting"
            />
          </UranusFormRow>

          <UranusFormRow :cols="2">
            <UranusTextfield
                id="profile_username"
                v-model="profile.username"
                :label="t('user_profile_username')"
            />
          </UranusFormRow>

          <UranusFormRow :cols="2">
            <UranusLabel id="profile_language" :label="t('language')">
              <select id="profile_language" v-model="selectedLocale" class="uranus-admin-select"
                :disabled="isSubmitting">
                <option v-for="option in localeOptions" :key="option.value"
                  :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </UranusLabel>

            <UranusLabel id="profile_theme" :label="t('settings_theme')">
              <select id="profile_theme" v-model="selectedTheme" class="uranus-admin-select"
                :disabled="isSubmitting">
                <option v-for="option in themeOptions" :key="option.value"
                :value="option.value">
                  {{ t(option.label) }}
                </option>
              </select>
            </UranusLabel>
          </UranusFormRow>
        </div>

        <UranusFeedback :message="submitError" type="error" />
        <UranusFeedback :message="submitSuccess" type="success" />

        <div class="uranus-form-action-bar">
          <UranusButton
              type="submit" :disabled="saveDisabled">
              <span v-if="!isSubmitting">{{ t('user_profile_save') }}</span>
              <span v-else>{{ t('form_saving') }}</span>
          </UranusButton>
        </div>
      </UranusForm>
    </UranusCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/store/uranusThemeStore.ts'
import { useUserStore } from '@/store/uranusUserStore.ts'
import type { ThemeMode } from '@/util/theme.ts'
import { apiFetch } from '@/api.ts'
import UserAvatarUpload from '@/component/UserAvatarUpload.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusForm from "@/component/ui/UranusForm.vue";
import UranusTextfield from "@/component/ui/UranusTextfield.vue";
import UranusButton from "@/component/ui/UranusButton.vue";

interface UserProfilePayload {
  user_uuid?: string | null
  email?: string | null
  username?: string | null
  display_name?: string | null
  first_name?: string | null
  last_name?: string | null
  locale?: string | null
  theme?: ThemeMode | null
}

const { t, locale } = useI18n({ useScope: 'global' })
const themeStore = useThemeStore()
const userStore = useUserStore()

const isThemeMode = (value: unknown): value is ThemeMode => value === 'light' || value === 'dark'

const profile = reactive({
  displayName: '',
  email: '',
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

const selectedLocale = computed({
  get: () => locale.value,
  set: (value: string) => { locale.value = value },
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
  return !profile.displayName.trim() || !profile.email.trim()
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

  return t('user_profile_save_error')
}

const mapResponseToState = (payload: UserProfilePayload | null | undefined) => {
  if (!payload || typeof payload !== 'object') {
    return
  }

  if ('display_name' in payload) {
    profile.displayName = typeof payload.display_name === 'string' ? payload.display_name : ''
  }

  if ('email' in payload) {
    profile.email = typeof payload.email === 'string' ? payload.email : ''
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
    const { response } = await apiFetch<any>('/api/admin/user/profile')
    mapResponseToState(response.data as UserProfilePayload)
  } catch (err: unknown) {
    if (err instanceof Error && err.message) {
      loadError.value = err.message
    } else {
      loadError.value = t('user_profile_load_error')
    }
  } finally {
    isLoading.value = false
  }
}

const submitProfile = async () => {
  submitError.value = null
  submitSuccess.value = null

  if (!profile.displayName.trim() || !profile.email.trim()) {
    submitError.value = t('user_profile_validation_error')
    return
  }

  if (isAvatarBusy.value) {
    return
  }

  isSubmitting.value = true

  const trimmedEmail = profile.email.trim()

  const payload = {
    email: trimmedEmail,
    username: profile.username.trim() || null,
    display_name: profile.displayName.trim(),
    first_name: profile.firstName.trim() || null,
    last_name: profile.lastName.trim() || null,
    locale: selectedLocale.value,
    theme: selectedTheme.value,
  }

  try {
    const { response } = await apiFetch<any>('/api/admin/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    mapResponseToState(response.data as UserProfilePayload)
    userStore.setDisplayName(payload.display_name)
    submitSuccess.value = t('user_profile_save_success')
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

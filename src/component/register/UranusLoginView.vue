<template>
  <div class="auth-page">
    <UranusCard style="width: 400px;">
      <h1>{{ t('login') }}</h1>
      <p>{{ loginSubtitle }}</p>

      <UranusForm @submit.prevent="login" aria-busy="isSubmitting" novalidate>
        <UranusTextfield
            id="login-email"
            v-model="email"
            type="email"
            required
            :label="t('email')"
            :error="fieldErrors.email ?? ''"
        />
        <UranusPasswordInput
            id="login-password"
            v-model="password"
            required
            :label="t('password')"
            :error="fieldErrors.password"
        />

        <div class="forgot-password-link">
          <router-link to="/app/forgot-password">{{ t('forgot_password') }}</router-link>
        </div>

        <transition name="fade">
          <p v-if="displayError" class="feedback feedback--error" role="alert" aria-live="assertive">
            {{ displayError }}
          </p>
        </transition>

        <div class="form-actions">
          <UranusButton
              type="submit" :disabled="isSubmitting">
            <template v-if="!isSubmitting">{{ t('login_cta') }}</template>
            <template v-else>{{ t('login_loading') }}</template>
          </UranusButton>
        </div>

      </UranusForm>

      <footer class="auth-footer">
        <span>{{ t('need_account') }}</span>
        <router-link to="/app/signup">{{ t('signup') }}</router-link>
      </footer>

    </UranusCard>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch, type LoginResponse } from '@/api.ts'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { useUserStore } from '@/store/uranusUserStore.ts'
import { useThemeStore } from '@/store/uranusThemeStore.ts'
import UranusPasswordInput from '@/component/ui/UranusPasswordInput.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusButton from '@/component/ui/UranusButton.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const tokenStore = useTokenStore()
const userStore = useUserStore()
const themeStore = useThemeStore()
const { locale } = useI18n({ useScope: 'global' })
const selectedLocale = computed({
  get: () => locale.value,
  set: (value: string) => {
    locale.value = value
  },
})
const email = ref('')
const password = ref('')
const error = ref<string | null>(null)
const isSubmitting = ref(false)
const fieldErrors = reactive({
  email: undefined as string | undefined,
  password: undefined as string | undefined,
})
const loginSubtitle = computed(() => t('login_subtitle'))
const displayError = computed(() => {
  if (fieldErrors.email) return fieldErrors.email
  if (fieldErrors.password) return fieldErrors.password
  return error.value
})
const isValidEmail = (value: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value)
}
const requiredFieldMessage = computed(() => t('required_field'))
const invalidEmailMessage = computed(() => t('organization_form_invalid_email'))
watch(email, (value) => {
  if (fieldErrors.email && value.trim()) {
    const trimmed = value.trim()
    if (isValidEmail(trimmed)) {
      fieldErrors.email = undefined
      if (error.value === fieldErrors.email) {
        error.value = null
      }
    }
  }
})
watch(password, (value) => {
  if (fieldErrors.password && value.trim()) {
    fieldErrors.password = undefined
    if (error.value === fieldErrors.password) {
      error.value = null
    }
  }
})
const login = async () => {
  error.value = null
  fieldErrors.email = undefined
  fieldErrors.password = undefined
  const trimmedEmail = email.value.trim()
  const trimmedPassword = password.value.trim()
  // Validate email
  if (!trimmedEmail) {
    fieldErrors.email = requiredFieldMessage.value
    return
  }
  if (!isValidEmail(trimmedEmail)) {
    fieldErrors.email = invalidEmailMessage.value
    return
  }
  // Validate password
  if (!trimmedPassword) {
    fieldErrors.password = requiredFieldMessage.value
    return
  }
  isSubmitting.value = true
  try {
    const { response, status } = await apiFetch<any>('/api/login', {
      method: 'POST',
      body: JSON.stringify({
        email: trimmedEmail,
        password: trimmedPassword,
      }),
    })

    const payload: LoginResponse = response.data
    if (status === 200 && payload.access_token && payload.refresh_token) {
      tokenStore.setTokens(payload.access_token, payload.refresh_token)
      userStore.setUserUuid(payload.user_uuid)
      userStore.setDisplayName(payload.display_name ?? '')
      if (payload.locale) selectedLocale.value = payload.locale
      if (payload.theme) themeStore.setTheme(payload.theme)
      router.replace(typeof route.query.redirect === 'string' ? route.query.redirect : '/')
    } else {
      error.value = t('invalid_credentials')
    }
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || t('login_failed')
    } else {
      error.value = t('login_failed')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
<style scoped lang="scss">
.auth-page {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.forgot-password-link {
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  text-align: right;
  a {
    font-size: 0.875rem;
    color: var(--color-link);
    text-decoration: none;
    &:hover,
    &:focus {
      text-decoration: underline;
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

.auth-footer {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: var(--uranus-muted-text);
  margin-top: 1.5rem;
  a {
    font-weight: 600;
    color: var(--accent-primary);
    transition: color 0.2s ease;
    &:hover {
      color: var(--accent-secondary);
    }
  }
}
</style>

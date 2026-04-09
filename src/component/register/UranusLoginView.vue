<template>
  <div class="auth-page">
    <UranusCard style="width: 400px;">
      <h1>{{ t('login_title') }}</h1>
      <p>{{ t('login_subtitle') }}</p>

      <UranusForm @submit.prevent="login" novalidate>
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

        <UranusFeedback :show="!!displayErrorFeedback" type="error">
          {{ displayErrorFeedback }}
        </UranusFeedback>

        <UranusFormActions>
          <UranusButton type="submit" :disabled="isSubmitting">{{ t('login') }}</UranusButton>
        </UranusFormActions>

      </UranusForm>

      <footer class="auth-footer">
        <div class="auth-footer-row">
          <router-link to="/page/terms">{{ t('terms_read') }}</router-link>
        </div>
        <div class="auth-footer-row">
          <span>{{ t('need_account') }}</span>
          <router-link to="/app/signup">{{ t('signup') }}</router-link>
        </div>
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
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'

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

const displayErrorFeedback = computed<string | null>(() => {
  if (fieldErrors.email || fieldErrors.password) return t('input_required_notice')
  return error.value ?? null
})


const isValidEmail = (value: string) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value)
}

const requiredFieldMessage = computed(() => t('input_required'))
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
    const apiPath = '/api/login'
    const apiResponse = await apiFetch<any>(apiPath, {
      method: 'POST',
      body: JSON.stringify({
        email: trimmedEmail,
        password: trimmedPassword,
      }),
    })

    const payload: LoginResponse = apiResponse.data
    if (apiResponse.status === 200 && payload.access_token && payload.refresh_token) {
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
      error.value = e.data?.error ?? t('login_failed')
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
  font-size: 0.9rem;
}

.auth-footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.5rem;
  color: var(--uranus-color-4);
  margin-top: 1.5rem;
}

.auth-footer-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

</style>

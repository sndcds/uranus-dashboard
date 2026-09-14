<template>
  <UranusBasicCardPage>
    <UranusCard class="uranus-card-narrow">
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

        <UranusFeedback v-if="!!displayErrorFeedback" type="error">
          {{ displayErrorFeedback }}
        </UranusFeedback>

        <UranusFeedback v-if="tokenStore.sessionError" type="error">
          {{ t(`auth_session_${tokenStore.sessionError}`) }}
          <UranusButton type="button" variant="tertiary" :disabled="tokenStore.isRestoring" @click="retrySession">
            {{ t('retry') }}
          </UranusButton>
        </UranusFeedback>

        <UranusFormActions>
          <UranusButton type="submit" :disabled="isSubmitting || tokenStore.isLoggingOut">{{ t('login') }}</UranusButton>
        </UranusFormActions>

      </UranusForm>

      <UranusCardFooter>
        <div class="footer-row">
          <router-link to="/page/terms">{{ t('terms_read') }}</router-link>
        </div>
        <div class="footer-row">
          <span>{{ t('need_account') }}</span>
          <router-link to="/app/signup">{{ t('signup') }}</router-link>
        </div>
      </UranusCardFooter>

    </UranusCard>

  </UranusBasicCardPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ApiError } from '@/api/apiError.ts'
import { SessionError } from '@/api/authSession.ts'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { useThemeStore } from '@/store/themeStore.ts'
import UranusPasswordInput from '@/component/ui/UranusPasswordInput.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusBasicCardPage from '@/component/layout/UranusBasicCardPage.vue'
import UranusCardFooter from '@/component/layout/UranusCardFooter.vue'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const tokenStore = useTokenStore()
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
    if (isValidEmail(value.trim())) {
      fieldErrors.email = undefined
    }
  }
})

watch(password, () => {
  if (fieldErrors.password) {
    fieldErrors.password = undefined
  }
})

const goAfterLogin = () => {
  const redirect = route.query.redirect
  return router.replace(typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect : '/page/about')
}

const retrySession = async () => {
  try {
    if (await tokenStore.restoreSession()) await goAfterLogin()
  } catch { /* The store exposes a localized retry message. */ }
}

const login = async () => {
  if (isSubmitting.value || tokenStore.isLoggingOut) return
  error.value = null
  fieldErrors.email = undefined
  fieldErrors.password = undefined

  const normalizedEmail = email.value.trim()

  // Validate email
  if (!normalizedEmail) {
    fieldErrors.email = requiredFieldMessage.value
    return
  }

  if (!isValidEmail(normalizedEmail)) {
    fieldErrors.email = invalidEmailMessage.value
    return
  }

  // Validate password — never trim or normalize passwords
  if (!password.value) {
    fieldErrors.password = requiredFieldMessage.value
    return
  }

  isSubmitting.value = true

  try {
    const profile = await tokenStore.login(normalizedEmail, password.value)
    password.value = ''
    if (profile.locale) selectedLocale.value = profile.locale
    if (profile.theme) themeStore.setTheme(profile.theme)
    await goAfterLogin()
  } catch (err: unknown) {
    error.value = err instanceof SessionError
      ? t(`auth_session_${err.reason}`)
      : t(err instanceof ApiError && err.status === 401 ? 'invalid_credentials' : 'login_failed')
  } finally {
    isSubmitting.value = false
  }
}

</script>
<style scoped lang="scss">

.forgot-password-link {
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  text-align: right;
  font-size: 0.9rem;
}

.footer-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
</style>

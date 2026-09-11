<!--
  src/component/register/UranusSignupView.vue
-->

<template>
  <UranusBasicCardPage>
    <UranusCard v-if="!signupSuccess" class="uranus-card-narrow">
      <h1>{{ t('signup') }}</h1>
      <p>{{ signupSubtitle }}</p>

      <UranusForm @submit.prevent="signup" :aria-busy="isSubmitting" novalidate>
        <UranusTextfield
            id="signup-email"
            v-model="email"
            type="email"
            :label="t('email')"
            :error="fieldErrors.email ?? ''"
            required
        />

        <UranusTextfield
            id="signup-repeat-email"
            v-model="repeatEmail"
            type="email"
            :label="t('repeat_email')"
            :error="fieldErrors.repeatEmail ?? ''"
            required
        />

        <UranusPasswordInput
            id="signup-password"
            :label="t('password')"
            v-model="password"
            :required="true"
            :error="fieldErrors.password"
            size="normal"
            flex="1"
            autocomplete="new-password"
        />

        <p>{{ t('password_rules') }}</p>

        <UranusFeedback v-if="!!error" type="error">
          {{ error }}
        </UranusFeedback>

        <UranusFormActions>
          <UranusButton type="submit" :disabled="isSubmitting">
            <span v-if="!isSubmitting">{{ t('signup') }}</span>
            <span v-else>{{ t('signup_loading') }}</span>
          </UranusButton>
        </UranusFormActions>
      </UranusForm>

      <UranusCardFooter>
        <div class="footer-row">
          <router-link to="/page/terms">{{ t('terms_read') }}</router-link>
        </div>
        <div class="footer-row">
          <span>{{ t('have_account') }}</span>
          <router-link to="/app/login">{{ t('login') }}</router-link>
        </div>
      </UranusCardFooter>

    </UranusCard>

    <UranusCard v-else class="card">
      <h1>{{ t('signup_success_title')}}</h1>
      <p>{{ t('signup_success_message')}}</p>
    </UranusCard>
  </UranusBasicCardPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useTokenStore } from '@/store/uranusTokenStore.ts'

import UranusPasswordInput from '@/component/ui/UranusPasswordInput.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusCardFooter from '@/component/layout/UranusCardFooter.vue'
import UranusBasicCardPage from '@/component/layout/UranusBasicCardPage.vue'

interface SignupResponse {
  data?: unknown
  message?: string
}

const { t, te, locale } = useI18n()
const tokenStore = useTokenStore()

const signupSuccess = ref(false)
const email = ref('')
const repeatEmail = ref('')
const password = ref('')

const isSubmitting = ref(false)
const error = ref<string | null>(null)

const fieldErrors = reactive<{
  email: string | null
  repeatEmail: string | null
  password: string | null
}>({
  email: null,
  repeatEmail: null,
  password: null,
})


const signupSubtitle = computed(() => (te('signup_subtitle') ? t('signup_subtitle') : 'Create a new organization account to get started.'))

const requiredFieldMessage = computed(() => t('required_field'))

const invalidEmailMessage = computed(() => t('invalid_email'))

const emailsDoNotMatchMessage = computed(() => t('emails_do_not_match'))

const isValidEmail = (value: string): boolean => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(value)
}

const clearFieldError = (
    field: keyof typeof fieldErrors,
): void => {
  fieldErrors[field] = null
  error.value = null
}

const resetForm = (): void => {
  email.value = ''
  repeatEmail.value = ''
  password.value = ''

  fieldErrors.email = null
  fieldErrors.repeatEmail = null
  fieldErrors.password = null

  error.value = null
}

watch(email, (value) => {
  if (!fieldErrors.email) {
    return
  }

  const normalizedEmail = value.trim()

  if (normalizedEmail && isValidEmail(normalizedEmail)) {
    clearFieldError('email')
  }
})

watch(repeatEmail, (value) => {
  if (!fieldErrors.repeatEmail) {
    return
  }

  const normalizedEmail = email.value.trim().toLowerCase()
  const normalizedRepeatEmail = value.trim().toLowerCase()

  if (
      normalizedRepeatEmail &&
      isValidEmail(normalizedRepeatEmail) &&
      normalizedEmail === normalizedRepeatEmail
  ) {
    clearFieldError('repeatEmail')
  }
})

watch(password, (value) => {
  if (!fieldErrors.password) {
    return
  }

  /*
   * IMPORTANT:
   *
   * Do not use value.trim() here.
   *
   * Whitespace is a valid part of a password and must not be
   * silently removed or otherwise modified.
   */
  if (value.length > 0) {
    clearFieldError('password')
  }
})

const signup = async (): Promise<void> => {
  error.value = null

  fieldErrors.email = null
  fieldErrors.repeatEmail = null
  fieldErrors.password = null

  /*
   * Email addresses may be normalized by removing accidental
   * surrounding whitespace.
   *
   * Passwords must NEVER be trimmed or otherwise modified.
   */
  const normalizedEmail = email.value.trim()
  const normalizedRepeatEmail = repeatEmail.value.trim()

  const passwordValue = password.value

  // ------------------------------------------------------------
  // Validate email
  // ------------------------------------------------------------

  if (!normalizedEmail) {
    fieldErrors.email = requiredFieldMessage.value
    return
  }

  if (!isValidEmail(normalizedEmail)) {
    fieldErrors.email = invalidEmailMessage.value
    return
  }

  // ------------------------------------------------------------
  // Validate repeated email
  // ------------------------------------------------------------

  if (!normalizedRepeatEmail) {
    fieldErrors.repeatEmail = requiredFieldMessage.value
    return
  }

  if (!isValidEmail(normalizedRepeatEmail)) {
    fieldErrors.repeatEmail = invalidEmailMessage.value
    return
  }

  if (
      normalizedEmail.toLowerCase() !==
      normalizedRepeatEmail.toLowerCase()
  ) {
    fieldErrors.repeatEmail = emailsDoNotMatchMessage.value
    return
  }

  // ------------------------------------------------------------
  // Validate password
  // ------------------------------------------------------------

  /*
   * Do NOT use:
   *
   *     password.value.trim()
   *
   * A password containing leading/trailing whitespace is a valid
   * password. The exact value entered by the user must be sent to
   * the server.
   */
  if (!passwordValue) {
    fieldErrors.password = requiredFieldMessage.value
    return
  }

  // ------------------------------------------------------------
  // Submit
  // ------------------------------------------------------------

  isSubmitting.value = true

  try {
    await apiFetch<SignupResponse | null>(
        `/api/signup?lang=${encodeURIComponent(locale.value)}`,
        {
          method: 'POST',
          body: JSON.stringify({
            email: normalizedEmail,

            // IMPORTANT:
            // Send the password exactly as entered.
            password: passwordValue,

            referer: window.location.origin,
          }),
        },
    )

    resetForm()
    tokenStore.markKnownAccount()
    signupSuccess.value = true
  } catch (err: unknown) {
    /*
     * Keep the password untouched. In particular, do not
     * normalize or trim it in error handling.
     */

    if (
        err &&
        typeof err === 'object' &&
        'data' in err
    ) {
      const apiError = err as {
        data?: {
          message?: string
          error?: string
        }
      }

      error.value =
          apiError.data?.message ??
          apiError.data?.error ??
          t('signup_failed')
    } else {
      error.value = t('signup_failed')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">
.footer-row {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
</style>

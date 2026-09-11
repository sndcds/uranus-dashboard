<template>
  <UranusBasicCardPage>
    <UranusCard class="uranus-card-narrow">
      <h1>{{ t('reset_password_title') }}</h1>
      <p>{{ t('reset_password_subtitle') }}</p>

      <UranusForm
          @submit.prevent="handleSubmit"
          :aria-busy="isSubmitting"
          novalidate
      >
        <UranusPasswordInput
            id="new-password"
            v-model="password"
            required
            :label="t('new_password')"
            :error="fieldErrors.password"
        />

        <UranusPasswordInput
            id="confirm-password"
            v-model="confirmPassword"
            required
            :label="t('confirm_password')"
            :error="fieldErrors.confirmPassword"
        />

        <p>{{ t('password_rules') }}</p>

        <UranusFeedback
            v-if="displayError"
            type="error"
        >
          {{ displayError }}
        </UranusFeedback>

        <UranusFeedback
            v-if="success"
            type="success"
        >
          {{ success }}
        </UranusFeedback>

        <UranusFormActions>
          <UranusButton
              type="submit"
              :disabled="isSubmitting"
          >
            <span v-if="!isSubmitting">
              {{ t('reset_password_submit') }}
            </span>
            <span v-else>
              {{ t('reset_password_submitting') }}
            </span>
          </UranusButton>
        </UranusFormActions>
      </UranusForm>

      <UranusCardFooter>
        <router-link to="/app/login">
          {{ t('back_to_login') }}
        </router-link>
      </UranusCardFooter>
    </UranusCard>
  </UranusBasicCardPage>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api.ts'

import UranusBasicCardPage from '@/component/layout/UranusBasicCardPage.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusCardFooter from '@/component/layout/UranusCardFooter.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusPasswordInput from '@/component/ui/UranusPasswordInput.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')

const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)

const fieldErrors = reactive({
  password: null as string | null,
  confirmPassword: null as string | null,
})

const displayError = computed(() => {
  if (fieldErrors.password) {
    return fieldErrors.password
  }

  if (fieldErrors.confirmPassword) {
    return fieldErrors.confirmPassword
  }

  return error.value
})

const requiredFieldMessage = computed(
    () => t('input_required') || 'This field is required'
)

const passwordMismatchMessage = computed(
    () => t('reset_password_mismatch') || 'Passwords do not match'
)

/**
 * Get the password-reset token from the route.
 *
 * Trimming the token is intentional here. The token is not a password
 * and whitespace introduced by URL handling should not be significant.
 */
const getTokenFromRoute = (): string => {
  const tokenParam = route.query.token ?? route.params.token

  if (Array.isArray(tokenParam)) {
    return typeof tokenParam[0] === 'string'
        ? tokenParam[0].trim()
        : ''
  }

  return typeof tokenParam === 'string'
      ? tokenParam.trim()
      : ''
}

/**
 * Clear a password field error as soon as the user enters something.
 *
 * IMPORTANT:
 * Do not trim or otherwise modify the password.
 */
watch(password, (value) => {
  if (fieldErrors.password && value.length > 0) {
    fieldErrors.password = null
  }

  if (error.value) {
    error.value = null
  }
})

/**
 * Clear the confirmation-field error when the user corrects it.
 *
 * The actual password values are compared exactly as entered.
 */
watch(confirmPassword, (value) => {
  if (
      fieldErrors.confirmPassword &&
      value.length > 0 &&
      value === password.value
  ) {
    fieldErrors.confirmPassword = null
  }

  if (error.value) {
    error.value = null
  }
})

const handleSubmit = async () => {
  if (isSubmitting.value) {
    return
  }

  error.value = null
  success.value = null
  fieldErrors.password = null
  fieldErrors.confirmPassword = null

  /*
   * Do NOT trim passwords.
   *
   * Passwords are opaque user input. Leading/trailing whitespace,
   * Unicode characters, etc. are part of the password.
   */

  // Validate password.
  if (!password.value) {
    fieldErrors.password = requiredFieldMessage.value
    return
  }

  // Validate confirmation password.
  if (!confirmPassword.value) {
    fieldErrors.confirmPassword = requiredFieldMessage.value
    return
  }

  // Compare the passwords exactly as entered.
  if (password.value !== confirmPassword.value) {
    fieldErrors.confirmPassword = passwordMismatchMessage.value
    return
  }

  const token = getTokenFromRoute()

  if (!token) {
    error.value = t('reset_password_missing_token')
    return
  }

  isSubmitting.value = true

  try {
    await apiFetch('/api/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token,
        new_password: password.value,
      }),
    })

    success.value = t('reset_password_success')

    // Clear password values after successful reset.
    password.value = ''
    confirmPassword.value = ''

    fieldErrors.password = null
    fieldErrors.confirmPassword = null

    setTimeout(() => {
      router.push('/app/login')
    }, 2000)
  } catch (err: any) {
    if (err?.error?.includes('(#1)')) {
      error.value = t(
          'password__doesnt_meet_security_requirements'
      )
    } else {
      error.value = t('signup_failed')
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
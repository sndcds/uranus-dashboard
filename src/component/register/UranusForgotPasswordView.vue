<template>
  <UranusBasicCardPage>
    <UranusCard class="uranus-card-narrow">
      <h1>{{ t('reset_password') }}</h1>
      <p>{{ t('reset_password_how_to') }}</p>

      <UranusForm @submit.prevent="requestReset" :aria-busy="isSubmitting" novalidate>
        <UranusTextfield
            id="forgot-email"
            v-model="email"
            type="email"
            :label="t('email')"
            autocomplete="email"
            required
            :error="displayError('email') ?? ''"
            @input="handleInput" />

        <UranusFeedback :show="!!error" type="error">
          {{ error }}
        </UranusFeedback>

        <UranusFeedback :show="!!success" type="success">
          {{ success }}
        </UranusFeedback>

        <UranusFormActions>
          <UranusButton :disabled="isSubmitting" type="submit">
            <span v-if="!isSubmitting">{{ t('forgot_password_submit') }}</span>
            <span v-else>{{ t('forgot_password_sending') }}</span>
          </UranusButton>
        </UranusFormActions>
      </UranusForm>

      <UranusCardFooter>
        <router-link to="/app/login">{{ t('back_to_login') }}</router-link>
      </UranusCardFooter>
    </UranusCard>
  </UranusBasicCardPage>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import UranusTextfield from '@/component/ui/UranusTextfield.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusForm from '@/component/ui/UranusForm.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusBasicCardPage from '@/component/layout/UranusBasicCardPage.vue'
import UranusCardFooter from '@/component/layout/UranusCardFooter.vue'
import UranusFeedback from "@/component/uranus/UranusFeedback.vue";

const { t, locale } = useI18n()

const email = ref('')
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)
const errorMessageId = 'forgot-password-error'
const successMessageId = 'forgot-password-success'

const fieldErrors = reactive({
    email: null as string | null,
})

const displayError = (field: 'email') => {
    return fieldErrors[field] || null
}

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Watch email for validation
watch(email, (newEmail) => {
    if (newEmail.trim() && emailRegex.test(newEmail.trim())) {
        fieldErrors.email = null
    }
})

const handleInput = () => {
    // Clear global error when user starts typing
    if (error.value) {
        error.value = null
    }
}

const requestReset = async () => {
  if (isSubmitting.value) {
    return
  }

  // Clear previous errors
  error.value = null
  success.value = null
  fieldErrors.email = null

  // Validate email
  if (!email.value.trim()) {
    fieldErrors.email = t('email_required')
    return
  }

  if (!emailRegex.test(email.value.trim())) {
    fieldErrors.email = t('email_invalid', 'Please enter a valid email address')
    return
  }

  isSubmitting.value = true

  try {
    const apiPath = `/api/forgot-password?lang=${locale.value}`
    const apiResponse = await apiFetch(apiPath, {
      method: 'POST',
      body: JSON.stringify({
        email: email.value.trim(),
      }),
    })

    if (apiResponse.status >= 200 && apiResponse.status < 300) {
      success.value = t('forgot_password_success')
      fieldErrors.email = null
    } else {
      error.value = t('forgot_password_error')
    }
  } catch (err: unknown) {
    error.value = t('forgot_password_error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped lang="scss">

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5rem;
}

</style>

<template>
  <UranusBasicCardPage>
    <UranusCard class="uranus-card-narrow">
      <h1>{{ t('reset_password_title') }}</h1>
      <p>{{ t('reset_password_subtitle') }}</p>

      <UranusForm @submit.prevent="handleSubmit" :aria-busy="isSubmitting" novalidate>
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

        <UranusFeedback :show="!!displayError" type="error">
          {{ displayError }}
        </UranusFeedback>
        <UranusFeedback :show="!!success" type="success">
          {{ success }}
        </UranusFeedback>

        <UranusFormActions>
          <UranusButton type="submit" :disabled="isSubmitting">
            <span v-if="!isSubmitting">{{ t('reset_password_submit') }}</span>
            <span v-else>{{ t('reset_password_submitting') }}</span>
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
    if (fieldErrors.password) return fieldErrors.password
    if (fieldErrors.confirmPassword) return fieldErrors.confirmPassword
    return error.value
})

const getTokenFromRoute = () => {
    const tokenParam = route.query.token ?? route.params.token
    if (Array.isArray(tokenParam)) {
        return tokenParam[0]
    }
    return typeof tokenParam === 'string' ? tokenParam.trim() : ''
}

const requiredFieldMessage = computed(() => t('input_required') || 'This field is required')
const passwordMismatchMessage = computed(() => t('reset_password_mismatch') || 'Passwords do not match')

watch(password, (value) => {
    if (fieldErrors.password && value.trim()) {
        fieldErrors.password = null
        if (error.value === fieldErrors.password) {
            error.value = null
        }
    }
})

watch(confirmPassword, (value) => {
    if (fieldErrors.confirmPassword && value.trim()) {
        const trimmedPassword = password.value.trim()
        const trimmedConfirm = value.trim()
        if (trimmedConfirm && trimmedPassword === trimmedConfirm) {
            fieldErrors.confirmPassword = null
            if (error.value === fieldErrors.confirmPassword) {
                error.value = null
            }
        }
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

    const trimmedPassword = password.value.trim()
    const trimmedConfirm = confirmPassword.value.trim()

    // Validate password
    if (!trimmedPassword) {
        fieldErrors.password = requiredFieldMessage.value
        return
    }

    // Validate confirm password
    if (!trimmedConfirm) {
        fieldErrors.confirmPassword = requiredFieldMessage.value
        return
    }

    // Check if passwords match
    if (trimmedPassword !== trimmedConfirm) {
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
        const { status } = await apiFetch('/api/reset-password', {
            method: 'POST',
            body: JSON.stringify({ token, new_password: trimmedPassword }),
        })

        if (status >= 200 && status < 300) {
            success.value = t('reset_password_success')
            password.value = ''
            confirmPassword.value = ''
            fieldErrors.password = null
            fieldErrors.confirmPassword = null
            setTimeout(() => {
                router.push('/app/login')
            }, 2000)
        } else {
            error.value = t('reset_password_failed', { status })
        }
    } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || t('reset_password_error_generic')
        } else if (err instanceof Error) {
            error.value = err.message || t('reset_password_error_generic')
        } else {
            error.value = t('reset_password_error_generic')
        }
    } finally {
        isSubmitting.value = false
    }
}
</script>

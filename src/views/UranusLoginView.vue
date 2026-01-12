<template>
  <div class="auth-page">
    <div class="uranus-card">
      <header class="auth-header">
        <h1>{{ t('login') }}</h1>
        <p>{{ loginSubtitle }}</p>
      </header>

      <form class="uranus-form" @submit.prevent="login" :aria-busy="isSubmitting" novalidate>
        <UranusTextInput
            v-model="email"
            type="email"
            id="login-email"
            required
            :label="t('email')"
            :error="fieldErrors.email"
        />

        <UranusPasswordInput
            v-model="password"
            id="login-password"
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
          <button class="uranus-secondary-button" type="submit" :disabled="isSubmitting">
            <template v-if="!isSubmitting">{{ t('login_cta') }}</template>
            <template v-else>{{ t('login_loading') }}</template>
          </button>
        </div>
      </form>

      <footer class="auth-footer">
          <span>{{ t('need_account') }}</span>
          <router-link to="/app/signup">{{ t('signup') }}</router-link>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api.ts'
import type { LoginResponse } from '@/api.ts'
import { useTokenStore } from '@/store/tokenStore.ts'
import { useUserStore } from '@/store/userStore.ts'
import { useThemeStore } from '@/store/themeStore.ts'

import UranusTextInput from '@/components/ui/UranusTextInput.vue'
import UranusPasswordInput from "@/components/ui/UranusPasswordInput.vue";
import UranusBlob from "@/components/uranus/UranusBlob.vue";
import UranusDashboardButton from "@/components/dashboard/UranusDashboardButton.vue";

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
const isPasswordVisible = ref(false)
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
        const { data, status } = await apiFetch<LoginResponse>('/api/login', {
            method: 'POST',
            body: JSON.stringify({
              email: trimmedEmail,
              password: trimmedPassword,
            }),
        })

        console.log(JSON.stringify(data, null, 2))
        console.log("status:", status)
        console.log("data.message:", data.message)
        console.log("data.accessToken:", data.access_token)
        console.log("data.refreshToken:", data.refresh_token)

        if (status === 200 && data.message === 'login successful' && data.access_token && data.refresh_token) {
            tokenStore.setTokens(data.access_token, data.refresh_token)
            if (data.user_id) {
                userStore.setUserId(data.user_id)
            }
            if (data.display_name) {
                userStore.setDisplayName(data.display_name)
            }
            if (data.locale) {
                selectedLocale.value = data.locale

            }
            if (data.theme) {
                themeStore.setTheme(data.theme)
            }
            const redirectTarget = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
            router.replace(redirectTarget)
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

.uranus-card {
    width: 100%;
    max-width: 500px;
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


.feedback {
    margin: 0.5rem 0;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.9rem;

    &--error {
        background-color: #fee;
        color: #c00;
        border: 1px solid #fcc;
    }
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

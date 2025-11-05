<template>
    <div class="auth-page">
        <div class="uranus-card">
            <header class="auth-header">
                <h1>{{ t('login') }}</h1>
                <p>{{ loginSubtitle }}</p>
            </header>

            <form class="uranus-form" @submit.prevent="login" :aria-busy="isSubmitting" novalidate>
                <UranusTextInput
                    id="login-email"
                    v-model="email"
                    type="email"
                    :label="t('email')"
                    :error="fieldErrors.email"
                    required
                />

                <UranusPasswordInput
                    id="login-password"
                    label="Password"
                    v-model="password"
                    :required="true"
                    :error="fieldErrors.password"
                    size="normal"
                    flex="1"
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
                    <button class="uranus-button" type="submit" :disabled="isSubmitting">
                        <span v-if="!isSubmitting">{{ t('login_cta') }}</span>
                        <span v-else>{{ t('login_loading') }}</span>
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
import { apiFetch } from '@/api'
import type { LoginResponse } from '@/api'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/userStore'
import { useThemeStore } from '@/store/themeStore'

import UranusTextInput from '@/components/uranus/UranusTextInput.vue'
import UranusPasswordInput from "@/components/uranus/UranusPasswordInput.vue";

const { t, te } = useI18n()
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
    email: null as string | null,
    password: null as string | null,
})

const loginSubtitle = computed(() => (te('login_subtitle') ? t('login_subtitle') : 'Welcome back! Sign in to continue organizing your events.'))

const displayError = computed(() => {
    if (fieldErrors.email) return fieldErrors.email
    if (fieldErrors.password) return fieldErrors.password
    return error.value
})

const isValidEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(value)
}

const requiredFieldMessage = computed(() => (te('event_error_required') ? t('event_error_required') : 'This field is required'))
const invalidEmailMessage = computed(() => (te('organizer_form_invalid_email') ? t('organizer_form_invalid_email') : 'Please provide a valid email address.'))

watch(email, (value) => {
    if (fieldErrors.email && value.trim()) {
        const trimmed = value.trim()
        if (isValidEmail(trimmed)) {
            fieldErrors.email = null
            if (error.value === fieldErrors.email) {
                error.value = null
            }
        }
    }
})

watch(password, (value) => {
    if (fieldErrors.password && value.trim()) {
        fieldErrors.password = null
        if (error.value === fieldErrors.password) {
            error.value = null
        }
    }
})

const login = async () => {
    error.value = null
    fieldErrors.email = null
    fieldErrors.password = null

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
        const { data, status } = await apiFetch<LoginResponse>('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({
                email: trimmedEmail,
                password: trimmedPassword,
            }),
        })

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
            error.value = te('invalid_credentials') ? t('invalid_credentials') : 'Invalid credentials'
        }
    } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || (te('login_failed') ? t('login_failed') : 'Login failed')
        } else {
            error.value = te('login_failed') ? t('login_failed') : 'Login failed'
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
    color: var(--muted-text);
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

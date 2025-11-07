<template>
    <div class="auth-page">
        <div class="uranus-card">
            <header class="auth-header">
                <h1>{{ t('reset_password_title') }}</h1>
                <p>{{ t('reset_password_subtitle') }}</p>
            </header>

            <form class="uranus-form" @submit.prevent="handleSubmit" :aria-busy="isSubmitting" novalidate>
                <UranusFieldLabel
                    id="new-password"
                    :label="t('new_password')"
                    :error="fieldErrors.password"
                    required
                >
                    <div class="input-with-toggle">
                        <input
                            id="new-password"
                            v-model="password"
                            :type="passwordFieldType"
                            autocomplete="new-password"
                            class="uranus-text-input"
                            :aria-required="true"
                            :aria-invalid="fieldErrors.password ? 'true' : 'false'"
                        />
                        <button
                            type="button"
                            class="password-toggle"
                            :aria-label="passwordToggleLabel"
                            :title="passwordToggleLabel"
                            :aria-pressed="isPasswordVisible"
                            @click="togglePasswordVisibility"
                        >
                            <svg v-if="isPasswordVisible" class="password-toggle__icon"
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M12 5c-5.5 0-9.6 4.2-10.9 6.6a1 1 0 000 .8C2.4 15.8 6.5 20 12 20a11 11 0 006.8-2.3l1.1 1.1a1 1 0 101.4-1.4l-18-18A1 1 0 001.9.9l3.2 3.2A11 11 0 0112 5zm0 12c-3.2 0-6.1-2.1-8.1-4.9A13.1 13.1 0 015 9.4l2.1 2.1a4 4 0 005.4 5.4l2 2A9 9 0 0112 17zm0-6a2 2 0 01.3 4l-2.3-2.3A2 2 0 0112 11zm9.6.6a15.5 15.5 0 01-3 3.6 1 1 0 01-1.4-1.4A13.4 13.4 0 0020.3 12a13.6 13.6 0 00-3.8-3.6 1 1 0 111.1-1.7 15.6 15.6 0 013 3.9 1 1 0 01.1.9z" />
                            </svg>
                            <svg v-else class="password-toggle__icon" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M12 5c5.5 0 9.6 4.2 10.9 6.6a1 1 0 010 .8C21.6 15.8 17.5 20 12 20S2.4 15.8 1.1 12.4a1 1 0 010-.8C2.4 9.2 6.5 5 12 5zm0 12c4.1 0 7.5-3.2 8.9-5-1.4-1.8-4.8-5-8.9-5S4.5 10.2 3.1 12c1.4 1.8 4.8 5 8.9 5zm0-9a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                        </button>
                    </div>
                </UranusFieldLabel>

                <UranusFieldLabel
                    id="confirm-password"
                    :label="t('confirm_password')"
                    :error="fieldErrors.confirmPassword"
                    required
                >
                    <div class="input-with-toggle">
                        <input
                            id="confirm-password"
                            v-model="confirmPassword"
                            :type="confirmPasswordFieldType"
                            autocomplete="new-password"
                            class="uranus-text-input"
                            :aria-required="true"
                            :aria-invalid="fieldErrors.confirmPassword ? 'true' : 'false'"
                        />
                        <button
                            type="button"
                            class="password-toggle"
                            :aria-label="confirmPasswordToggleLabel"
                            :title="confirmPasswordToggleLabel"
                            :aria-pressed="isConfirmPasswordVisible"
                            @click="toggleConfirmPasswordVisibility"
                        >
                            <svg v-if="isConfirmPasswordVisible" class="password-toggle__icon"
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M12 5c-5.5 0-9.6 4.2-10.9 6.6a1 1 0 000 .8C2.4 15.8 6.5 20 12 20a11 11 0 006.8-2.3l1.1 1.1a1 1 0 101.4-1.4l-18-18A1 1 0 001.9.9l3.2 3.2A11 11 0 0112 5zm0 12c-3.2 0-6.1-2.1-8.1-4.9A13.1 13.1 0 015 9.4l2.1 2.1a4 4 0 005.4 5.4l2 2A9 9 0 0112 17zm0-6a2 2 0 01.3 4l-2.3-2.3A2 2 0 0112 11zm9.6.6a15.5 15.5 0 01-3 3.6 1 1 0 01-1.4-1.4A13.4 13.4 0 0020.3 12a13.6 13.6 0 00-3.8-3.6 1 1 0 111.1-1.7 15.6 15.6 0 013 3.9 1 1 0 01.1.9z" />
                            </svg>
                            <svg v-else class="password-toggle__icon" xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                    d="M12 5c5.5 0 9.6 4.2 10.9 6.6a1 1 0 010 .8C21.6 15.8 17.5 20 12 20S2.4 15.8 1.1 12.4a1 1 0 010-.8C2.4 9.2 6.5 5 12 5zm0 12c4.1 0 7.5-3.2 8.9-5-1.4-1.8-4.8-5-8.9-5S4.5 10.2 3.1 12c1.4 1.8 4.8 5 8.9 5zm0-9a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 100 4 2 2 0 000-4z" />
                            </svg>
                        </button>
                    </div>
                </UranusFieldLabel>

                <transition name="fade">
                    <p v-if="displayError" class="feedback feedback--error" role="alert" aria-live="assertive">
                        {{ displayError }}
                    </p>
                </transition>
                <transition name="fade">
                    <p v-if="success" class="feedback feedback--success" role="status" aria-live="polite">
                        {{ success }}
                    </p>
                </transition>

                <div class="form-actions">
                    <button class="uranus-button" type="submit" :disabled="isSubmitting">
                        <span v-if="!isSubmitting">{{ t('reset_password_submit') }}</span>
                        <span v-else>{{ t('reset_password_submitting') }}</span>
                    </button>
                </div>
            </form>

            <footer class="auth-footer">
                <router-link to="/app/login">{{ t('back_to_login') }}</router-link>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api'

import UranusFieldLabel from '@/components/uranus/UranusFieldLabel.vue'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const password = ref('')
const confirmPassword = ref('')
const isPasswordVisible = ref(false)
const isConfirmPasswordVisible = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)

const fieldErrors = reactive({
    password: null as string | null,
    confirmPassword: null as string | null,
})

const passwordFieldType = computed(() => (isPasswordVisible.value ? 'text' : 'password'))
const passwordToggleLabel = computed(() =>
    isPasswordVisible.value ? t('password_hide_label') : t('password_show_label')
)
const confirmPasswordFieldType = computed(() => (isConfirmPasswordVisible.value ? 'text' : 'password'))
const confirmPasswordToggleLabel = computed(() =>
    isConfirmPasswordVisible.value ? t('password_hide_label') : t('password_show_label')
)

const displayError = computed(() => {
    if (fieldErrors.password) return fieldErrors.password
    if (fieldErrors.confirmPassword) return fieldErrors.confirmPassword
    return error.value
})

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value
}

const toggleConfirmPasswordVisibility = () => {
    isConfirmPasswordVisible.value = !isConfirmPasswordVisible.value
}

const getTokenFromRoute = () => {
    const tokenParam = route.query.token ?? route.params.token
    if (Array.isArray(tokenParam)) {
        return tokenParam[0]
    }
    return typeof tokenParam === 'string' ? tokenParam.trim() : ''
}

const requiredFieldMessage = computed(() => t('event_error_required') || 'This field is required')
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
        const { status } = await apiFetch('/api/admin/reset-password', {
            method: 'POST',
            body: JSON.stringify({
                token,
                new_password: trimmedPassword,
            }),
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

<style scoped lang="scss">
.auth-page {
    @include form-page($justify: center, $padding: clamp(2rem, 6vw, 3rem));
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.auth-card {
    @include form-card(420px, clamp(2rem, 4vw, 2.75rem), clamp(1.5rem, 3vw, 2rem));
}

.auth-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    h1 {
        font-size: clamp(1.75rem, 4vw, 2.25rem);
        font-weight: 700;
        margin: 0;
        color: var(--text-primary);
    }

    p {
        margin: 0;
        font-size: 0.95rem;
        color: var(--muted-text);
    }
}

.input-with-toggle {
    position: relative;

    input {
        width: 100%;
        padding-right: 2.75rem;
    }
}

.password-toggle {
    position: absolute;
    top: 50%;
    right: 0.75rem;
    transform: translateY(-50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
    padding: 0;

    &:hover {
        background: rgba(79, 70, 229, 0.08);
        border-color: rgba(79, 70, 229, 0.25);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
        border-color: var(--accent-primary, #4f46e5);
        background: rgba(79, 70, 229, 0.08);
    }
}

.password-toggle__icon {
    width: 1.1rem;
    height: 1.1rem;
    fill: var(--muted-text, #475569);
}

.form-actions {
    display: flex;
    justify-content: stretch;
    margin-top: 0.5rem;
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

    &--success {
        background-color: #efe;
        color: #060;
        border: 1px solid #cfc;
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

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 480px) {
    .auth-card {
        padding: clamp(1.5rem, 6vw, 2rem);
    }
}
</style>

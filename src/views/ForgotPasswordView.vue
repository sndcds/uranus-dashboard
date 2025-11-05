<template>
    <div class="auth-page">
        <div class="uranus-card">
            <header class="auth-header">
                <h1>{{ t('forgot_password_title') }}</h1>
                <p>{{ t('forgot_password_subtitle') }}</p>
            </header>

            <form class="uranus-form" @submit.prevent="requestReset" :aria-busy="isSubmitting" novalidate>
                <UranusTextInput id="forgot-email" v-model="email" type="email" :label="t('email')"
                    :placeholder="t('email_placeholder')" autocomplete="email" required
                    :error="displayError('email')" @input="handleInput" />

                <transition name="fade">
                    <p v-if="error" :id="errorMessageId" class="feedback feedback--error" role="alert"
                        aria-live="assertive">
                        {{ error }}
                    </p>
                </transition>
                <transition name="fade">
                    <p v-if="success" :id="successMessageId" class="feedback feedback--success" role="status"
                        aria-live="polite">
                        {{ success }}
                    </p>
                </transition>

                <div class="form-actions">
                    <button class="uranus-button" :disabled="isSubmitting" type="submit">
                        <span v-if="!isSubmitting">{{ t('forgot_password_submit') }}</span>
                        <span v-else>{{ t('forgot_password_sending') }}</span>
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
import { ref, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import UranusTextInput from '@/components/uranus/UranusTextInput.vue'

const { t } = useI18n()

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
        fieldErrors.email = t('email_required', 'Email is required')
        return
    }

    if (!emailRegex.test(email.value.trim())) {
        fieldErrors.email = t('email_invalid', 'Please enter a valid email address')
        return
    }

    isSubmitting.value = true

    try {
        const { status } = await apiFetch('/api/admin/forgot-password', {
            method: 'POST',
            body: JSON.stringify({
                email: email.value.trim(),
            }),
        })

        if (status >= 200 && status < 300) {
            success.value = t('forgot_password_success')
            fieldErrors.email = null
        } else {
            error.value = t('forgot_password_error', { status })
        }
    } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || t('forgot_password_error_generic')
        } else if (err instanceof Error) {
            error.value = err.message || t('forgot_password_error_generic')
        } else {
            error.value = t('forgot_password_error_generic')
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

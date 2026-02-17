<template>
    <div class="auth-page">
        <div class="uranus-card">
            <header class="signup-header">
                <h1>{{ t('signup') }}</h1>
                <p>{{ signupSubtitle }}</p>
            </header>

            <form class="uranus-form" @submit.prevent="signup" :aria-busy="isSubmitting" novalidate>
                <UranusTextInput
                    id="signup-email"
                    v-model="email"
                    type="email"
                    :label="t('email')"
                    :error="fieldErrors.email ?? ''"
                    required
                />

                <UranusTextInput
                    id="signup-repeat-email"
                    v-model="repeatEmail"
                    type="email"
                    :label="t('repeat_email')"
                    :error="fieldErrors.repeatEmail ?? ''"
                    required
                />

                <UranusPasswordInput
                    id="signup-password"
                    label="Password"
                    v-model="password"
                    :required="true"
                    :error="fieldErrors.password"
                    size="normal"
                    flex="1"
                    autocomplete="new-password"
                />

                <transition name="fade">
                    <p v-if="displayError" class="feedback feedback--error" role="alert" aria-live="assertive">
                        {{ displayError }}
                    </p>
                </transition>

                <transition name="fade">
                    <div v-if="signupSuccess" class="feedback feedback--success" role="status" aria-live="polite">
                        <p><strong>{{ t('signup_success_title') || 'Account created successfully!' }}</strong></p>
                        <p>{{ t('signup_success_message') || 'Please check your email to confirm your account. You will need to verify your email address before you can log in.' }}</p>
                    </div>
                </transition>

                <div class="form-actions">
                    <button v-if="!signupSuccess" class="uranus-button" type="submit" :disabled="isSubmitting">
                        <span v-if="!isSubmitting">{{ t('signup_cta') }}</span>
                        <span v-else>{{ t('signup_loading') }}</span>
                    </button>
                    <router-link v-else to="/app/login" class="uranus-button">
                        {{ t('go_to_login') || 'Go to Login' }}
                    </router-link>
                </div>
            </form>

            <footer class="signup-footer">
                <span>{{ t('have_account') }}</span>
                <router-link to="/app/login">{{ t('login') }}</router-link>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import UranusTextInput from '@/component/ui/UranusTextInput.vue'
import UranusPasswordInput from "@/component/ui/UranusPasswordInput.vue";

type SignupResponse = { message?: string;[key: string]: unknown }

const { t, te, locale } = useI18n()

const email = ref('')
const repeatEmail = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const error = ref<string | null>(null)
const isSubmitting = ref(false)
const signupSuccess = ref(false)

const fieldErrors = reactive({
    email: null as string | null,
    repeatEmail: null as string | null,
    password: null as string | null,
})

const signupSubtitle = computed(() => (te('signup_subtitle') ? t('signup_subtitle') : 'Create a new organization account to get started.'))
const passwordFieldType = computed(() => (isPasswordVisible.value ? 'text' : 'password'))
const passwordToggleLabel = computed(() =>
    isPasswordVisible.value
        ? (te('password_hide_label') ? t('password_hide_label') : 'Hide password')
        : (te('password_show_label') ? t('password_show_label') : 'Show password')
)

const displayError = computed(() => {
    if (fieldErrors.email) return fieldErrors.email
    if (fieldErrors.repeatEmail) return fieldErrors.repeatEmail
    if (fieldErrors.password) return fieldErrors.password
    return error.value
})

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value
}

const resetForm = () => {
    email.value = ''
    repeatEmail.value = ''
    password.value = ''
    fieldErrors.email = null
    fieldErrors.repeatEmail = null
    fieldErrors.password = null
    error.value = null
}

const isValidEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(value)
}

const requiredFieldMessage = computed(() => (te('required_field') ? t('required_field') : 'This field is required'))
const invalidEmailMessage = computed(() => (te('organization_form_invalid_email') ? t('organization_form_invalid_email') : 'Please provide a valid email address.'))
const emailsDoNotMatchMessage = computed(() => (te('emails_do_not_match') ? t('emails_do_not_match') : 'Email addresses do not match'))

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

watch(repeatEmail, (value) => {
    if (fieldErrors.repeatEmail && value.trim()) {
        const trimmedEmail = email.value.trim().toLowerCase()
        const trimmedRepeatEmail = value.trim().toLowerCase()
        if (trimmedRepeatEmail && trimmedEmail === trimmedRepeatEmail) {
            fieldErrors.repeatEmail = null
            if (error.value === fieldErrors.repeatEmail) {
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

const signup = async () => {
    error.value = null
    fieldErrors.email = null
    fieldErrors.repeatEmail = null
    fieldErrors.password = null

    const trimmedEmail = email.value.trim()
    const trimmedRepeatEmail = repeatEmail.value.trim()
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

    // Validate repeat email
    if (!trimmedRepeatEmail) {
        fieldErrors.repeatEmail = requiredFieldMessage.value
        return
    }
    if (!isValidEmail(trimmedRepeatEmail)) {
        fieldErrors.repeatEmail = invalidEmailMessage.value
        return
    }

    // Check if emails match
    if (trimmedEmail.toLowerCase() !== trimmedRepeatEmail.toLowerCase()) {
        fieldErrors.repeatEmail = emailsDoNotMatchMessage.value
        return
    }

    // Validate password
    if (!trimmedPassword) {
        fieldErrors.password = requiredFieldMessage.value
        return
    }

    isSubmitting.value = true

    try {
        const { data, status } = await apiFetch<SignupResponse | null>(`/api/signup?lang=${locale.value}`, {
            method: 'POST',
            body: JSON.stringify({
                email: trimmedEmail,
                password: trimmedPassword,
            }),
        })

        if (status !== 201) {
            error.value = te('signup_failed') ? t('signup_failed') : 'Signup failed'
            return
        }

        resetForm()
        signupSuccess.value = true
        // Don't redirect automatically - let user read the message and click to login
    } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || (te('signup_failed') ? t('signup_failed') : 'Signup failed')
        } else {
            error.value = te('signup_failed') ? t('signup_failed') : 'Signup failed'
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

.signup-header {
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
        color: var(--uranus-muted-text);
    }
}

.form-actions {
    display: flex;
    justify-content: flex-end;
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
        background-color: #e8f5e9;
        color: #2e7d32;
        border: 1px solid #a5d6a7;

        p {
            margin: 0;

            &:first-child {
                margin-bottom: 0.5rem;
            }

            strong {
                font-weight: 600;
            }
        }
    }
}

.signup-footer {
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

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

<template>
    <div class="signup-page">
        <div class="signup-card">
            <header class="signup-header">
                <h1>{{ t('signup') }}</h1>
                <p>{{ signupSubtitle }}</p>
            </header>

            <transition name="fade">
                <p v-if="error" :id="errorMessageId" class="signup-feedback signup-feedback--error" role="alert"
                    aria-live="assertive">
                    {{ error }}
                </p>
            </transition>

            <form class="signup-form" @submit.prevent="signup" :aria-busy="isSubmitting" novalidate>
                <div class="input-group">
                    <label for="signup-email">{{ t('email') }}</label>
                    <input id="signup-email" v-model="email" type="email" autocomplete="email"
                        :placeholder="t('email_placeholder')" required :aria-invalid="Boolean(error)"
                        :aria-describedby="error ? errorMessageId : undefined" />
                </div>
                <div class="input-group">
                    <label for="signup-repeat-email">{{ t('repeat_email') }}</label>
                    <input id="signup-repeat-email" v-model="repeatEmail" type="email" autocomplete="email"
                        :placeholder="t('repeat_email_placeholder')" required :aria-invalid="Boolean(error)"
                        :aria-describedby="error ? errorMessageId : undefined" />
                </div>
                <div class="input-group">
                    <label for="signup-password">{{ t('password') }}</label>
                    <div class="input-with-toggle">
                        <input id="signup-password" v-model="password" :type="passwordFieldType"
                            autocomplete="new-password" :placeholder="t('password_placeholder')" required
                            :aria-invalid="Boolean(error)" :aria-describedby="error ? errorMessageId : undefined" />
                        <button type="button" class="password-toggle" :aria-label="passwordToggleLabel"
                            :title="passwordToggleLabel" :aria-pressed="isPasswordVisible"
                            @click="togglePasswordVisibility">
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
                </div>
                <button :disabled="isSubmitting" type="submit">
                    <span v-if="!isSubmitting">{{ t('signup_cta') }}</span>
                    <span v-else>{{ t('signup_loading') }}</span>
                </button>
            </form>

            <footer class="signup-footer">
                <span>{{ t('have_account') }}</span>
                <router-link to="/login">{{ t('login') }}</router-link>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { apiFetch } from '../api'

type SignupResponse = { message?: string;[key: string]: unknown }

const { t, te } = useI18n()
const router = useRouter()

const email = ref('')
const repeatEmail = ref('')
const password = ref('')
const isPasswordVisible = ref(false)
const error = ref<string | null>(null)
const isSubmitting = ref(false)
const errorMessageId = 'signup-error-message'

const signupSubtitle = computed(() => (te('signup_subtitle') ? t('signup_subtitle') : 'Create a new organizer account to get started.'))
const passwordFieldType = computed(() => (isPasswordVisible.value ? 'text' : 'password'))
const passwordToggleLabel = computed(() =>
    isPasswordVisible.value
        ? (te('password_hide_label') ? t('password_hide_label') : 'Hide password')
        : (te('password_show_label') ? t('password_show_label') : 'Show password')
)

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value
}

const resetForm = () => {
    email.value = ''
    repeatEmail.value = ''
    password.value = ''
}

const signup = async () => {
    if (email.value.trim().toLowerCase() !== repeatEmail.value.trim().toLowerCase()) {
        error.value = te('emails_do_not_match') ? t('emails_do_not_match') : 'Email addresses do not match'
        return
    }

    error.value = null
    isSubmitting.value = true

    try {
        const { data, status } = await apiFetch<SignupResponse | null>('/api/admin/signup', {
            method: 'POST',
            body: JSON.stringify({
                email: email.value.trim(),
                password: password.value,
            }),
        })

        if (status !== 201) {
            error.value = te('signup_failed') ? t('signup_failed') : 'Signup failed'
            return
        }

        resetForm()
        router.push('/login')
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
.signup-page {
    @include form-page($justify: center, $padding: clamp(2rem, 6vw, 3rem));
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.signup-card {
    @include form-card(420px, clamp(2rem, 4vw, 2.75rem), clamp(1.5rem, 3vw, 2rem));
}

.signup-header {
    @include form-hero(420px);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.signup-form {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2vw, 1.35rem);
}

.input-group {
    @include form-group();
}

.input-with-toggle {
    position: relative;
}

.input-with-toggle input {
    width: 100%;
    padding-right: 2.75rem;
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
}

.password-toggle:hover {
    background: rgba(79, 70, 229, 0.08);
    border-color: rgba(79, 70, 229, 0.25);
}

.password-toggle:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
    border-color: var(--accent-primary, #4f46e5);
    background: rgba(79, 70, 229, 0.08);
}

.password-toggle__icon {
    width: 1.1rem;
    height: 1.1rem;
    fill: var(--muted-text, #475569);
}

.signup-form>button {
    @include form-primary-button($padding-y: 0.9rem, $padding-x: 1.5rem);
}

.signup-feedback {
    @include form-feedback();

    &--error {
        @include form-feedback-error();
    }
}

.signup-footer {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: var(--muted-text);

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
    .signup-card {
        padding: clamp(1.5rem, 6vw, 2rem);
    }

    .signup-form>button {
        width: 100%;
    }
}
</style>

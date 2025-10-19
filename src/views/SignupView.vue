<template>
    <div class="signup-page">
        <div class="signup-card">
            <header class="signup-header">
                <h1>{{ t('signup') }}</h1>
                <p>{{ signupSubtitle }}</p>
            </header>

            <transition name="fade">
                <p v-if="error" class="signup-feedback signup-feedback--error" role="alert">{{ error }}</p>
            </transition>

            <form class="signup-form" @submit.prevent="signup">
                <div class="input-group">
                    <label for="signup-email">{{ t('email') }}</label>
                    <input
                        id="signup-email"
                        v-model="email"
                        type="email"
                        autocomplete="email"
                        :placeholder="t('email_placeholder')"
                        required
                    />
                </div>
                <div class="input-group">
                    <label for="signup-repeat-email">{{ t('repeat_email') }}</label>
                    <input
                        id="signup-repeat-email"
                        v-model="repeatEmail"
                        type="email"
                        autocomplete="email"
                        :placeholder="t('repeat_email_placeholder')"
                        required
                    />
                </div>
                <div class="input-group">
                    <label for="signup-password">{{ t('password') }}</label>
                    <input
                        id="signup-password"
                        v-model="password"
                        type="password"
                        autocomplete="new-password"
                        :placeholder="t('password_placeholder')"
                        required
                    />
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

type SignupResponse = { message?: string; [key: string]: unknown }

const { t, te } = useI18n()
const router = useRouter()

const email = ref('')
const repeatEmail = ref('')
const password = ref('')
const error = ref<string | null>(null)
const isSubmitting = ref(false)

const signupSubtitle = computed(() => (te('signup_subtitle') ? t('signup_subtitle') : 'Create a new organizer account to get started.'))

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
        const res = (await apiFetch('/api/admin/signup', {
            method: 'POST',
            body: JSON.stringify({
                email: email.value.trim(),
                password: password.value,
            }),
        })) as SignupResponse

        if (res.message === 'signup successful') {
            resetForm()
            router.push('/login')
        } else {
            error.value = te('signup_failed') ? t('signup_failed') : 'Signup failed'
        }
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
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at top left, rgba(79, 70, 229, 0.35), transparent 55%), radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.3), transparent 45%);
}

.signup-card {
    width: min(420px, 100%);
    background: rgba(255, 255, 255, 0.92);
    border-radius: 24px;
    padding: clamp(2rem, 4vw, 2.75rem);
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.15);
    backdrop-filter: blur(12px);
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.signup-header {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    h1 {
        font-size: clamp(1.9rem, 3vw, 2.4rem);
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    p {
        margin: 0;
        font-size: 1rem;
        color: rgba(55, 65, 81, 0.8);
        line-height: 1.6;
    }
}

.signup-form {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2vw, 1.35rem);
}

.input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        font-weight: 600;
        color: #1f2937;
        letter-spacing: 0.015em;
    }

    input {
        padding: 0.85rem 1rem;
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.45);
        background-color: rgba(248, 250, 252, 0.85);
        font-size: 1rem;
        color: #0f172a;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;

        &::placeholder {
            color: rgba(100, 116, 139, 0.6);
        }

        &:focus {
            outline: none;
            border-color: rgba(79, 70, 229, 0.75);
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
            background-color: #fff;
        }
    }
}

button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.9rem 1.5rem;
    border-radius: 999px;
    border: none;
    background: linear-gradient(135deg, #4f46e5, #0ea5e9);
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

    &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 14px 30px rgba(79, 70, 229, 0.35);
        filter: brightness(1.03);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.3);
    }

    &:disabled {
        cursor: wait;
        opacity: 0.75;
        transform: none;
        box-shadow: none;
    }
}

.signup-feedback {
    margin: 0;
    border-radius: 14px;
    padding: 0.85rem 1rem;
    text-align: center;
    font-weight: 600;
    font-size: 0.95rem;
    border: 1px solid transparent;

    &--error {
        color: #b91c1c;
        background: rgba(254, 202, 202, 0.45);
        border-color: rgba(248, 113, 113, 0.35);
    }
}

.signup-footer {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    font-size: 0.95rem;
    color: rgba(71, 85, 105, 0.95);

    a {
        font-weight: 600;
        color: #4f46e5;
        transition: color 0.2s ease;

        &:hover {
            color: #4338ca;
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

    button {
        width: 100%;
    }
}
</style>

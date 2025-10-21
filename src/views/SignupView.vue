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
}

.signup-card {
    @include form-card(420px, clamp(2rem, 4vw, 2.75rem), clamp(1.5rem, 3vw, 2rem));
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(12px);
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

button {
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

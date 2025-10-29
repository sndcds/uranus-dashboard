<template>
    <div class="auth-page">
        <div class="auth-card">
            <header class="auth-header">
                <h1>{{ t('forgot_password_title') }}</h1>
                <p>{{ t('forgot_password_subtitle') }}</p>
            </header>

            <transition name="fade">
                <p v-if="error" class="auth-feedback auth-feedback--error" role="alert">{{ error }}</p>
            </transition>
            <transition name="fade">
                <p v-if="success" class="auth-feedback auth-feedback--success" role="status">{{ success }}</p>
            </transition>

            <form class="auth-form" @submit.prevent="requestReset">
                <div class="input-group">
                    <label for="forgot-email">{{ t('email') }}</label>
                    <input id="forgot-email" v-model="email" type="email" autocomplete="email"
                        :placeholder="t('email_placeholder')" required />
                </div>
                <button :disabled="isSubmitting" type="submit">
                    <span v-if="!isSubmitting">{{ t('forgot_password_submit') }}</span>
                    <span v-else>{{ t('forgot_password_sending') }}</span>
                </button>
            </form>

            <footer class="auth-footer">
                <router-link to="/login">{{ t('back_to_login') }}</router-link>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

const { t } = useI18n()

const email = ref('')
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)

const requestReset = async () => {
    if (isSubmitting.value) {
        return
    }

    error.value = null
    success.value = null
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
    @include form-hero(420px);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.auth-form {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2vw, 1.35rem);
}

.input-group {
    @include form-group();
}

.auth-form>button {
    @include form-primary-button($padding-y: 0.9rem, $padding-x: 1.5rem);
}

.auth-feedback {
    @include form-feedback();

    &--error {
        @include form-feedback-error();
    }

    &--success {
        @include form-feedback-success();
    }
}

.auth-footer {
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
    .auth-card {
        padding: clamp(1.5rem, 6vw, 2rem);
    }

    .auth-form>button {
        width: 100%;
    }
}
</style>

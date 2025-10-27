<template>
    <div class="auth-page">
        <div class="auth-card">
            <header class="auth-header">
                <h1>{{ t('login') }}</h1>
                <p>{{ loginSubtitle }}</p>
            </header>

            <transition name="fade">
                <p v-if="error" class="auth-feedback auth-feedback--error" role="alert">{{ error }}</p>
            </transition>

            <form class="auth-form" @submit.prevent="login">
                <div class="input-group">
                    <label for="login-email">{{ t('email') }}</label>
                    <input id="login-email" v-model="email" type="email" autocomplete="email"
                        :placeholder="t('email_placeholder')" required />
                </div>
                <div class="input-group">
                    <label for="login-password">{{ t('password') }}</label>
                    <input id="login-password" v-model="password" type="password" autocomplete="current-password"
                        :placeholder="t('password_placeholder_login')" required />
                </div>
                <button :disabled="isSubmitting" type="submit">
                    <span v-if="!isSubmitting">{{ t('login_cta') }}</span>
                    <span v-else>{{ t('login_loading') }}</span>
                </button>
            </form>

            <footer class="auth-footer">
                <span>{{ t('need_account') }}</span>
                <router-link to="/signup">{{ t('signup') }}</router-link>
            </footer>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api'
import type { LoginResponse } from '@/api'
import { useTokenStore } from '@/store/token'
import { useUserStore } from '@/store/userStore'
import { useThemeStore } from '@/store/themeStore'

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
const error = ref<string | null>(null)
const isSubmitting = ref(false)

const loginSubtitle = computed(() => (te('login_subtitle') ? t('login_subtitle') : 'Welcome back! Sign in to continue organizing your events.'))

const login = async () => {
    error.value = null
    isSubmitting.value = true

    try {
        const { data, status } = await apiFetch<LoginResponse>('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify({
                email: email.value.trim(),
                password: password.value,
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
    @include form-page($justify: center, $padding: clamp(2rem, 6vw, 3rem));
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

button {
    @include form-primary-button($padding-y: 0.9rem, $padding-x: 1.5rem);
}

.auth-feedback {
    @include form-feedback();

    &--error {
        @include form-feedback-error();
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

    button {
        width: 100%;
    }
}
</style>

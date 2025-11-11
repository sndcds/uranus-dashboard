<template>
    <div class="auth-page">
        <div class="uranus-card">
            <header class="activate-header">
                <h1>{{ t('activate_account') }}</h1>
                <p v-if="!isActivating && !activationSuccess && !activationError">
                    {{ t('activate_account_subtitle') }}
                </p>
            </header>

            <div class="activation-content">
                <!-- Loading State -->
                <div v-if="isActivating" class="activation-state activation-state--loading">
                    <div class="spinner"></div>
                    <p>{{ t('activating_account') }}</p>
                </div>

                <!-- Success State -->
                <div v-else-if="activationSuccess" class="activation-state activation-state--success">
                    <div class="success-icon">✓</div>
                    <p class="success-message">{{ t('activation_success') }}</p>
                    <p class="redirect-message">
                        <router-link to="/app/login" class="uranus-button">
                            {{ t('go_to_login') }}
                        </router-link>
                    </p>
                </div>

                <!-- Error State -->
                <div v-else-if="activationError" class="activation-state activation-state--error">
                    <div class="error-icon">✕</div>
                    <p class="error-message">{{ activationError }}</p>
                    <router-link to="/app/login" class="uranus-button">
                        {{ t('go_to_login') }}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const isActivating = ref(false)
const activationSuccess = ref(false)
const activationError = ref<string | null>(null)

const activateAccount = async () => {
    const token = route.query.token as string

    if (!token) {
        router.push('/app/login')
        return
    }

    isActivating.value = true
    activationError.value = null

    try {
        const { status } = await apiFetch('/api/admin/activate', {
            method: 'POST',
            body: JSON.stringify({ token }),
        })

        if (status === 200) {
            activationSuccess.value = true
        } else {
            activationError.value = t('activation_failed')
        }
    } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            activationError.value = e.data?.error || t('activation_failed')
        } else {
            activationError.value = t('activation_failed')
        }
    } finally {
        isActivating.value = false
    }
}

onMounted(() => {
    activateAccount()
})
</script>

<style scoped lang="scss">
.auth-page {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem 1rem;
}

.activate-header {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 2rem;
    text-align: center;

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

.activation-content {
    min-height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.activation-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    text-align: center;

    &--loading {
        .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid rgba(79, 70, 229, 0.1);
            border-top-color: var(--accent-primary, #4f46e5);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        p {
            color: var(--muted-text);
            font-size: 0.95rem;
        }
    }

    &--success {
        .success-icon {
            width: 64px;
            height: 64px;
            background: #10b981;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            font-weight: bold;
        }

        .success-message {
            font-size: 1.125rem;
            font-weight: 600;
            color: #10b981;
            margin: 0;
        }

        .redirect-message {
            font-size: 0.9rem;
            color: var(--muted-text);
            margin: 0;
        }
    }

    &--error {
        .error-icon {
            width: 64px;
            height: 64px;
            background: #ef4444;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: white;
            font-weight: bold;
        }

        .error-message {
            font-size: 1rem;
            color: #dc2626;
            margin: 0 0 1rem 0;
            max-width: 400px;
        }
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

@media (max-width: 480px) {
    .auth-page {
        padding: 1rem;
    }

    .activation-state {
        padding: 1rem;
    }
}
</style>

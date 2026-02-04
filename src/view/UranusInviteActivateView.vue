<template>
    <div class="invite-activate-page">
        <div class="uranus-card">
            <header class="activate-header">
                <p class="activate-eyebrow">{{ t('invite_activate_title') }}</p>
                <h1>{{ t('invite_activate_subtitle') }}</h1>
                <p v-if="!isProcessing && !isSuccess && !errorMessage">
                    {{ t('invite_activate_description') }}
                </p>
            </header>

            <div class="activation-content">
                <div v-if="isProcessing" class="activation-state activation-state--loading">
                    <div class="spinner" aria-hidden="true"></div>
                    <p>{{ t('invite_activate_processing') }}</p>
                </div>

                <div v-else-if="isSuccess" class="activation-state activation-state--success">
                    <div class="success-icon">✓</div>
                    <p class="success-message">{{ t('invite_activate_success_title') }}</p>
                    <p class="redirect-message">
                        {{ successMessage }}
                    </p>

                    <dl class="invite-details" v-if="inviteInfo">
                        <div class="invite-detail-row">
                            <dt>{{ t('invite_activate_organization_label') }}</dt>
                            <dd>{{ inviteInfo.organization_name }}</dd>
                        </div>
                        <div v-if="inviteInfo.role_name" class="invite-detail-row">
                            <dt>{{ t('invite_activate_role_label') }}</dt>
                            <dd>{{ inviteInfo.role_name }}</dd>
                        </div>
                        <div v-if="inviteInfo.invited_by" class="invite-detail-row">
                            <dt>{{ t('invite_activate_inviter_label') }}</dt>
                            <dd>{{ inviteInfo.invited_by }}</dd>
                        </div>
                    </dl>

                    <button class="uranus-button" type="button" @click="goToTeam">
                        {{ t('invite_activate_go_to_team') }}
                    </button>
                    <p class="redirect-message">
                        {{ t('invite_activate_redirect_note', { seconds: redirectSeconds }) }}
                    </p>
                </div>

                <div v-else class="activation-state activation-state--error">
                    <div class="error-icon">!</div>
                    <p class="error-message">{{ errorMessage }}</p>
                    <router-link to="/admin/dashboard" class="uranus-button">
                        {{ t('invite_activate_back_to_login') }}
                    </router-link>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api.ts'

interface InviteAcceptResponse {
    organization_id: number
    organization_name: string
    role_name?: string | null
    invited_by?: string | null
}

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()

const isProcessing = ref(true)
const inviteInfo = ref<InviteAcceptResponse | null>(null)
const errorMessage = ref<string | null>(null)
const redirectSeconds = ref(5)
let redirectTimer: ReturnType<typeof setInterval> | null = null

const isSuccess = computed(() => !isProcessing.value && !!inviteInfo.value && !errorMessage.value)

const successMessage = computed(() => {
    if (!inviteInfo.value) return ''
    if (inviteInfo.value.role_name) {
        return t('invite_activate_success_body_role', {
            organization: inviteInfo.value.organization_name,
            role: inviteInfo.value.role_name,
        })
    }

    return t('invite_activate_success_body', {
        organization: inviteInfo.value.organization_name,
    })
})

const goToTeam = () => {
    const organizationId = inviteInfo.value?.organization_id
    if (!organizationId) {
        router.push('/admin/dashboard')
        return
    }

    router.push(`/admin/organization/${organizationId}/team`)
}

const startRedirectCountdown = () => {
    redirectSeconds.value = 5
    redirectTimer && clearInterval(redirectTimer)
    redirectTimer = setInterval(() => {
        if (redirectSeconds.value <= 1) {
            redirectTimer && clearInterval(redirectTimer)
            goToTeam()
            return
        }

        redirectSeconds.value -= 1
    }, 1000)
}

const acceptInvite = async () => {
    const token = (route.query.token as string | undefined) ?? ''
    if (!token) {
        errorMessage.value = t('invite_activate_missing_token')
        isProcessing.value = false
        return
    }

    isProcessing.value = true
    errorMessage.value = null

    try {
        const { data } = await apiFetch<InviteAcceptResponse>('/api/admin/organization/team/invite/accept', {
            method: 'POST',
            body: JSON.stringify({ token }),
        })

        if (!data || typeof data !== 'object') {
            throw new Error(t('invite_activate_error_generic'))
        }

        inviteInfo.value = data
        startRedirectCountdown()
    } catch (err: unknown) {
        if (err instanceof Error && err.message) {
            errorMessage.value = err.message
        } else if (typeof err === 'object' && err && 'data' in err) {
            const apiErr = err as { data?: { error?: string } }
            errorMessage.value = apiErr.data?.error || t('invite_activate_error_generic')
        } else {
            errorMessage.value = t('invite_activate_error_generic')
        }
    } finally {
        isProcessing.value = false
    }
}

onMounted(() => {
    void acceptInvite()
})

onBeforeUnmount(() => {
    if (redirectTimer) {
        clearInterval(redirectTimer)
    }
})
</script>

<style scoped lang="scss">
.invite-activate-page {
    display: flex;
    width: 100%;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
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
        color: var(--uranus-muted-text);
    }
}

.activate-eyebrow {
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 0.8rem;
    color: var(--uranus-muted-text);
    margin: 0;
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
            color: var(--uranus-muted-text);
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
            color: var(--uranus-muted-text);
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
            color: #ef4444;
            margin: 0;
        }
    }
}

.invite-details {
    width: 100%;
    margin: 1rem 0 0;
    padding: 1rem;
    border-radius: 16px;
    background: var(--surface-secondary, rgba(79, 70, 229, 0.05));
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.invite-detail-row {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
}

.invite-detail-row dt {
    font-size: 0.85rem;
    color: var(--uranus-muted-text);
}

.invite-detail-row dd {
    margin: 0;
    font-weight: 600;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>

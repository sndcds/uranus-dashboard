<template>
  <UranusBasicCardPage>
    <UranusCard class="uranus-card-narrow">
      <header class="activate-header">
        <h1>{{ t('activate_account') }}</h1>
      </header>

      <!-- Success -->
      <div class="activation-content">
        <div v-if="activationSuccess" class="activation-state activation-state--success">
          <div class="success-icon">✓</div>
          <p class="success-message">{{ t('activation_success') }}</p>
          <p class="redirect-message">
            <router-link to="/app/login" class="uranus-button">
              {{ t('go_to_login') }}
            </router-link>
          </p>
        </div>

        <!-- Error -->
        <div v-else-if="activationError" class="activation-state activation-state--error">
          <div class="error-icon">✕</div>
          <p class="error-message">{{ activationError }}</p>
          <UranusButton @click="onRetryActivateAccount">{{ t('retry') }}</UranusButton>
        </div>
      </div>
    </UranusCard>
  </UranusBasicCardPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusBasicCardPage from '@/component/layout/UranusBasicCardPage.vue'
import UranusCard from '@/component/ui/UranusCard.vue'
import UranusButton from "@/component/ui/UranusButton.vue";

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
    activationSuccess.value = false

    try {
        const { status } = await apiFetch('/api/activate', {
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

const onRetryActivateAccount = async () => {
  activateAccount()
}

onMounted(() => {
  activateAccount()
})
</script>

<style scoped lang="scss">
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
    margin-top: 2rem;
    color: var(--uranus-color);
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

</style>

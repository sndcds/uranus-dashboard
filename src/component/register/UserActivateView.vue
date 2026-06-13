<!--
  src/component/register/UserActivateView.vue
-->

<template>
  <UranusBasicCardPage>
    <UranusStatusCard
        :state="
          isActivating
            ? 'loading'
            : activationSuccess
              ? 'success'
              : 'error'
        "
        :title="t('activate_account')"
        :loading-message="t('activating_account')"
    >

      <!-- Success -->
      <template #success>
        <p class="success-message" v-html="t('activation_success')" />
        <UranusButton to="/app/login">
          {{ t('go_to_login') }}
        </UranusButton>
      </template>

      <!-- Error -->
      <template #error>
        <p class="error-message" v-html="activationError" />
        <UranusButton @click="onRetryActivateAccount">
          {{ t('retry') }}
        </UranusButton>
      </template>

    </UranusStatusCard>
  </UranusBasicCardPage>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusStatusCard from '@/component/uranus/UranusStatusCard.vue'
import UranusBasicCardPage from "@/component/layout/UranusBasicCardPage.vue";

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

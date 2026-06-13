<!--
  src/component/user/UranusOrgTeamInviteActivateView.vue
-->

<template>
  <UranusBasicCardPage>
    <UranusStatusCard
        :state="statusState"
        :title="t('invite_accept_welcome_title')"
        :loading-message="t('invite_activate_processing')"
    >

      <!-- SUCCESS -->
      <template #success>
        <p class="success-message">
          {{ t('invite_accept_joined_org_message') }}
          <strong>{{ inviteInfo?.org_name }}</strong>
        </p>

        <p class="info-message">
          {{ t('invite_accept_permissions_info_message') }}
        </p>

        <p class="info-message">
          {{ t('invite_accept_no_action_required_message') }}
        </p>

        <p class="help-message">
          {{ t('invite_accept_membership_help_message') }}
        </p>

        <button class="uranus-button" type="button" @click="goToOrgs">
          {{ t('invite_accept_go_to_orgs_cta') }}
        </button>
      </template>

      <!-- ERROR -->
      <template #error>
        <p class="error-message">{{ errorMessage }}</p>

        <router-link to="/admin/dashboard" class="uranus-button">
          {{ t('invite_activate_back_to_login') }}
        </router-link>
      </template>

    </UranusStatusCard>
  </UranusBasicCardPage>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api.ts'
import UranusBasicCardPage from '@/component/layout/UranusBasicCardPage.vue'
import UranusStatusCard from '@/component/uranus/UranusStatusCard.vue'

interface InviteAcceptResponse {
  org_uuid: string
  org_name: string
  org_city?: string | null
  org_country?: string | null
  org_web_link?: string | null
  org_email?: string | null
}

const { t } = useI18n({ useScope: 'global' })
const route = useRoute()
const router = useRouter()

const isProcessing = ref(true)
const inviteInfo = ref<InviteAcceptResponse | null>(null)
const errorMessage = ref<string | null>(null)
const redirectSeconds = ref(5)
let redirectTimer: ReturnType<typeof setInterval> | null = null

const statusState = computed<'loading' | 'success' | 'error'>(() => {
  if (isProcessing.value) return 'loading'
  if (inviteInfo.value && !errorMessage.value) return 'success'
  return 'error'
})

const goToOrgs = () => {
  const orgUuid = inviteInfo.value?.org_uuid
  if (!orgUuid) {
    router.push('/admin/dashboard')
    return
  }

  router.push(`/admin/orgs`)
}

const startRedirectCountdown = () => {
  redirectSeconds.value = 5
  redirectTimer && clearInterval(redirectTimer)
  redirectTimer = setInterval(() => {
    if (redirectSeconds.value <= 1) {
      redirectTimer && clearInterval(redirectTimer)
      goToOrgs()
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
    const apiPath = '/api/admin/org/team/invite/accept'
    const apiResponse = await apiFetch<InviteAcceptResponse>(apiPath, {
      method: 'POST',
      body: JSON.stringify({ token }),
    })

    console.log(JSON.stringify(apiResponse, null, 2))

    if (apiResponse.status != 200) {
      throw new Error(t('invite_activate_error_generic'))
    }

    inviteInfo.value = apiResponse.data as InviteAcceptResponse
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
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

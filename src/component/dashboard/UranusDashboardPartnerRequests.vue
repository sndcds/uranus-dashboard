<template>
  <section v-if="appStore.orgUuid" class="dashboard-partner-requests">
    <UranusFeedback v-if="isLoading" type="notice" :delay-seconds="1">
      {{ t('loading') }}
    </UranusFeedback>
    <UranusFeedback v-if="hasError" type="error">
      {{ t('partner_requests_load_error') }}
      <UranusButton :disabled="isLoading" @click="loadRequests">{{ t('refresh') }}</UranusButton>
    </UranusFeedback>

    <UranusPartnerRequestCard
        :key="`${appStore.orgUuid}-outgoing`"
        :items="requests"
        direction="outgoing"
        :compact="true"
        :title="t('partner_pending_outgoing_requests_title')"
    />
    <UranusPartnerRequestCard
        :key="`${appStore.orgUuid}-incoming`"
        :items="requests"
        direction="incoming"
        :compact="true"
        :title="t('partner_requests_to_org', { org: appStore.orgName ?? '' })"
        :can-answer-partner-requests="canAnswerPartnerRequests"
        :can-edit-partner-rights="canEditPartnerRights"
        @request-updated="loadRequests"
    />
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import type { PartnerRequestDTO } from '@/api/dto/partner.dto.ts'
import { mapPartnerRequestItem, type PartnerRequestItem } from '@/domain/partner/partner.model.ts'
import { useAppStore } from '@/store/appStore.ts'
import UranusPartnerRequestCard from '@/component/partner/card/UranusPartnerRequestCard.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusButton from '@/component/ui/UranusButton.vue'

const { t } = useI18n()
const appStore = useAppStore()
const requests = ref<PartnerRequestItem[]>([])
const canAnswerPartnerRequests = ref(false)
const canEditPartnerRights = ref(false)
const isLoading = ref(false)
const hasError = ref(false)
let loadVersion = 0

async function loadRequests() {
  const orgUuid = appStore.orgUuid
  const version = ++loadVersion
  hasError.value = false
  if (!orgUuid) return
  isLoading.value = true

  try {
    const [requestResponse, grantsResponse] = await Promise.all([
      apiFetch<{ partner_requests: PartnerRequestDTO[] | null }>(`/api/admin/org/${orgUuid}/partner/requests`),
      apiFetch<{ answer_partner_requests: boolean; edit_partner_rights: boolean }>(`/api/admin/org/${orgUuid}/partner/grants`),
    ])
    if (version !== loadVersion) return

    requests.value = (requestResponse.data?.partner_requests ?? [])
        .map(mapPartnerRequestItem)
        .filter(item => item.status === 'pending')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    canAnswerPartnerRequests.value = grantsResponse.data?.answer_partner_requests === true
    canEditPartnerRights.value = grantsResponse.data?.edit_partner_rights === true
  } catch {
    if (version !== loadVersion) return
    hasError.value = true
  } finally {
    if (version === loadVersion) isLoading.value = false
  }
}

watch(() => appStore.orgUuid, () => {
  requests.value = []
  canAnswerPartnerRequests.value = false
  canEditPartnerRights.value = false
  isLoading.value = false
  void loadRequests()
}, { immediate: true })

onBeforeUnmount(() => { loadVersion++ })
</script>

<style scoped lang="scss">
.dashboard-partner-requests {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>

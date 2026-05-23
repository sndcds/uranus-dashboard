<!--
  src/component/partner/view/UranusPartnerListView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('partners')"
        :subtitle="t('partner_manage_description')"
    />

    <UranusInfo
        v-if="!isLoading && partnerList.length === 0"
        :infoText="t('partner_no_membership_message')"
    />
    
    <div class="partner-actions-bar">
      <UranusButton
          v-if="canRequestPartner"
          to="/admin/org/partner-request"
      >
        {{ t('partner_send_request') }}
      </UranusButton>
      <UranusButton
          v-if="hasPendingRequests"
          variant="primary"
          :loading="isLoading"
          :loading-text="t('loading')"
          @click="reloadPartnerData"
      >
        {{ t('refresh') }}
      </UranusButton>
    </div>

    <UranusFeedback v-if="isLoading" type="warning">
      {{ t('loading') }}
    </UranusFeedback>

    <UranusFeedback v-if="error" type="error">
      {{ error }}
    </UranusFeedback>

    <UranusPartnershipConnectionsGraph />

    <UranusPartnerRequestCard
        :items="partnerRequests"
        direction="incoming"
        :canAnswerPartnerRequests="canAnswerPartnerRequests"
        @request-updated="reloadPartnerData"
    />
    <UranusPartnerRequestCard
        :items="partnerRequests"
        direction="outgoing"
        @request-updated="reloadPartnerData"
    />

    <UranusPartnerGrantCard
        :items="partnerList"
        direction="incoming"
    />
    <UranusPartnerGrantCard
        :items="partnerList"
        :canEditPartnerRights="canEditPartnerRights"
        direction="outgoing"
    />

  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import type {PartnerDTO, PartnerRequestDTO} from '@/api/dto/partnerDTO.ts'
import {
  mapPartnerListItem,
  mapPartnerRequestItem,
  type PartnerListItem,
  type PartnerRequestItem
} from '@/domain/partner/partner.model.ts'
import UranusInfo from '@/component/ui/UranusInfo.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import { useAppStore } from '@/store/appStore.ts'
import UranusPartnerGrantCard from '@/component/partner/card/UranusPartnerGrantCard.vue'
import UranusOrgTitle from '@/component/layout/UranusOrgTitle.vue'
import UranusPartnerRequestCard from '@/component/partner/card/UranusPartnerRequestCard.vue'
import UranusPartnershipConnectionsGraph from '@/component/partner/card/UranusPartnershipConnectionsGraph.vue'

const { t } = useI18n()
const appStore = useAppStore()

const canRequestPartner = ref(false)
const canAnswerPartnerRequests = ref(false)
const canEditPartnerRights = ref(false)
const canDeletePartnership = ref(false)

const partnerList = ref<PartnerListItem[]>([])
const partnerRequests = ref<PartnerRequestItem[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const hasPendingRequests = computed(() => partnerRequests.value.some(request => request.status === 'pending'))

function sortByOrgName<T extends { orgName: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.orgName.localeCompare(b.orgName, undefined, { sensitivity: 'base' }))
}

const loadPartnerList = async () => {
  error.value = null
  try {
    const apiPath = `/api/admin/org/${appStore.orgUuid}/partner/grants`
    const apiResponse = await apiFetch<any>(apiPath)

    canRequestPartner.value = apiResponse.data.request_partner
    canAnswerPartnerRequests.value = apiResponse.data.answer_partner_requests
    canEditPartnerRights.value = apiResponse.data.edit_partner_rights
    canDeletePartnership.value = apiResponse.data.delete_partnership

    const data = apiResponse.data.partner_grants as PartnerDTO[]
    partnerList.value = sortByOrgName((data || []).map(dto => mapPartnerListItem(dto)))
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || 'Failed to load partner list'
    } else {
      error.value = 'Unknown error'
    }
  }
}

const loadPartnerRequests = async () => {
  try {
    const apiPath = `/api/admin/org/${appStore.orgUuid}/partner/requests`
    const apiResponse = await apiFetch<any>(apiPath)

    const data = apiResponse.data.partner_requests as PartnerRequestDTO[]
    partnerRequests.value = sortByOrgName((data || []).map(dto => mapPartnerRequestItem(dto)))
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
    } else {
    }
  } finally {
  }
}

const reloadPartnerData = async () => {
  isLoading.value = true
  await Promise.all([
    loadPartnerList(),
    loadPartnerRequests(),
  ])
  isLoading.value = false
}

onMounted(async () => {
  reloadPartnerData()
})
</script>

<style scoped lang="scss">
.partner-actions-bar {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.partner-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.partner-grid > * {
  display: flex;
  flex-direction: row;
}

@media (max-width: 600px) {
  .partner-grid {
    grid-template-columns: 1fr;
  }
}

</style>

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

    <!-- Empty State Message -->
    <UranusNotification
        v-if="!isLoading && partnerList.length === 0"
        type="info"
        :button-text="t('show_manual_page')"
        button-link="/help/permissions"
    >
      <template #title>{{ t('notification') }}</template>
      {{ t('partner_no_membership_message') }}
    </UranusNotification>

    <div>
      <UranusButton to="/admin/org/partner-request">
        {{ t('partner_send_request') }}
      </UranusButton>
    </div>

    <UranusFeedback v-if="isLoading" type="warning">
      {{ t('loading') }}
    </UranusFeedback>

    <UranusFeedback v-if="error" type="error">
      {{ error }}
    </UranusFeedback>

    <UranusPartnerRequestCard :items="partnerRequests" direction="incoming" />
    <UranusPartnerRequestCard :items="partnerRequests" direction="outgoing" />

    <UranusPartnerGrantCard :items="partnerList" direction="incoming" />
    <UranusPartnerGrantCard :items="partnerList" direction="outgoing" />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
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
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import { useAppStore } from '@/store/appStore.ts'
import UranusPartnerGrantCard from '@/component/partner/card/UranusPartnerGrantCard.vue'
import UranusOrgTitle from '@/component/layout/UranusOrgTitle.vue'
import UranusPartnerRequestCard from '@/component/partner/card/UranusPartnerRequestCard.vue'

const { t } = useI18n()
const appStore = useAppStore()

const partnerList = ref<PartnerListItem[]>([])
const partnerRequests = ref<PartnerRequestItem[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)


const loadPartnerList = async () => {
  try {
    const apiPath = `/api/admin/org/${appStore.orgUuid}/partner/grants`
    const apiResponse = await apiFetch<any>(apiPath)

    const data = apiResponse.data.partner_grants as PartnerDTO[]
    partnerList.value = (data || []).map(dto => mapPartnerListItem(dto))
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || 'Failed to load partner list'
    } else {
      error.value = 'Unknown error'
    }
  } finally {
    isLoading.value = false
  }
}

const loadPartnerRequests = async () => {
  try {
    const apiPath = `/api/admin/org/${appStore.orgUuid}/partner/requests`
    const apiResponse = await apiFetch<any>(apiPath)

    const data = apiResponse.data.partner_requests as PartnerRequestDTO[]
    partnerRequests.value = (data || []).map(dto => mapPartnerRequestItem(dto))
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
    } else {
    }
  } finally {
  }
}

onMounted(async () => {
  loadPartnerList()
  loadPartnerRequests()
})
</script>

<style scoped lang="scss">
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

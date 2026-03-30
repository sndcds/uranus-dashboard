<!--
  src/component/organization/view/UranusAdminOrganizationListView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('organizations')"
        :subtitle="t('dashboard_organizations_hero_description')"
    />

    <!-- Empty State Message -->
    <UranusNotification
        v-if="!isLoading && organizationListItems.length === 0"
        type="info"
        :button-text="t('show_manual_page')"
        button-link="/help/permissions"
    >
      <template #title>{{ t('notification') }}</template>
      {{ t('organization_no_membership_message') }}
    </UranusNotification>

    <div>
      <UranusButton to="/admin/organization/create">
        {{ t('create_organization') }}
      </UranusButton>
    </div>


    <div v-if="error" class="organization-dashboard-view__error">
      <p class="form-feedback-error">{{ error }}</p>
    </div>

    <div class="organization-grid">
      <UranusOrganizationCard
          v-for="item in organizationListItems"
          :key="item.uuid"
          :organisation="item"
          @deleted="handleOrganizationDeleted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import UranusOrganizationCard from '@/component/organization/UranusOrganizationCard.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import type { UranusOrganizationListItemDTO } from '@/api/dto/organizationListItem.dto.ts'
import { mapOrganizationListItem } from '@/domain/organization/organizationListItem.model.ts'

const { t } = useI18n()

const organizationListItems = ref<UranusOrganizationListItemDTO[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

interface ApiOrganizationListResponse {
  service: string
  api_version: string
  response_type: string
  status: string
  timestamp: string
  metadata: {
    response_time_ms: number
  }
  data: {
    organizations: UranusOrganizationListItemDTO[]
  }
}



const handleOrganizationDeleted = (orgUuid: string | null) => {
  organizationListItems.value = organizationListItems.value.filter(org => org.uuid !== orgUuid)
}


onMounted(async () => {
  try {
    const { response } = await apiFetch<ApiOrganizationListResponse>('/api/admin/organization/list')

    organizationListItems.value = (response?.data.organizations || []).map(dto =>
        mapOrganizationListItem(dto)
    )

    console.log('Mapped organizations:', JSON.stringify(organizationListItems.value, null, 2))
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || 'Failed to load organization list'
    } else {
      error.value = 'Unknown error'
    }
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped lang="scss">
.organization-grid {
  display: flex;
  flex-direction: column;
  grid-template-columns: repeat(auto-fill, minmax(360px, 500px));
  grid-auto-rows: auto;
  gap: var(--uranus-grid-gap);
  max-width: var(--uranus-dashboard-content-width);
}

// Empty state
.organization-dashboard-view__empty {
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.organization-dashboard-view__empty-text {
  margin: 0;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
  color: var(--uranus-muted-text);
  line-height: 1.6;
}

// Error feedback
.organization-dashboard-view__error {
  width: 100%;
  max-width: 600px;
}

</style>

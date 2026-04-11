<!--
  src/component/organization/view/UranusAdminOrganizationListView.vue

  organisations - mapped data from DTO
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

    <UranusFeedback v-if="isLoading" type="warning">
      {{ t('loading') }}
    </UranusFeedback>

    <UranusFeedback v-if="error" type="error">
      {{ error }}
    </UranusFeedback>

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
import UranusOrganizationCard from '@/component/organization/card/UranusOrganizationCard.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import type { UranusOrganizationListItemDTO } from '@/api/dto/organizationListItem.dto.ts'
import { mapOrganizationListItem, type OrganizationListItem } from '@/domain/organization/organizationListItem.model.ts'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'

const { t } = useI18n()

const organizationListItems = ref<OrganizationListItem[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const handleOrganizationDeleted = (orgUuid: string | null) => {
  organizationListItems.value = organizationListItems.value.filter(org => org.uuid !== orgUuid)
}

onMounted(async () => {
  try {
    const res = await apiFetch<any>('/api/admin/organization/list')
    const data = res.data.organizations as UranusOrganizationListItemDTO[]
    organizationListItems.value = (data || []).map(dto => mapOrganizationListItem(dto))
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
</style>

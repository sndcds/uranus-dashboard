<!--
  src/component/org/view/UranusAdminOrgListView.vue

  organisations - mapped data from DTO
-->

<template>
  <div class="uranus-main-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('orgs')"
        :subtitle="t('orgs_manage_description')"
    />

    <!-- Empty State Message -->
    <UranusNotification
        v-if="!isLoading && orgListItems.length === 0"
        type="info"
        :button-text="t('show_manual_page')"
        button-link="/help/permissions"
    >
      <template #title>{{ t('notification') }}</template>
      {{ t('org_no_membership_message') }}
    </UranusNotification>

    <div>
      <UranusButton to="/admin/org/create">
        {{ t('create_org') }}
      </UranusButton>
    </div>

    <UranusFeedback v-if="isLoading" type="warning">
      {{ t('loading') }}
    </UranusFeedback>

    <UranusFeedback v-if="error" type="error">
      {{ error }}
    </UranusFeedback>

    <div class="org-grid">
      <UranusOrgCard
          v-for="item in orgListItems"
          :key="item.uuid"
          :org="item"
          @deleted="handleOrgDeleted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import UranusOrgCard from '@/component/org/card/UranusOrgCard.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import type { OrgListItemDTO } from '@/api/dto/orgListItem.dto.ts'
import { mapOrgListItem, type OrgListItem } from '@/domain/org/orgListItem.model.ts'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusOrgTitle from "@/component/layout/UranusOrgTitle.vue";

const { t } = useI18n()

const orgListItems = ref<OrgListItem[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const handleOrgDeleted = (orgUuid: string | null) => {
  orgListItems.value = orgListItems.value.filter(org => org.uuid !== orgUuid)
}

onMounted(async () => {
  try {
    const apiPath = '/api/admin/org/list'
    const apiResponse = await apiFetch<any>(apiPath)
    const data = apiResponse.data.organizations as OrgListItemDTO[]
    console.log(JSON.stringify(data, null, 2))

    orgListItems.value = (data || []).map(dto => mapOrgListItem(dto))
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
.org-grid {
  display: flex;
  flex-direction: column;
  grid-template-columns: repeat(auto-fill, minmax(360px, 500px));
  grid-auto-rows: auto;
  gap: var(--uranus-grid-gap);
  max-width: var(--uranus-dashboard-content-width);
}
</style>

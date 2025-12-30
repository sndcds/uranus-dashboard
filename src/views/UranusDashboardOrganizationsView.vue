<!--
  UranusDashboardOrganizationsView.vue
-->
<template>
  <div class="uranus-main-layout" style="max-width: 1600px;">
    <UranusDashboardHero
        :title="t('organizations')"
        :subtitle="t('dashboard_organizations_hero_description')"
    />

    <!-- Empty State Message -->
    <UranusNotification
        v-if="!isLoading && organizations.length === 0"
        type="warning"
        :title="t('notification')"
        :text="t('organization_no_membership_message')"
        :button-text="t('show_manual_page')"
        button-link="/help/permissions"
    />

    <UranusDashboardActionBar>
      <router-link
          to="/admin/organization/create"
          class="uranus-action-button">
        {{ t('create_organization') }}
      </router-link>
    </UranusDashboardActionBar>


    <!-- Error Message -->
    <div v-if="error" class="organization-dashboard-view__error">
      <p class="form-feedback-error">{{ error }}</p>
    </div>

    <!-- Organization Cards Grid -->
    <div class="organization-grid">
      <UranusOrganizationCard
          v-for="organization in organizations"
          :key="organization.organization_id"
          :organization="organization"
          @deleted="handleOrganizationDeleted"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusOrganizationCard from '@/components/organization/UranusOrganizationCard.vue'
import UranusDashboardHero from "@/components/dashboard/UranusDashboardHero.vue"
import UranusDashboardActionBar from "@/components/uranus/UranusDashboardActionBar.vue";
import UranusNotification from "@/components/ui/UranusNotification.vue";

const { t } = useI18n()

interface Organization {
  organization_id: number
  organization_name: string
  organization_city: string | null
  organization_country_code: string | null
  total_upcoming_events: number
  venue_count: number
  space_count: number
  can_edit_organization: boolean
  can_delete_organization: boolean
  can_manage_team: boolean
}

const organizations = ref<Organization[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

const handleOrganizationDeleted = (organizationId: number) => {
  organizations.value = organizations.value.filter(org => org.organization_id !== organizationId)
}

onMounted(async () => {
  try {
    const { data } = await apiFetch<{ organizations: Organization[] }>('/api/admin/organization/dashboard')
    organizations.value = data?.organizations || []
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || 'Failed to load dashboard'
    } else {
      error.value = 'Unknown error'
    }
  }
  finally {
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

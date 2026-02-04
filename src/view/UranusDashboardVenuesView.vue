<!--
  src/view/UranusDashboardVenuesView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero :title="t('venues')" :subtitle="t('venues_description')" />

    <UranusNotification
        v-if="!organizationId"
        type="info"
    >
      <!-- No Organization Selected Message -->
      <template #title>
        {{ t('notification_cant_see_venues_title') }}
      </template>
      <template #default>
        <div v-html="t('notification_cant_see_venues_message')"></div>
      </template>
      <template #actions>
        <RouterLink to="/admin/organizations" class="uranus-notification-button">
          {{ t('notification_cant_see_venues_action') }}
        </RouterLink>
      </template>
    </UranusNotification>

    <template v-else>
      <div v-if="!isLoading" class="uranus-main-layout">
        <UranusDashboardActionBar
            v-if="organizationVenueInfos && organizationVenueInfos.canAddVenue"
        >
          <UranusActionButton :to="`/admin/organization/${organizationId}/venue/create`">
            {{ t('venue_add') }}
          </UranusActionButton>
        </UranusDashboardActionBar>

        <!-- Error Message, Todo: Implement errors -->
        <div v-if="error" class="organization-venue-view__error">
          <p class="form-feedback-error">{{ error }}</p>
        </div>

        <div v-if="organizationVenueInfos" class="organization-venue-view__content">
          <UranusVenueCard
              v-for="venueInfo in organizationVenueInfos?.venueInfos ?? []"
              :key="venueInfo.venueId"
              :venueInfo="venueInfo"
              :organizationId="organizationId"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import type { UranusVenueInfo, VenueInfoSpaceInfo, OrganizationVenueInfos, OrganizationVenueInfosApi } from '@/model/uranusVenueInfo.ts'
import { mapApiOrganizationVenueInfosToModel } from '@/model/uranusVenueInfo.ts'


import UranusVenueCard from '@/component/venue/UranusVenueCard.vue'
import UranusDashboardHero from "@/component/dashboard/UranusDashboardHero.vue"
import UranusDashboardActionBar from "@/component/uranus/UranusDashboardActionBar.vue"
import UranusNotification from "@/component/ui/UranusNotification.vue";
import UranusActionButton from "@/component/ui/UranusActionButton.vue";

const { t } = useI18n()
const appStore = useAppStore()

// Make organizationId reactive from the store
const organizationId = computed({
  get: () => appStore.organizationId,
  set: (val: number | null) => appStore.setOrganizationId(val),
})

const isLoading = ref(true)
const organizationVenueInfos = ref<OrganizationVenueInfos | null>(null)
const error = ref<string | null>(null)

const handleVenueDeleted = (venueId: number) => {
  if (!organizationVenueInfos.value) {
    return
  }
  organizationVenueInfos.value = {
    ...organizationVenueInfos.value,
    venueInfos: organizationVenueInfos.value.venueInfos.filter((venueInfo) => venueInfo.venueId !== venueId),
  }
}

watch(
    organizationId,
    async (id) => {
      isLoading.value = true
      if (id === null) {
        organizationVenueInfos.value = null
        isLoading.value = false
        return
      }

      try {
        const response = await apiFetch<OrganizationVenueInfosApi>(
            `/api/admin/organization/${id}/venues`
        )
        const apiData = response.data
        // ✅ Use the mapping function here
        organizationVenueInfos.value = mapApiOrganizationVenueInfosToModel(apiData)
        error.value = null
      } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
          const e = err as { data?: { error?: string } }
          error.value = e.data?.error || 'Failed to load organization venues'
        } else {
          error.value = 'Unknown error'
        }
        organizationVenueInfos.value = null
      } finally {
        isLoading.value = false
      }
    },
    { immediate: true }
)
</script>

<style scoped lang="scss">
// Error feedback
.organization-venue-view__error {
  width: 100%;
  max-width: 600px;
}

.form-feedback-error {
}

// Content section
.organization-venue-view__content {
  width: 100%;
  max-width: 1200px;
  display: flex;
  flex-direction: column;
  gap: var(--uranus-grid-gap);
}

// Stats section
// Venue cards grid
.organization-venue-view__grid {
  display: flex;
  flex-direction: column;
  gap: var(--uranus-grid-gap);
  width: 100%;
}

@media (max-width: 768px) {
}

@media (min-width: 1280px) {
}

// No organization selected message
.organization-venue-view__no-organization {
  width: 100%;
  max-width: 600px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.no-organization-content {
  text-align: center;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;

  h3 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: var(--uranus-muted-text);
    line-height: 1.6;
  }
}
</style>
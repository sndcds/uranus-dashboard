<!--
  src/component/venue/view/UranusAdminVenueListView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero :title="t('venues')" :subtitle="t('venues_description')" />

    <UranusNotification
        v-if="!organizationUuid"
        type="info"
        :action-label="t('notification_cant_see_venues_action')"
        action-to="/admin/organizations"
    >
      <template #title>
        {{ t('notification_cant_see_venues_title') }}
      </template>

      <div v-html="t('notification_cant_see_venues_message')"></div>
    </UranusNotification>


    <template v-else>
      <div v-if="!isLoading" class="uranus-main-layout">
        <div v-if="venueList && venueList.canAddVenue">
          <UranusButton :to="`/admin/organization/${organizationUuid}/venue/create`">
            {{ t('venue_add') }}
          </UranusButton>
        </div>

        <!-- Error Message, Todo: Implement errors -->
        <div v-if="error" class="organization-venue-view__error">
          <p class="form-feedback-error">{{ error }}</p>
        </div>

        <div v-if="venueList" class="organization-venue-view__content">
          <UranusVenueCard
              v-for="item in venueList?.venues ?? []"
              :key="item.uuid"
              :venueListItem="item"
              :organizationUuid="organizationUuid"
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
import { mapVenueList, type VenueList } from '@/domain/organization/venueList.ts'

import UranusVenueCard from '@/component/venue/UranusVenueCard.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import UranusButton from '@/component/ui/UranusButton.vue'

const { t } = useI18n()
const appStore = useAppStore()

// Make organizationId reactive from the store
const organizationUuid = computed({
  get: () => appStore.orgUuid,
  set: (val: string | null) => appStore.setOrganizationUuid(val),
})

const isLoading = ref(true)
const venueList = ref<VenueList | null>(null)
const error = ref<string | null>(null)

const handleVenueDeleted = (venueUuid: string) => {
  /*
  if (!organizationVenueList.value) {
    return
  }
  organizationVenueList.value = {
    ...organizationVenueList.value,
    venueInfos: organizationVenueList.value.venueInfos.filter((venueInfo) => venueInfo.venueUuid !== venueUuid),
  }
  */
}

watch(
    organizationUuid,
    async (uuid) => {
      isLoading.value = true
      if (uuid === null) {
        venueList.value = null
        isLoading.value = false
        return
      }

      try {
        const { response } = await apiFetch<any>(`/api/admin/organization/${uuid}/venues`)

        venueList.value = mapVenueList(response?.data)
        console.log('Mapped organizations:', JSON.stringify(venueList.value, null, 2))

/*
        // Sort spaces by spaceName in each venue
        organizationVenueInfos.value.venueInfos.forEach(venue => {
          venue.spaceInfos.sort((a, b) =>
              a.spaceName.localeCompare(b.spaceName, undefined, { sensitivity: 'base' })
          )
        })
*/
        error.value = null
      } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
          const e = err as { data?: { error?: string } }
          error.value = e.data?.error || 'Failed to load organization venues'
        } else {
          error.value = 'Unknown error'
        }
        organizationVenueList.value = null
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
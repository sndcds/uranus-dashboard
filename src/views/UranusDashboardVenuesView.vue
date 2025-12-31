<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero :title="t('venues')" :subtitle="t('venues_description')" />

    <UranusNotification v-if="!organizationId" type="info">
      <!-- No Organization Selected Message -->
      <template #title>
        {{ t('notification_cant_see_venues_title') }}
      </template>
      <template #default>
        <div v-html="t('notification_cant_see_venues_message')"></div>
      </template>
      <template #actions>
        <RouterLink to="/admin/organizations" class="notification-button">
          {{ t('notification_cant_see_venues_action') }}
        </RouterLink>
      </template>
    </UranusNotification>

    <template v-else>
      <div v-if="!isLoading" class="uranus-main-layout">
        <UranusDashboardActionBar
            v-if="organization && organization.can_add_venue"
        >
          <router-link
              :to="`/admin/organization/${organizationId}/venue/create`"
              class="uranus-action-button">
            {{ t('venue_add') }}
          </router-link>
        </UranusDashboardActionBar>

        <!-- Error Message, Todo: Implement errors -->
        <div v-if="error" class="organization-venue-view__error">
          <p class="form-feedback-error">{{ error }}</p>
        </div>

        <div v-if="organization" class="organization-venue-view__content">
          <div class="organization-venue-view__grid">
            <UranusVenueCard
                v-for="venue in organization.venues"
                :key="venue.venue_id"
                :venue="venue"
                :organizationId="organizationId || 0"
                @deleted="handleVenueDeleted"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { useAppStore } from '@/store/appStore'

import UranusVenueCard from '@/components/venue/UranusVenueCard.vue'
import UranusDashboardHero from "@/components/dashboard/UranusDashboardHero.vue"
import UranusDashboardActionBar from "@/components/uranus/UranusDashboardActionBar.vue"
import UranusDashboardInfo from "@/components/dashboard/UranusDashboardInfo.vue";
import UranusNotification from "@/components/ui/UranusNotification.vue";

const { t } = useI18n()
const appStore = useAppStore()

// Make organizationId reactive from the store
const organizationId = computed({
  get: () => appStore.organizationId,
  set: (val: number | null) => appStore.setOrganizationId(val),
})

interface Space {
  space_id: number
  space_name: string
  upcoming_event_count: number
}

interface Venue {
  venue_id: number
  venue_name: string
  upcoming_event_count: number
  spaces: Space[]
  can_edit?: boolean
  can_edit_venue?: boolean
  can_delete_venue?: boolean
  can_add_space?: boolean
  can_edit_space?: boolean
  can_delete_space?: boolean
  can_add_event?: boolean
  can_edit_event?: boolean
  can_delete_event?: boolean
  can_release_event?: boolean
}

interface Organization {
  organization_id: number
  organization_name: string
  can_edit_organization?: boolean
  can_delete_organization?: boolean
  can_add_venue?: boolean
  can_add_space?: boolean
  can_add_event?: boolean
  total_upcoming_events: number
  venues: Venue[]
}

const isLoading = ref(true)
const organization = ref<Organization | null>(null)
const error = ref<string | null>(null)

const handleVenueDeleted = (venueId: number) => {
  if (!organization.value) {
    return
  }
  organization.value = {
    ...organization.value,
    venues: organization.value.venues.filter((venue) => venue.venue_id !== venueId),
  }
}

// Watch for changes in organizationId and fetch organization data
watch(
    organizationId,
    async (id) => {
      isLoading.value = true
      if (id === null) {
        organization.value = null
        isLoading.value = false
        return
      }

      try {
        const response = await apiFetch<Organization>(
            `/api/admin/organization/${id}/venues`
        )
        organization.value = response.data
        error.value = null
      } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
          const e = err as { data?: { error?: string } }
          error.value = e.data?.error || 'Failed to load organization venues'
        } else {
          error.value = 'Unknown error'
        }
        organization.value = null
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
    color: var(--color-text);
  }

  p {
    margin: 0;
    color: var(--uranus-muted-text);
    line-height: 1.6;
  }
}
</style>
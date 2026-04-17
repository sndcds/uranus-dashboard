<!--
  src/component/venue/view/UranusAdminVenueListView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('venues')"
        :subtitle="t('venues_list_hero_description')"
    />

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

        <UranusFeedback :show="!!error" type="error">
          <h3>{{  t('error_notification') }}</h3>
          <p>{{ t('error_missing_permissions') }}</p>
        </UranusFeedback>

        <div v-if="venueList" class="organization-venue-view__content">
          <UranusVenueCard
              v-for="item in venueList?.venues ?? []"
              :key="item.venueUuid"
              :venueListItem="item"
              :organizationUuid="organizationUuid"
              @deleted="handleVenueDeleted"
          />
        </div>
      </div>
    </template>

    <div class="venue-space-list" ref="containerRef" style="margin-top: 2rem;">
      <h2>Diese Spielstätten kannst du für Events auswählen</h2>
      <div
          class="uranus-card venue-group"
          v-for="venue in choosableVenuesStore.getVenueSpacesInfos()"
          :key="venue.venueUuid"
      >
        <div class="venue-item">
          {{ venue.venueName }} ({{ venue.city }})
        </div>

        <div
            v-for="space in venue.spaces"
            :key="space.spaceUuid ?? 0"
            class="space-item"
        >
          {{ space.spaceName }}
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {ref, computed, watch, onMounted} from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import { mapVenueList, type VenueList } from '@/domain/organization/venueList.ts'
import { useChoosableVenuesStore } from '@/store/choosableVenuesStore.ts'

import UranusVenueCard from '@/component/venue/card/UranusVenueCard.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFeedback from "@/component/uranus/UranusFeedback.vue";


const { t } = useI18n()
const appStore = useAppStore()
const choosableVenuesStore = useChoosableVenuesStore()

// Make organizationId reactive from the store
const organizationUuid = computed({
  get: () => appStore.orgUuid,
  set: (val: string | null) => appStore.setOrganizationUuid(val),
})

const isLoading = ref(true)
const venueList = ref<VenueList | null>(null)
const error = ref<string | null>(null)

const loadVenues = async (uuid: string | null) => {
  isLoading.value = true

  if (!uuid) {
    venueList.value = null
    isLoading.value = false
    return
  }

  try {
    const apiPath = `/api/admin/organization/${uuid}/venues`
    const apiResponse = await apiFetch<any>(apiPath)
    console.log(JSON.stringify(apiResponse.data, null, 2))
    venueList.value = mapVenueList(apiResponse.data)
    error.value = null
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || 'Failed to load organization venues'
    } else {
      error.value = 'Unknown error'
    }
  } finally {
    isLoading.value = false
  }
}

const handleVenueDeleted = async () => {
  await loadVenues(organizationUuid.value)
}

watch(
    organizationUuid,
    (uuid) => loadVenues(uuid),
    { immediate: true }
)

onMounted(() => {
  choosableVenuesStore.fetchAll()
})
</script>

<style scoped lang="scss">

.venue-space-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.venue-group {
  font-weight: 500;
}

.space-item {
  font-weight: 300;
  padding-left: 2rem;
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
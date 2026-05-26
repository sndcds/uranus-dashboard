<!--
  src/component/venue/view/UranusAdminVenueListView.vue
-->

<template>
  <div class="uranus-main-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('venues')"
        :subtitle="t('venues_list_hero_description')"
    />

    <UranusNotification
        v-if="!appStore.orgUuid"
        type="info"
        :action-label="t('notification_cant_see_venues_action')"
        action-to="/admin/orgs"
    >
      <template #title>
        {{ t('notification_cant_see_venues_title') }}
      </template>

      <div v-html="t('notification_cant_see_venues_message')"></div>
    </UranusNotification>


    <template v-else>
      <div v-if="!isLoading" class="uranus-main-layout">
        <div v-if="venueList && venueList.canAddVenue">
          <UranusButton :to="`/admin/org/${appStore.orgUuid}/venue/create`">
            {{ t('venue_add') }}
          </UranusButton>
        </div>

        <UranusFeedback v-if="!!error" type="error">
          <h3>{{  t('error_notification') }}</h3>
          <p>{{ t('error_missing_permissions') }}</p>
        </UranusFeedback>

        <div v-if="venueList" class="uranus-vertical-flex">
            <UranusAdminVenueCard
              v-for="item in sortedVenues"
              :key="item.venueUuid"
              :venueListItem="item"
              :orgUuid="appStore.orgUuid"
              @deleted="handleVenueDeleted"
          />
        </div>
      </div>
    </template>

  </div>
</template>

<script setup lang="ts">
import {computed, ref, onMounted} from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'
import { mapVenueList, type VenueList } from '@/domain/venue/venueList.ts'
import { useChoosableVenuesStore } from '@/store/choosableVenuesStore.ts'

import UranusAdminVenueCard from '@/component/venue/card/UranusAdminVenueCard.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFeedback from "@/component/uranus/UranusFeedback.vue";
import UranusOrgTitle from "@/component/layout/UranusOrgTitle.vue";


const { t } = useI18n()
const appStore = useAppStore()
const choosableVenuesStore = useChoosableVenuesStore()

const isLoading = ref(true)
const venueList = ref<VenueList | null>(null)
const error = ref<string | null>(null)
const sortedVenues = computed(() => {
  const venues = venueList.value?.venues ?? []
  return [...venues].sort((a, b) =>
      a.venueName.localeCompare(b.venueName, undefined, { sensitivity: 'base' })
  )
})

const loadVenues = async (uuid: string | null) => {
  isLoading.value = true

  if (!uuid) {
    venueList.value = null
    isLoading.value = false
    return
  }

  try {
    const apiPath = `/api/admin/org/${uuid}/venues`
    const apiResponse = await apiFetch<any>(apiPath)
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
  await loadVenues(appStore.orgUuid)
}

onMounted(() => {
  loadVenues(appStore.orgUuid)
  choosableVenuesStore.fetchAll(appStore.orgUuid)
})
</script>

<style scoped lang="scss">

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
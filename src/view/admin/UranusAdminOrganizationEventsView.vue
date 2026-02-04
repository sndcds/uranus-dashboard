<!--
  src/view/admin/UranusAdminOrganizationEventsView.vue
-->

<template>
  <div class="uranus-max-layout">
    <UranusDashboardHero
        :title="t('events_title')"
        :subtitle="t('events_subtitle')" />

    <!-- No Organization Selected Message -->
    <UranusNotification v-if="deleteError" type="error">
      <template #title>{{ t('error_notification') }}</template>
      <template #default>{{ deleteError }}</template>
    </UranusNotification>

    <UranusNotification v-if="!organizationId" type="info">
      <template #title>{{ t('notification_cant_see_events_title') }}</template>
      <template #default>
        <div v-html="t('notification_cant_see_events_message')"></div>
      </template>
      <template #actions>
        <RouterLink to="/admin/organizations" class="uranus-notification-button">
          {{ t('notification_cant_see_events_action') }}
        </RouterLink>
      </template>
    </UranusNotification>

    <template v-else>
      <UranusDashboardActionBar v-if="!isLoading && canAddEvent">
        <UranusActionButton :to="`/admin/organization/${organizationId}/event/create`">
          {{ t('add_new_event') }}
        </UranusActionButton>
      </UranusDashboardActionBar>

      <div v-if="organizationId" class="uranus-dashboard-card-grid uranus-max-layout">
        <UranusAdminEventCard
            v-for="event in events"
            :key="`${event.id}-${event.dateId ?? 'series'}`"
            :event="event"
            @deleted="onEventDeleted"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api.ts'

import UranusAdminEventCard from '@/component/event/UranusAdminEventCard.vue'
import UranusDashboardHero from "@/component/dashboard/UranusDashboardHero.vue"
import UranusDashboardActionBar from "@/component/uranus/UranusDashboardActionBar.vue"
import UranusNotification from "@/component/ui/UranusNotification.vue";
import UranusActionButton from "@/component/ui/UranusActionButton.vue";
import { useUranusAdminListEvents } from "@/composable/useUranusAdminListEvents.ts"

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()

const { adminListEvents, metadata, loading: isLoading, error, fetchAdminListEvents } = useUranusAdminListEvents();

const deleteError = ref('')
const organizationId = Number(route.params.id)

const canAddEvent = computed(() => !!metadata.value.canAddEvent);
const events = adminListEvents;


interface EventsApiResponse {
  can_add_event: boolean
  events: unknown[]
}

interface DeleteEventPayload {
  id: number
  dateId: number | null
  deleteSeries: boolean
}


const onEventDeleted = async ({eventId, dateId, deleteSeries}: {
  eventId: number
  dateId: number | null
  deleteSeries: boolean
}) => {
  try {
    // Optionally, you could show a loading state here
    // e.g., isLoading.value = true

    // Refetch events from API
    await fetchAdminListEvents(organizationId)

    // Optionally, show a success toast or message
    console.log(`Event ${eventId} deleted successfully`)
  } catch (err) {
    console.error("Failed to refetch events after delete:", err)
    // Optionally, set an error state
    deleteError.value = t('failed_to_refresh_events')
  } finally {
    // Optionally, reset loading state
    // isLoading.value = false
  }
}


onMounted(async () => {
  if (organizationId) {
    await fetchAdminListEvents(organizationId);
  }
});
</script>

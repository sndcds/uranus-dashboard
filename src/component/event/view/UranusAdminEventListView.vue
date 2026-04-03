<!--
  src/component/event/view/UranusAdminEventListView.vue
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

    <UranusNotification
        v-if="!orgUuid"
        type="info"
        :action-label="t('notification_cant_see_events_action')"
        action-to="/admin/organizations"
    >
      <template #title>{{ t('notification_cant_see_events_title') }}</template>
      <template #default>
        <div v-html="t('notification_cant_see_events_message')"></div>
      </template>
    </UranusNotification>

    <template v-else>
      <div v-if="!isLoading && canAddEvent">
        <UranusButton :to="`/admin/organization/${orgUuid}/event/create`">
          {{ t('add_new_event') }}
        </UranusButton>
      </div>

      <div v-if="orgUuid" class="uranus-dashboard-card-grid uranus-max-layout">
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
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/appStore.ts'
import UranusAdminEventCard from '@/component/event/card/UranusAdminEventCard.vue'
import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusNotification from '@/component/ui/UranusNotification.vue'
import { useUranusAdminListEvents } from '@/composable/useUranusAdminListEvents.ts'
import UranusButton from '@/component/ui/UranusButton.vue'

const { t } = useI18n({ useScope: 'global' })
const appStore = useAppStore()

const { adminListEvents, metadata, loading: isLoading, fetchAdminListEvents } = useUranusAdminListEvents();

const deleteError = ref('')
const orgUuid = computed(() => appStore.orgUuid)

const canAddEvent = computed(() => !!metadata.value.can_add_event);
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
    await fetchAdminListEvents(orgUuid)
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
  if (orgUuid) {
    await fetchAdminListEvents(orgUuid.value ?? '');
  }
});
</script>

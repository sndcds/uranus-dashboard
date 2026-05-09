<!--
  src/component/event/view/UranusAdminEventCardsView.vue
-->

<template>
  <div class="uranus-max-layout">
    <UranusOrgTitle />
    <UranusDashboardHero
        :title="t('events')"
        :subtitle="t('events_hero_subtitle')" />

    <!-- No Organization Selected Message -->
    <UranusNotification v-if="deleteError" type="error">
      <template #title>{{ t('error_notification') }}</template>
      <template #default>{{ deleteError }}</template>
    </UranusNotification>

    <UranusNotification
        v-if="!orgUuid"
        type="info"
        :action-label="t('notification_cant_see_events_action')"
        action-to="/admin/orgs"
    >
      <template #title>{{ t('notification_cant_see_events_title') }}</template>
      <template #default>
        <div v-html="t('notification_cant_see_events_message')"></div>
      </template>
    </UranusNotification>

    <template v-else>
      <div v-if="!isLoading" class="event-list-toolbar">
        <UranusButton v-if="canAddEvent" :to="`/admin/org/${orgUuid}/event/create`">
          {{ t('add_new_event') }}
        </UranusButton>

        <UranusSegmentedSelect
            v-model="displayMode"
            :options="displayModeOptions"
            size="small"
        />
      </div>

      <div v-if="orgUuid" class="uranus-dashboard-card-grid uranus-max-layout">
        <UranusAdminEventCard
            v-for="event in displayedEvents"
            :key="`${event.uuid}-${event.dateUuid ?? 'series'}`"
            :event="event"
            :grouped="displayMode === 'grouped'"
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
import UranusOrgTitle from "@/component/layout/UranusOrgTitle.vue";
import UranusSegmentedSelect from '@/component/ui/UranusSegmentedSelect.vue'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem.ts'

const { t } = useI18n({ useScope: 'global' })
const appStore = useAppStore()

const { adminListEvents, metadata, loading: isLoading, fetchAdminListEvents } = useUranusAdminListEvents();

const deleteError = ref('')
const orgUuid = computed(() => appStore.orgUuid)

const canAddEvent = computed(() => !!metadata.value.can_add_event);
const events = adminListEvents;
type EventListDisplayMode = 'all' | 'grouped'
const displayMode = ref<EventListDisplayMode>('all')
const displayModeOptions = computed(() => [
  { label: t('show_grouped'), value: 'grouped' },
  { label: t('show_single'), value: 'all' },
])
const displayedEvents = computed(() => {
  if (displayMode.value === 'all') return events.value

  const grouped = new Map<string, AdminEventListItem>()
  events.value.forEach((event) => {
    if (!grouped.has(event.uuid)) {
      grouped.set(event.uuid, event)
    }
  })

  return Array.from(grouped.values())
})

const onEventDeleted = async ({eventUuid}: {
  eventUuid: string
  dateUuid: string | null
  deleteSeries: boolean
}) => {
  try {
    await fetchAdminListEvents(orgUuid.value)
    console.log(`Event ${eventUuid} deleted successfully`)
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
    // await fetchAdminListEvents(orgUuid.value ?? '', '2020-01-01');
  }
});
</script>

<style scoped>
.event-list-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 2rem;
  margin-bottom: 1rem;
}
</style>

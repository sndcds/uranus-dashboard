<template>
  <div class="uranus-max-layout">
    <UranusDashboardHero
        :title="t('events_title')"
        :subtitle="t('events_subtitle')" />

    <!-- No Organization Selected Message -->
    <UranusNotification
        v-if="!organizationId"
        type="info"
    >
      <template #title>
        {{ t('notification_cant_see_events_title') }}
      </template>
      <template #default>
        <div v-html="t('notification_cant_see_events_message')"></div>
      </template>
      <template #actions>
        <RouterLink to="/admin/organizations" class="notification-button">
          {{ t('notification_cant_see_events_action') }}
        </RouterLink>
      </template>
    </UranusNotification>

    <template v-else>
      <UranusDashboardActionBar v-if="!isLoading && canAddEvent">
        <router-link
            class="uranus-action-button"
            :to="`/admin/organization/${organizationId}/event/create`"
        >
          {{ t('add_new_event') }}
        </router-link>
      </UranusDashboardActionBar>

      <div
          v-if="organizationId"
          class="uranus-dashboard-card-grid uranus-max-layout"
      >
        <UranusDashboardEventCard
            v-for="event in events"
            :key="event.eventId"
            :event="event"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusDashboardEventCard from '@/components/dashboard/UranusDashboardEventCard.vue'
import UranusDashboardHero from "@/components/dashboard/UranusDashboardHero.vue"
import UranusDashboardActionBar from "@/components/uranus/UranusDashboardActionBar.vue"
import { mapDashboardEventData } from "@/utils/UranusDashboardEventDataMapper.ts"
import { UranusEventBase } from "@/models/UranusEventModel.ts"
import UranusNotification from "@/components/ui/UranusNotification.vue";

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()

const organizationId = Number(route.params.id)

const events = ref<UranusEventBase[]>([])
const error = ref<string | null>(null)
const isLoading = ref(true)
const canAddEvent = ref(false)


interface EventsApiResponse {
  can_add_event: boolean
  events: unknown[] // replace with your UranusEventBase[] if you have the type
}

const fetchEvents = async () => {
  isLoading.value = true
  error.value = null

  try {
    const { data } = await apiFetch<EventsApiResponse>(
        `/api/admin/organization/${organizationId}/events?lang=${locale.value}`
    )

    // Extract the permission flag
    canAddEvent.value = !!data?.can_add_event

    // Normalize events array
    const rawEvents = Array.isArray(data?.events) ? data.events : []
    events.value = rawEvents
        .map(mapDashboardEventData)
        .filter((e): e is UranusEventBase => e !== null)

  } catch (err) {
    error.value =
        err instanceof Error ? err.message : t('events_fetch_failed_generic')
    events.value = []
    canAddEvent.value = false
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchEvents(),
  ])
})

interface DeleteEventPayload {
  eventId: number
  eventDateId: number | null
  deleteSeries: boolean
}

const removeEventCard = async ({
                                 eventId,
                                 eventDateId,
                                 deleteSeries,
                               }: DeleteEventPayload) => {
  if (deleteSeries) {
    events.value = events.value.filter(e => e.eventId !== eventId)
  } else if (eventDateId !== null) {
    events.value = events.value.filter(e => e.eventDateId !== eventDateId)
  } else {
    events.value = events.value.filter(e => e.eventId !== eventId)
  }

  await fetchEvents()
}
</script>

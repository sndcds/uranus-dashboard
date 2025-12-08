<template>
  <div class="uranus-max-layout">
    <DashboardHeroComponent
        :title="t('events_title')"
        :subtitle="t('events_subtitle')" />

    <UranusDashboardActionBar v-if="canAddEvent">
      <router-link :to="`/admin/organizer/${organizerId}/event/create`" class="uranus-button">
        {{ t('add_new_event') }}
      </router-link>
    </UranusDashboardActionBar>

    <div class="uranus-dashboard-event-card-grid uranus-max-layout">
      <UranusDashboardEventCard
          v-for="event in events"
          :key="event.eventId"
          :event="event as UranusEventBase"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusDashboardEventCard from '@/components/dashboard/UranusDashboardEventCard.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue"
import UranusDashboardActionBar from "@/components/uranus/UranusDashboardActionBar.vue";
import {mapDashboardEventData} from "@/utils/UranusDashboardEventDataMapper.ts";
import {UranusEventBase} from "@/models/UranusEventModel.ts";

const apiBase = import.meta.env.VITE_API_URL

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()

const organizerId = Number(route.params.id)

const events = ref<UranusEventBase[]>([])
const error = ref<string | null>(null)
const isLoading = ref(false)
const canAddEvent = ref(false)

const loadOrganizerPermission = async () => {
    try {
        const { data } = await apiFetch<{ can_add_event: boolean }>(
            `/api/admin/organizer/${organizerId}/event/permission`
        )
        canAddEvent.value = Boolean(data?.can_add_event)
    } catch (err) {
        console.error('Failed to load organizer permissions', err)
        canAddEvent.value = false
    }
}

const fetchEvents = async () => {
  isLoading.value = true
  error.value = null

  try {
    const { data, status } = await apiFetch<
        UranusEventBase[] | { events?: any[] } // raw API response
    >(
        `/api/admin/organizer/${organizerId}/events?lang=${locale.value}`
    )

    if (status >= 200 && status < 300) {
      let rawEvents: any[] = []

      if (Array.isArray(data)) {
        rawEvents = data
      } else if (data && typeof data === 'object' && Array.isArray(data.events)) {
        rawEvents = data.events
      }

      // Map snake_case → camelCase using mapEvent
      events.value = rawEvents.map((e) => mapDashboardEventData(e))
    } else {
      error.value = t('events_fetch_failed', { status })
      events.value = []
    }
  } catch (err: unknown) {
    if (typeof err === 'object' && err && 'data' in err) {
      const e = err as { data?: { error?: string } }
      error.value = e.data?.error || t('events_fetch_failed_generic')
    } else if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = t('events_fetch_failed_generic')
    }
    events.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
    await fetchEvents()
    await loadOrganizerPermission()
})

interface DeleteEventPayload {
    eventId: number
    eventDateId: number | null
    deleteSeries: boolean
}

const removeEventCard = async ({ eventId, eventDateId, deleteSeries }: DeleteEventPayload) => {
    if (deleteSeries) {
        events.value = events.value.filter(event => event.eventId !== eventId)
    } else if (eventDateId !== null) {
        events.value = events.value.filter(event => event.eventDateId !== eventDateId)
    } else {
        events.value = events.value.filter(event => event.eventId !== eventId)
    }

    await fetchEvents()
}
</script>

<style scoped lang="scss">
.uranus-dashboard-event-card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: var(--uranus-grid-gap);
  justify-items: stretch;
  align-items: stretch;
}

.uranus-dashboard-event-card-grid > * {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
</style>
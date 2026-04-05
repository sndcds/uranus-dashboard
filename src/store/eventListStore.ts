// src/store/eventsStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/api.ts'
import { type EventListItem } from '@/domain/event/eventListItem.model.ts'
import { mapEventDTO } from '@/domain/event/eventListItem.mapper.ts'
import { type EventListItemsApiData } from '@/api/dto/event.dto.ts'


export const useEventListStore = defineStore('events', () => {
    const events = ref<EventListItem[]>([])
    const lastEventStartAt = ref<string | null>(null)
    const lastEventDateUuid = ref<string | null>(null)
    const loading = ref(false)
    const error = ref<string | null>(null)
    const hasMore = ref(true) // for infinite scroll

    function reset() {
        events.value = []
        lastEventStartAt.value = null
        lastEventDateUuid.value = null
        loading.value = false
        error.value = null
        hasMore.value = true
    }

    function hasEvents(): boolean {
        return events.value.length > 0
    }

    function getEventImageUrl(event: EventListItem): string {
        if (!event.imageUrl) {
            return import.meta.env.BASE_URL + "assets/event_dummy.png"
        }

        const url = new URL(event.imageUrl, window.location.origin)
        url.searchParams.set("width", "480")
        url.searchParams.set("ratio", "16:9")

        return url.toString()
    }

    /** Load events with optional reset for first page */
    async function loadEvents(resetPage: boolean = false) {
        if (loading.value || (!hasMore.value && !resetPage)) return
        loading.value = true

        if (resetPage) reset()

        try {
            // Build query params with lastEventStartAt / lastEventDateUuid for pagination
            const params = new URLSearchParams()
            if (lastEventStartAt.value) params.append('last_event_start_at', lastEventStartAt.value)
            if (lastEventDateUuid.value) params.append('last_event_date_id', lastEventDateUuid.value)

            const apiPath = `/api/events?${params.toString()}`

            const apiResponse = await apiFetch<EventListItemsApiData>(apiPath)

            const apiData = apiResponse?.data ?? null
            if (apiData) {
                const apiEvents = apiData.events ?? []
                if (apiEvents && apiEvents.length) {
                    const mappedEvents = apiEvents.map(mapEventDTO)
                    events.value.push(...mappedEvents)
                    lastEventStartAt.value = apiData.last_event_start_at ?? null
                    lastEventDateUuid.value = apiData.last_event_date_uuid ?? null

                    if (!apiEvents.length) {
                        hasMore.value = false
                    } else {
                        hasMore.value = !!apiData.last_event_date_uuid
                    }
                }
            } else {
                hasMore.value = false
            }

            error.value = null
        } catch (err: unknown) {
            error.value = 'Failed to load events'
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    return {
        events,
        lastEventStartAt,
        lastEventDateUuid,
        loading,
        reset,
        error,
        hasEvents,
        hasMore,
        loadEvents,
        getEventImageUrl
    }
})
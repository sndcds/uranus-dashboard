// src/store/eventsStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/api.ts'
import { type EventListItem, type EventListTypeSummary } from '@/domain/event/eventListItem.model.ts'
import { mapEventDTO } from '@/domain/event/eventListItem.mapper.ts'
import { type EventListItemsApiData, type EventListTypeSummaryDTO } from '@/api/dto/event.dto.ts'
import { useEventsFilterStore } from '@/store/eventsFilterStore.ts'


export const useEventListStore = defineStore('events', () => {
    const events = ref<EventListItem[]>([])
    const lastEventStartAt = ref<string | null>(null)
    const lastEventDateUuid = ref<string | null>(null)
    const limit = 20
    const loading = ref(false)
    const error = ref<string | null>(null)
    const hasMore = ref(true) // for infinite scroll
    const eventsFilterStore = useEventsFilterStore()
    const typeSummary = ref<EventListTypeSummary[]>([])

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

    function buildFilterParams(paginationMode = false, typesMode = false): URLSearchParams {
        const params = new URLSearchParams()
        const f = eventsFilterStore.filter

        // Pagination
        if (paginationMode) {
            params.set("limit", limit.toString())
            if (lastEventStartAt.value) {
                params.set("last_event_start_at", lastEventStartAt.value)
                if (lastEventDateUuid.value) {
                    params.set("last_event_date_uuid", lastEventDateUuid.value)
                }
            }
        }

        // Categories
        if (f.categories?.length) params.set("categories", f.categories.join(","))

        // Basic filters
        if (f.search) params.set("search", f.search)
        if (f.city) params.set("city", f.city)
        if (f.startDate) params.set("start", f.startDate)
        if (f.endDate) params.set("end", f.endDate)

        // Venue filter
        if (f.venue?.uuid != null) params.set("venues", f.venue.uuid)

        // Location filter
        if (f.useCurrentLocation && typeof f.latitude === 'number' && typeof f.longitude === 'number' && typeof f.radiusKm === 'number') {
            params.set("lat", f.latitude.toString())
            params.set("lon", f.longitude.toString())
            params.set("radius", Math.round(f.radiusKm * 1000).toString()) // km → m
        }

        // Age filter
        if (typeof f.minAge === 'number' && typeof f.maxAge === 'number') {
            params.set("age", `${f.minAge},${f.maxAge}`)
        } else if (typeof f.minAge === 'number') {
            params.set("age", f.minAge.toString())
        } else if (typeof f.maxAge === 'number') {
            params.set("age", f.maxAge.toString())
        }

        // Price filter
        if (f.priceType !== 'not_specified') {
            if (f.priceType === 'free' || f.priceType === 'donation') {
                params.set("price", f.priceType)
            } else if (typeof f.maxPrice === 'number') {
                params.set("price", `${f.maxPrice},${f.priceCurrency}`)
            }
        }

        // Event types filter
        if (typesMode && f.eventTypeIds?.length) {
            params.set("event_types", f.eventTypeIds.join(","))
        }

        console.log("paginationMode", paginationMode, "typesMode", typesMode)
        console.log(JSON.stringify(params, null, 2))

        return params
    }

    async function loadTypeSummary() {
        try {
            const params = buildFilterParams(false, true) // no pagination, include types
            const apiPath = `/api/events/type-summary?${params.toString()}`
            const apiResponse = await apiFetch<{ summary: EventListTypeSummaryDTO[] }>(apiPath)
            typeSummary.value = mapEventTypeSummaryArray(apiResponse?.data?.summary ?? [])
        } catch (err) {
            console.error('Failed to load type summary:', err)
        }
    }

    function mapEventTypeSummary(dto: EventListTypeSummaryDTO): EventListTypeSummary {
        return {
            typeId: dto.type_id,
            count: dto.count
        }
    }

    function mapEventTypeSummaryArray(dtos: EventListTypeSummaryDTO[]): EventListTypeSummary[] {
        return dtos.map(mapEventTypeSummary)
    }

    async function loadEvents(resetPage: boolean = false) {
        if (loading.value || (!hasMore.value && !resetPage)) return
        loading.value = true

        if (resetPage) reset()

        try {
            const params = buildFilterParams(true, true) // paginationMode + typesMode
            const apiPath = `/api/events?${params.toString()}`
            const apiResponse = await apiFetch<EventListItemsApiData>(apiPath)

            const apiData = apiResponse?.data ?? null
            if (apiData) {
                const apiEvents = apiData.events ?? []
                if (apiEvents.length) {
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
        typeSummary,
        lastEventStartAt,
        lastEventDateUuid,
        loading,
        reset,
        error,
        hasEvents,
        hasMore,
        loadEvents,
        loadTypeSummary,
        getEventImageUrl,
        buildFilterParams
    }
})
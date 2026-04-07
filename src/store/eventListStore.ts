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
    const typeSummary = ref<EventListTypeSummary[]>([])
    const lastEventStartAt = ref<string | null>(null)
    const lastEventDateUuid = ref<string | null>(null)
    const filterStore = useEventsFilterStore()
    const limit = 20
    const loading = ref(false)
    const error = ref<string | null>(null)
    const hasMore = ref(true) // for infinite scroll
    const loadEventsCounter = ref(0) // for infinite scroll

    function reset() {
        events.value = []
        typeSummary.value = []
        lastEventStartAt.value = null
        lastEventDateUuid.value = null
        loading.value = false
        error.value = null
        hasMore.value = true
    }

    function getLoadEventsCount(): number {
        return loadEventsCounter.value
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
        const filter = filterStore.filter

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
        if (filter.categories?.length) params.set("categories", filter.categories.join(","))

        // Basic filters
        if (filter.search) params.set("search", filter.search)
        if (filter.city) params.set("city", filter.city)
        if (filter.startDate) params.set("start", filter.startDate)
        if (filter.endDate) params.set("end", filter.endDate)

        // Venue filter
        if (filter.venue?.uuid != null) params.set("venues", filter.venue.uuid)

        // Location filter
        if (filter.useCurrentLocation && filter.latitude && filter.longitude && filter.radiusKm) {
            params.set("lat", filter.latitude.toString())
            params.set("lon", filter.longitude.toString())
            params.set("radius", Math.round(filter.radiusKm * 1000).toString()) // km → m
        }

        // Age filter
        if (filter.minAge && filter.maxAge) {
            params.set("age", `${filter.minAge},${filter.maxAge}`)
        } else if (filter.minAge) {
            params.set("age", filter.minAge.toString())
        } else if (filter.maxAge) {
            params.set("age", filter.maxAge.toString())
        }

        // Price filter
        if (filter.priceType !== 'not_specified') {
            if (filter.priceType === 'free' || filter.priceType === 'donation') {
                params.set("price", filter.priceType)
            } else if (filter.maxPrice) {
                params.set("price", `${filter.maxPrice},${filter.priceCurrency}`)
            }
        }

        // Event types filter
        if (typesMode && filter.eventTypeIds?.length > 0) {
            params.set("event_types", filter.eventTypeIds.join(","))
        }

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
        if (loading.value) return
        if (!resetPage && !hasMore.value) return

        if (resetPage) reset()

        loading.value = true

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
            loadEventsCounter.value++
        } catch (err: unknown) {
            error.value = 'Failed to load events'
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    return {
        getLoadEventsCount,
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
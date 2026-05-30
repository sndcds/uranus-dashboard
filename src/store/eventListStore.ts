/*
    src/store/eventListStore.ts
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/api.ts'
import { type EventListItem, type EventListTypeSummary } from '@/domain/event/eventListItem.model.ts'
import { mapEventDTO, mapEventWeekDTO } from '@/domain/event/eventListItem.mapper.ts'
import {
    type EventWeekApiData,
    type EventListItemsApiData,
    type EventListTypeSummaryDTO,
    type EventListTypeCountDTO }
    from '@/api/dto/event.dto.ts'
import { type UranusEventsFilter, useEventsFilterStore } from '@/store/eventsFilterStore.ts'

interface LoadEventsOptions {
    keepCurrentEvents?: boolean
}

interface LoadEventsEndpointOptions extends LoadEventsOptions {
    paginationMode?: boolean
    weeklyMode?: boolean
}

export const useEventListStore = defineStore('events', () => {
    const events = ref<EventListItem[]>([])
    const totalEventCount  = ref<number>(0)
    const typeSummary = ref<EventListTypeSummary[]>([])
    const lastEventStartAt = ref<string | null>(null)
    const lastEventDateUuid = ref<string | null>(null)
    const filterStore = useEventsFilterStore()
    const limit = 20
    const loading = ref(false)
    const error = ref<string | null>(null)
    const hasMore = ref(true) // for infinite scroll
    const loadEventsCounter = ref(0) // for infinite scroll
    let requestId = 0

    function reset(options: { keepSummary?: boolean } = {}) {
        events.value = []
        if (!options.keepSummary) {
            totalEventCount.value = 0
            typeSummary.value = []
        }
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

    function getEventImageUrl(
        event: EventListItem,
        options?: { width?: number; ratio?: string }
    ): string {
        if (!event.imageUrl) {
            return '/assets/event_placeholder.webp'
        }

        const url = new URL(event.imageUrl, window.location.origin)
        const width = options?.width ?? 480
        const ratio = options?.ratio ?? '16:9'
        url.searchParams.set('width', width.toString())
        url.searchParams.set('ratio', ratio)
        return url.toString()

    }

    function buildFilterParams(
        paginationMode = false,
        typesMode = false,
        filter: UranusEventsFilter = filterStore.getFilter()
    ): URLSearchParams {
        const params = new URLSearchParams()

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
        if (filter.portalPrefilter?.venues) {
            params.set("venues", filter.portalPrefilter.venues.toString())
        } else if (filter.venue?.uuid) {
            params.set("venues", filter.venue.uuid)
        }

        // Portal filter
        if (filter.portalUuid) params.set("portal", filter.portalUuid)

        // Location filter
        if (filter.useCurrentLocation && filter.latitude && filter.longitude && filter.radiusKm) {
            params.set("lat", filter.latitude.toString())
            params.set("lon", filter.longitude.toString())
            params.set("radius", Math.round(filter.radiusKm * 1000).toString()) // km → m
        }

        // Age filter
        if (filter.portalPrefilter?.age) {
            params.set("age", filter.portalPrefilter.age.toString())
        } else if (filter.minAge && filter.maxAge) {
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

    async function loadTypeSummary(filter: UranusEventsFilter = filterStore.getFilter()) {
        try {
            const params = buildFilterParams(false, true, filter)
            const apiPath = `/api/events/type-summary?${params.toString()}`
            const apiResponse = await apiFetch<EventListTypeSummaryDTO>(apiPath)
            typeSummary.value = mapEventTypeSummaryArray(
                apiResponse?.data?.summary ?? []
            )
            totalEventCount.value = apiResponse?.data?.total_event_count ?? 0
        } catch (err) {
            console.error('Failed to load type summary:', err)
        }
    }

    function mapEventTypeSummary(dto: EventListTypeCountDTO) {
        return {
            typeId: dto.type_id,
            count: dto.count
        }
    }

    function mapEventTypeSummaryArray(dtos: EventListTypeCountDTO[]) {
        return dtos.map(mapEventTypeSummary)
    }

    async function loadEvents(
        resetPage: boolean = false,
        filter: UranusEventsFilter = filterStore.getFilter(),
        options: LoadEventsOptions = {}
    ) {
        await loadEventsFromEndpoint('/api/events', resetPage, filter, {
            ...options,
            paginationMode: true,
        })
    }

    async function loadWeekEvents(
        resetPage: boolean = false,
        filter: UranusEventsFilter = filterStore.getFilter(),
        options: LoadEventsOptions = {}
    ) {
        await loadEventsFromEndpoint('/api/events/week', resetPage, filter, {
            ...options,
            paginationMode: false,
            weeklyMode: true,
        })
    }

    async function loadEventsFromEndpoint(
        endpointPath: string,
        resetPage: boolean,
        filter: UranusEventsFilter,
        options: LoadEventsEndpointOptions
    ) {
        const currentRequest = ++requestId
        if (loading.value) return
        if (!resetPage && !hasMore.value) return
        const replaceEvents = resetPage && options.keepCurrentEvents
        if (resetPage) {
            if (options.keepCurrentEvents) {
                lastEventStartAt.value = null
                lastEventDateUuid.value = null
                error.value = null
                hasMore.value = true
            } else {
                reset({ keepSummary: true })
            }
        }
        loading.value = true

        try {
            const params = buildFilterParams(options.paginationMode ?? true, true, filter)
            if (options.weeklyMode) {
                const weekStart = params.get('start')
                params.delete('start')
                params.delete('end')
                if (weekStart) {
                    params.set('week_start', weekStart)
                }
            }
            const apiPath = `${endpointPath}?${params.toString()}`
            const apiResponse = options.weeklyMode
                ? await apiFetch<EventWeekApiData>(apiPath)
                : await apiFetch<EventListItemsApiData>(apiPath)

            if (currentRequest !== requestId) return

            const apiEvents = options.weeklyMode
                ? (apiResponse.data?.days ?? []).flatMap((day) => day.events ?? [])
                : (apiResponse.data?.events ?? [])
            if (apiEvents.length === 0) {
                if (replaceEvents) {
                    events.value = []
                }
                hasMore.value = false
            } else {
                const mappedEvents = options.weeklyMode
                    ? apiEvents.map(mapEventWeekDTO)
                    : apiEvents.map(mapEventDTO)
                if (replaceEvents) {
                    events.value = mappedEvents
                } else {
                    events.value.push(...mappedEvents)
                }
                const listApiData = options.weeklyMode ? null : apiResponse.data
                lastEventStartAt.value = listApiData?.last_event_start_at ?? null
                lastEventDateUuid.value = listApiData?.last_event_date_uuid ?? null
                hasMore.value = (options.paginationMode ?? true)
                    ? !!listApiData?.last_event_date_uuid
                    : false
            }

            error.value = null
            loadEventsCounter.value++
        } catch (err) {
            error.value = 'Failed to load events'
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    return {
        getLoadEventsCount,
        events,
        totalEventCount,
        typeSummary,
        lastEventStartAt,
        lastEventDateUuid,
        loading,
        reset,
        error,
        hasEvents,
        hasMore,
        loadEvents,
        loadWeekEvents,
        loadTypeSummary,
        getEventImageUrl,
        buildFilterParams
    }
})

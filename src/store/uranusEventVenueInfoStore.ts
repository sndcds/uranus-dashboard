import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/api.ts'

export interface UranusEventVenueInfo {
    venueId: number
    venueName: string
    spaceId: number | null
    spaceName: string | null
    city: string
    country: string
}

interface UranusEventVenueInfoDTO {
    venue_id: number
    venue_name: string
    space_id: number | null
    space_name: string | null
    city: string
    country: string
}

interface ChoosableVenuesApiResponse {
    data: {
        total_count: number
        venueInfos: UranusEventVenueInfoDTO[]
    }
}

function mapVenue(dto: UranusEventVenueInfoDTO): UranusEventVenueInfo {
    return {
        venueId: dto.venue_id,
        venueName: dto.venue_name,
        spaceId: dto.space_id,
        spaceName: dto.space_name,
        city: dto.city,
        country: dto.country,
    }
}

export const useUranusEventVenueInfoStore = defineStore(
    'uranusEventVenueInfo',
    () => {
        const items = ref<UranusEventVenueInfo[]>([])
        const loading = ref(false)
        const error = ref<string | null>(null)

        const isEmpty = computed(() => items.value.length === 0)

        async function fetchAll() {
            if (items.value.length > 0) return

            loading.value = true
            error.value = null

            try {
                const res = await apiFetch<ChoosableVenuesApiResponse>(
                    '/api/admin/user/choosable-event-venues'
                )

                items.value = (res.data?.data?.venueInfos ?? []).map(mapVenue)

            } catch (e) {
                console.error(e)
                error.value = 'Failed to load venues'
            } finally {
                loading.value = false
            }
        }

        function clear() {
            items.value = []
            error.value = null
            loading.value = false
        }

        function getVenueLabel(venueId: number | null, spaceId: number | null): string {
            if (!venueId) return ''

            const exact = items.value.find(v =>
                v.venueId === venueId &&
                (spaceId == null ? v.spaceId == null : v.spaceId === spaceId)
            )

            if (exact) {
                return exact.spaceName
                    ? `${exact.venueName} – ${exact.spaceName}`
                    : exact.venueName
            }

            const venueOnly = items.value.find(v => v.venueId === venueId)
            return venueOnly ? venueOnly.venueName : ''
        }

        return {
            items,
            loading,
            error,
            isEmpty,
            fetchAll,
            clear,
            getVenueLabel,
        }
    }
)
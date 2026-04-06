import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/api.ts'
import { type VenueInfo } from '@/domain/venue/venueInfo.model.ts'
import type { VenueInfoDTO } from "@/api/dto/venueInfo.dto.ts";


interface ChoosableVenuesApiResponse {
    total_count: number
    venueInfos: VenueInfoDTO[]
}

function mapVenue(dto: VenueInfoDTO): VenueInfo {
    return {
        venueUuid: dto.venue_uuid,
        venueName: dto.venue_name,
        spaceUuid: dto.space_uuid,
        spaceName: dto.space_name,
        city: dto.city,
        country: dto.country,
    }
}

export const useUranusEventVenueInfoStore = defineStore(
    'uranusEventVenueInfo',
    () => {
        const items = ref<VenueInfo[]>([])
        const loading = ref(false)
        const error = ref<string | null>(null)

        const isEmpty = computed(() => items.value.length === 0)

        async function fetchAll() {
            if (items.value.length > 0) return

            loading.value = true
            error.value = null

            try {
                const apiPath = '/api/admin/user/choosable-event-venues'
                const apiResponse = await apiFetch<ChoosableVenuesApiResponse>(
                    apiPath
                )

                items.value = (apiResponse?.data?.venueInfos ?? []).map(mapVenue)

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

        function getVenueLabel(venueUuid: string | null, spaceUuid: string | null): string {
            if (!venueUuid) return ''

            const exact = items.value.find(v =>
                v.venueUuid == venueUuid &&
                (spaceUuid == null ? v.spaceUuid == null : v.spaceUuid == spaceUuid)
            )

            if (exact) {
                return exact.spaceName
                    ? `${exact.venueName} | ${exact.spaceName}`
                    : exact.venueName
            }

            const venueOnly = items.value.find(v => v.venueUuid === venueUuid)
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
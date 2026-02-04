// /src/store/uranusVenueStore.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/api.ts'
import type { UranusEventVenueInfoProp } from '@/model/uranusAdminEventModel.ts'

interface UranusVenueApiResponse {
    service: string
    api_version: string
    response_type: string
    status: string
    timestamp: string
    data: {
        total_count: number
        venueInfos: UranusEventVenueInfoProp[]
    }
}

export const useUranusUserOrgVenueStore = defineStore('uranusVenue', () => {
    // the venue list
    const venueInfos = ref<UranusEventVenueInfoProp[]>([])

    const loading = ref(false)
    const error = ref<string | null>(null)

    // load venues from API
    async function fetchVenues() {
        loading.value = true
        error.value = null

        try {
            const res = await apiFetch<UranusVenueApiResponse>(
                '/api/admin/user/choosable-event-venues'
            )
            venueInfos.value = res.data?.data?.venueInfos ?? []
        } catch (err) {
            console.error(err)
            error.value = 'Failed to fetch venues'
        } finally {
            loading.value = false
        }
    }

    return {
        venueInfos,
        loading,
        error,
        fetchVenues,
    }
})
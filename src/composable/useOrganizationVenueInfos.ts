// src/composable/useOrganizationVenueInfos.ts
import { ref, watch } from 'vue'
import { apiFetch } from '@/api.ts'
import type {
    UranusVenueInfo,
    OrganizationVenueInfos,
    OrganizationVenueInfosApi,
    VenueInfoSpaceInfoApi,
    VenueInfoApi,
} from '@/model/uranusVenueInfo.ts'
import { mapApiOrganizationVenueInfosToModel } from '@/model/uranusVenueInfo.ts'

export function useOrganizationVenueInfos(organizationId: number | null) {
    const organization = ref<OrganizationVenueInfos | null>(null)
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    async function loadVenues(id: number | null) {
        if (id === null) {
            organization.value = null
            return
        }

        isLoading.value = true
        error.value = null

        try {
            const response = await apiFetch<OrganizationVenueInfosApi>(
                `/api/admin/organization/${id}/venues`
            )
            const apiData = response.data
            organization.value = mapApiOrganizationVenueInfosToModel(apiData)
        } catch (err: unknown) {
            console.error(err)
            if (typeof err === 'object' && err && 'data' in err) {
                const e = err as { data?: { error?: string } }
                error.value = e.data?.error || 'Failed to load organization venues'
            } else {
                error.value = 'Unknown error'
            }
            organization.value = null
        } finally {
            isLoading.value = false
        }
    }

    // Optional: automatically reload when organizationId changes
    watch(
        () => organizationId,
        (id) => loadVenues(id),
        { immediate: true }
    )

    return { organization, isLoading, error, loadVenues }
}
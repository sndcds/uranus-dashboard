import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/api.ts'
import { type BasicVenueInfo, type BasicVenueSpacesInfo } from '@/domain/venue/basicVenueInfo.model.ts'
import type { BasicVenueInfoDTO } from "@/api/dto/basicVenueInfo.dto.ts";


interface ChoosableVenueInfosDTO {
    total_count: number
    venue_infos: BasicVenueInfoDTO[]
}

function mapBasicVenueInfo(dto: BasicVenueInfoDTO): BasicVenueInfo {
    return {
        venueUuid: dto.venue_uuid,
        venueName: dto.venue_name,
        spaceUuid: dto.space_uuid,
        spaceName: dto.space_name,
        city: dto.city,
        country: dto.country,
    }
}


export const useChoosableVenuesStore = defineStore(
    'uranusEventVenueInfo',
    () => {
        const basicVenueInfos = ref<BasicVenueInfo[]>([])
        const loading = ref(false)
        const error = ref<string | null>(null)

        const isEmpty = computed(() => basicVenueInfos.value.length === 0)

        function clear() {
            basicVenueInfos.value = []
            error.value = null
            loading.value = false
        }

        async function fetchAll() {
            if (basicVenueInfos.value.length > 0) return

            loading.value = true
            error.value = null

            try {
                const apiPath = '/api/admin/user/choosable-event-venues'
                const apiResponse = await apiFetch<ChoosableVenueInfosDTO>(
                    apiPath
                )

                basicVenueInfos.value = (apiResponse?.data?.venue_infos ?? []).map(mapBasicVenueInfo)
            } catch (e) {
                console.error(e)
                error.value = 'Failed to load venues'
            } finally {
                loading.value = false
            }
        }

        async function refresh() {
            clear()
            await fetchAll()
        }

        function getVenueLabel(venueUuid: string | null, spaceUuid: string | null): string {
            if (!venueUuid) return ''

            const exact = basicVenueInfos.value.find(v =>
                v.venueUuid == venueUuid &&
                (spaceUuid == null ? v.spaceUuid == null : v.spaceUuid == spaceUuid)
            )

            if (exact) {
                return exact.spaceName
                    ? `${exact.venueName} | ${exact.spaceName}`
                    : exact.venueName
            }

            const venueOnly = basicVenueInfos.value.find(v => v.venueUuid === venueUuid)
            return venueOnly ? venueOnly.venueName : ''
        }

        function getVenueSpacesInfos(): BasicVenueSpacesInfo[] {
            const map = new Map<string, BasicVenueSpacesInfo>()

            for (const v of basicVenueInfos.value) {
                if (!map.has(v.venueUuid)) {
                    map.set(v.venueUuid, {
                        venueUuid: v.venueUuid,
                        venueName: v.venueName,
                        city: v.city,
                        spaces: [],
                    })
                }

                if (v.spaceUuid != null) {
                    map.get(v.venueUuid)!.spaces.push({
                        spaceUuid: v.spaceUuid,
                        spaceName: v.spaceName,
                        city: v.city,
                    })
                }
            }

            return Array.from(map.values()).sort((a, b) =>
                a.venueName.localeCompare(b.venueName)
            )
        }

        return {
            basicVenueInfos,
            loading,
            error,
            isEmpty,
            clear,
            fetchAll,
            refresh,
            getVenueLabel,
            getVenueSpacesInfos
        }
    }
)
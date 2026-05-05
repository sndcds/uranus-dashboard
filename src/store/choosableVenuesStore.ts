/*
    src/store/choosableVenuesStore.ts
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiFetch } from '@/api.ts'
import { type BasicVenueInfo, type BasicVenueSpacesInfo } from '@/domain/venue/basicVenueInfo.model.ts'


interface SpaceDTO {
    uuid: string
    name: string
}

interface VenueDTO {
    uuid: string
    name: string
    org_uuid: string
    city: string | null
    country: string | null
    spaces: SpaceDTO[]
}

interface ChoosableVenuesResponseDTO {
    venues: VenueDTO[]
}

function mapVenuesToBasicInfos(dto: ChoosableVenuesResponseDTO | null): BasicVenueInfo[] {
    const result: BasicVenueInfo[] = []

    if (!dto)  return result
    for (const venue of dto.venues ?? []) {
        if (venue.spaces && venue.spaces.length > 0) {
            // Venue has spaces
            for (const space of venue.spaces) {
                result.push({
                    venueUuid: venue.uuid,
                    venueName: venue.name,
                    spaceUuid: space.uuid,
                    spaceName: space.name,
                    city: venue.city,
                    country: venue.country,
                })
            }
        } else {
            // Venue without spaces
            result.push({
                venueUuid: venue.uuid,
                venueName: venue.name,
                spaceUuid: null,
                spaceName: null,
                city: venue.city,
                country: venue.country,
            })
        }
    }

    return result
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

        async function fetchAll(orgUuid: string | null) {
            if (basicVenueInfos.value.length > 0 || !orgUuid) return

            loading.value = true
            error.value = null

            try {
                const apiPath = `/api/admin/org/${orgUuid}/choosable-venues`
                const apiResponse = await apiFetch<ChoosableVenuesResponseDTO>(
                    apiPath
                )

                const data = apiResponse?.data as ChoosableVenuesResponseDTO
                basicVenueInfos.value = mapVenuesToBasicInfos(data)
            } catch (e) {
                console.error(e)
                error.value = 'Failed to load venues'
            } finally {
                loading.value = false
            }
        }

        async function refresh(orgUuid: string | null) {
            clear()
            await fetchAll(orgUuid)
        }

        function getVenueLabel(venueUuid: string | null, spaceUuid: string | null): string {
            if (!venueUuid) return ''

            const venueEntries = basicVenueInfos.value.filter(
                v => v.venueUuid === venueUuid
            )

            if (venueEntries.length === 0) return ''

            const spaceEntry = venueEntries.find(
                v => spaceUuid != null && v.spaceUuid === spaceUuid
            )

            if (spaceEntry) {
                return spaceEntry.spaceName
                    ? `${spaceEntry.venueName} | ${spaceEntry.spaceName}`
                    : spaceEntry.venueName
            }

            return venueEntries[0]?.venueName ?? ''
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

                const venue = map.get(v.venueUuid)

                if (venue && v.spaceUuid != null) {
                    if (!venue.spaces.some(s => s.spaceUuid === v.spaceUuid)) {
                        venue.spaces.push({
                            spaceUuid: v.spaceUuid,
                            spaceName: v.spaceName,
                            city: v.city,
                        })
                    }
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
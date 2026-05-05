import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '@/api.ts'

interface VenueSpaceNameDTO {
    venue_name: string
    space_name: string | null
}

function buildKey(venueUuid: string, spaceUuid: string | null): string {
    return `${venueUuid}:${spaceUuid ?? 'null'}`
}

export const useVenueSpaceLabelStore = defineStore(
    'uranusVenueSpaceLabelStore',
    () => {

        /**
         *  Internal cache:
         *  key = venueUuid:spaceUuid
         *  value = "Venue | Space"
         */
        const labelCache = ref<Map<string, string>>(new Map())

        const loadingKeys = ref<Set<string>>(new Set())
        const error = ref<string | null>(null)

        function clear() {
            labelCache.value.clear()
            loadingKeys.value.clear()
            error.value = null
        }

        async function fetchLabel(
            venueUuid: string,
            spaceUuid: string | null
        ): Promise<string> {

            const key = buildKey(venueUuid, spaceUuid)

            if (labelCache.value.has(key)) {
                return labelCache.value.get(key)!
            }

            if (loadingKeys.value.has(key)) {
                // simple wait loop to avoid duplicate requests
                return new Promise(resolve => {
                    const interval = setInterval(() => {
                        if (labelCache.value.has(key)) {
                            clearInterval(interval)
                            resolve(labelCache.value.get(key)!)
                        }
                    }, 50)
                })
            }

            loadingKeys.value.add(key)
            error.value = null

            try {
                const apiPath = `/api/venue/${venueUuid}/space/${spaceUuid ?? '-'}/label`
                const apiResponse = await apiFetch<VenueSpaceNameDTO>(apiPath)
                const data = apiResponse?.data as VenueSpaceNameDTO

                const label = data.space_name
                    ? `${data.venue_name} | ${data.space_name}`
                    : data.venue_name

                labelCache.value.set(key, label)

                return label
            } catch (e) {
                console.error(e)
                error.value = 'Failed to load venue label'
                return ''
            } finally {
                loadingKeys.value.delete(key)
            }
        }

        async function getVenueSpaceLabel(
            venueUuid: string | null,
            spaceUuid: string | null
        ): Promise<string> {
            if (!venueUuid) return ''

            return await fetchLabel(venueUuid, spaceUuid)
        }

        return {
            labelCache,
            error,
            clear,
            getVenueSpaceLabel
        }
    }
)
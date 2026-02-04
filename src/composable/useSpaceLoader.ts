// src/composable/useSpaceLoader.ts

import { ref } from 'vue'
import { apiFetch } from '@/api.ts'
import type { SpaceFormInitialValues } from '@/component/UranusSpaceEditForm.vue'

interface SpaceResponse {
    name?: string | null
    total_capacity?: number | string | null
    seating_capacity?: number | string | null
    building_level?: number | string | null
    space_type_id?: number | string | null
    website_url?: string | null
    description?: string | null
    accessibility_summary?: string | null
    accessibility_flags?: number | string | null
}

const toNumber = (value: unknown, fallback = 0): number => {
    const n = Number(value)
    return Number.isFinite(n) ? n : fallback
}

const toNullableNumber = (value: unknown): number | null => {
    const n = Number(value)
    return Number.isFinite(n) ? n : null
}

export function useSpaceLoader() {
    const isLoading = ref(false)
    const error = ref<string | null>(null)

    async function loadSpace(spaceId: number): Promise<SpaceFormInitialValues | null> {
        if (!Number.isFinite(spaceId)) {
            return null
        }

        isLoading.value = true
        error.value = null

        try {
            const { data } = await apiFetch<SpaceResponse | null>(
                `/api/admin/space/${spaceId}`
            )

            if (!data) {
                throw new Error('Space not found')
            }

            return {
                id: spaceId,
                name: data.name ?? '',
                totalCapacity: toNumber(data.total_capacity),
                seatingCapacity: toNumber(data.seating_capacity),
                buildingLevel: toNumber(data.building_level),
                spaceTypeId: toNullableNumber(data.space_type_id),
                websiteUrl: data.website_url ?? '',
                description: data.description ?? '',
                accessibilitySummary: data.accessibility_summary ?? '',
                accessibilityFlags:
                    typeof data.accessibility_flags === 'string'
                        ? data.accessibility_flags
                        : null,
            }
        } catch (e) {
            console.error('Failed to load space', e)
            error.value = 'space_load_error'
            return null
        } finally {
            isLoading.value = false
        }
    }

    return {
        isLoading,
        error,
        loadSpace,
    }
}
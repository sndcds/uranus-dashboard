/*
    src/composable/useUranusEvents.ts

    2026-02-08, Roald
 */

import { ref } from 'vue'
import type { AdminEventListItem } from '@/domain/event/adminEventListItem.ts'
import { camelCaseKeys } from './useUranusAPI.ts'
import { apiFetch } from '@/api.ts'

export function useUranusAdminListEvents() {
    const adminListEvents = ref<AdminEventListItem[]>([]);
    const metadata = ref<Record<string, any>>({});
    const loading = ref(false);
    const error = ref<string | null>(null);
    let requestId = 0

    /**
     * Fetch the admin list of events for a given organization
     */
    async function fetchAdminListEvents(orgUuid: string | null, startDate?: string) {
        const currentRequest = ++requestId
        loading.value = true;
        error.value = null;
        adminListEvents.value = []
        metadata.value = {}

        try {
            if (!orgUuid) {
                return
            }

            const params = new URLSearchParams()
            if (startDate) params.set("start", startDate)

            const queryString = params.toString()
            const apiPath = `/api/admin/org/${orgUuid}/events${queryString ? `?${queryString}` : ''}`
            const apiResonse = await apiFetch<any[]>(apiPath);
            if (currentRequest !== requestId) return
            adminListEvents.value = camelCaseKeys<AdminEventListItem[]>(apiResonse.data ?? []);
            metadata.value = apiResonse.metadata ?? {};
        } catch (e: any) {
            if (currentRequest !== requestId) return
            error.value = e.message ?? "Unknown error";
            adminListEvents.value = [];
            metadata.value = {};
        } finally {
            if (currentRequest === requestId) loading.value = false;
        }
    }

    return { adminListEvents, metadata, loading, error, fetchAdminListEvents };
}

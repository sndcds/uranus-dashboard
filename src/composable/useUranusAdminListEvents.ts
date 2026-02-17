/*
    src/composable/useUranusEvents.ts

    2026-02-08, Roald
 */

import { ref } from "vue";
import type { UranusAdminListEvent } from '@/domain/event/UranusAdminListEvent.ts'
import type { UranusApiResponse } from '@/model/uranusApiResponse.ts'
import { camelCaseKeys } from "./useAPI.ts";
import { apiFetch } from "@/api.ts";

export function useUranusAdminListEvents() {
    const adminListEvents = ref<UranusAdminListEvent[]>([]);
    const metadata = ref<Record<string, any>>({});
    const loading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Fetch the admin list of events for a given organization
     */
    async function fetchAdminListEvents(organizationId: number, startDate?: string) {
        loading.value = true;
        error.value = null;

        try {
            const params = new URLSearchParams();
            if (startDate) params.set("start", startDate);

            const path = `/api/admin/organization/${organizationId}/events?${params.toString()}`;
            // Use your apiFetch wrapper
            const res = await apiFetch<UranusApiResponse<any[]>>(path);

            if (res.data.status !== "ok") {
                throw new Error(res.data.error || "Unknown API error");
            }

            // Map snake_case → camelCase
            adminListEvents.value = camelCaseKeys<UranusAdminListEvent[]>(res.data.data ?? []);
            metadata.value = res.data.metadata ?? {};
        } catch (e: any) {
            error.value = e.message ?? "Unknown error";
            adminListEvents.value = [];
            metadata.value = {};
        } finally {
            loading.value = false;
        }
    }

    return { adminListEvents, metadata, loading, error, fetchAdminListEvents };
}
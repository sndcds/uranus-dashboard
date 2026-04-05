/*
    src/composable/useUranusEvents.ts

    2026-02-08, Roald
 */

import { ref } from "vue";
import type { AdminEventListItemModel } from '@/domain/event/adminEventListItem.model.ts'
import { camelCaseKeys } from "./useAPI.ts";
import { apiFetch, type ApiResponse } from "@/api.ts";

export function useUranusAdminListEvents() {
    const adminListEvents = ref<AdminEventListItemModel[]>([]);
    const metadata = ref<Record<string, any>>({});
    const loading = ref(false);
    const error = ref<string | null>(null);

    /**
     * Fetch the admin list of events for a given organization
     */
    async function fetchAdminListEvents(orgUuid: string | null, startDate?: string) {
        loading.value = true;
        error.value = null;

        try {
            if (!orgUuid) {
                throw new Error("orgUuid required");
            }

            const params = new URLSearchParams();
            if (startDate) params.set("start", startDate);

            const apiPath = `/api/admin/organization/${orgUuid}/events?${params.toString()}`;
            // Use your apiFetch wrapper
            const apiResonse = await apiFetch<ApiResponse<any[]>>(apiPath);


            adminListEvents.value = camelCaseKeys<AdminEventListItemModel[]>(apiResonse.data ?? []);
            metadata.value = apiResonse.metadata ?? {};
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
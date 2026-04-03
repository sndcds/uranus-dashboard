/*
    src/composable/useUranusEvents.ts

    2026-02-08, Roald
 */

import { ref } from "vue";
import type { EventAdminListItemModel } from '@/domain/event/eventAdminListItem.model.ts'
import type { UranusApiResponse } from '@/model/uranusApiResponse.ts'
import { camelCaseKeys } from "./useAPI.ts";
import { apiFetch } from "@/api.ts";

export function useUranusAdminListEvents() {
    const adminListEvents = ref<EventAdminListItemModel[]>([]);
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

            const path = `/api/admin/organization/${orgUuid}/events?${params.toString()}`;
            // Use your apiFetch wrapper
            const res = await apiFetch<UranusApiResponse<any[]>>(path);

            if (res.response.status !== "ok") {
                throw new Error(res.response.error || "Unknown API error");
            }

            adminListEvents.value = camelCaseKeys<EventAdminListItemModel[]>(res.response.data ?? []);
            metadata.value = res.response.metadata ?? {};
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
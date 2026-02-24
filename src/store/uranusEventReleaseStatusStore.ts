import { defineStore } from "pinia";
import { apiFetch, type ApiResponse } from '@/api.ts'


interface EventReleaseStatusApiResponse {
    service: string;
    api_version: string;
    response_type: string;
    status: string;
    timestamp: string;
    metadata: Record<string, any>;
    data: {
        i18n: Record<string, Record<string, string>>;
        order: string[];
    };
}

export const useEventReleaseStatusStore = defineStore("eventReleaseStatus", {
    state: () => ({
        i18n: {} as Record<string, Record<string, string>>, // translations per language
        order: [] as string[],                              // keys sorted by order
        loaded: false,
        loading: false
    }),

    getters: {
        /**
         * All keys in order
         */
        keys: (state) => state.order,

        /**
         * Map keys to labels for a given locale
         */
        options: (state) => (locale: string = "en") => {
            return state.order.map((key) => ({
                key,
                name: state.i18n[locale]?.[key] ?? key
            }));
        }
    },

    actions: {
        /**
         * Load translations and order from API
         * @param languages array of language codes, e.g. ["en","de","da"]
         */
        async load(languages: string[]) {
            if (this.loaded || this.loading) return;
            this.loading = true;

            try {
                const langParam = languages.join(',');
                const response: ApiResponse<EventReleaseStatusApiResponse> =
                    await apiFetch(`/api/event/release-status-i18n?lang=${langParam}`);
                const payload = response.data?.data;

                if (!payload) {
                    console.warn("No i18n data returned from API");
                    this.i18n = {};
                    this.order = [];
                } else {
                    this.i18n = payload.i18n ?? {};
                    this.order = payload.order ?? [];
                }

                this.loaded = true;
            } catch (error) {
                console.error("Failed to load event release status i18n:", error);
                this.i18n = {};
                this.order = [];
            } finally {
                this.loading = false;
            }
        },

        /**
         * Check if a key exists
         */
        isValidKey(key: string): boolean {
            return this.order.includes(key);
        },

        /**
         * Check if a key represents "released/active"
         */
        isReleased(key: string): boolean {
            const releasedIndex = this.order.indexOf("released");
            if (releasedIndex === -1) return false; // fallback if "released" not found

            const keyIndex = this.order.indexOf(key);
            if (keyIndex === -1) return false; // unknown key

            return keyIndex > releasedIndex;
        },

        /**
         * Get localized name for a key
         */
        getName(key: string, locale: string = "en"): string {
            return this.i18n[locale]?.[key] ?? key;
        }
    }
});
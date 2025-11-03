<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent
        :title="t('events_title')"
        :subtitle="t('events_subtitle')"
    />
    <div style="padding: 16px;">
      <router-link
          :to="`/admin/organizer/${organizerId}/event/create`"
          class="uranus-button">
        {{ t('add_new_event') }}
      </router-link>
    </div>

    <OrganizerEventsCard
      :events="events"
      :is-loading="isLoading"
      :error="error"
      :api-base="apiBase"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import OrganizerEventsCard, { type OrganizerEventItem } from '@/components/dashboard/OrganizerEventsCard.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue";

const apiBase = ((import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? 'https://uranus2.oklabflensburg.de')


const { t } = useI18n({ useScope: 'global' })
const route = useRoute()

const organizerId = Number(route.params.id)

const events = ref<OrganizerEventItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
    isLoading.value = true
    error.value = null

    try {
        const { data, status } = await apiFetch<OrganizerEventItem[] | { events?: OrganizerEventItem[] }>(
            `/api/admin/organizer/${organizerId}/events?start=2000-01-01`
        )

        if (status >= 200 && status < 300) {
            if (Array.isArray(data)) {
                events.value = data
            } else if (data && typeof data === 'object' && Array.isArray(data.events)) {
                events.value = data.events
            } else {
                events.value = []
            }
        } else {
            error.value = t('events_fetch_failed', { status })
        }
    } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || t('events_fetch_failed_generic')
        } else if (err instanceof Error) {
            error.value = err.message
        } else {
            error.value = t('events_fetch_failed_generic')
        }
    } finally {
        isLoading.value = false
    }
})
</script>

<style scoped lang="scss">
.events-page {
    @include form-page();
}

.events-hero {
    @include form-hero(560px);
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
}

.events-hero__cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.65rem 1.4rem;
    border-radius: 999px;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: #fff;
    font-weight: 600;
    font-size: 0.95rem;
    box-shadow: 0 10px 24px rgba(79, 70, 229, 0.24);
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 15px 28px rgba(79, 70, 229, 0.32);
        filter: brightness(1.05);
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.22);
    }
}

</style>

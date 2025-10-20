<template>
    <div class="events-page">
        <section class="events-hero">
            <h1>{{ t('events_title') }}</h1>
            <p>{{ t('events_subtitle') }}</p>
            <router-link :to="`/organizer/${organizerId}/event/create`" class="btn btn--primary">{{ t('add_new_event') }}</router-link>
        </section>

        <section class="events-card">
            <div v-if="error" class="feedback feedback--error" role="alert">
                {{ error }}
            </div>
            <div v-else>
                <div v-if="isLoading" class="events-loading">
                    {{ t('events_loading') }}
                </div>
                <div v-else-if="!events.length" class="events-empty">
                    {{ t('events_empty') }}
                </div>
                <div v-else class="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>{{ t('event_datetime') }}</th>
                                <th>{{ t('event_space') }}</th>
                                <th>{{ t('event_title') }}</th>
                                <th>{{ t('event_organizer') }}</th>
                                <th>{{ t('event_type') }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="event in events" :key="event.event_id">
                                <td>{{ formatDateTime(event.start_date, event.start_time) }}</td>
                                <td>{{ event.space_name || '—' }}</td>
                                <td>{{ event.event_title }}</td>
                                <td>{{ event.event_organizer_name }}</td>
                                <td>
                                    <span class="chip">{{ event.event_type || t('event_type_unknown') }}</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

const { t, locale } = useI18n({ useScope: 'global' })
const route = useRoute()
const organizerId = Number(route.params.id)

interface EventItem {
    event_id: number
    event_title: string
    start_date: string
    start_time: string
    space_name: string
    event_organizer_name: string
    event_type: string
}

const events = ref<EventItem[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

const dateFormatter = computed(
    () =>
        new Intl.DateTimeFormat(locale.value, {
            dateStyle: 'medium',
        })
)

const formatDate = (value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
        return value
    }
    return dateFormatter.value.format(date)
}

const formatDateTime = (dateValue: string, timeValue?: string) => {
    const formattedDate = formatDate(dateValue)
    if (timeValue) {
        return `${formattedDate} · ${timeValue}`
    }
    return formattedDate
}

onMounted(async () => {
    isLoading.value = true
    error.value = null

    try {
        const { data, status } = await apiFetch<EventItem[] | { events?: EventItem[] }>(
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
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(1.5rem, 3vw, 2.5rem);
    padding: clamp(1.5rem, 4vw, 3rem);
    background: linear-gradient(135deg, rgba(72, 93, 255, 0.1), rgba(141, 233, 255, 0.15));
    backdrop-filter: blur(6px);
}

.events-hero {
    text-align: center;
    max-width: 560px;
    color: #1f2937;

    h1 {
        font-size: clamp(1.9rem, 3vw, 2.5rem);
        font-weight: 700;
        margin-bottom: 0.5rem;
    }

    p {
        margin: 0;
        font-size: clamp(1rem, 2.3vw, 1.15rem);
        color: rgba(31, 41, 55, 0.75);
        line-height: 1.6;
    }
}

.events-card {
    width: min(1280px, 100%);
    background: #ffffff;
    border-radius: 24px;
    padding: clamp(1.75rem, 4vw, 2.5rem);
    box-shadow: 0 24px 50px rgba(31, 41, 55, 0.16);
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 3vw, 1.75rem);
}

.table-wrapper {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
    color: #1f2937;
}

thead {
    background: rgba(72, 93, 255, 0.08);

    th {
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: rgba(31, 41, 55, 0.75);
    }
}

th,
td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid rgba(148, 163, 184, 0.25);
    text-align: left;
    vertical-align: top;
}

tbody tr:hover {
    background: rgba(243, 244, 246, 0.65);
}

.chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    background: rgba(79, 70, 229, 0.1);
    color: #4338ca;
    font-weight: 600;
    font-size: 0.82rem;
    letter-spacing: 0.02em;
}

.feedback {
    font-size: 0.95rem;
    font-weight: 600;
    border-radius: 12px;
    padding: 0.75rem 1rem;
    margin: 0;
    text-align: center;
    border: 1px solid transparent;

    &--error {
        color: #991b1b;
        background: rgba(254, 202, 202, 0.45);
        border-color: rgba(248, 113, 113, 0.35);
    }
}

.events-loading,
.events-empty {
    text-align: center;
    color: rgba(55, 65, 81, 0.85);
    font-weight: 500;
}

@media (max-width: 640px) {

    th,
    td {
        padding: 0.75rem 0.8rem;
    }

    table {
        font-size: 0.88rem;
    }
}
</style>

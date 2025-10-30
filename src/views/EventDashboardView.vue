<template>
    <div class="events-page">
        <section class="events-hero">
            <h1>{{ t('events_title') }}</h1>
            <p>{{ t('events_subtitle') }}</p>
        </section>

        <router-link :to="`/organizer/${organizerId}/event/create`" class="uranus-button _events-hero__cta">
            {{ t('add_new_event') }}
        </router-link>

        <section class="uranus-card">
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
                                <th>{{ t('date') }}</th>
                                <th>{{ t('begin') }}</th>
                                <th>{{ t('event_title') }}</th>
                                <th>{{ t('venue') }}</th>
                                <th>{{ t('space') }}</th>
                                <th>{{ t('event_organizer') }}</th>
                                <th>{{ t('event_type') }}</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="event in events" :key="event.event_id">
                                <td>{{ formatDate(event.start_date) }}</td>
                                <td>{{ event.start_time }}</td>
                                <td><strong>{{ event.event_title }}</strong></td>
                                <td>{{ event.venue_name || '—' }}</td>
                                <td>{{ event.space_name || '—' }}</td>
                                <td>{{ event.event_organizer_name }}</td>
                                <td>
                                    <span class="chip">{{ event.event_type || t('event_type_unknown') }}</span>
                                </td>
                                <td>
                                    <router-link :to="`/event/${event.event_id}`" class="uranus-seondary-button">
                                        {{ t('edit') }}
                                    </router-link>
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
    venue_name: string
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

.events-card {
    @include form-card(1280px, clamp(1.75rem, 4vw, 2.5rem), clamp(1.25rem, 3vw, 1.75rem));
}

.table-wrapper {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.95rem;
    color: var(--color-text);
}

thead {
    background: var(--accent-muted);

    th {
        font-weight: 600;
        letter-spacing: 0.06em;
        color: var(--muted-text);
    }
}

th,
td {
    padding: 0.9rem 1rem;
    border-bottom: 1px solid var(--border-soft);
    text-align: left;
    vertical-align: top;
}

tbody tr:hover {
    background: var(--surface-muted);
}

.chip {
    display: inline-flex;
    align-items: center;
    padding: 0.25rem 0.6rem;
    border-radius: 999px;
    background: var(--accent-muted);
    color: var(--accent-primary);
    font-weight: 600;
    font-size: 0.82rem;
    letter-spacing: 0.02em;
}

.btn {
    @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1rem);

    &--sm {
        font-size: 0.85rem;
        padding: 0.4rem 0.8rem;
    }

    &--secondary {
        @include form-secondary-button($padding-y: 0.5rem, $padding-x: 1rem);
    }
}

.feedback {
    @include form-feedback();

    &--error {
        @include form-feedback-error();
    }
}

.events-loading,
.events-empty {
    text-align: center;
    color: var(--muted-text);
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

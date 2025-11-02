<template>
    <div class="event-detail-page">
        <div v-if="isLoading" class="event-detail-state event-detail-state--loading">
            <span>{{ loadingLabel }}</span>
        </div>
        <div v-else-if="loadError" class="event-detail-state event-detail-state--error" role="alert">
            <span>{{ loadError }}</span>
        </div>
        <div v-else-if="event" class="event-detail-content">
            <!-- Hero Section -->
            <section class="event-detail-hero">
                <div v-if="event.has_main_image" class="event-detail-hero__image">
                    <img 
                        :src="`/api/event/${event.id}/image?ratio=16by9&width=1200`" 
                        :alt="event.title"
                        class="event-detail-hero__img"
                    />
                </div>
                <div class="event-detail-hero__content">
                    <h1 class="event-detail-hero__title">{{ event.title }}</h1>
                    <p v-if="event.subtitle" class="event-detail-hero__subtitle">{{ event.subtitle }}</p>
                </div>
            </section>

            <!-- Main Content -->
            <div class="event-detail-grid">
                <!-- Left Column - Main Info -->
                <section class="event-detail-main">
                    <!-- Teaser -->
                    <div v-if="event.teaser_text" class="event-detail-section">
                        <p class="event-detail-teaser">{{ event.teaser_text }}</p>
                    </div>

                    <!-- Description -->
                    <div v-if="event.description" class="event-detail-section">
                        <h2>{{ t('description') }}</h2>
                        <div class="event-detail-description" v-html="formatMarkdown(event.description)"></div>
                    </div>

                    <!-- Event Types -->
                    <div v-if="event.event_types && event.event_types.length > 0" class="event-detail-section">
                        <h3>{{ t('choose_event_type') }}</h3>
                        <div class="event-detail-tags">
                            <span v-for="type in event.event_types" :key="type.type_id" class="event-detail-tag">
                                {{ type.type_name }}
                                <span v-if="type.genre_name" class="event-detail-tag__genre">
                                    · {{ type.genre_name }}
                                </span>
                            </span>
                        </div>
                    </div>

                    <!-- URLs -->
                    <div v-if="event.event_urls && event.event_urls.length > 0" class="event-detail-section">
                        <h3>{{ t('website') }}</h3>
                        <div class="event-detail-links">
                            <a 
                                v-for="link in event.event_urls" 
                                :key="link.id" 
                                :href="link.url" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                class="event-detail-link"
                            >
                                {{ link.title || link.url }}
                                <span class="event-detail-link__icon">↗</span>
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Right Column - Sidebar -->
                <aside class="event-detail-sidebar">
                    <!-- Date & Time -->
                    <div class="event-detail-card">
                        <h3>{{ t('date') }} & {{ t('time') }}</h3>
                        <div class="event-detail-card__content">
                            <div class="event-detail-info-row">
                                <span class="event-detail-info-label">{{ t('begin') }}:</span>
                                <span class="event-detail-info-value">
                                    {{ formatDate(event.start_date) }}
                                    <span v-if="event.start_time"> · {{ formatTime(event.start_time) }}</span>
                                </span>
                            </div>
                            <div v-if="event.end_date || event.end_time" class="event-detail-info-row">
                                <span class="event-detail-info-label">{{ t('events_calendar_end_date_label') }}:</span>
                                <span class="event-detail-info-value">
                                    <span v-if="event.end_date">{{ formatDate(event.end_date) }}</span>
                                    <span v-if="event.end_time"> · {{ formatTime(event.end_time) }}</span>
                                </span>
                            </div>
                            <div v-if="event.duration" class="event-detail-info-row">
                                <span class="event-detail-info-label">{{ t('dashboard_todo_due') }}:</span>
                                <span class="event-detail-info-value">{{ event.duration }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Venue -->
                    <div v-if="event.venue_name" class="event-detail-card">
                        <h3>{{ t('location') }}</h3>
                        <div class="event-detail-card__content">
                            <p class="event-detail-venue-name">{{ event.venue_name }}</p>
                            <div v-if="event.venue_street || event.venue_house_number" class="event-detail-address">
                                <p>{{ event.venue_street }} {{ event.venue_house_number }}</p>
                                <p v-if="event.venue_postal_code || event.venue_city">
                                    {{ event.venue_postal_code }} {{ event.venue_city }}
                                </p>
                            </div>
                            <div v-if="event.space_name" class="event-detail-space">
                                <span class="event-detail-info-label">{{ t('space') }}:</span>
                                <span>{{ event.space_name }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Organizer -->
                    <div v-if="event.organizer_name" class="event-detail-card">
                        <h3>{{ t('organizers') }}</h3>
                        <div class="event-detail-card__content">
                            <p class="event-detail-organizer">{{ event.organizer_name }}</p>
                        </div>
                    </div>

                    <!-- Space Info -->
                    <div v-if="event.space_total_capacity || event.space_seating_capacity" class="event-detail-card">
                        <h3>{{ t('space_details_title') }}</h3>
                        <div class="event-detail-card__content">
                            <div v-if="event.space_total_capacity" class="event-detail-info-row">
                                <span class="event-detail-info-label">{{ t('space_total_capacity') }}:</span>
                                <span class="event-detail-info-value">{{ event.space_total_capacity }}</span>
                            </div>
                            <div v-if="event.space_seating_capacity" class="event-detail-info-row">
                                <span class="event-detail-info-label">{{ t('space_seating_capacity') }}:</span>
                                <span class="event-detail-info-value">{{ event.space_seating_capacity }}</span>
                            </div>
                            <div v-if="event.space_building_level" class="event-detail-info-row">
                                <span class="event-detail-info-label">{{ t('space_building_level') }}:</span>
                                <span class="event-detail-info-value">{{ event.space_building_level }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Additional Info -->
                    <div v-if="event.meeting_point || event.entry_time || event.participation_info" class="event-detail-card">
                        <h3>{{ t('details') }}</h3>
                        <div class="event-detail-card__content">
                            <div v-if="event.meeting_point" class="event-detail-info-row">
                                <span class="event-detail-info-label">{{ t('geo_location') }}:</span>
                                <span class="event-detail-info-value">{{ event.meeting_point }}</span>
                            </div>
                            <div v-if="event.entry_time" class="event-detail-info-row">
                                <span class="event-detail-info-label">{{ t('begin') }}:</span>
                                <span class="event-detail-info-value">{{ formatTime(event.entry_time) }}</span>
                            </div>
                            <div v-if="event.participation_info" class="event-detail-info-row">
                                <span class="event-detail-info-label">{{ t('user_permissions_title') }}:</span>
                                <span class="event-detail-info-value">{{ event.participation_info }}</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import { marked } from 'marked'

interface EventType {
    genre_id: number | null
    genre_name: string | null
    type_id: number
    type_name: string
}

interface EventUrl {
    id: number
    title: string | null
    url: string
    url_type: string
}

interface EventDetail {
    accessibility_flag_names: string[] | null
    accessibility_flags: number[] | null
    description: string | null
    duration: string | null
    end_date: string | null
    end_time: string | null
    entry_time: string | null
    event_types: EventType[] | null
    event_urls: EventUrl[] | null
    has_main_image: boolean
    id: number
    image_focus_x: number
    image_focus_y: number
    image_id: number | null
    meeting_point: string | null
    organizer_id: number
    organizer_name: string
    participation_info: string | null
    space_building_level: string | null
    space_id: number | null
    space_name: string | null
    space_seating_capacity: number | null
    space_total_capacity: number | null
    space_url: string | null
    start_date: string
    start_time: string | null
    subtitle: string | null
    teaser_text: string | null
    title: string
    venue_city: string | null
    venue_country: string | null
    venue_geometry: string | null
    venue_house_number: string | null
    venue_id: number
    venue_lat: number | null
    venue_lon: number | null
    venue_name: string
    venue_postal_code: string | null
    venue_state: string | null
    venue_street: string | null
    visitor_info_flag_names: string[] | null
    visitor_info_flags: number[] | null
}

const route = useRoute()
const { t, locale } = useI18n({ useScope: 'global' })

const event = ref<EventDetail | null>(null)
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const loadingLabel = computed(() => t('loading'))

const intlDate = new Intl.DateTimeFormat(locale.value || 'de', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
})

const intlTime = new Intl.DateTimeFormat(locale.value || 'de', {
    hour: '2-digit',
    minute: '2-digit',
})

const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) return dateStr
    const date = new Date(year, month - 1, day)
    return intlDate.format(date)
}

const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours ?? 0, minutes ?? 0, 0, 0)
    return intlTime.format(date)
}

const formatMarkdown = (markdown: string) => {
    try {
        return marked(markdown)
    } catch (error) {
        console.error('Failed to parse markdown:', error)
        return markdown
    }
}

const loadEvent = async () => {
    const eventId = route.params.id
    if (!eventId) {
        loadError.value = 'No event ID provided'
        isLoading.value = false
        return
    }

    isLoading.value = true
    loadError.value = null

    try {
        const lang = locale.value || 'de'
        const endpoint = `/api/event/${eventId}?lang=${lang}`
        const { data } = await apiFetch<EventDetail>(endpoint)
        event.value = data
    } catch (error: unknown) {
        loadError.value = error instanceof Error && error.message
            ? error.message
            : t('events_calendar_load_error')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void loadEvent()
})
</script>

<style scoped lang="scss">
.event-detail-page {
    display: flex;
    flex-direction: column;
    max-width: 1400px;
    width: 100%;
    margin: 0 auto;
    padding: clamp(1.5rem, 4vw, 2.5rem);
    gap: clamp(2rem, 4vw, 3rem);
}

.event-detail-state {
    border-radius: 18px;
    padding: clamp(2rem, 5vw, 3rem);
    text-align: center;
    font-weight: 600;
    background: var(--input-bg);
    border: 1px solid var(--border-soft);
}

.event-detail-state--loading {
    color: var(--muted-text);
}

.event-detail-state--error {
    color: #b91c1c;
}

.event-detail-hero {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    background: var(--card-bg, #fff);
    border-radius: 16px;
    overflow: hidden;
}

.event-detail-hero__image {
    width: 100%;
    aspect-ratio: 16/9;
    overflow: hidden;
}

.event-detail-hero__img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.event-detail-hero__content {
    padding: clamp(1.5rem, 4vw, 2.5rem);
}

.event-detail-hero__title {
    margin: 0;
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    line-height: 1.2;
}

.event-detail-hero__subtitle {
    margin: 1rem 0 0;
    font-size: clamp(1.25rem, 3vw, 1.5rem);
    color: var(--muted-text);
    line-height: 1.4;
}

.event-detail-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: clamp(2rem, 4vw, 3rem);
    align-items: start;
}

.event-detail-main {
    display: flex;
    flex-direction: column;
    gap: clamp(2rem, 4vw, 2.5rem);
}

.event-detail-section {
    background: var(--card-bg, #fff);
    border-radius: 12px;
    padding: clamp(1.5rem, 3vw, 2rem);
}

.event-detail-section h2 {
    margin: 0 0 1rem 0;
    font-size: clamp(1.5rem, 3vw, 1.75rem);
    font-weight: 700;
}

.event-detail-section h3 {
    margin: 0 0 0.75rem 0;
    font-size: clamp(1.25rem, 2.5vw, 1.5rem);
    font-weight: 600;
}

.event-detail-teaser {
    margin: 0;
    font-size: clamp(1.1rem, 2.5vw, 1.25rem);
    line-height: 1.6;
    color: var(--muted-text);
}

.event-detail-description {
    line-height: 1.7;
    font-size: 1rem;

    :deep(p) {
        margin: 0 0 1rem 0;
    }

    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
        margin: 1.5rem 0 1rem 0;
        font-weight: 600;
    }

    :deep(ul), :deep(ol) {
        margin: 0 0 1rem 0;
        padding-left: 2rem;
    }

    :deep(a) {
        color: var(--accent-primary);
        text-decoration: underline;
    }
}

.event-detail-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.event-detail-tag {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    background: rgba(79, 70, 229, 0.12);
    color: var(--accent-primary);
    font-weight: 600;
    font-size: 0.95rem;
}

.event-detail-tag__genre {
    margin-left: 0.25rem;
    opacity: 0.8;
}

.event-detail-links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.event-detail-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent-primary);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s ease;
}

.event-detail-link:hover {
    opacity: 0.7;
}

.event-detail-link__icon {
    font-size: 1.1rem;
}

.event-detail-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    position: sticky;
    top: 100px;
}

.event-detail-card {
    background: var(--card-bg, #fff);
    border-radius: 12px;
    padding: 1.5rem;
    border: 1px solid var(--border-soft);
}

.event-detail-card h3 {
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: var(--muted-text);
}

.event-detail-card__content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.event-detail-info-row {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.event-detail-info-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--muted-text);
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.event-detail-info-value {
    font-size: 1rem;
    font-weight: 500;
}

.event-detail-venue-name {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
}

.event-detail-address {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.5rem;
}

.event-detail-address p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.4;
}

.event-detail-space {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--border-soft);
}

.event-detail-organizer {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
}

@media (max-width: 1024px) {
    .event-detail-grid {
        grid-template-columns: 1fr;
    }

    .event-detail-sidebar {
        position: static;
    }
}
</style>

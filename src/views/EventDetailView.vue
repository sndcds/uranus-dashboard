<template>
    <div class="event-detail-page">
        <div v-if="isLoading" class="event-detail-state event-detail-state--loading">
            <span>{{ loadingLabel }}</span>
        </div>

        <div v-else-if="loadError" class="event-detail-state event-detail-state--error" role="alert">
            <span>{{ loadError }}</span>
        </div>

        <div v-else-if="event" class="event-detail-content">
            <div class="event-detail-grid">

                <!-- Left Column - Main Info -->
                <section class="event-detail-main">
                    <section>
                        <div v-if="event.has_main_image && event.image_path" class="event-image-frame">
                            <img :src="event.image_path.includes('?')
                                ? `${event.image_path}&ratio=16by9&width=1200`
                                : `${event.image_path}?ratio=16by9&width=1200`" :alt="event.image_alt_text ? event.image_alt_text : event.title"
                                class="event-image" />
                            <div v-if="event.image_copyright || event.image_created_by || event.image_license" class="event-image-caption"> 
                                <small>
                                    <template v-if="event.image_created_by">
                                        {{ t('image_created_by', { creator: event.image_created_by }) }}
                                    </template>
                                    <template v-if="event.image_copyright">
                                        <span v-if="event.image_created_by"> | </span>
                                        {{ t('image_copyright', { copyright: event.image_copyright }) }}
                                    </template>
                                    <template v-if="event.image_license">
                                        <span v-if="event.image_created_by || event.image_copyright"> | </span>
                                        {{ t('image_license', { license: event.image_license }) }}
                                    </template>
                                </small>
                            </div>
                        </div>

                        <div class="event-detail-section">
                            <h1>{{ event.title }}</h1>
                            <p v-if="event.subtitle" class="event-detail-hero__subtitle">{{ event.subtitle }}</p>
                        </div>
                    </section>

                    <!-- Event Types -->
                    <div v-if="event.event_types && event.event_types.length > 0" class="event-detail-section">
                        <div class="event-detail-tags">
                            <span v-for="type in event.event_types" :key="type.type_id" class="event-detail-tag">
                                {{ type.type_name }}
                                <span v-if="type.genre_name">
                                    &nbsp;·&nbsp;{{ type.genre_name }}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div v-if="event.languages && event.languages.length > 0" class="event-detail-hero__languages">
                        <!--span class="event-detail-info-label">{{ t('languages') }}</span-->
                        <div class="event-detail-languages-tags">
                            <span v-for="lang in event.languages" :key="lang" class="event-detail-language-tag">
                                {{ lang.toUpperCase() }}
                            </span>
                        </div>
                    </div>

                    <!-- Teaser -->
                    <div v-if="event.teaser_text" class="event-detail-section">
                        <p class="event-detail-teaser">{{ event.teaser_text }}</p>
                    </div>

                    <!-- Description -->
                    <div v-if="event.description" class="event-detail-section">
                        <div class="event-detail-description" v-html="formatMarkdown(event.description)"></div>
                    </div>


                    <!-- URLs -->
                    <div v-if="event.event_urls && event.event_urls.length > 0" class="event-detail-section">
                        <div class="event-detail-links">
                            <a v-for="link in event.event_urls" :key="link.id" :href="link.url" target="_blank"
                                rel="noopener noreferrer" class="event-detail-link">
                                {{ link.title || link.url }}
                                <span class="event-detail-link__icon">↗</span>
                            </a>
                        </div>
                    </div>
                </section>

                <!-- Right Column - Sidebar -->
                <aside class="event-detail-sidebar">

                    <!-- Date & Time -->
                    <div>
                        <div v-if="formatEventDateTime && 'date' in formatEventDateTime">
                            <!-- Single day event -->
                            <p class="event-date">{{ formatEventDateTime.date }}</p>
                            <p v-if="formatEventDateTime.time" class="event-time">{{ formatEventDateTime.time }}</p>
                            <div v-if="event.entry_time" class="event-detail-section-spacing">
                                <p class="event-detail-info-label">{{ t('event_entry_time') }}:</p>
                                <p class="event-detail-info-value">{{ formatTime(event.entry_time) }}</p>
                            </div>
                        </div>
                        
                        <div v-else-if="formatEventDateTime && 'startDate' in formatEventDateTime">
                            <!-- Multi-day event -->
                            <div>
                                <p class="event-detail-info-label">{{ t('event_start') }}:</p>
                                <p class="event-date">{{ formatEventDateTime.startDate }}</p>
                                <p v-if="formatEventDateTime.startTime" class="event-time">{{ formatEventDateTime.startTime }}</p>
                            </div>
                            <div class="event-detail-section-spacing">
                                <p class="event-detail-info-label">{{ t('event_end') }}:</p>
                                <p class="event-date">{{ formatEventDateTime.endDate }}</p>
                                <p v-if="formatEventDateTime.endTime" class="event-time">{{ formatEventDateTime.endTime }}</p>
                            </div>
                            <div v-if="event.entry_time" class="event-detail-section-spacing">
                                <p class="event-detail-info-label">{{ t('event_entry_time') }}:</p>
                                <p class="event-detail-info-value">{{ formatTime(event.entry_time) }}</p>
                            </div>
                        </div>

                        <div v-if="event.duration">
                            <span class="event-detail-info-label">{{ t('dashboard_todo_due') }}:</span>
                            <span class="event-detail-info-value">{{ event.duration }}</span>
                        </div>
                    </div>

                    <!-- Venue -->
                    <div v-if="event.venue_name">
                        <span class="event-detail-info-label">{{ t('location') }}:</span>
                        <p>{{ event.venue_name }}</p>
                        <div v-if="event.venue_street || event.venue_house_number">
                            <p>{{ event.venue_street }} {{ event.venue_house_number }}</p>
                            <p v-if="event.venue_postal_code || event.venue_city">
                                {{ event.venue_postal_code }} {{ event.venue_city }}
                            </p>
                        </div>
                    </div>

                    <!-- Organizer -->
                    <div v-if="event.organizer_name">
                        <h3>{{ t('organizer') }}</h3>
                        <p class="event-detail-organizer">{{ event.organizer_name }}</p>
                    </div>

                    <!-- Space Info -->
                    <div v-if="event.space_name">
                        <p class="space">{{ t('space') }}:</p>
                        <p>{{ event.space_name }}</p>
                    </div>
                    <div v-if="event.space_total_capacity || event.space_seating_capacity">
                        <div v-if="event.space_total_capacity" class="event-detail-info-row">
                            <span class="event-detail-info-label">{{ t('space_total_capacity') }}: {{ event.space_total_capacity }}</span>
                        </div>
                        <div v-if="event.space_seating_capacity" class="event-detail-info-row">
                            <span class="event-detail-info-label">{{ t('space_seating_capacity') }}: {{ event.space_seating_capacity }}</span>
                        </div>
                        <div v-if="event.space_building_level" class="event-detail-info-row">
                            <span class="event-detail-info-label">{{ t('space_building_level') }}: {{ event.space_building_level }}</span>
                        </div>
                    </div>

                    <!-- Additional Info -->
                    <div v-if="event.meeting_point || event.participation_info">
                        <h3>{{ t('details') }}</h3>
                        <div>
                            <div v-if="event.meeting_point" class="event-detail-info-row">
                                <span class="event-detail-info-label">{{ t('geo_location') }}:</span>
                                <span class="event-detail-info-value">{{ event.meeting_point }}</span>
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
    image_license: string | null
    image_alt_text: string | null
    image_copyright: string | null
    image_created_by: string | null
    id: number
    image_focus_x: number
    image_focus_y: number
    image_id: number | null
    image_path: string | null
    languages: string[] | null
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

const intlTime = new Intl.DateTimeFormat(locale.value || 'de', {
    hour: '2-digit',
    minute: '2-digit',
})

const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number)
    if (!year || !month || !day) return dateStr

    // Format as DD.MM.YYYY
    const paddedDay = String(day).padStart(2, '0')
    const paddedMonth = String(month).padStart(2, '0')

    return `${paddedDay}.${paddedMonth}.${year}`
}

const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number)
    const date = new Date()
    date.setHours(hours ?? 0, minutes ?? 0, 0, 0)
    return intlTime.format(date)
}

const formatEventDateTime = computed(() => {
    if (!event.value) return null

    const { start_date, start_time, end_date, end_time } = event.value

    // Check if it's a single-day event (same start and end date or no end date)
    const isSingleDay = !end_date || start_date === end_date

    if (isSingleDay) {
        // Single day event: show date and time on separate lines
        const dateStr = formatDate(start_date)
        let timeStr = ''
        
        if (start_time && end_time) {
            timeStr = `${formatTime(start_time)} - ${formatTime(end_time)}`
        } else if (start_time) {
            timeStr = formatTime(start_time)
        }
        
        return {
            date: dateStr,
            time: timeStr
        }
    } else {
        // Multi-day event: show separate start and end dates with times on separate lines
        return {
            startDate: formatDate(start_date),
            startTime: start_time ? formatTime(start_time) : '',
            endDate: formatDate(end_date),
            endTime: end_time ? formatTime(end_time) : ''
        }
    }
})

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
    const eventDateId = route.params.eventDateId

    if (!eventId) {
        loadError.value = 'No event ID provided'
        isLoading.value = false
        return
    }

    if (!eventDateId) {
        loadError.value = 'No event date ID provided'
        isLoading.value = false
        return
    }

    isLoading.value = true
    loadError.value = null

    try {
        const lang = locale.value || 'de'
        const endpoint = `/api/event/${eventId}/date/${eventDateId}?lang=${lang}`
        const { data } = await apiFetch<EventDetail>(endpoint)
        event.value = data
    } catch (error: unknown) {
        loadError.value = error instanceof Error && error.message
            ? error.message
            : t('event_load_error')
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    void loadEvent()
})
</script>

<style scoped lang="scss">
p {
    margin: 0;
}

.space {
    font-weight: 600;
    margin: 0;
}

.event-date {
    font-weight: 600;
    font-size: 2rem;
}

.event-time {
    font-weight: 500;
    font-size: 1.5rem;
    margin-top: 0.5rem;
}

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

.event-image-frame {
    width: 100%;
    max-width: 800px;
    aspect-ratio: 16/9;
    overflow: hidden;
}

.event-image {
    width: 100%;
    height: 100%;
    max-width: 800px;
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

.event-detail-hero__languages {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 16px;
}

.event-detail-languages-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--muted-text);
    text-transform: uppercase;
    letter-spacing: 0.3px;
}

.event-detail-languages-tags {
    display: flex;
    gap: 0.3rem;
}

.event-detail-language-tag {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    background: rgba(181, 222, 255, 0.65);
    color: var(--accent-secondary, rgb(22, 149, 213));
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 0.5px;
}

.event-detail-grid {
    display: grid;
    grid-template-columns: minmax(600px, 800px) 400px;
    gap: 32px;
    align-items: start;
}

.event-detail-main {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.event-detail-section {
    padding: 16px;

    h1 {
        margin-top: 32px;
        font-size: 2.8rem;
        font-weight: 600;
    }
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

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
        margin: 1.5rem 0 1rem 0;
        font-weight: 600;
    }

    :deep(ul),
    :deep(ol) {
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
    gap: 0.4rem;
}

.event-detail-tag {
    display: inline-flex;
    align-items: center;
    padding: 0.1rem 0.6rem;
    border-radius: 999px;
    background: rgba(184, 178, 255, 0.33);
    color: rgb(86, 80, 188);
    font-weight: 600;
    font-size: 0.95rem;
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

.event-detail-section-spacing {
    margin-top: 1rem;
}

.event-detail-info-label {
    font-weight: 800;
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

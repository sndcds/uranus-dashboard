<template>
    <div class="event-page" v-if="event">
        <header class="event-hero">
            <div class="event-hero__meta">
                <p class="event-hero__date">{{ formattedDate }}</p>
                <p class="event-hero__time" v-if="event.start_time">{{ formattedTime }}</p>
            </div>

            <div class="event-hero__header">
                <template v-if="isEditingHeader">
                    <EventTitleFieldsComponent
                        :title="editedTitle"
                        :subtitle="editedSubtitle"
                        @update:title="editedTitle = $event"
                        @update:subtitle="editedSubtitle = $event"
                    />
                    <div class="event-hero__actions">
                        <button
                            type="button"
                            class="event-hero__button event-hero__button--cancel"
                            @click="cancelEditingHeader"
                        >
                            {{ t('event_header_cancel') }}
                        </button>
                        <button type="button" class="event-hero__button" @click="saveHeader">
                            {{ t('event_header_save') }}
                        </button>
                    </div>
                </template>
                <template v-else>
                    <h1>{{ event.title }}</h1>
                    <p class="event-hero__subtitle" v-if="event.subtitle">{{ event.subtitle }}</p>
                    <button type="button" class="event-hero__edit" @click="startEditingHeader">
                        {{ t('event_header_edit') }}
                    </button>
                </template>
            </div>

            <p class="event-hero__organizer">{{ event.organizer_name }}</p>
        </header>

        <section class="event-layout">
            <article class="event-description">
                <h2>{{ t('event_details_heading') }}</h2>
                <div class="event-description__content">
                    <template v-if="isEditingDescription">
                        <MarkdownEditorComponent
                            v-model="editedDescription"
                            :placeholder="t('event_description_placeholder')"
                        />
                        <div class="event-description__actions">
                            <button
                                type="button"
                                class="event-description__button event-description__button--cancel"
                                @click="cancelEditingDescription"
                            >
                                {{ t('event_description_cancel') }}
                            </button>
                            <button type="button" class="event-description__button" @click="saveDescription">
                                {{ t('event_description_save') }}
                            </button>
                        </div>
                    </template>
                    <template v-else>
                        <MarkdownPreviewComponent v-if="event.description" :value="event.description" />
                        <p v-else class="empty">{{ t('event_details_empty') }}</p>
                        <button
                            type="button"
                            class="event-description__edit"
                            @click="startEditingDescription"
                        >
                            {{ t('event_description_edit') }}
                        </button>
                    </template>
                </div>

                <div class="event-tags">
                    <template v-if="isEditingTags">
                        <TwoStageTagListComponent
                            :fetch-stage1="fetchEventTypesOptions"
                            :fetch-stage2="fetchEventGenresOptions"
                            :initial-selection="tagInitialSelection"
                            @update-selection="onTagSelectionUpdate"
                        />
                        <div class="event-tags__actions">
                            <button
                                type="button"
                                class="event-tags__button event-tags__button--cancel"
                                @click="cancelEditingTags"
                            >
                                {{ t('event_tags_cancel') }}
                            </button>
                            <button type="button" class="event-tags__button" @click="saveTags">
                                {{ t('event_tags_save') }}
                            </button>
                        </div>
                    </template>
                    <template v-else>
                        <div class="event-tags__lists">
                            <div v-if="event.event_types?.length">
                                <h3>{{ t('event_types_heading') }}</h3>
                                <ul>
                                    <li v-for="type in event.event_types" :key="type.id">{{ type.name }}</li>
                                </ul>
                            </div>
                            <div v-if="event.genre_types?.length">
                                <h3>{{ t('event_genres_heading') }}</h3>
                                <ul>
                                    <li v-for="genre in event.genre_types" :key="genre.id">{{ genre.name }}</li>
                                </ul>
                            </div>
                        </div>
                        <button type="button" class="event-tags__edit" @click="startEditingTags">
                            {{ t('event_tags_edit') }}
                        </button>
                    </template>
                </div>

                <div class="event-additional">
                    <p v-if="event.participation_info">
                        <strong>{{ t('event_participation_label') }}:</strong>
                        {{ event.participation_info }}
                    </p>
                    <p v-if="event.meeting_point">
                        <strong>{{ t('event_meeting_point') }}:</strong>
                        {{ event.meeting_point }}
                    </p>
                </div>
            </article>

            <aside class="event-aside">
                <LocationMapComponent
                    :latitude="event.venue_lat"
                    :longitude="event.venue_lon"
                    :zoom="18"
                    :selectable="false"
                />
                <section class="event-venue">
                    <h2>{{ event.venue_name }}</h2>
                    <p>
                        {{ event.venue_street }} {{ event.venue_house_number }}<br />
                        {{ event.venue_postal_code }} {{ event.venue_city }}
                    </p>
                    <p>{{ event.space_name }} ({{ event.space_total_capacity }} {{ t('event_capacity_label') }})</p>
                </section>

                <section class="event-meta">
                    <h3>{{ t('event_details_time') }}</h3>
                    <p>{{ formattedDate }}</p>
                    <p v-if="event.start_time">{{ formattedTime }}</p>
                </section>
            </aside>
        </section>
    </div>
    <div v-else class="event-loading">
        <p v-if="error">{{ error }}</p>
        <p v-else>{{ t('loading') }}</p>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'
import LocationMapComponent from '@/components/LocationMapComponent.vue'
import MarkdownPreviewComponent from '@/components/MarkdownPreviewComponent.vue'
import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'
import EventTitleFieldsComponent from '@/components/EventTitleFieldsComponent.vue'
import TwoStageTagListComponent from '@/components/TwoStageTagListComponent.vue'

interface EventType {
    id: number
    name: string
}

interface EventGenreType {
    id: number
    name: string
    event_type_id?: number | null
    type_id?: number | null
}

interface EventDetail {
    id: number
    title: string
    subtitle: string
    description: string
    organizer_name: string
    start_date: string
    start_time: string | null
    end_date: string | null
    end_time: string | null
    entry_time: string | null
    event_types: EventType[]
    genre_types: EventGenreType[]
    participation_info: string | null
    meeting_point: string | null
    venue_name: string
    venue_street: string
    venue_house_number: string
    venue_postal_code: string
    venue_city: string
    venue_lat: number
    venue_lon: number
    space_name: string
    space_total_capacity: number
}

interface QueryResponse {
    events: EventDetail[]
}

const route = useRoute()
const { t, locale } = useI18n({ useScope: 'global' })
const event = ref<EventDetail | null>(null)
const error = ref<string | null>(null)
const isEditingDescription = ref(false)
const editedDescription = ref('')
const isEditingHeader = ref(false)
const editedTitle = ref('')
const editedSubtitle = ref('')
const isEditingTags = ref(false)
const selectedTypeIds = ref<number[]>([])
const selectedGenreIds = ref<number[]>([])

const eventId = computed(() => Number(route.params.id))

const dateFormatter = computed(() =>
    new Intl.DateTimeFormat(locale.value, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

const timeFormatter = computed(() => new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }))

const formattedDate = computed(() =>
    event.value ? dateFormatter.value.format(new Date(event.value.start_date)) : ''
)

const formattedTime = computed(() =>
    event.value?.start_time ? timeFormatter.value.format(new Date(`${event.value.start_date}T${event.value.start_time}`)) : ''
)

const startEditingDescription = () => {
    editedDescription.value = event.value?.description || ''
    isEditingDescription.value = true
}

const cancelEditingDescription = () => {
    editedDescription.value = event.value?.description || ''
    isEditingDescription.value = false
}

const saveDescription = async () => {
    if (!event.value) return

    const previousDescription = event.value.description
    event.value.description = editedDescription.value

    try {
        await apiFetch(`/api/admin/event/${eventId.value}/description`, {
            method: 'PUT',
            body: JSON.stringify({
                description: editedDescription.value,
            }),
        })
    } catch (err) {
        console.error('Failed to update description', err)
        event.value.description = previousDescription
    } finally {
        isEditingDescription.value = false
    }
}

watch(
    () => event.value?.description,
    (value) => {
        if (!isEditingDescription.value) {
            editedDescription.value = value || ''
        }
    }
)

const startEditingHeader = () => {
    editedTitle.value = event.value?.title || ''
    editedSubtitle.value = event.value?.subtitle || ''
    isEditingHeader.value = true
}

const cancelEditingHeader = () => {
    editedTitle.value = event.value?.title || ''
    editedSubtitle.value = event.value?.subtitle || ''
    isEditingHeader.value = false
}

const saveHeader = async () => {
    if (!event.value) return

    const previousTitle = event.value.title
    const previousSubtitle = event.value.subtitle
    event.value.title = editedTitle.value
    event.value.subtitle = editedSubtitle.value

    try {
        await apiFetch(`/api/admin/event/${eventId.value}/header`, {
            method: 'PUT',
            body: JSON.stringify({
                title: editedTitle.value,
                subtitle: editedSubtitle.value,
            }),
        })
        isEditingHeader.value = false
        await loadEvent()
    } catch (err) {
        console.error('Failed to update header', err)
        event.value.title = previousTitle
        event.value.subtitle = previousSubtitle
        isEditingHeader.value = false
    }
}

watch(
    () => event.value?.title,
    (value) => {
        if (!isEditingHeader.value) {
            editedTitle.value = value || ''
        }
    }
)

watch(
    () => event.value?.subtitle,
    (value) => {
        if (!isEditingHeader.value) {
            editedSubtitle.value = value || ''
        }
    }
)

const tagInitialSelection = ref<Array<{ typeId: number; genreId: number | null }> | null>(null)

const buildTagSelection = (source: EventDetail | null | undefined) => {
    const selections: Array<{ typeId: number; genreId: number | null }> = []
    if (!source) return selections

    const eventTypes = normalizeCollection(source.event_types)
    const genreTypes = normalizeCollection(source.genre_types)

    const typeIds = new Set(eventTypes.map((type) => type.id))
    const groupedGenres: Record<number, number[]> = {}

    genreTypes.forEach((genre) => {
        const typeId = genre.event_type_id ?? (genre as { type_id?: number }).type_id ?? null
        if (typeof typeId !== 'number') return
        typeIds.add(typeId)
        const list = groupedGenres[typeId] ?? []
        list.push(genre.id)
        groupedGenres[typeId] = list
    })

    Array.from(typeIds).forEach((typeId) => {
        const genresForType = groupedGenres[typeId]
        if (genresForType && genresForType.length) {
            genresForType.forEach((genreId) => {
                selections.push({ typeId, genreId })
            })
        } else {
            selections.push({ typeId, genreId: null })
        }
    })

    return selections
}

const onTagSelectionUpdate = (payload: { typeIds: number[]; genreIds: number[] }) => {
    selectedTypeIds.value = payload.typeIds
    selectedGenreIds.value = payload.genreIds
}

const startEditingTags = () => {
    selectedTypeIds.value = Array.from(new Set(normalizeCollection(event.value?.event_types).map((type) => type.id)))
    selectedGenreIds.value = Array.from(new Set(normalizeCollection(event.value?.genre_types).map((genre) => genre.id)))
    tagInitialSelection.value = buildTagSelection(event.value)
    isEditingTags.value = true
}

const cancelEditingTags = () => {
    selectedTypeIds.value = Array.from(new Set(normalizeCollection(event.value?.event_types).map((type) => type.id)))
    selectedGenreIds.value = Array.from(new Set(normalizeCollection(event.value?.genre_types).map((genre) => genre.id)))
    tagInitialSelection.value = null
    isEditingTags.value = false
}

const fetchEventTypesOptions = async () => {
    const language = locale.value
    const { data } = await apiFetch<Array<{ type_id: number; name: string } | { id: number; name: string }>>(
        `/api/choosable-event-types?lang=${language}`
    )
    return Array.isArray(data) ? data : []
}

const fetchEventGenresOptions = async (typeId: number) => {
    const language = locale.value
    const { data } = await apiFetch<Array<{ type_id: number; name: string } | { id: number; name: string }>>(
        `/api/choosable-event-genres/event-type/${typeId}?lang=${language}`
    )
    return Array.isArray(data) ? data : []
}

const saveTags = async () => {
    if (!event.value) return

    const previousTypes = [...(event.value.event_types ?? [])]
    const previousGenres = [...(event.value.genre_types ?? [])]

    const typeIdsPayload = Array.from(new Set(selectedTypeIds.value))
    const genreIdsPayload = Array.from(new Set(selectedGenreIds.value))

    try {
        await apiFetch(`/api/admin/event/${eventId.value}/types`, {
            method: 'PUT',
            body: JSON.stringify({
                event_type_ids: typeIdsPayload,
                genre_type_ids: genreIdsPayload,
            }),
        })
        isEditingTags.value = false
        tagInitialSelection.value = null
        await loadEvent()
    } catch (err) {
        console.error('Failed to update event types', err)
        if (event.value) {
            event.value.event_types = previousTypes
            event.value.genre_types = previousGenres
        }
        selectedTypeIds.value = previousTypes.map((type) => type.id)
        selectedGenreIds.value = previousGenres.map((genre) => genre.id)
        tagInitialSelection.value = null
        isEditingTags.value = false
    }
}

const normalizeCollection = <T>(collection: T[] | Record<string, T> | null | undefined): T[] => {
    if (Array.isArray(collection)) return collection
    if (collection && typeof collection === 'object') {
        return Object.values(collection as Record<string, T>)
    }
    return []
}

const loadEvent = async () => {
    try {
        const { data } = await apiFetch<QueryResponse>(
            `/api/query?mode=event&events=${eventId.value}&start=2000-01-01`
        )

        if (data?.events?.length) {
            const eventData = data.events[0]
            eventData.event_types = normalizeCollection(eventData.event_types)
            eventData.genre_types = normalizeCollection(eventData.genre_types)
            event.value = eventData

            if (!isEditingDescription.value) {
                editedDescription.value = event.value.description || ''
            }

            if (!isEditingHeader.value) {
                editedTitle.value = event.value.title || ''
                editedSubtitle.value = event.value.subtitle || ''
            }

            if (!isEditingTags.value) {
                selectedTypeIds.value = Array.from(new Set(normalizeCollection(event.value.event_types).map((type) => type.id)))
                selectedGenreIds.value = Array.from(new Set(normalizeCollection(event.value.genre_types).map((genre) => genre.id)))
                tagInitialSelection.value = null
            }
        } else {
            error.value = t('event_not_found')
        }
    } catch (err) {
        console.error(err)
        error.value = t('event_load_error')
    }
}

onMounted(() => {
    void loadEvent()
})
</script>

<style scoped lang="scss">
.event-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2.5rem);
    padding: clamp(1.5rem, 4vw, 3rem);
    background: linear-gradient(135deg, rgba(72, 93, 255, 0.08), rgba(141, 233, 255, 0.12));
}

.event-hero {
    text-align: center;
    color: #1f2937;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    h1 {
        font-size: clamp(2rem, 4vw, 2.8rem);
        margin: 0;
    }

    p {
        margin: 0;
    }

    .event-hero__meta {
        display: flex;
        justify-content: center;
        gap: 1rem;
        font-weight: 600;
        color: rgba(79, 70, 229, 0.85);
    }

    .event-hero__subtitle {
        color: rgba(55, 65, 81, 0.8);
        font-size: 1.05rem;
    }

    .event-hero__organizer {
        font-weight: 600;
        color: rgba(31, 41, 55, 0.85);
    }
}

.event-hero__header {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
}

.event-hero__header :deep(.title-fields) {
    width: min(520px, 100%);
}

.event-hero__edit {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    border: none;
    border-radius: 999px;
    padding: 0.35rem 0.85rem;
    background: rgba(79, 70, 229, 0.12);
    color: #4338ca;
    font-weight: 600;
    cursor: pointer;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}

.event-hero:hover .event-hero__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-hero__edit:hover {
    background: rgba(79, 70, 229, 0.2);
}

.event-hero__actions {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
}

.event-hero__button {
    border: none;
    border-radius: 999px;
    padding: 0.5rem 1.3rem;
    background: linear-gradient(135deg, #485dff, #60a5fa);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-hero__button:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 25px rgba(72, 93, 255, 0.35);
}

.event-hero__button--cancel {
    background: rgba(99, 102, 241, 0.12);
    color: #4338ca;
}

.event-hero__button--cancel:hover {
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.18);
}

.event-layout {
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: clamp(1.5rem, 3vw, 2rem);
}

.event-description {
    background: #fff;
    border-radius: 24px;
    padding: clamp(1.75rem, 3vw, 2.4rem);
    box-shadow: 0 24px 50px rgba(31, 41, 55, 0.12);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    position: relative;

    h2 {
        margin-top: 0;
        color: #111827;
        font-size: 1.35rem;
    }

    .empty {
        font-style: italic;
        color: rgba(107, 114, 128, 0.85);
    }
}

.event-description__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    position: relative;
    padding-top: 0.5rem;
}

.event-description__edit {
    position: absolute;
    top: 1.3rem;
    right: 0.5rem;
    z-index: 1;
    border: none;
    border-radius: 999px;
    padding: 0.4rem 0.9rem;
    background: rgba(79, 70, 229, 0.12);
    color: #4338ca;
    font-weight: 600;
    cursor: pointer;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}

.event-description:hover .event-description__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-description__edit:hover {
    background: rgba(79, 70, 229, 0.2);
}

.event-description__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.event-description__button {
    border: none;
    border-radius: 999px;
    padding: 0.5rem 1.3rem;
    background: linear-gradient(135deg, #485dff, #60a5fa);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-description__button:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 25px rgba(72, 93, 255, 0.35);
}

.event-description__button--cancel {
    background: rgba(99, 102, 241, 0.12);
    color: #4338ca;
}

.event-description__button--cancel:hover {
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.18);
}

.event-tags {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.event-tags__lists {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;
    justify-content: center;
}

.event-tags__lists h3 {
    margin: 0 0 0.35rem 0;
    font-size: 1rem;
    color: #1f2937;
}

.event-tags__lists ul {
    margin: 0;
    padding-left: 1.1rem;
    color: rgba(55, 65, 81, 0.85);
}

.event-tags__edit {
    align-self: center;
    border: none;
    border-radius: 999px;
    padding: 0.35rem 0.85rem;
    background: rgba(79, 70, 229, 0.12);
    color: #4338ca;
    font-weight: 600;
    cursor: pointer;
    opacity: 0;
    transform: translateY(-4px);
    transition: opacity 0.2s ease, transform 0.2s ease, background-color 0.2s ease;
}

.event-description:hover .event-tags__edit,
.event-tags:hover .event-tags__edit {
    opacity: 1;
    transform: translateY(0);
}

.event-tags__edit:hover {
    background: rgba(79, 70, 229, 0.2);
}

.event-tags__actions {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
}

.event-tags__button {
    border: none;
    border-radius: 999px;
    padding: 0.5rem 1.3rem;
    background: linear-gradient(135deg, #485dff, #60a5fa);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.event-tags__button:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 25px rgba(72, 93, 255, 0.35);
}

.event-tags__button--cancel {
    background: rgba(99, 102, 241, 0.12);
    color: #4338ca;
}

.event-tags__button--cancel:hover {
    box-shadow: 0 10px 20px rgba(79, 70, 229, 0.18);
}

.event-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 1.2rem;

    h3 {
        margin: 0 0 0.35rem 0;
        font-size: 1rem;
        color: #1f2937;
    }

    ul {
        margin: 0;
        padding-left: 1.1rem;
        color: rgba(55, 65, 81, 0.85);
    }
}

.event-additional {
    font-size: 0.95rem;
    color: rgba(55, 65, 81, 0.85);

    p {
        margin: 0.4rem 0;
    }
}

.event-aside {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
}

.event-venue,
.event-meta {
    background: #fff;
    border-radius: 24px;
    padding: 1.4rem;
    box-shadow: 0 18px 40px rgba(31, 41, 55, 0.10);

    h2,
    h3 {
        margin: 0 0 0.5rem 0;
        color: #111827;
        font-size: 1.1rem;
    }

    p {
        margin: 0.35rem 0;
        color: rgba(55, 65, 81, 0.85);
        line-height: 1.5;
    }
}

.event-loading {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.05rem;
    color: rgba(55, 65, 81, 0.85);
}

@media (max-width: 960px) {
    .event-layout {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 540px) {

    .event-description,
    .event-venue,
    .event-meta {
        border-radius: 20px;
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }
}
</style>

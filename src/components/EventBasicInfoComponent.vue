<template>
    <section class="event-section">
        <header class="event-section__header">
            <h2>{{ t('event_section_basic') }}</h2>
            <p>{{ t('event_section_basic_subtitle') }}</p>
        </header>

        <form class="event-section__form">
            <div class="form-field">
                <label for="event-title">{{ t('event_title_label') }}</label>
                <input id="event-title" v-model="eventTitle" type="text" :placeholder="t('event_title_placeholder')"
                    required />
            </div>

            <div class="form-field">
                <label for="event-subtitle">{{ t('event_subtitle_label') }}</label>
                <input id="event-subtitle" v-model="eventSubtitle" type="text"
                    :placeholder="t('event_subtitle_placeholder')" />
            </div>
            <div class="event-section__grid">
                <div class="form-field">
                    <label for="organizer">{{ t('event_organizer_label') }}</label>
                    <select id="organizer" v-model="organizer" required>
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="org in organizers" :key="org.id" :value="org.id">
                            {{ org.name }}
                        </option>
                    </select>
                </div>

                <div class="form-field">
                    <label for="event-venue">{{ t('venue') }}</label>
                    <select id="event-venue" v-model="venue" required>
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="ven in venues" :key="ven.id" :value="ven.id">
                            {{ ven.name }}
                        </option>
                    </select>
                </div>

                <div class="form-field">
                    <label for="event-space">{{ t('event_space_label') }}</label>
                    <select id="event-space" v-model="space" required>
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="sp in spaces" :key="sp.id" :value="sp.id">
                            {{ sp.name }}
                        </option>
                    </select>
                </div>

                <div class="form-field">
                    <label for="event-type">{{ t('event_type_label') }}</label>
                    <select id="event-type" v-model="eventType" required>
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="type in eventTypes" :key="type.id" :value="type.id">
                            {{ type.name }}
                        </option>
                    </select>
                </div>

                <div class="form-field">
                    <label for="genre">{{ t('event_genre_label') }}</label>
                    <select id="genre" v-model="genre" required>
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="gen in genres" :key="gen.id" :value="gen.id">
                            {{ gen.name }}
                        </option>
                    </select>
                </div>
            </div>
        </form>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

const props = defineProps<{
    organizerId: number
}>()

const { t } = useI18n({ useScope: 'global' })

const eventTitle = ref('')
const eventSubtitle = ref('')
const organizer = ref<number | null>(null)
const space = ref<number | null>(null)
const eventType = ref<number | null>(null)
const genre = ref<number | null>(null)
const venue = ref<number | null>(null)

const venues = ref<Array<{ id: number; name: string }>>([])
const organizers = ref<Array<{ id: number; name: string }>>([])
const spaces = ref<Array<{ id: number; name: string }>>([])
const eventTypes = ref<Array<{ id: number; name: string }>>([])
const genres = ref<Array<{ id: number; name: string }>>([])

onMounted(async () => {
    await fetchSelectData()
})

const fetchSelectData = async () => {
    try {
        const { data } = await apiFetch<Array<{ id: number; name: string }>>(
            `/api/admin/user/choosable-event-organizers/organizer/${props.organizerId}`
        )

        organizers.value = Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Failed to load organizers', error)
        organizers.value = []
    }
    try {
        const { data } = await apiFetch<Array<{ id: number; name: string }>>(
            `/api/admin/organizer/${props.organizerId}/venues`
        )

        venues.value = Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Failed to load venues', error)
        venues.value = []
    }
    try {
        const { data } = await apiFetch<Array<{ id: number; name: string }>>(
            `/api/admin/organizer/${props.organizerId}/spaces`
        )

        spaces.value = Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Failed to load spaces', error)
        spaces.value = []
    }
    try {
        const { data } = await apiFetch<Array<{ id: number; name: string }>>(
            `/api/admin/organizer/${props.organizerId}/event-types`
        )

        eventTypes.value = Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Failed to load event types', error)
        eventTypes.value = []
    }
    try {
        const { data } = await apiFetch<Array<{ id: number; name: string }>>(
            `/api/admin/organizer/${props.organizerId}/genres`
        )

        genres.value = Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Failed to load genres', error)
        genres.value = []
    }
}
</script>

<style scoped lang="scss">
.event-section {
    background: #ffffff;
    border-radius: 24px;
    padding: clamp(1.75rem, 4vw, 2.5rem);
    box-shadow: 0 24px 50px rgba(31, 41, 55, 0.14);
    display: flex;
    flex-direction: column;
    gap: clamp(1.25rem, 3vw, 1.75rem);
}

.event-section__header {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;

    h2 {
        font-size: clamp(1.35rem, 2.5vw, 1.75rem);
        font-weight: 700;
        color: #111827;
        margin: 0;
    }

    p {
        margin: 0;
        color: rgba(55, 65, 81, 0.8);
        line-height: 1.6;
        font-size: 0.98rem;
    }
}

.event-section__form {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2.5vw, 1.5rem);
}

.event-section__grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: clamp(1rem, 2vw, 1.5rem);
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    label {
        font-weight: 600;
        color: #1f2937;
        letter-spacing: 0.01em;
    }

    input,
    select {
        padding: 0.75rem 0.9rem;
        border: 1px solid rgba(17, 24, 39, 0.1);
        border-radius: 12px;
        background-color: rgba(243, 244, 246, 0.6);
        color: #0f172a;
        transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        font-size: 1rem;

        &::placeholder {
            color: rgba(100, 116, 139, 0.6);
        }

        &:focus {
            outline: none;
            border-color: rgba(79, 70, 229, 0.75);
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.15);
            background-color: #fff;
        }
    }

    select {
        padding-right: 2.4rem;
        background:
            linear-gradient(180deg, rgba(243, 244, 246, 0.9), rgba(229, 231, 235, 0.65)),
            url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.646 6.646a.5.5 0 0 1 .708 0L8 10.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z' fill='%2363748B'/%3E%3C/svg%3E") no-repeat right 0.85rem center/0.9rem;
        appearance: none;

        &:focus {
            background:
                linear-gradient(180deg, #ffffff, rgba(229, 231, 235, 0.65)),
                url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.646 6.646a.5.5 0 0 1 .708 0L8 10.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z' fill='%234856FF'/%3E%3C/svg%3E") no-repeat right 0.85rem center/0.9rem;
        }
    }
}

@media (max-width: 540px) {
    .event-section {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }
}
</style>

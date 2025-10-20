<template>
    <section class="event-section">
        <header class="event-section__header">
            <h2>{{ t('event_section_basic') }}</h2>
            <p>{{ t('event_section_basic_subtitle') }}</p>
        </header>

        <div class="event-section__form">
            <div class="form-field">
                <label for="event-title">
                    {{ t('event_title_label') }}
                    <span class="required">*</span>
                </label>
                <input
                    id="event-title"
                    v-model="basicInfo.title"
                    type="text"
                    :placeholder="t('event_title_placeholder')"
                    autocomplete="off"
                />
                <p v-if="errors.title" class="field-error">{{ errors.title }}</p>
            </div>

            <div class="form-field">
                <label for="event-subtitle">{{ t('event_subtitle_label') }}</label>
                <input
                    id="event-subtitle"
                    v-model="basicInfo.subtitle"
                    type="text"
                    :placeholder="t('event_subtitle_placeholder')"
                    autocomplete="off"
                />
            </div>

            <div class="event-section__grid">
                <div class="form-field">
                    <label for="organizer">
                        {{ t('event_organizer_label') }}<span class="required">*</span>
                    </label>
                    <select id="organizer" v-model="basicInfo.organizerId">
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="org in organizers" :key="org.id" :value="org.id">
                            {{ org.name }}
                        </option>
                    </select>
                    <p v-if="errors.organizerId" class="field-error">{{ errors.organizerId }}</p>
                </div>

                <div class="form-field">
                    <label for="event-venue">
                        {{ t('venue') }}<span class="required">*</span>
                    </label>
                    <select id="event-venue" v-model="basicInfo.venueId">
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="ven in venues" :key="ven.id" :value="ven.id">
                            {{ ven.name }}
                        </option>
                    </select>
                </div>

                <div class="form-field">
                    <label for="event-space">{{ t('event_space_label') }}</label>
                    <select id="event-space" v-model="basicInfo.spaceId">
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="sp in spaces" :key="sp.id" :value="sp.id">
                            {{ sp.name }}
                        </option>
                    </select>
                </div>

                <div class="form-field">
                    <label for="event-type">
                        {{ t('event_type_label') }}<span class="required">*</span>
                    </label>
                    <select id="event-type" v-model="basicInfo.eventTypeId">
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="type in eventTypes" :key="type.id" :value="type.id">
                            {{ type.name }}
                        </option>
                    </select>
                    <p v-if="errors.eventTypeId" class="field-error">{{ errors.eventTypeId }}</p>
                </div>

                <div class="form-field">
                    <label for="genre">{{ t('event_genre_label') }}</label>
                    <select id="genre" v-model="basicInfo.genreId">
                        <option :value="null" disabled>{{ t('select_placeholder') }}</option>
                        <option v-for="gen in genres" :key="gen.id" :value="gen.id">
                            {{ gen.name }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

const props = defineProps<{
    organizerId: number | null
    modelValue: BasicInfoModel
}>()

const emit = defineEmits<{
    (e: 'update:modelValue', value: BasicInfoModel): void
}>()

const { t } = useI18n({ useScope: 'global' })

interface SelectOption {
    id: number
    name: string
}

interface BasicInfoModel {
    title: string
    subtitle: string
    organizerId: number | null
    venueId: number | null
    spaceId: number | null
    eventTypeId: number | null
    genreId: number | null
}

const emptyBasicInfo = (): BasicInfoModel => ({
    title: '',
    subtitle: '',
    organizerId: null,
    venueId: null,
    spaceId: null,
    eventTypeId: null,
    genreId: null,
})

const basicInfo = reactive<BasicInfoModel>(emptyBasicInfo())

const venues = ref<SelectOption[]>([])
const organizers = ref<SelectOption[]>([])
const spaces = ref<SelectOption[]>([])
const eventTypes = ref<SelectOption[]>([])
const genres = ref<SelectOption[]>([])
const errors = reactive<Record<keyof BasicInfoModel | 'title', string | null>>({
    title: null,
    subtitle: null,
    organizerId: null,
    venueId: null,
    spaceId: null,
    eventTypeId: null,
    genreId: null,
})

watch(
    () => props.modelValue,
    (value) => {
        Object.assign(basicInfo, emptyBasicInfo(), value || {})
    },
    { deep: true, immediate: true }
)

watch(
    basicInfo,
    (value) => {
        emit('update:modelValue', { ...value })
    },
    { deep: true }
)

watch(
    () => props.organizerId,
    async (id) => {
        await fetchOrganizers(id ?? null)
        await fetchVenues(id ?? null)
        await fetchSpaces(id ?? null)
        await fetchEventTypes(id ?? null)
        await fetchGenres(id ?? null)
    },
    { immediate: true }
)

async function fetchOrganizers(contextId: number | null) {
    if (!contextId) {
        organizers.value = []
        basicInfo.organizerId = null
        return
    }

    try {
        const { data } = await apiFetch<SelectOption[]>(
            `/api/admin/user/choosable-event-organizers/organizer/${contextId}`
        )

        organizers.value = Array.isArray(data) ? data : []

        if (!organizers.value.find((org) => org.id === basicInfo.organizerId)) {
            basicInfo.organizerId = null
        }
    } catch (error) {
        console.error('Failed to load organizers', error)
        organizers.value = []
        basicInfo.organizerId = null
    }
}

async function fetchVenues(contextId: number | null) {
    try {
        const { data } = await apiFetch<SelectOption[]>(`/api/choosable-venues/organizer/${contextId}`)
        venues.value = Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Failed to load venues', error)
        venues.value = []
    }
}

async function fetchSpaces(contextId: number | null) {
    try {
        const { data } = await apiFetch<SelectOption[]>(`/api/choosable-spaces/organizer/${contextId}`)
        spaces.value = Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Failed to load spaces', error)
        spaces.value = []
    }
}

async function fetchEventTypes(contextId: number | null) {
    try {
        const { data } = await apiFetch<SelectOption[]>(`/api/choosable-event-types/organizer/${contextId}`)
        eventTypes.value = Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Failed to load event types', error)
        eventTypes.value = []
    }
}

async function fetchGenres(contextId: number | null) {
    try {
        const { data } = await apiFetch<SelectOption[]>(`/api/choosable-genres/organizer/${contextId}`)
        genres.value = Array.isArray(data) ? data : []
    } catch (error) {
        console.error('Failed to load genres', error)
        genres.value = []
    }
}

const validate = () => {
    errors.title = basicInfo.title.trim() ? null : t('event_error_required')
    errors.organizerId = basicInfo.organizerId ? null : t('event_error_required')
    errors.eventTypeId = basicInfo.eventTypeId ? null : t('event_error_required_optional')
    errors.venueId = basicInfo.venueId ? null : t('event_error_required_optional')

    return Object.values(errors).every((msg) => !msg)
}

watch(
    basicInfo,
    () => {
        if (errors.title && basicInfo.title.trim()) errors.title = null
        if (errors.organizerId && basicInfo.organizerId) errors.organizerId = null
        if (errors.eventTypeId && basicInfo.eventTypeId) errors.eventTypeId = null
        if (errors.venueId && basicInfo.venueId) errors.venueId = null
    },
    { deep: true }
)

defineExpose({ validate })
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

    .required {
        color: #dc2626;
        margin-left: 0.25rem;
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
            url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.646 6.646a.5.5 0 0 1 .708 0L8 10.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z' fill='%2363748B'/%3E%3C/svg%3E")
                no-repeat right 0.85rem center/0.9rem;
        appearance: none;

        &:focus {
            background:
                linear-gradient(180deg, #ffffff, rgba(229, 231, 235, 0.65)),
                url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M3.646 6.646a.5.5 0 0 1 .708 0L8 10.293l3.646-3.647a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 0-.708z' fill='%234856FF'/%3E%3C/svg%3E")
                    no-repeat right 0.85rem center/0.9rem;
        }
    }
}

@media (max-width: 540px) {
    .event-section {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }
}

.field-error {
    margin: 0;
    font-size: 0.85rem;
    color: #b91c1c;
    font-weight: 600;
}
</style>

<template>
    <div class="space-page">
        <section class="space-hero">
            <h1>{{ title }}</h1>
            <p>{{ subtitle }}</p>
        </section>

        <section class="space-card">
            <form class="space-form" @submit.prevent="submitForm">
                <div class="form-grid">
                    <div class="form-group">
                        <label for="name">{{ t('space_name') }}</label>
                        <input v-model="space.name" id="name" type="text" required />
                    </div>
                    <div class="form-group">
                        <label for="total_capacity">{{ t('space_total_capacity') }}</label>
                        <input v-model.number="space.total_capacity" id="total_capacity" type="number" min="0"
                            required />
                    </div>
                    <div class="form-group">
                        <label for="seating_capacity">{{ t('space_seating_capacity') }}</label>
                        <input v-model.number="space.seating_capacity" id="seating_capacity" type="number" min="0"
                            required />
                    </div>
                    <div class="form-group">
                        <label for="building_level">{{ t('space_building_level') }}</label>
                        <input v-model.number="space.building_level" id="building_level" type="number" required />
                    </div>
                    <div class="form-group">
                        <label for="space_type_id">{{ t('space_type') }}</label>
                        <select v-model.number="space.space_type_id" id="space_type_id" required>
                            <option :value="null" disabled>
                                {{ t('select_space_type') }}
                            </option>
                            <option v-for="type in spaceTypes" :key="type.id" :value="type.id">
                                {{ type.name }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="website_url">{{ t('website') }}</label>
                        <input v-model="space.website_url" id="website_url" type="url" />
                    </div>
                    <div class="form-group form-group--full">
                        <label for="accessibility_summary">{{ t('space_accessibility_summary') }}</label>
                        <textarea v-model="space.accessibility_summary" id="accessibility_summary" rows="3"></textarea>
                    </div>
                    <div v-if="accessibilityTopics.length" class="form-group--full">
                        <fieldset class="accessibility-section" aria-describedby="accessibility-flags-hint">
                            <p id="accessibility-flags-hint" class="accessibility-section__hint">
                                {{ t('space_accessibility_flags_hint') }}
                            </p>

                            <div class="accessibility-topics">
                                <section v-for="topic in accessibilityTopics" :key="topic.id"
                                    class="accessibility-topic">
                                    <header class="accessibility-topic__header">
                                        <h4 class="accessibility-topic__title">{{ topic.title }}</h4>
                                        <p v-if="topic.description" class="accessibility-topic__description">
                                            {{ topic.description }}
                                        </p>
                                    </header>

                                    <div class="accessibility-flags">
                                        <div v-for="flag in topic.flags" :key="flag.id" class="accessibility-flag">
                                            <input :id="`accessibility-flag-${flag.id}`" type="checkbox"
                                                :value="flag.value" v-model="selectedAccessibilityFlags" />
                                            <div class="accessibility-flag__content">
                                                <label class="accessibility-flag__label"
                                                    :for="`accessibility-flag-${flag.id}`">
                                                    {{ flag.label }}
                                                </label>
                                                <p v-if="flag.description" class="accessibility-flag__description">
                                                    {{ flag.description }}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </fieldset>
                    </div>
                </div>

                <transition name="fade">
                    <p v-if="errorMessage" class="feedback feedback--error" role="alert">{{ errorMessage }}</p>
                </transition>

                <div class="form-actions">
                    <button :disabled="isSubmitting || isLoadingSpace" type="submit">
                        <span v-if="!isSubmitting">{{ submitLabel }}</span>
                        <span v-else>{{ t(isEditMode ? 'updating' : 'saving') }}</span>
                    </button>
                </div>
            </form>
        </section>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

interface AccessibilityFlagRecord {
    id?: string | number | null
    topic_id?: string | number | null
    topicId?: string | number | null
    name?: string | null
    description?: string | null
}

interface AccessibilityFlagOption {
    id: number
    topicId: number
    label: string
    description: string
    value: number
    order: number
}

type AccessibilityFlagSource =
    | AccessibilityFlagRecord[]
    | { flags?: AccessibilityFlagRecord[]; data?: AccessibilityFlagRecord[]; accessibility_flags?: AccessibilityFlagRecord[]; accessibilityFlags?: AccessibilityFlagRecord[] }
    | Record<string, AccessibilityFlagRecord>
    | null

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const venueId = Number(route.params.venueId)
const organizerId = Number(route.params.id)
const toSpaceId = (value: unknown): number | null => {
    if (Array.isArray(value)) {
        return toSpaceId(value[0])
    }
    if (typeof value !== 'string') {
        return null
    }
    const trimmed = value.trim()
    if (!trimmed.length) {
        return null
    }
    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : null
}

const spaceId = toSpaceId(route.params.spaceId)
const space = reactive({
    name: '',
    total_capacity: 0,
    seating_capacity: 0,
    building_level: 0,
    space_type_id: null as number | null,
    website_url: '',
    accessibility_summary: '',
    accessibility_flags: null as number | null
})

const spaceTypes = ref<Array<{ id: number; name: string }>>([])
const accessibilityFlags = ref<AccessibilityFlagOption[]>([])
const selectedAccessibilityFlags = ref<number[]>([])
const accessibilityTopics = computed(() => {
    void locale.value
    return buildAccessibilityTopics(accessibilityFlags.value)
})

watch(
    selectedAccessibilityFlags,
    (values) => {
        space.accessibility_flags = values.length ? values.reduce((sum, value) => sum + value, 0) : null
    },
    { deep: true }
)

const isSubmitting = ref(false)
const isLoadingSpace = ref(false)
const errorMessage = ref<string | null>(null)
const isEditMode = computed(() => spaceId != null)
const title = computed(() => t(isEditMode.value ? 'update_space' : 'create_space'))
const subtitle = computed(() => t(isEditMode.value ? 'space_edit_subtitle' : 'space_details_subtitle'))
const submitLabel = computed(() => t(isEditMode.value ? 'update_space' : 'save_space'))
const spaceLoadErrorMessage = computed(() => t('space_load_error'))

onMounted(async () => {
    await Promise.all([fetchSpaceTypes(), fetchAccessibilityFlags()])
    if (spaceId != null) {
        await loadSpaceById(spaceId)
    }
})

watch(
    () => locale.value,
    async () => {
        await fetchAccessibilityFlags()
    }
)

async function fetchSpaceTypes() {
    try {
        const { data, status } = await apiFetch<Array<{ id: number; name: string }> | { space_types?: Array<{ id: number; name: string }> }>('/api/space/types', {
            method: 'GET',
        })

        if (status >= 200 && status < 300) {
            let types: Array<{ id: number; name: string }> | undefined

            if (Array.isArray(data)) {
                types = data
            } else if (data && typeof data === 'object' && 'space_types' in data && Array.isArray(data.space_types)) {
                types = data.space_types
            }

            if (types) {
                spaceTypes.value = types
                return
            }
        }

        console.error(`Failed to fetch space types (status ${status}).`)
    } catch (error) {
        console.error('Error fetching space types:', error)
    }
}

async function fetchAccessibilityFlags() {
    try {
        const previousMask = computeAccessibilityFlagsMask()
        const { data } = await apiFetch<AccessibilityFlagSource>(`/api/accessibility/flags?lang=${locale.value}`, {
            method: 'GET',
        })
        const flags = normalizeAccessibilityFlags(data)
        accessibilityFlags.value = flags

        if (!flags.length) {
            selectedAccessibilityFlags.value = []
            space.accessibility_flags = null
            return
        }

        if (space.accessibility_flags != null && space.accessibility_flags !== 0) {
            applyAccessibilityFlagsFromResponse(space.accessibility_flags)
        } else if (previousMask > 0) {
            applyAccessibilityFlagsFromResponse(previousMask)
        } else {
            reconcileSelectedAccessibilityFlags()
        }
    } catch (error) {
        console.error('Error fetching accessibility flags:', error)
        accessibilityFlags.value = []
        selectedAccessibilityFlags.value = []
        space.accessibility_flags = null
    }
}

const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string') {
        const parsed = Number(value.trim())
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }
    return fallback
}

const toNullableNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string') {
        const parsed = Number(value.trim())
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

const toFlagNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.max(0, Math.trunc(value))
    }
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed.length) {
            return null
        }
        const parsed = Number(trimmed)
        if (Number.isFinite(parsed)) {
            return Math.max(0, Math.trunc(parsed))
        }
    }
    return null
}

function normalizeAccessibilityFlags(source: AccessibilityFlagSource): AccessibilityFlagOption[] {
    const records: AccessibilityFlagRecord[] = []

    const append = (collection: unknown) => {
        if (Array.isArray(collection)) {
            collection.forEach((item) => {
                records.push((item ?? null) as AccessibilityFlagRecord)
            })
        }
    }

    if (Array.isArray(source)) {
        append(source)
    } else if (source && typeof source === 'object') {
        const container = source as {
            flags?: AccessibilityFlagRecord[]
            data?: AccessibilityFlagRecord[]
            accessibility_flags?: AccessibilityFlagRecord[]
            accessibilityFlags?: AccessibilityFlagRecord[]
        }
        append(container.flags)
        append(container.data)
        append(container.accessibility_flags)
        append(container.accessibilityFlags)

        if (!container.flags && !container.data && !container.accessibility_flags && !container.accessibilityFlags) {
            Object.values(source as Record<string, AccessibilityFlagRecord>).forEach((entry) => {
                if (entry && typeof entry === 'object') {
                    records.push(entry)
                }
            })
        }
    }

    const dedupeMap = new Map<number, AccessibilityFlagOption>()

    records.forEach((record, index) => {
        const option = normalizeAccessibilityFlagRecord(record, index)
        if (option) {
            dedupeMap.set(option.id, option)
        }
    })

    return Array.from(dedupeMap.values()).sort((a, b) => {
        if (a.topicId === b.topicId) {
            return a.order - b.order
        }
        return a.topicId - b.topicId
    })
}

function normalizeAccessibilityFlagRecord(record: AccessibilityFlagRecord, order: number): AccessibilityFlagOption | null {
    if (!record || typeof record !== 'object') {
        return null
    }

    const idCandidate = toFlagNumber(record.id)
    const topicCandidate =
        toFlagNumber(record.topic_id) ??
        toFlagNumber((record as { topicId?: unknown }).topicId)

    if (idCandidate == null || topicCandidate == null) {
        return null
    }

    const label = typeof record.name === 'string' && record.name.trim().length ? record.name.trim() : `Flag #${idCandidate}`
    const description = typeof record.description === 'string' ? record.description.trim() : ''

    const value = Math.pow(2, idCandidate)
    if (!Number.isFinite(value)) {
        return null
    }

    return {
        id: idCandidate,
        topicId: topicCandidate,
        label,
        description,
        value,
        order,
    }
}

async function loadSpaceById(id: number) {
    isLoadingSpace.value = true
    errorMessage.value = null
    try {
        const { data } = await apiFetch<SpaceResponse | null>(`/api/admin/space/${id}`)
        if (!data) {
            throw new Error('Space not found')
        }

        space.name = typeof data.name === 'string' ? data.name : ''
        space.total_capacity = toNumber(data.total_capacity, 0)
        space.seating_capacity = toNumber(data.seating_capacity, 0)
        space.building_level = toNumber(data.building_level, 0)
        space.space_type_id = toNullableNumber(data.space_type_id)
        space.website_url = typeof data.website_url === 'string' ? data.website_url : ''
        space.accessibility_summary =
            typeof data.accessibility_summary === 'string' ? data.accessibility_summary : ''
        space.accessibility_flags = typeof data.accessibility_flags === 'number'
            ? data.accessibility_flags
            : toNullableNumber(data.accessibility_flags)
        applyAccessibilityFlagsFromResponse(data.accessibility_flags)
    } catch (error) {
        console.error('Failed to load space', error)
        errorMessage.value = spaceLoadErrorMessage.value
    } finally {
        isLoadingSpace.value = false
    }
}

async function submitForm() {
    const spaceTypeId = space.space_type_id

    if (spaceTypeId === null) {
        errorMessage.value = t('select_space_type_error')
        return
    }

    const trimmedWebsite = space.website_url.trim()
    const normalizedWebsite = trimmedWebsite.length
        ? trimmedWebsite.startsWith('http://') || trimmedWebsite.startsWith('https://')
            ? trimmedWebsite
            : `https://${trimmedWebsite}`
        : ''
    const accessibilitySummary = space.accessibility_summary.trim()
    space.accessibility_summary = accessibilitySummary

    const accessibilityMask = computeAccessibilityFlagsMask()
    space.accessibility_flags = selectedAccessibilityFlags.value.length ? accessibilityMask : null

    const payload: SpacePayload = {
        name: space.name,
        total_capacity: space.total_capacity,
        seating_capacity: space.seating_capacity,
        building_level: space.building_level,
        space_type_id: spaceTypeId,
        website_url: normalizedWebsite,
        accessibility_summary: accessibilitySummary,
        venue_id: venueId,
        accessibility_flags: space.accessibility_flags
    }

    isSubmitting.value = true
    errorMessage.value = null

    try {
        const endpoint = isEditMode.value && spaceId != null ? `/api/admin/space/${spaceId}` : '/api/admin/space/create'
        const method = isEditMode.value ? 'PUT' : 'POST'
        const { status } = await apiFetch(endpoint, {
            method,
            body: JSON.stringify(payload),
        })

        if (status >= 200 && status < 300) {
            if (Number.isFinite(organizerId)) {
                router.push(`/organizer/${organizerId}/venues`)
            }

            if (isEditMode.value) {
                router.push(`/organizer/${organizerId}/venues`)
            }
        } else {
            const failureKey = isEditMode.value ? 'update_space_failed' : 'save_space_failed'
            errorMessage.value = `${t(failureKey)} (status ${status}).`
        }
    } catch (error: unknown) {
        const defaultError = t(isEditMode.value ? 'update_space_failed' : 'save_space_failed')
        if (typeof error === 'object' && error && 'data' in error) {
            const err = error as { data?: { error?: string } }
            errorMessage.value = err.data?.error ?? defaultError
        } else if (error instanceof Error) {
            errorMessage.value = error.message || defaultError
        } else {
            errorMessage.value = defaultError
        }
    } finally {
        isSubmitting.value = false
    }
}


function applyAccessibilityFlagsFromResponse(value: unknown) {
    const options = accessibilityFlags.value

    if (!options.length) {
        selectedAccessibilityFlags.value = []
        return
    }

    const selection = new Set<number>()

    if (typeof value === 'string' && value.includes(',')) {
        const parts = value
            .split(',')
            .map((part) => part.trim())
            .filter((part) => part.length)
        applyAccessibilityFlagsFromResponse(parts)
        return
    }

    if (Array.isArray(value)) {
        value.forEach((entry) => {
            const numeric = toFlagNumber(entry)
            if (numeric == null) {
                return
            }

            const matchByValue = options.find((option) => option.value === numeric)
            if (matchByValue) {
                selection.add(matchByValue.value)
                return
            }

            const matchById = options.find((option) => option.id === numeric)
            if (matchById) {
                selection.add(matchById.value)
            }
        })
        selectedAccessibilityFlags.value = Array.from(selection)
        space.accessibility_flags = selectedAccessibilityFlags.value.length ? computeAccessibilityFlagsMask() : null
        return
    }

    const mask = toFlagNumber(value)
    if (mask == null || mask === 0) {
        selectedAccessibilityFlags.value = []
        return
    }

    options.forEach((option) => {
        if (option.value <= 0) {
            return
        }

        const division = mask / option.value
        if (Number.isFinite(division) && Math.floor(division) % 2 === 1) {
            selection.add(option.value)
            return
        }

        if (mask === option.id) {
            selection.add(option.value)
        }
    })

    selectedAccessibilityFlags.value = Array.from(selection)
    space.accessibility_flags = selectedAccessibilityFlags.value.length ? computeAccessibilityFlagsMask() : null
}

function computeAccessibilityFlagsMask(): number {
    return selectedAccessibilityFlags.value.reduce((accumulator, current) => accumulator + current, 0)
}

function buildAccessibilityTopics(flags: AccessibilityFlagOption[]): Array<{
    id: number
    title: string
    description: string
    flags: AccessibilityFlagOption[]
}> {
    if (!Array.isArray(flags) || !flags.length) {
        return []
    }

    const grouped = new Map<number, AccessibilityFlagOption[]>()
    flags.forEach((flag) => {
        const topicId = flag.topicId
        if (!grouped.has(topicId)) {
            grouped.set(topicId, [])
        }
        grouped.get(topicId)!.push(flag)
    })

    const preferredOrder = [1, 2, 3, 4, 5, 6]

    return Array.from(grouped.entries())
        .map(([topicId, topicFlags]) => {
            const copy = getAccessibilityTopicCopy(topicId)
            return {
                id: topicId,
                title: copy.title,
                description: copy.description,
                flags: topicFlags.slice().sort((a, b) => a.order - b.order),
            }
        })
        .sort((a, b) => {
            const indexA = preferredOrder.indexOf(a.id)
            const indexB = preferredOrder.indexOf(b.id)

            if (indexA !== -1 || indexB !== -1) {
                return (indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA) -
                    (indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB)
            }

            return a.id - b.id
        })
}

function getAccessibilityTopicCopy(topicId: number): { title: string; description: string } {
    switch (topicId) {
        case 1:
            return {
                title: t('space_accessibility_topic_1_title'),
                description: t('space_accessibility_topic_1_description'),
            }
        case 2:
            return {
                title: t('space_accessibility_topic_2_title'),
                description: t('space_accessibility_topic_2_description'),
            }
        case 3:
            return {
                title: t('space_accessibility_topic_3_title'),
                description: t('space_accessibility_topic_3_description'),
            }
        case 4:
            return {
                title: t('space_accessibility_topic_4_title'),
                description: t('space_accessibility_topic_4_description'),
            }
        case 5:
            return {
                title: t('space_accessibility_topic_5_title'),
                description: t('space_accessibility_topic_5_description'),
            }
        case 6:
            return {
                title: t('space_accessibility_topic_6_title'),
                description: t('space_accessibility_topic_6_description'),
            }
        default:
            return {
                title: t('space_accessibility_topic_generic_title', { id: topicId }),
                description: '',
            }
    }
}

function reconcileSelectedAccessibilityFlags() {
    if (!selectedAccessibilityFlags.value.length) {
        space.accessibility_flags = null
        return
    }

    const available = new Set(accessibilityFlags.value.map((flag) => flag.value))
    selectedAccessibilityFlags.value = selectedAccessibilityFlags.value.filter((value) => available.has(value))
    space.accessibility_flags = selectedAccessibilityFlags.value.length ? computeAccessibilityFlagsMask() : null
}

interface Space {
    name: string
    total_capacity: number
    seating_capacity: number
    building_level: number
    space_type_id: number | null
    website_url: string
    accessibility_summary: string
    venue_id: number
    accessibility_flags?: number | null
}

type SpacePayload = Omit<Space, 'space_type_id'> & { space_type_id: number }

interface SpaceResponse {
    name?: string | null
    total_capacity?: number | string | null
    seating_capacity?: number | string | null
    building_level?: number | string | null
    space_type_id?: number | string | null
    website_url?: string | null
    accessibility_summary?: string | null
    accessibility_flags?: number | string | Array<number | string> | null
}
</script>

<style scoped lang="scss">
.space-page {
    @include form-page();
}

.space-hero {
    @include form-hero(540px);
}

.space-card {
    @include form-card(720px, clamp(1.75rem, 4vw, 2.5rem), clamp(1.25rem, 3vw, 1.75rem));
}

.space-form {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.form-grid {
    @include form-grid();
}

.form-group {
    @include form-group();
}

.form-group--full {
    grid-column: span 2;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
}

button {
    @include form-primary-button($padding-y: 0.85rem, $padding-x: 2rem);
}

.feedback {
    @include form-feedback();

    &--error {
        @include form-feedback-error();
    }
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.accessibility-section {
    display: flex;
    flex-direction: column;
    border: none;
    padding: 0;
}

.accessibility-section__hint {
    margin: 0 0 0 clamp(1rem, 2.5vw, 1.5rem) p;
    font-size: 0.875rem;
    color: var(--text-muted, rgba(0, 0, 0, 0.65));
}

.accessibility-topics {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2.5vw, 1.5rem);
}

.accessibility-topic__header {
    margin-bottom: 0.25rem;
}

.accessibility-topic__title {
    font-size: 1rem;
    font-weight: 600;
}

.accessibility-topic__description {
    margin: 0.35rem 0 1rem 0;
    font-size: 0.9rem;
    color: var(--text-muted, rgba(0, 0, 0, 0.65));
}

.accessibility-flags {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.accessibility-flag {
    display: flex;
    align-items: flex-start;
    gap: 0.2rem;
    font-size: 0.95rem;
    flex-direction: row;
}

.accessibility-flag__content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.accessibility-flag__label {
    display: inline-block;
    font-weight: 600;
    cursor: pointer;
}

.accessibility-flag__description {
    font-size: 0.85rem;
    color: var(--text-muted, rgba(0, 0, 0, 0.65));
}

@media (max-width: 540px) {
    .space-card {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }

    .form-actions {
        justify-content: center;
    }
}
</style>

<template>
  <form class="uranus-form" @submit.prevent="handleSubmit" novalidate>

    <UranusTextInput id="space_name" size="big" required
        v-model="spaceName"
        :label="t('space_name')"
        :error="fieldErrors.spaceName"
    />

    <UranusFormRow>
      <UranusFieldLabel :label="t('space_total_capacity')" id="total_capacity" required :error="fieldErrors.totalCapacity">
        <input
            id="total_capacity"
            type="number"
            v-model.number="totalCapacity"
            min="0"
            class="uranus-text-input"
            :aria-required="true"
            :aria-invalid="fieldErrors.totalCapacity ? 'true' : 'false'"
        />
      </UranusFieldLabel>

      <UranusFieldLabel :label="t('space_seating_capacity')" id="seating_capacity" required :error="fieldErrors.seatingCapacity">
        <input
            id="seating_capacity"
            type="number"
            v-model.number="seatingCapacity"
            min="0"
            class="uranus-text-input"
            :aria-required="true"
            :aria-invalid="fieldErrors.seatingCapacity ? 'true' : 'false'"
        />
      </UranusFieldLabel>
    </UranusFormRow>

    <UranusFormRow>
      <UranusFieldLabel :label="t('space_building_level')" id="building_level" required :error="fieldErrors.buildingLevel">
        <input
            id="building_level"
            type="number"
            v-model.number="buildingLevel"
            class="uranus-text-input"
            :aria-required="true"
            :aria-invalid="fieldErrors.buildingLevel ? 'true' : 'false'"
        />
      </UranusFieldLabel>

      <UranusFieldLabel :label="t('space_type')" id="space_type_id" required :error="fieldErrors.spaceTypeId">
        <select
            id="space_type_id"
            v-model.number="spaceTypeId"
            class="uranus-text-input"
            :aria-required="true"
            :aria-invalid="fieldErrors.spaceTypeId ? 'true' : 'false'"
        >
          <option :value="null" disabled>
            {{ t('select_space_type') }}
          </option>
          <option v-for="type in spaceTypes" :key="type.id" :value="type.id">
            {{ type.name }}
          </option>
        </select>
      </UranusFieldLabel>
    </UranusFormRow>

    <UranusTextInput id="website_url"
                     v-model="websiteUrl"
                     :label="t('website')"
                     :error="fieldErrors.websiteUrl"
    />

    <UranusFieldLabel :label="t('space_description')" id="description" :error="fieldErrors.description">
      <textarea
          id="description"
          v-model="description"
          class="uranus-text-input"
          rows="3"
      ></textarea>
    </UranusFieldLabel>

    <UranusFieldLabel :label="t('space_accessibility_summary')" id="accessibility_summary" :error="fieldErrors.accessibilitySummary">
      <textarea
          id="accessibility_summary"
          v-model="accessibilitySummary"
          class="uranus-text-input"
          rows="3"
      ></textarea>
    </UranusFieldLabel>

    <div v-if="accessibilityTopics.length">
      <fieldset class="accessibility-section" aria-describedby="accessibility-flags-hint">
        <p id="accessibility-flags-hint" class="accessibility-section__hint">
          {{ t('space_accessibility_flags_hint') }}
        </p>

        <div class="accessibility-topics">
          <section v-for="topic in accessibilityTopics" :key="topic.id" class="accessibility-topic">
            <header class="accessibility-topic__header">
              <h4 class="accessibility-topic__title">{{ topic.title }}</h4>
              <p v-if="topic.description" class="accessibility-topic__description">
                {{ topic.description }}
              </p>
            </header>

            <div class="accessibility-flags">
              <div v-for="flag in topic.flags" :key="flag.id" class="accessibility-flag">
                <input
                    :id="`accessibility-flag-${flag.id}`"
                    type="checkbox"
                    :value="flag.value"
                    v-model="selectedAccessibilityFlags"
                />
                <div class="accessibility-flag__content">
                  <label class="accessibility-flag__label" :for="`accessibility-flag-${flag.id}`">
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

    <div class="form-actions" style="text-align: right">
      <button class="uranus-button" type="submit" :disabled="loading">{{ submitLabel }}</button>
    </div>
  </form>

  <transition name="fade">
    <p v-if="displayError" class="feedback feedback--error">{{ displayError }}</p>
  </transition>
  <transition name="fade">
    <p v-if="successMessage" class="feedback feedback--success">{{ successMessage }}</p>
  </transition>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, toRef, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusTextInput from '@/components/uranus/UranusTextInput.vue'
import UranusFormRow from '@/components/uranus/UranusFormRow.vue'
import UranusFieldLabel from '@/components/uranus/UranusFieldLabel.vue'

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

export interface SpaceFormInitialValues {
    name?: string
    totalCapacity?: number
    seatingCapacity?: number
    buildingLevel?: number
    spaceTypeId?: number | null
    websiteUrl?: string
    description?: string | null
    accessibilitySummary?: string | null
    accessibilityFlags?: number | null
}

export interface SpaceFormSubmitPayload {
    name: string
    total_capacity: number
    seating_capacity: number
    building_level: number
    space_type_id: number
    website_url: string | null
    description: string | null
    accessibility_summary: string | null
    accessibility_flags: number | null
}

const props = withDefaults(defineProps<{
    submitLabel: string
    loading?: boolean
    errorMessage?: string | null
    successMessage?: string | null
    initialValues?: SpaceFormInitialValues
}>(), {
    loading: false,
    errorMessage: null,
    successMessage: null,
})

const emit = defineEmits<{
    (e: 'submit', payload: SpaceFormSubmitPayload): void
    (e: 'clear-error'): void
}>()

const { t, te, locale } = useI18n()

const spaceName = ref('')
const totalCapacity = ref(0)
const seatingCapacity = ref(0)
const buildingLevel = ref(0)
const spaceTypeId = ref<number | null>(null)
const websiteUrl = ref('')
const description = ref('')
const accessibilitySummary = ref('')

const spaceTypes = ref<Array<{ id: number; name: string }>>([])
const accessibilityFlags = ref<AccessibilityFlagOption[]>([])
const selectedAccessibilityFlags = ref<number[]>([])

const fieldErrors = reactive({
    spaceName: null as string | null,
    totalCapacity: null as string | null,
    seatingCapacity: null as string | null,
    buildingLevel: null as string | null,
    spaceTypeId: null as string | null,
    websiteUrl: null as string | null,
    description: null as string | null,
    accessibilitySummary: null as string | null,
})

const localError = ref<string | null>(null)

const requiredFieldMessage = computed(() => (te('event_error_required') ? t('event_error_required') : 'This field is required'))
const missingRequiredMessage = computed(() => (te('organizer_form_missing_required') ? t('organizer_form_missing_required') : 'Please complete all required fields.'))
const invalidWebsiteMessage = computed(() => (te('organizer_form_invalid_website') ? t('organizer_form_invalid_website') : 'Please provide a valid website URL.'))

const displayError = computed(() => localError.value ?? props.errorMessage ?? null)

const accessibilityTopics = computed(() => {
    void locale.value
    return buildAccessibilityTopics(accessibilityFlags.value)
})

watch(
    selectedAccessibilityFlags,
    () => {
        // Flags are managed by the component
    },
    { deep: true }
)

onMounted(async () => {
    await Promise.all([fetchSpaceTypes(), fetchAccessibilityFlags()])
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
        const { data } = await apiFetch<AccessibilityFlagSource>(`/api/accessibility/flags?lang=${locale.value}`, {
            method: 'GET',
        })
        const flags = normalizeAccessibilityFlags(data)
        accessibilityFlags.value = flags

        if (!flags.length) {
            selectedAccessibilityFlags.value = []
            return
        }
    } catch (error) {
        console.error('Error fetching accessibility flags:', error)
        accessibilityFlags.value = []
        selectedAccessibilityFlags.value = []
    }
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

function applyAccessibilityFlagsFromMask(mask: number | null) {
    const options = accessibilityFlags.value

    if (!options.length || mask == null || mask === 0) {
        selectedAccessibilityFlags.value = []
        return
    }

    const selection = new Set<number>()

    options.forEach((option) => {
        if (option.value <= 0) {
            return
        }

        const division = mask / option.value
        if (Number.isFinite(division) && Math.floor(division) % 2 === 1) {
            selection.add(option.value)
        }
    })

    selectedAccessibilityFlags.value = Array.from(selection)
}

function computeAccessibilityFlagsMask(): number {
    return selectedAccessibilityFlags.value.reduce((accumulator, current) => accumulator + current, 0)
}

const isValidUrl = (value: string) => {
    try {
        const hasProtocol = value.startsWith('http://') || value.startsWith('https://')
        const normalized = hasProtocol ? value : `https://${value}`
        const parsed = new URL(normalized)
        return Boolean(parsed.hostname)
    } catch {
        return false
    }
}

const applyInitialValues = (values?: SpaceFormInitialValues) => {
    spaceName.value = values?.name ?? ''
    totalCapacity.value = values?.totalCapacity ?? 0
    seatingCapacity.value = values?.seatingCapacity ?? 0
    buildingLevel.value = values?.buildingLevel ?? 0
    spaceTypeId.value = values?.spaceTypeId ?? null
    websiteUrl.value = values?.websiteUrl ?? ''
    description.value = values?.description ?? ''
    accessibilitySummary.value = values?.accessibilitySummary ?? ''

    if (values?.accessibilityFlags != null) {
        applyAccessibilityFlagsFromMask(values.accessibilityFlags)
    } else {
        selectedAccessibilityFlags.value = []
    }

    Object.keys(fieldErrors).forEach((key) => {
        fieldErrors[key as keyof typeof fieldErrors] = null
    })
    localError.value = null
}

watch(
    () => props.initialValues,
    (values) => {
        applyInitialValues(values)
    },
    { immediate: true, deep: true }
)

const clearMissingRequiredMessage = () => {
    if (localError.value === missingRequiredMessage.value) {
        const stillMissing = [
            fieldErrors.spaceName,
            fieldErrors.totalCapacity,
            fieldErrors.seatingCapacity,
            fieldErrors.buildingLevel,
            fieldErrors.spaceTypeId,
        ].some((value) => Boolean(value))
        if (!stillMissing) {
            localError.value = null
        }
    }
    if (props.errorMessage) {
        emit('clear-error')
    }
}

const handleSubmit = () => {
    if (props.loading) {
        return
    }

    localError.value = null

    const trimmedName = spaceName.value.trim()
    const trimmedWebsite = websiteUrl.value.trim()
    const trimmedDescription = description.value.trim()
    const trimmedAccessibilitySummary = accessibilitySummary.value.trim()

    fieldErrors.spaceName = trimmedName ? null : requiredFieldMessage.value
    fieldErrors.totalCapacity = totalCapacity.value >= 0 ? null : requiredFieldMessage.value
    fieldErrors.seatingCapacity = seatingCapacity.value >= 0 ? null : requiredFieldMessage.value
    fieldErrors.buildingLevel = buildingLevel.value != null ? null : requiredFieldMessage.value
    fieldErrors.spaceTypeId = spaceTypeId.value != null ? null : requiredFieldMessage.value
    fieldErrors.websiteUrl = trimmedWebsite ? (isValidUrl(trimmedWebsite) ? null : invalidWebsiteMessage.value) : null

    const hasMissingRequired = [
        fieldErrors.spaceName,
        fieldErrors.totalCapacity,
        fieldErrors.seatingCapacity,
        fieldErrors.buildingLevel,
        fieldErrors.spaceTypeId,
    ].some((value) => Boolean(value))

    const websiteInvalid = Boolean(fieldErrors.websiteUrl)

    if (hasMissingRequired) {
        localError.value = missingRequiredMessage.value
        return
    }

    if (websiteInvalid) {
        localError.value = fieldErrors.websiteUrl
        return
    }

    if (spaceTypeId.value === null) {
        localError.value = t('select_space_type_error')
        return
    }

    const normalizedWebsite = trimmedWebsite.length
        ? trimmedWebsite.startsWith('http://') || trimmedWebsite.startsWith('https://')
            ? trimmedWebsite
            : `https://${trimmedWebsite}`
        : ''

    const accessibilityMask = computeAccessibilityFlagsMask()

    emit('submit', {
        name: trimmedName,
        total_capacity: totalCapacity.value,
        seating_capacity: seatingCapacity.value,
        building_level: buildingLevel.value,
        space_type_id: spaceTypeId.value,
        website_url: normalizedWebsite.length ? normalizedWebsite : null,
        description: trimmedDescription.length ? trimmedDescription : null,
        accessibility_summary: trimmedAccessibilitySummary.length ? trimmedAccessibilitySummary : null,
        accessibility_flags: selectedAccessibilityFlags.value.length ? accessibilityMask : null,
    })
}

watch(spaceName, (value) => {
    if (fieldErrors.spaceName && value.trim()) {
        fieldErrors.spaceName = null
        clearMissingRequiredMessage()
    }
})

watch(totalCapacity, () => {
    if (fieldErrors.totalCapacity && totalCapacity.value >= 0) {
        fieldErrors.totalCapacity = null
        clearMissingRequiredMessage()
    }
})

watch(seatingCapacity, () => {
    if (fieldErrors.seatingCapacity && seatingCapacity.value >= 0) {
        fieldErrors.seatingCapacity = null
        clearMissingRequiredMessage()
    }
})

watch(buildingLevel, () => {
    if (fieldErrors.buildingLevel && buildingLevel.value != null) {
        fieldErrors.buildingLevel = null
        clearMissingRequiredMessage()
    }
})

watch(spaceTypeId, () => {
    if (fieldErrors.spaceTypeId && spaceTypeId.value != null) {
        fieldErrors.spaceTypeId = null
        clearMissingRequiredMessage()
    }
})

watch(websiteUrl, (value) => {
    const currentMessage = fieldErrors.websiteUrl
    if (!currentMessage) {
        return
    }
    const trimmed = value.trim()
    if (!trimmed || isValidUrl(trimmed)) {
        if (localError.value === currentMessage) {
            localError.value = null
        }
        fieldErrors.websiteUrl = null
        if (props.errorMessage) {
            emit('clear-error')
        }
    }
})

defineExpose({
    setValues: applyInitialValues,
})
</script>

<style scoped lang="scss">
.accessibility-section {
    display: flex;
    flex-direction: column;
    border: none;
    padding: 0;
}

.accessibility-section__hint {
    margin: 0 0 1rem 0;
    font-size: 0.875rem;
    color: var(--text-muted, rgba(0, 0, 0, 0.65));
}

.accessibility-topics {
    display: flex;
    flex-direction: column;
    gap: clamp(1rem, 2.5vw, 1.5rem);
}

.accessibility-topic__header {
    margin-bottom: 0.75rem;
}

.accessibility-topic__title {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.25rem 0;
}

.accessibility-topic__description {
    margin: 0;
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
    gap: 0.5rem;
    font-size: 0.95rem;
}

.accessibility-flag input[type="checkbox"] {
    margin-top: 0.25rem;
}

.accessibility-flag__content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.accessibility-flag__label {
    display: inline-block;
    font-weight: 500;
    cursor: pointer;
}

.accessibility-flag__description {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-muted, rgba(0, 0, 0, 0.65));
}

.feedback {
    margin-top: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.9rem;

    &--error {
        background-color: #fee;
        color: #c00;
        border: 1px solid #fcc;
    }

    &--success {
        background-color: #efe;
        color: #060;
        border: 1px solid #cfc;
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
</style>

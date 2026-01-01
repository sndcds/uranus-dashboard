<!--
  UranusSpaceEditForm.vue
-->
<template>
  <form class="uranus-form" @submit.prevent="handleSubmit" novalidate>

    <section class="uranus-card">
      <UranusTextInput
          id="space_name"
          size="big"
          required
          v-model="spaceName"
          :label="t('space_name')"
          :error="fieldErrors.spaceName!"
      />

      <UranusFormRow>
        <UranusFieldLabel
            :label="t('space_total_capacity')"
            id="total_capacity"
            required
            :error="fieldErrors.totalCapacity"
        >
          <input
              id="total_capacity"
              type="number"
              v-model.number="totalCapacity"
              min="0"
              class="uranus-text-input" :aria-required="true"
              :aria-invalid="fieldErrors.totalCapacity ? 'true' : 'false'"
          />
        </UranusFieldLabel>

        <UranusFieldLabel
            :label="t('space_seating_capacity')"
            id="seating_capacity"
            required
            :error="fieldErrors.seatingCapacity"
        >
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
        <UranusFieldLabel
            :label="t('space_building_level')"
            id="building_level" required
            :error="fieldErrors.buildingLevel"
        >
          <input
              id="building_level"
              type="number"
              v-model.number="buildingLevel"
              class="uranus-text-input"
              :aria-required="true"
              :aria-invalid="fieldErrors.buildingLevel ? 'true' : 'false'"
          />
        </UranusFieldLabel>

        <UranusFieldLabel
            :label="t('space_type')"
            id="space_type_id"
            required
            :error="fieldErrors.spaceTypeId"
        >
          <select
              id="space_type_id"
              -model.number="spaceTypeId"
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

    </section>

    <section class="uranus-card">
      <UranusTextInput
          id="website_url"
          v-model="websiteUrl"
          :label="t('website')"
          :error="fieldErrors.websiteUrl!"
      />

      <UranusFieldLabel
          :label="t('space_description')"
          id="description"
          :error="fieldErrors.description"
      >
        <textarea
            id="description"
            v-model="description"
            class="uranus-text-input"
            rows="3">
        </textarea>
      </UranusFieldLabel>
    </section>

    <section class="uranus-card">
      <UranusFieldLabel
          :label="t('space_accessibility_summary')"
          id="accessibility_summary"
          :error="fieldErrors.accessibilitySummary"
      >
        <textarea
            id="accessibility_summary"
            v-model="accessibilitySummary"
            class="uranus-text-input"
            rows="3">
        </textarea>
      </UranusFieldLabel>

      <div v-if="uranusI18nAccessibilityFlags.length">
        <fieldset class="accessibility-section" aria-describedby="accessibility-flags-hint">
          <p id="accessibility-flags-hint" class="accessibility-section__hint">
            {{ t('space_accessibility_flags_hint') }}
          </p>

          <div class="accessibility-topics">
            <section
                v-for="topic in uranusI18nAccessibilityFlags"
                :key="topic.topic"
                class="accessibility-topic"
            >
              <header class="accessibility-topic__header">
                <h4> {{ t(`${topic.topic_name}`) }} </h4>
              </header>

              <div class="accessibility-flags">
                <div
                    v-for="flag in topic.flags"
                    :key="flag.id"
                    class="accessibility-flag"
                >
                  <input
                      :id="`accessibility-flag-${flag.id}`"
                      type="checkbox"
                      :value="1n << BigInt(flag.id)"
                      v-model="selectedAccessibilityFlags"
                  />
                  <div class="accessibility-flag__content">
                    <label
                        class="accessibility-flag__label"
                        :for="`accessibility-flag-${flag.id}`"
                    >
                      {{ t(`${flag.name}`) }}
                    </label>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </fieldset>
      </div>

    </section>

    <div class="uranus-form-action-footer">
      <button class="uranus-ok-button" type="submit" :disabled="loading">{{ submitLabel }}</button>
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
import UranusTextInput from '@/components/ui/UranusTextInput.vue'
import UranusFormRow from '@/components/ui/UranusFormRow.vue'
import UranusFieldLabel from '@/components/ui/UranusFieldLabel.vue'
import { uranusI18nAccessibilityFlags } from '@/i18n/uranus-i18n-accessibility.ts'

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
  id?: number
  name?: string
  totalCapacity?: number
  seatingCapacity?: number
  buildingLevel?: number
  spaceTypeId?: number | null
  websiteUrl?: string
  description?: string | null
  accessibilitySummary?: string | null
  accessibilityFlags?: string | null
}

export interface SpaceFormSubmitPayload {
  spaceId?: number
  name: string
  totalCapacity: number
  seatingCapacity: number
  buildingLevel: number
  spaceTypeId: number
  websiteUrl: string | null
  description: string | null
  accessibilitySummary: string | null
  accessibilityFlags: string | null
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

const spaceId = ref<number | null>(null)
const spaceName = ref('')
const totalCapacity = ref(0)
const seatingCapacity = ref(0)
const buildingLevel = ref(0)
const spaceTypeId = ref<number | null>(null)
const websiteUrl = ref('')
const description = ref('')
const accessibilitySummary = ref('')

const spaceTypes = ref<Array<{ id: number; name: string }>>([])
const selectedAccessibilityFlags = ref<bigint[]>([])

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

const requiredFieldMessage = computed(() => (te('required_field') ? t('required_field') : 'This field is required'))
const missingRequiredMessage = computed(() => (te('organization_form_missing_required') ? t('organization_form_missing_required') : 'Please complete all required fields.'))
const invalidWebsiteMessage = computed(() => (te('organization_form_invalid_website') ? t('organization_form_invalid_website') : 'Please provide a valid website URL.'))

const displayError = computed(() => localError.value ?? props.errorMessage ?? null)

watch(
    selectedAccessibilityFlags,
    () => {
        // Flags are managed by the component
    },
    { deep: true }
)

onMounted(async () => {
    await Promise.all([fetchSpaceTypes()])
})

async function fetchSpaceTypes() {
    try {
        const { data, status } = await apiFetch<Array<{ id: number; name: string }> | { space_types?: Array<{ id: number; name: string }> }>(`/api/choosable-space-types?lang=${locale.value}`, {
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

function applyAccessibilityFlagsFromMask(mask: number | string | null) {
  if (mask == null) {
    selectedAccessibilityFlags.value = []
    return
  }

  const bigMask = BigInt(mask)
  const selection: bigint[] = []

  uranusI18nAccessibilityFlags.forEach((topic) => {
    topic.flags.forEach((flag) => {
      const bit = 1n << BigInt(flag.id)
      if ((bigMask & bit) !== 0n) {
        selection.push(bit)
      }
    })
  })

  selectedAccessibilityFlags.value = selection
}

function computeAccessibilityFlagsMask(): bigint {
  return selectedAccessibilityFlags.value.reduce(
      (mask, bit) => mask | bit,
      0n
  )
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
  spaceId.value = values?.id ?? null
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
      ...(spaceId.value != null ? { spaceId: spaceId.value } : {}),
      name: trimmedName,
      totalCapacity: totalCapacity.value,
      seatingCapacity: seatingCapacity.value,
      buildingLevel: buildingLevel.value,
      spaceTypeId: spaceTypeId.value,
      websiteUrl: normalizedWebsite.length ? normalizedWebsite : null,
      description: trimmedDescription.length ? trimmedDescription : null,
      accessibilitySummary: trimmedAccessibilitySummary.length ? trimmedAccessibilitySummary : null,
      accessibilityFlags: selectedAccessibilityFlags.value.length
        ? accessibilityMask.toString()
        : null,
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

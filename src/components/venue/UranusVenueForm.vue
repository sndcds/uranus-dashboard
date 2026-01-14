<template>
    <form class="uranus-form" @submit.prevent="handleSubmit" novalidate>
        <section class="uranus-card">
            <UranusTextInput id="venue_name" size="big" required v-model="venueName" :label="t('venue_name')"
                :error="fieldErrors.venueName!" />

            <UranusFormRow>
                <UranusTextInput id="street" required :flex=2 v-model="street" :label="t('street')"
                    :error="fieldErrors.street!" />
                <UranusTextInput id="house_number" required v-model="houseNumber" :label="t('house_number')"
                    :error="fieldErrors.houseNumber!" />
            </UranusFormRow>

            <UranusFormRow>
                <UranusTextInput id="postal_code" required v-model="postalCode" :label="t('postal_code')"
                    :error="fieldErrors.postalCode!" />
                <UranusTextInput id="city" required :flex=2 v-model="city" :label="t('city')"
                    :error="fieldErrors.city!" />
            </UranusFormRow>

            <UranusFormRow>
                <UranusRegionSelect v-if="showRegionSelector" v-model:country-code="countryCode"
                    v-model:state-code="stateCode" />
            </UranusFormRow>
        </section>

        <section class="uranus-card">
            <UranusFormRow>
                <UranusTextInput id="email" v-model="email" :label="t('email')" :error="fieldErrors.email!" />

                <UranusTextInput id="phone" v-model="phone" :label="t('phone')" :error="fieldErrors.phone!" />
            </UranusFormRow>

            <UranusTextInput id="website" v-model="website" :label="t('website')" :error="fieldErrors.website!" />

            <UranusFieldLabel v-if="showDescription" :id="descriptionLabelId" :label="t('description')"
                :error="fieldErrors.description">
                <UranusMarkdownEditor v-model="description" class="venue-description-editor"
                    :aria-labelledby="descriptionLabelId" :placeholder="descriptionPlaceholder" />
            </UranusFieldLabel>

            <UranusFormRow>
                <UranusDateInput id="opened_at" v-model="openedAt" :label="t('opened_at')"
                    :error="fieldErrors.openedAt" />

                <UranusDateInput id="closed_at" v-model="closedAt" :label="t('closed_at')"
                    :error="fieldErrors.closedAt" />

            </UranusFormRow>
        </section>

        <section class="uranus-card">
            <div>
              <UranusMapLocationPicker
                  v-model="location"
                  :zoom="12"
                  :selectable="true"
              />
              <UranusValueInfo :label="t('geo_location')" :value="locationSummary" />
            </div>
        </section>

        <section class="uranus-form-action-footer">
            <button class="uranus-ok-button" type="submit" :disabled="loading">{{ submitLabel }}</button>
        </section>

    </form>

    <transition name="fade">
        <p v-if="displayError" class="feedback feedback--error">{{ displayError }}</p>
    </transition>
    <transition name="fade">
        <p v-if="successMessage" class="feedback feedback--success">{{ successMessage }}</p>
    </transition>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, toRef } from 'vue'
import { useI18n } from 'vue-i18n'

import UranusMarkdownEditor from '@/components/uranus/UranusMarkdownEditor.vue'
import UranusRegionSelect from '@/components/selects/UranusRegionSelect.vue'
import UranusValueInfo from "@/components/ui/UranusValueInfo.vue"
import UranusTextInput from "@/components/ui/UranusTextInput.vue"
import UranusFormRow from "@/components/ui/UranusFormRow.vue"
import UranusFieldLabel from "@/components/ui/UranusFieldLabel.vue"
import UranusDateInput from "@/components/ui/UranusDateInput.vue"
import LibreMap from '@/components/LibreMap.vue'
import UranusMapLocationPicker from "@/components/UranusMapLocationPicker.vue";

interface LatLngLiteral {
    lat: number
    lng: number
}

export interface VenueFormInitialValues {
    venueName?: string
    street?: string
    houseNumber?: string
    postalCode?: string
    city?: string
    email?: string
    website?: string
    phone?: string | null
    description?: string | null
    openedAt?: string | null
    closedAt?: string | null
    countryCode?: string | null
    stateCode?: string | null
    location?: LatLngLiteral | null
}

export interface VenueFormSubmitPayload {
    name: string
    street: string
    houseNumber: string
    postalCode: string
    city: string
    contactEmail: string | null
    websiteUrl: string | null
    contactPhone: string | null
    description: string | null
    openedAt: string | null
    closedAt: string | null
    countryCode: string | null
    stateCode: string | null
    location: LatLngLiteral | null
}

const props = withDefaults(defineProps<{
    submitLabel: string
    loading?: boolean
    errorMessage?: string | null
    successMessage?: string | null
    initialValues?: VenueFormInitialValues
    showDescription?: boolean
    showDateFields?: boolean
    showRegionSelector?: boolean
}>(), {
    showDescription: true,
    showDateFields: true,
    showRegionSelector: true,
})

const emit = defineEmits<{
    (e: 'submit', payload: VenueFormSubmitPayload): void
    (e: 'clear-error'): void
}>()

const { t } = useI18n()
const showDescription = toRef(props, 'showDescription')
const showDateFields = toRef(props, 'showDateFields')
const showRegionSelector = toRef(props, 'showRegionSelector')

const venueName = ref('')
const street = ref('')
const houseNumber = ref('')
const postalCode = ref('')
const city = ref('')
const email = ref('')
const website = ref('')
const phone = ref('')
const description = ref('')
const countryCode = ref('')
const stateCode = ref('')
const openedAt = ref('')
const closedAt = ref('')
const location = ref<LatLngLiteral | null>(null)

const fieldErrors = reactive({
  venueName: null as string | null,
  street: null as string | null,
  houseNumber: null as string | null,
  postalCode: null as string | null,
  city: null as string | null,
  email: null as string | null,
  phone: null as string | null,
  website: null as string | null,
  description: null as string | null,
  openedAt: null as string | null,
  closedAt: null as string | null,
})

const localError = ref<string | null>(null)

const mapHint = computed(() => t('venue_map_hint'))
const descriptionPlaceholder = computed(() => t('venue_description_placeholder'))
const descriptionLabelId = 'venue-description-label'
const requiredFieldMessage = computed(() => t('required_field'))
const missingRequiredMessage = computed(() => t('organization_form_missing_required'))
const invalidEmailMessage = computed(() => t('organization_form_invalid_email'))
const invalidWebsiteMessage = computed(() => t('organization_form_invalid_website'))

const displayError = computed(() => localError.value ?? props.errorMessage ?? null)
const invalidDatesMessage = computed(() => t('venue_invalid_dates'))

const locationSummary = computed(() => {
    if (!location.value) {
        return t('venue_map_no_selection')
    }
    const { lat, lng } = location.value
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
})

const applyInitialValues = (values?: VenueFormInitialValues) => {
    const normalizeDateInput = (value?: string | null) => {
        if (!value) {
            return ''
        }
        const trimmed = value.trim()
        if (!trimmed.length) {
            return ''
        }
        // Accept already formatted dates
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
            return trimmed
        }
        // Attempt to parse and reformat (e.g. ISO string -> YYYY-MM-DD)
        const parsed = new Date(trimmed)
        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString().slice(0, 10)
        }
        return ''
    }

    venueName.value = values?.venueName ?? ''
    street.value = values?.street ?? ''
    houseNumber.value = values?.houseNumber ?? ''
    postalCode.value = values?.postalCode ?? ''
    city.value = values?.city ?? ''
    email.value = values?.email ?? ''
    website.value = values?.website ?? ''
    phone.value = values?.phone ?? ''
    description.value = values?.description ?? ''
    countryCode.value = values?.countryCode?.trim() ?? ''
    stateCode.value = values?.stateCode?.trim() ?? ''
    openedAt.value = normalizeDateInput(values?.openedAt ?? '')
    closedAt.value = normalizeDateInput(values?.closedAt ?? '')
    location.value = values?.location ?? null

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
            fieldErrors.venueName,
            fieldErrors.street,
            fieldErrors.houseNumber,
            fieldErrors.postalCode,
            fieldErrors.city,
        ].some((value) => Boolean(value))
        if (!stillMissing) {
            localError.value = null
        }
    }
    if (props.errorMessage) {
        emit('clear-error')
    }
}

const isValidEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(value)
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

const handleSubmit = () => {
    if (props.loading) {
        return
    }

    localError.value = null

    const trimmedName = venueName.value.trim()
    const trimmedStreet = street.value.trim()
    const trimmedHouseNumber = houseNumber.value.trim()
    const trimmedPostalCode = postalCode.value.trim()
    const trimmedCity = city.value.trim()
    const trimmedEmail = email.value.trim()
    const trimmedWebsite = website.value.trim()
    const trimmedPhone = phone.value.trim()
    const trimmedDescription = showDescription.value ? description.value.trim() : ''
    const trimmedOpenedAt = showDateFields.value ? openedAt.value.trim() : ''
    const trimmedClosedAt = showDateFields.value ? closedAt.value.trim() : ''
    const trimmedCountryCode = showRegionSelector.value ? countryCode.value.trim() : ''
    const trimmedStateCode = showRegionSelector.value ? stateCode.value.trim() : ''

    fieldErrors.venueName = trimmedName ? null : requiredFieldMessage.value
    fieldErrors.street = trimmedStreet ? null : requiredFieldMessage.value
    fieldErrors.houseNumber = trimmedHouseNumber ? null : requiredFieldMessage.value
    fieldErrors.postalCode = trimmedPostalCode ? null : requiredFieldMessage.value
    fieldErrors.city = trimmedCity ? null : requiredFieldMessage.value
    fieldErrors.email = trimmedEmail ? (isValidEmail(trimmedEmail) ? null : invalidEmailMessage.value) : null
    fieldErrors.website = trimmedWebsite ? (isValidUrl(trimmedWebsite) ? null : invalidWebsiteMessage.value) : null

    if (trimmedOpenedAt && trimmedClosedAt && new Date(trimmedClosedAt) < new Date(trimmedOpenedAt)) {
        localError.value = invalidDatesMessage.value
        fieldErrors.openedAt = localError.value
        fieldErrors.closedAt = localError.value
        return
    } else {
        fieldErrors.openedAt = null
        fieldErrors.closedAt = null
    }

    const hasMissingRequired = [
        fieldErrors.venueName,
        fieldErrors.street,
        fieldErrors.houseNumber,
        fieldErrors.postalCode,
        fieldErrors.city,
    ].some((value) => Boolean(value))
    const emailInvalid = Boolean(fieldErrors.email)
    const websiteInvalid = Boolean(fieldErrors.website)

    if (hasMissingRequired) {
        localError.value = missingRequiredMessage.value
        return
    }

    if (emailInvalid) {
        localError.value = fieldErrors.email
        return
    }

    if (websiteInvalid) {
        localError.value = fieldErrors.website
        return
    }

    emit('submit', {
        name: trimmedName,
        street: trimmedStreet,
        houseNumber: trimmedHouseNumber,
        postalCode: trimmedPostalCode,
        city: trimmedCity,
        contactEmail: trimmedEmail.length ? trimmedEmail : null,
        websiteUrl: trimmedWebsite.length ? trimmedWebsite : null,
        contactPhone: trimmedPhone.length ? trimmedPhone : null,
        description: showDescription.value && trimmedDescription.length ? trimmedDescription : null,
        openedAt: showDateFields.value && trimmedOpenedAt.length ? trimmedOpenedAt : null,
        closedAt: showDateFields.value && trimmedClosedAt.length ? trimmedClosedAt : null,
        countryCode: showRegionSelector.value && trimmedCountryCode.length ? trimmedCountryCode : null,
        stateCode: showRegionSelector.value && trimmedStateCode.length ? trimmedStateCode : null,
        location: location.value ? { ...location.value } : null,
    })
}

watch(venueName, (value) => {
    if (fieldErrors.venueName && value.trim()) {
        fieldErrors.venueName = null
        clearMissingRequiredMessage()
    }
})

watch(street, (value) => {
    if (fieldErrors.street && value.trim()) {
        fieldErrors.street = null
        clearMissingRequiredMessage()
    }
})

watch(houseNumber, (value) => {
    if (fieldErrors.houseNumber && value.trim()) {
        fieldErrors.houseNumber = null
        clearMissingRequiredMessage()
    }
})

watch(postalCode, (value) => {
    if (fieldErrors.postalCode && value.trim()) {
        fieldErrors.postalCode = null
        clearMissingRequiredMessage()
    }
})

watch(city, (value) => {
    if (fieldErrors.city && value.trim()) {
        fieldErrors.city = null
        clearMissingRequiredMessage()
    }
})

watch(email, (value) => {
    const currentMessage = fieldErrors.email
    if (!currentMessage) {
        return
    }
    const trimmed = value.trim()
    if (!trimmed || isValidEmail(trimmed)) {
        if (localError.value === currentMessage) {
            localError.value = null
        }
        fieldErrors.email = null
        if (props.errorMessage) {
            emit('clear-error')
        }
    }
})

watch(website, (value) => {
    const currentMessage = fieldErrors.website
    if (!currentMessage) {
        return
    }
    const trimmed = value.trim()
    if (!trimmed || isValidUrl(trimmed)) {
        if (localError.value === currentMessage) {
            localError.value = null
        }
        fieldErrors.website = null
        if (props.errorMessage) {
            emit('clear-error')
        }
    }
})

watch(openedAt, (value) => {
    if (!showDateFields.value) {
        return
    }
    if (fieldErrors.openedAt) {
        fieldErrors.openedAt = null
        if (localError.value === invalidDatesMessage.value) {
            localError.value = null
        }
        if (props.errorMessage) {
            emit('clear-error')
        }
    }
})

watch(closedAt, (value) => {
    if (!showDateFields.value) {
        return
    }
    if (fieldErrors.closedAt) {
        fieldErrors.closedAt = null
        if (localError.value === invalidDatesMessage.value) {
            localError.value = null
        }
        if (props.errorMessage) {
            emit('clear-error')
        }
    }
})

const setLocation = (coords: LatLngLiteral | null) => {
    location.value = coords
}

defineExpose({
    setLocation,
    setValues: applyInitialValues,
})
</script>

<style scoped lang="scss">
.venue-map-panel {
    max-width: 100%;
    height: 300px;
}
</style>

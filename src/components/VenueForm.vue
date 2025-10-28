<template>
    <div class="venue-form-wrapper">
        <div class="venue-layout">
            <form class="venue-form" @submit.prevent="handleSubmit" novalidate>
                <div class="form-grid">
                    <div class="form-group form-group--full">
                        <label for="venue_name">
                            {{ t('venue_name') }}
                            <span class="required" aria-hidden="true">*</span>
                            <span class="sr-only">{{ requiredA11yLabel }}</span>
                        </label>
                        <input v-model="venueName" id="venue_name" type="text" />
                        <p v-if="fieldErrors.venueName" class="field-error">{{ fieldErrors.venueName }}</p>
                    </div>
                    <div class="form-group">
                        <label for="street">
                            {{ t('street') }}
                            <span class="required" aria-hidden="true">*</span>
                            <span class="sr-only">{{ requiredA11yLabel }}</span>
                        </label>
                        <input v-model="street" id="street" type="text" />
                        <p v-if="fieldErrors.street" class="field-error">{{ fieldErrors.street }}</p>
                    </div>
                    <div class="form-group">
                        <label for="house_number">
                            {{ t('house_number') }}
                            <span class="required" aria-hidden="true">*</span>
                            <span class="sr-only">{{ requiredA11yLabel }}</span>
                        </label>
                        <input v-model="houseNumber" id="house_number" type="text" />
                        <p v-if="fieldErrors.houseNumber" class="field-error">{{ fieldErrors.houseNumber }}</p>
                    </div>
                    <div class="form-group">
                        <label for="postal_code">
                            {{ t('postal_code') }}
                            <span class="required" aria-hidden="true">*</span>
                            <span class="sr-only">{{ requiredA11yLabel }}</span>
                        </label>
                        <input v-model="postalCode" id="postal_code" type="text" />
                        <p v-if="fieldErrors.postalCode" class="field-error">{{ fieldErrors.postalCode }}</p>
                    </div>
                    <div class="form-group">
                        <label for="city">
                            {{ t('city') }}
                            <span class="required" aria-hidden="true">*</span>
                            <span class="sr-only">{{ requiredA11yLabel }}</span>
                        </label>
                        <input v-model="city" id="city" type="text" />
                        <p v-if="fieldErrors.city" class="field-error">{{ fieldErrors.city }}</p>
                    </div>
                    <div class="form-group">
                        <label for="email">{{ t('email') }}</label>
                        <input v-model="email" id="email" type="email" />
                        <p v-if="fieldErrors.email" class="field-error">{{ fieldErrors.email }}</p>
                    </div>
                    <div class="form-group">
                        <label for="phone">{{ t('phone') }}</label>
                        <input v-model="phone" id="phone" type="tel" />
                    </div>
                    <div class="form-group">
                        <label for="website">{{ t('website') }}</label>
                        <input v-model="website" id="website" type="url" />
                        <p v-if="fieldErrors.website" class="field-error">{{ fieldErrors.website }}</p>
                    </div>
                </div>

                <div class="form-actions">
                    <button type="submit" :disabled="loading">{{ submitLabel }}</button>
                </div>
            </form>

            <aside class="venue-map-panel">
                <LocationMapComponent v-model="location" :zoom="13" :selectable="true">
                    <template #footer>
                        {{ mapHint }}
                    </template>
                </LocationMapComponent>
                <div class="location-meta">
                    <span class="meta-label">{{ t('location') }}</span>
                    <span class="meta-value">{{ locationSummary }}</span>
                </div>
            </aside>
        </div>

        <transition name="fade">
            <p v-if="displayError" class="feedback feedback--error">{{ displayError }}</p>
        </transition>
        <transition name="fade">
            <p v-if="successMessage" class="feedback feedback--success">{{ successMessage }}</p>
        </transition>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import LocationMapComponent from '@/components/LocationMapComponent.vue'

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
    phone?: string
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
    location: LatLngLiteral | null
}

const props = defineProps<{
    submitLabel: string
    loading?: boolean
    errorMessage?: string | null
    successMessage?: string | null
    initialValues?: VenueFormInitialValues
}>()

const emit = defineEmits<{
    (e: 'submit', payload: VenueFormSubmitPayload): void
    (e: 'clear-error'): void
}>()

const { t, te } = useI18n()

const venueName = ref('')
const street = ref('')
const houseNumber = ref('')
const postalCode = ref('')
const city = ref('')
const email = ref('')
const website = ref('')
const phone = ref('')
const location = ref<LatLngLiteral | null>(null)

const fieldErrors = reactive({
    venueName: null as string | null,
    street: null as string | null,
    houseNumber: null as string | null,
    postalCode: null as string | null,
    city: null as string | null,
    email: null as string | null,
    website: null as string | null,
})

const localError = ref<string | null>(null)

const mapHint = computed(() => (te('venue_map_hint') ? t('venue_map_hint') : 'Click the map to drop a pin where the venue is located.'))
const requiredA11yLabel = computed(() => (te('form_required_indicator') ? t('form_required_indicator') : 'Required field'))
const requiredFieldMessage = computed(() => (te('event_error_required') ? t('event_error_required') : 'This field is required'))
const missingRequiredMessage = computed(() => (te('organizer_form_missing_required') ? t('organizer_form_missing_required') : 'Please complete all required fields.'))
const invalidEmailMessage = computed(() => (te('organizer_form_invalid_email') ? t('organizer_form_invalid_email') : 'Please provide a valid email address.'))
const invalidWebsiteMessage = computed(() => (te('organizer_form_invalid_website') ? t('organizer_form_invalid_website') : 'Please provide a valid website URL (including http/https).'))

const displayError = computed(() => localError.value ?? props.errorMessage ?? null)

const locationSummary = computed(() => {
    if (!location.value) {
        return te('venue_map_no_selection') ? t('venue_map_no_selection') : 'No location selected yet'
    }
    const { lat, lng } = location.value
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
})

const applyInitialValues = (values?: VenueFormInitialValues) => {
    venueName.value = values?.venueName ?? ''
    street.value = values?.street ?? ''
    houseNumber.value = values?.houseNumber ?? ''
    postalCode.value = values?.postalCode ?? ''
    city.value = values?.city ?? ''
    email.value = values?.email ?? ''
    website.value = values?.website ?? ''
    phone.value = values?.phone ?? ''
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

    fieldErrors.venueName = trimmedName ? null : requiredFieldMessage.value
    fieldErrors.street = trimmedStreet ? null : requiredFieldMessage.value
    fieldErrors.houseNumber = trimmedHouseNumber ? null : requiredFieldMessage.value
    fieldErrors.postalCode = trimmedPostalCode ? null : requiredFieldMessage.value
    fieldErrors.city = trimmedCity ? null : requiredFieldMessage.value
    fieldErrors.email = trimmedEmail ? (isValidEmail(trimmedEmail) ? null : invalidEmailMessage.value) : null
    fieldErrors.website = trimmedWebsite ? (isValidUrl(trimmedWebsite) ? null : invalidWebsiteMessage.value) : null

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

const setLocation = (coords: LatLngLiteral | null) => {
    location.value = coords
}

defineExpose({
    setLocation,
    setValues: applyInitialValues,
})
</script>

<style scoped lang="scss">
.venue-form-wrapper {
    display: flex;
    flex-direction: column;
    gap: clamp(1.5rem, 3vw, 2rem);
}

.venue-layout {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2.25rem);
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
}

.venue-form {
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
    grid-column: 1 / -1;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
}

button {
    @include form-primary-button($padding-y: 0.85rem, $padding-x: 2rem);
}

.required {
    color: #dc2626;
    font-weight: 700;
}

.field-error {
    margin: 0.35rem 0 0;
    font-size: 0.85rem;
    color: #b91c1c;
    font-weight: 600;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

.venue-map-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.location-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-size: 0.9rem;
    background: var(--input-bg);
    border-radius: 14px;
    padding: 0.75rem 1rem;
}

.meta-label {
    font-weight: 600;
    color: var(--color-text);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-size: 0.78rem;
}

.meta-value {
    font-variant-numeric: tabular-nums;
    color: var(--muted-text);
}

.feedback {
    @include form-feedback();
}

.feedback--error {
    @include form-feedback-error();
}

.feedback--success {
    @include form-feedback-success();
}

@media (max-width: 768px) {
    .venue-layout {
        grid-template-columns: minmax(0, 1fr);
    }

    .form-actions {
        justify-content: stretch;
    }

    button {
        width: 100%;
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

<template>
    <div class="venue-page">
        <section class="venue-hero">
            <h1>{{ t('create_venue') }}</h1>
            <p>{{ venueDescription }}</p>
        </section>

        <section class="venue-card">
            <div class="venue-layout">
                <form class="venue-form" @submit.prevent="submitForm" novalidate>
                    <div class="form-grid">
                        <div class="form-group">
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
                            <label for="website">{{ t('website') }}</label>
                            <input v-model="website" id="website" type="url" />
                            <p v-if="fieldErrors.website" class="field-error">{{ fieldErrors.website }}</p>
                        </div>
                        <div class="form-group">
                            <label for="phone">{{ t('phone') }}</label>
                            <input v-model="phone" id="phone" type="tel" />
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" :disabled="isSubmitting">{{ t('create_venue') }}</button>
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
                <p v-if="error" class="feedback feedback--error">{{ error }}</p>
            </transition>
            <transition name="fade">
                <p v-if="success" class="feedback feedback--success">{{ success }}</p>
            </transition>
        </section>
    </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch, fetchCoordinatesForAddress } from '@/api'

import LocationMapComponent from '@/components/LocationMapComponent.vue'

interface LatLngLiteral {
    lat: number
    lng: number
}

const { t, te } = useI18n()
const route = useRoute()
const organizerId = Number(route.params.id)

const venueName = ref('')
const street = ref('')
const houseNumber = ref('')
const postalCode = ref('')
const city = ref('')
const email = ref('')
const website = ref('')
const phone = ref('')
const location = ref<LatLngLiteral | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)
const fieldErrors = reactive({
    venueName: null as string | null,
    street: null as string | null,
    houseNumber: null as string | null,
    postalCode: null as string | null,
    city: null as string | null,
    email: null as string | null,
    website: null as string | null,
})

const venueDescription = computed(() => (te('venue_create_description') ? t('venue_create_description') : 'Add the essential information for your venue profile.'))
const mapHint = computed(() => (te('venue_map_hint') ? t('venue_map_hint') : 'Click the map to drop a pin where the venue is located.'))
const requiredA11yLabel = computed(() => (te('form_required_indicator') ? t('form_required_indicator') : 'Required field'))
const requiredFieldMessage = computed(() => (te('event_error_required') ? t('event_error_required') : 'This field is required'))
const missingRequiredMessage = computed(() => (te('organizer_form_missing_required') ? t('organizer_form_missing_required') : 'Please complete all required fields.'))
const invalidEmailMessage = computed(() => (te('organizer_form_invalid_email') ? t('organizer_form_invalid_email') : 'Please provide a valid email address.'))
const invalidWebsiteMessage = computed(() => (te('organizer_form_invalid_website') ? t('organizer_form_invalid_website') : 'Please provide a valid website URL (including http/https).'))
const locationSummary = computed(() => {
    if (!location.value) {
        return te('venue_map_no_selection') ? t('venue_map_no_selection') : 'No location selected yet'
    }
    const { lat, lng } = location.value
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
})

const toNumberOrNull = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }

    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (!trimmed.length) {
            return null
        }

        const parsed = Number(trimmed)
        return Number.isFinite(parsed) ? parsed : null
    }

    return null
}

const isValidEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(value)
}

const isValidUrl = (value: string) => {
    try {
        const parsed = new URL(value)
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch (error) {
        return false
    }
}

const submitForm = async () => {
    if (isSubmitting.value) {
        return
    }

    error.value = null
    success.value = null

    Object.keys(fieldErrors).forEach((key) => {
        fieldErrors[key as keyof typeof fieldErrors] = null
    })

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
        error.value = missingRequiredMessage.value
        return
    }

    if (emailInvalid) {
        error.value = fieldErrors.email
        return
    }

    if (websiteInvalid) {
        error.value = fieldErrors.website
        return
    }

    isSubmitting.value = true

    try {
        const payload: Record<string, unknown> = {
            name: trimmedName,
            street: trimmedStreet,
            house_number: trimmedHouseNumber,
            postal_code: trimmedPostalCode,
            city: trimmedCity,
            contact_email: trimmedEmail.length ? trimmedEmail : null,
            website_url: trimmedWebsite.length ? trimmedWebsite : null,
            contact_phone: trimmedPhone.length ? trimmedPhone : null,
            organizer_id: organizerId,
        }

        let coords: LatLngLiteral | null = location.value

        if (!coords) {
            const query = [trimmedStreet, trimmedHouseNumber, trimmedPostalCode, trimmedCity]
                .filter((value) => value.length)
                .join(' ')

            const nominatimResult = query.length ? await fetchCoordinatesForAddress(query) : null
            if (nominatimResult) {
                const latNumber = toNumberOrNull(nominatimResult.lat)
                const lonNumber = toNumberOrNull(nominatimResult.lon)
                if (latNumber != null && lonNumber != null) {
                    coords = { lat: latNumber, lng: lonNumber }
                    location.value = coords
                }
            }
        }

        if (coords) {
            payload.latitude = coords.lat
            payload.longitude = coords.lng
        }

        const { status } = await apiFetch('/api/admin/venue/create', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
        if (status >= 200 && status < 300) {
            success.value = t('venue_created')
        } else {
            throw new Error('Unexpected status code')
        }
    } catch (err: unknown) {
        success.value = null
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || t('failed_to_create_venue')
        } else {
            error.value = t('unknown_error')
        }
    } finally {
        isSubmitting.value = false
    }
}

const clearMissingRequiredMessage = () => {
    if (error.value === missingRequiredMessage.value) {
        const stillMissing = [
            fieldErrors.venueName,
            fieldErrors.street,
            fieldErrors.houseNumber,
            fieldErrors.postalCode,
            fieldErrors.city,
        ].some((value) => Boolean(value))
        if (!stillMissing) {
            error.value = null
        }
    }
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
        if (error.value === currentMessage) {
            error.value = null
        }
        fieldErrors.email = null
    }
})

watch(website, (value) => {
    const currentMessage = fieldErrors.website
    if (!currentMessage) {
        return
    }
    const trimmed = value.trim()
    if (!trimmed || isValidUrl(trimmed)) {
        if (error.value === currentMessage) {
            error.value = null
        }
        fieldErrors.website = null
    }
})
</script>

<style scoped lang="scss">
.venue-page {
    @include form-page();
}

.venue-hero {
    @include form-hero(960px);
}

.venue-card {
    @include form-card(960px, clamp(1.75rem, 4vw, 2.75rem), clamp(1.25rem, 3vw, 1.75rem));
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

    &--error {
        @include form-feedback-error();
    }

    &--success {
        @include form-feedback-success();
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

@media (max-width: 900px) {
    .venue-layout {
        grid-template-columns: 1fr;
    }

    .form-actions {
        justify-content: center;
    }
}

@media (max-width: 540px) {
    .venue-card {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }
}
</style>

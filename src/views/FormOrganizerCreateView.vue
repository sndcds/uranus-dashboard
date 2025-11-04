<template>
    <div class="organizer-page">
        <section class="organizer-hero">
            <h1>{{ t('create_organizer') }}</h1>
            <p>{{ organizerDescription }}</p>
        </section>

        <section class="uranus-card">
            <div class="organizer-layout">
                <form class="organizer-form" @submit.prevent="submitForm" novalidate>
                    <div class="form-grid">
                        <div class="form-group form-group--full">
                            <label for="organizer_name">
                                {{ t('organizer_name') }}
                                <span class="required" aria-hidden="true">*</span>
                                <span class="sr-only">{{ requiredA11yLabel }}</span>
                            </label>
                            <input v-model="organizerName" id="organizer_name" type="text" />
                            <p v-if="fieldErrors.organizerName" class="field-error">{{ fieldErrors.organizerName }}</p>
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
                        <button type="submit" :disabled="isSubmitting">{{ t('create_organizer') }}</button>
                    </div>
                </form>

                <aside class="organizer-map-panel">
                    <LocationMapComponent v-model="location" :zoom="13" :selectable="true">
                        <template #footer>
                            {{ mapHint }}
                        </template>
                    </LocationMapComponent>
                  <ValueInfoComponent
                      :label="t('geo_location')"
                      :value="locationSummary" />
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
import { apiFetch, fetchCoordinatesForAddress } from '@/api'

import LocationMapComponent from '@/components/LocationMapComponent.vue'
import ValueInfoComponent from "@/components/ValueInfoComponent.vue";
import router from '@/router'

interface LatLngLiteral {
    lat: number
    lng: number
}

const { t, te } = useI18n()

const organizerName = ref('')
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
    organizerName: null as string | null,
    street: null as string | null,
    houseNumber: null as string | null,
    postalCode: null as string | null,
    city: null as string | null,
    email: null as string | null,
    website: null as string | null,
})

const organizerDescription = computed(() => (te('organizer_create_description') ? t('organizer_create_description') : 'Add the essential information for your organizer profile.'))
const mapHint = computed(() => (te('organizer_map_hint') ? t('organizer_map_hint') : 'Click the map to drop a pin where the organizer is located.'))
const requiredA11yLabel = computed(() => (te('form_required_indicator') ? t('form_required_indicator') : 'Required field'))
const requiredFieldMessage = computed(() => (te('event_error_required') ? t('event_error_required') : 'This field is required'))
const missingRequiredMessage = computed(() => (te('organizer_form_missing_required') ? t('organizer_form_missing_required') : 'Please complete all required fields.'))
const invalidEmailMessage = computed(() => (te('organizer_form_invalid_email') ? t('organizer_form_invalid_email') : 'Please provide a valid email address.'))
const invalidWebsiteMessage = computed(() => (te('organizer_form_invalid_website') ? t('organizer_form_invalid_website') : 'Please provide a valid website URL.'))
const locationSummary = computed(() => {
    if (!location.value) {
        return te('organizer_map_no_selection') ? t('organizer_map_no_selection') : 'No location selected yet'
    }
    const { lat, lng } = location.value
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
})

const isValidEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(value)
}

const isValidUrl = (value: string) => {
    try {
        const prefixed = value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`
        const parsed = new URL(prefixed)
        return Boolean(parsed.hostname)
    } catch (err) {
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

    const trimmedName = organizerName.value.trim()
    const trimmedStreet = street.value.trim()
    const trimmedHouseNumber = houseNumber.value.trim()
    const trimmedPostalCode = postalCode.value.trim()
    const trimmedCity = city.value.trim()
    const trimmedEmail = email.value.trim()
    const trimmedPhone = phone.value.trim()
    const trimmedWebsite = website.value.trim()

    fieldErrors.organizerName = trimmedName ? null : requiredFieldMessage.value
    fieldErrors.street = trimmedStreet ? null : requiredFieldMessage.value
    fieldErrors.houseNumber = trimmedHouseNumber ? null : requiredFieldMessage.value
    fieldErrors.postalCode = trimmedPostalCode ? null : requiredFieldMessage.value
    fieldErrors.city = trimmedCity ? null : requiredFieldMessage.value

    fieldErrors.email = trimmedEmail
        ? (isValidEmail(trimmedEmail) ? null : invalidEmailMessage.value)
        : null

    fieldErrors.website = trimmedWebsite
        ? (isValidUrl(trimmedWebsite) ? null : invalidWebsiteMessage.value)
        : null

    const hasMissingRequired = [fieldErrors.organizerName, fieldErrors.street, fieldErrors.houseNumber, fieldErrors.postalCode, fieldErrors.city].some((value) => Boolean(value))
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
        }

        if (location.value) {
            payload.latitude = location.value.lat
            payload.longitude = location.value.lng
        } else {
            const query = [trimmedStreet, trimmedHouseNumber, trimmedPostalCode, trimmedCity].filter(Boolean).join(' ')
            const nominatimResult = query ? await fetchCoordinatesForAddress(query) : null
            if (nominatimResult) {
                const latNumber = Number(nominatimResult.lat)
                const lonNumber = Number(nominatimResult.lon)
                if (!Number.isNaN(latNumber) && !Number.isNaN(lonNumber)) {
                    payload.latitude = latNumber
                    payload.longitude = lonNumber
                    location.value = { lat: latNumber, lng: lonNumber }
                }
            }
        }

        const { status } = await apiFetch('/api/admin/organizer/create', {
            method: 'POST',
            body: JSON.stringify(payload),
        })
        if (status >= 200 && status < 300) {
            success.value = t('organizer_created')
            router.push('/admin/organizers')
        } else {
            throw new Error('Unexpected status code')
        }
    } catch (err: unknown) {
        success.value = null
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || t('failed_to_create_organizer')
        } else {
            error.value = t('unknown_error')
        }
    } finally {
        isSubmitting.value = false
    }
}

const clearMissingRequiredMessage = () => {
    if (error.value === missingRequiredMessage.value) {
        const stillHasRequiredError = [fieldErrors.organizerName, fieldErrors.street, fieldErrors.houseNumber, fieldErrors.postalCode, fieldErrors.city].some((value) => Boolean(value))
        if (!stillHasRequiredError) {
            error.value = null
        }
    }
}

watch(organizerName, (value) => {
    if (fieldErrors.organizerName && value.trim()) {
        fieldErrors.organizerName = null
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
.organizer-page {
    @include form-page();
}

.organizer-hero {
    @include form-hero(540px);
}

.organizer-card {
    @include form-card(1080px, clamp(1.75rem, 4vw, 2.75rem), clamp(1.25rem, 3vw, 1.75rem));
}

.organizer-layout {
    display: grid;
    gap: clamp(1.5rem, 3vw, 2.25rem);
    grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
}

.organizer-form {
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

.organizer-map-panel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 340px;
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
    .organizer-layout {
        grid-template-columns: 1fr;
    }

    .form-actions {
        justify-content: center;
    }
}

@media (max-width: 540px) {
    .organizer-card {
        padding: clamp(1.25rem, 6vw, 1.8rem);
    }
}
</style>

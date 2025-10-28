<template>
    <div class="organizer-page">
        <section class="organizer-hero">
            <h1>{{ t('edit_organizer') }}</h1>
            <p>{{ organizerDescription }}</p>
        </section>

        <section class="organizer-card">
            <div class="organizer-layout">
                <form class="organizer-form" @submit.prevent="submitForm" novalidate>
                    <div class="form-grid">
                        <div class="form-group">
                            <label for="organizer_name">
                                {{ t('organizer_name') }}
                                <span class="required" aria-hidden="true">*</span>
                                <span class="sr-only">{{ requiredA11yLabel }}</span>
                            </label>
                            <input v-model="organizerName" id="organizer_name" type="text" />
                            <p v-if="fieldErrors.organizerName" class="field-error">{{ fieldErrors.organizerName }}</p>
                        </div>
                        <div class="form-group">
                            <label for="address_addition">
                                {{ labelMessage('organizer_address_addition') }}
                            </label>
                            <input v-model="addressAddition" id="address_addition" type="text" />
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
                            <label for="country_code">
                                {{ labelMessage('organizer_country_code') }}
                            </label>
                            <select
                                v-model="countryCode"
                                id="country_code"
                                :disabled="countriesLoading"
                            >
                                <option value="">
                                    {{ countryPlaceholder }}
                                </option>
                                <option
                                    v-for="country in countries"
                                    :key="country.code"
                                    :value="country.code"
                                >
                                    {{ country.name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="state_code">
                                {{ labelMessage('organizer_state_code') }}
                            </label>
                            <input v-model="stateCode" id="state_code" type="text" />
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
                        <div class="form-group form-group--full">
                            <label :id="descriptionLabelId">
                                {{ labelMessage('organizer_description') }}
                            </label>
                            <MarkdownEditorComponent v-model="description" class="organizer-description-editor"
                                :aria-labelledby="descriptionLabelId" :placeholder="descriptionPlaceholder" />
                        </div>
                        <div class="form-group">
                            <label for="holding_organizer_id">
                                {{ labelMessage('organizer_holding_id') }}
                            </label>
                            <input v-model="holdingOrganizerId" id="holding_organizer_id" type="text"
                                inputmode="numeric" />
                        </div>
                        <div class="form-group">
                            <label for="legal_form_id">
                                {{ labelMessage('organizer_legal_form_id') }}
                            </label>
                            <select v-model="legalFormId" id="legal_form_id" :disabled="legalFormsLoading">
                                <option value="" disabled>
                                    {{ legalFormPlaceholder }}
                                </option>
                                <option v-for="form in legalForms" :key="form.id" :value="String(form.id)">
                                    {{ form.name }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group nonprofit-checkbox">
                            <input :id="nonprofitId" type="checkbox" v-model="nonprofit" />
                            <label :for="nonprofitId">{{ labelMessage('organizer_nonprofit') }}</label>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="submit" :disabled="isSubmitting">{{ submitButtonLabel }}</button>
                    </div>
                </form>

                <aside class="organizer-map-panel">
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
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch, fetchCoordinatesForAddress } from '@/api'

import LocationMapComponent from '@/components/LocationMapComponent.vue'
import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'

interface LatLngLiteral {
    lat: number
    lng: number
}

const { t, te, locale } = useI18n()
const route = useRoute()

const organizerName = ref('')
const addressAddition = ref('')
const street = ref('')
const houseNumber = ref('')
const postalCode = ref('')
const city = ref('')
const stateCode = ref('')
const countryCode = ref('')
const email = ref('')
const website = ref('')
const phone = ref('')
const description = ref('')
const holdingOrganizerId = ref('')
const legalFormId = ref('')
const nonprofit = ref(false)
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

const organizerDescription = computed(() => (te('organizer_edit_description') ? t('organizer_edit_description') : 'Review and update the organizer details.'))
const mapHint = computed(() => (te('organizer_map_hint') ? t('organizer_map_hint') : 'Click the map to drop a pin where the organizer is located.'))
const requiredA11yLabel = computed(() => (te('form_required_indicator') ? t('form_required_indicator') : 'Required field'))
const requiredFieldMessage = computed(() => (te('event_error_required') ? t('event_error_required') : 'This field is required'))
const missingRequiredMessage = computed(() => (te('organizer_form_missing_required') ? t('organizer_form_missing_required') : 'Please complete all required fields.'))
const invalidEmailMessage = computed(() => (te('organizer_form_invalid_email') ? t('organizer_form_invalid_email') : 'Please provide a valid email address.'))
const invalidWebsiteMessage = computed(() => (te('organizer_form_invalid_website') ? t('organizer_form_invalid_website') : 'Please provide a valid website URL.'))
const organizerLoadErrorMessage = computed(() => (te('organizer_load_error') ? t('organizer_load_error') : 'Failed to load organizer details.'))
const descriptionPlaceholder = computed(() => (te('organizer_description_placeholder') ? t('organizer_description_placeholder') : 'Describe the organizer, services, and mission (Markdown supported).'))
const legalFormPlaceholder = computed(() => (te('organizer_legal_form_placeholder') ? t('organizer_legal_form_placeholder') : 'Select legal form'))
const countryPlaceholder = computed(() => (te('organizer_country_placeholder') ? t('organizer_country_placeholder') : 'Select country'))
const locationSummary = computed(() => {
    if (!location.value) {
        return te('organizer_map_no_selection') ? t('organizer_map_no_selection') : 'No location selected yet'
    }
    const { lat, lng } = location.value
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
})

const labelMessage = (key: string) => t(key)
const descriptionLabelId = 'organizer-description-label'

interface OrganizerResponse {
    organizer_id?: number
    name?: string
    organizer_name?: string
    address_addition?: string | null
    street?: string | null
    house_number?: string | null
    postal_code?: string | null
    city?: string | null
    state_code?: string | null
    country_code?: string | null
    description?: string | null
    holding_organizer_id?: number | string | null
    legal_form_id?: number | string | null
    nonprofit?: boolean | null
    contact_email?: string | null
    website_url?: string | null
    contact_phone?: string | null
    latitude?: number | string | null
    longitude?: number | string | null
    lat?: number | string | null
    lon?: number | string | null
}

interface LegalFormResponse {
    legal_form_id: number | string
    legal_form_name?: string | null
}

const legalForms = ref<Array<{ id: number; name: string }>>([])
const legalFormsLoading = ref(false)
interface CountryResponse {
    country_code: string
    country_name?: string | null
}

const countries = ref<Array<{ code: string; name: string }>>([])
const countriesLoading = ref(false)
const ensureCountryOption = (code: string) => {
    const trimmed = code.trim()
    if (!trimmed.length) {
        return
    }
    if (!countries.value.some((country) => country.code === trimmed)) {
        countries.value.push({ code: trimmed, name: trimmed })
    }
}

const toOrganizerId = (value: unknown): number | null => {
    if (Array.isArray(value)) {
        const [first] = value
        return toOrganizerId(first)
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

const organizerId = computed(() => toOrganizerId(route.params.id))
const submitButtonLabel = computed(() => t('update_organizer'))
const isLoadingOrganizer = ref(false)

const loadLegalForms = async () => {
    if (legalFormsLoading.value) {
        return
    }

    legalFormsLoading.value = true
    try {
        const { data } = await apiFetch<LegalFormResponse[]>(`/api/choosable-legal-forms?lang=${locale.value}`)
        if (Array.isArray(data)) {
            legalForms.value = data
                .map((item) => {
                    const rawId = item.legal_form_id
                    const id = typeof rawId === 'number' ? rawId : Number(rawId)
                    if (!Number.isFinite(id)) {
                        return null
                    }
                    const rawLabel = item.legal_form_name ?? ''
                    const label = typeof rawLabel === 'string' ? rawLabel.trim() : ''
                    return { id, name: label.length ? label : String(id) }
                })
                .filter((value): value is { id: number; name: string } => Boolean(value))

            const currentValue = legalFormId.value.trim()
            if (currentValue.length) {
                const numeric = Number(currentValue)
                if (
                    Number.isFinite(numeric) &&
                    !legalForms.value.some((form) => form.id === numeric)
                ) {
                    legalForms.value.push({ id: numeric, name: String(currentValue) })
                }
            }
        } else {
            legalForms.value = []
        }
    } catch (err) {
        legalForms.value = []
        console.error('Failed to load legal forms', err)
    } finally {
        legalFormsLoading.value = false
    }
}

const loadCountries = async () => {
    if (countriesLoading.value) {
        return
    }

    countriesLoading.value = true
    try {
        const { data } = await apiFetch<CountryResponse[]>(`/api/choosable-countries?lang=${locale.value}`)
        if (Array.isArray(data)) {
            countries.value = data
                .map((item) => {
                    const code = typeof item.country_code === 'string' ? item.country_code.trim() : ''
                    if (!code.length) {
                        return null
                    }
                    const rawLabel = item.country_name ?? ''
                    const label = typeof rawLabel === 'string' ? rawLabel.trim() : ''
                    return { code, name: label.length ? label : code }
                })
                .filter((value): value is { code: string; name: string } => Boolean(value))

            ensureCountryOption(countryCode.value)
        } else {
            countries.value = []
        }
    } catch (err) {
        countries.value = []
        console.error('Failed to load countries', err)
    } finally {
        countriesLoading.value = false
    }
}
const toNumberOrNull = (value: string): number | null => {
    if (!value.trim().length) {
        return null
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const nonprofitId = 'organizer-nonprofit-checkbox'

const loadOrganizerById = async (id: number) => {
    if (isLoadingOrganizer.value) {
        return
    }

    error.value = null
    success.value = null
    Object.keys(fieldErrors).forEach((key) => {
        fieldErrors[key as keyof typeof fieldErrors] = null
    })
    isLoadingOrganizer.value = true

    try {
        const { data } = await apiFetch<OrganizerResponse>(`/api/admin/organizer/${id}`)
        if (!data) {
            throw new Error('Organizer not found')
        }

        const organizerNameValue = data.name ?? data.organizer_name ?? ''
        organizerName.value = typeof organizerNameValue === 'string' ? organizerNameValue : ''

        addressAddition.value = typeof data.address_addition === 'string' ? data.address_addition : ''
        street.value = typeof data.street === 'string' ? data.street : ''
        houseNumber.value = typeof data.house_number === 'string' ? data.house_number : ''
        postalCode.value = typeof data.postal_code === 'string' ? data.postal_code : ''
        city.value = typeof data.city === 'string' ? data.city : ''
        stateCode.value = typeof data.state_code === 'string' ? data.state_code : ''
        countryCode.value = typeof data.country_code === 'string' ? data.country_code.trim() : ''
        ensureCountryOption(countryCode.value)
        description.value = typeof data.description === 'string' ? data.description : ''

        if (typeof data.holding_organizer_id === 'number' || (typeof data.holding_organizer_id === 'string' && data.holding_organizer_id.trim().length)) {
            holdingOrganizerId.value = String(data.holding_organizer_id).trim()
        } else {
            holdingOrganizerId.value = ''
        }

        if (typeof data.legal_form_id === 'number' || (typeof data.legal_form_id === 'string' && data.legal_form_id.trim().length)) {
            legalFormId.value = String(data.legal_form_id).trim()
        } else {
            legalFormId.value = ''
        }

        nonprofit.value = Boolean(data.nonprofit)

        email.value = typeof data.contact_email === 'string' ? data.contact_email : ''
        website.value = typeof data.website_url === 'string' ? data.website_url : ''
        phone.value = typeof data.contact_phone === 'string' ? data.contact_phone : ''

        const rawLat = data.latitude ?? data.lat ?? null
        const rawLng = data.longitude ?? data.lon ?? null
        const latNumber = typeof rawLat === 'number' ? rawLat : typeof rawLat === 'string' ? Number(rawLat) : null
        const lngNumber = typeof rawLng === 'number' ? rawLng : typeof rawLng === 'string' ? Number(rawLng) : null

        if (latNumber != null && Number.isFinite(latNumber) && lngNumber != null && Number.isFinite(lngNumber)) {
            location.value = { lat: latNumber, lng: lngNumber }
        } else {
            location.value = null
        }
    } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || organizerLoadErrorMessage.value
        } else {
            error.value = organizerLoadErrorMessage.value
        }
    } finally {
        isLoadingOrganizer.value = false
    }
}

watch(
    organizerId,
    (id) => {
        if (id == null) {
            return
        }
        loadOrganizerById(id)
    },
    { immediate: true }
)

onMounted(() => {
    loadLegalForms()
    loadCountries()
})

const isValidEmail = (value: string) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(value)
}

const isValidUrl = (value: string) => {
    try {
        const prefixed = value.startsWith('http://') || value.startsWith('https://')
            ? value
            : `https://${value}`

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
    const trimmedAddressAddition = addressAddition.value.trim()
    const trimmedStreet = street.value.trim()
    const trimmedHouseNumber = houseNumber.value.trim()
    const trimmedPostalCode = postalCode.value.trim()
    const trimmedCity = city.value.trim()
    const trimmedStateCode = stateCode.value.trim()
    const trimmedCountryCode = countryCode.value.trim()
    const trimmedEmail = email.value.trim()
    const trimmedPhone = phone.value.trim()
    const trimmedWebsite = website.value.trim()
    const trimmedDescription = description.value.trim()
    const trimmedHoldingOrganizerId = holdingOrganizerId.value.trim()
    const trimmedLegalFormId = legalFormId.value.trim()

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

        payload.address_addition = trimmedAddressAddition.length ? trimmedAddressAddition : null
        payload.state_code = trimmedStateCode.length ? trimmedStateCode : null
        payload.country_code = trimmedCountryCode.length ? trimmedCountryCode : null
        payload.description = trimmedDescription.length ? trimmedDescription : null

        const holdingIdValue = toNumberOrNull(trimmedHoldingOrganizerId)
        payload.holding_organizer_id = holdingIdValue

        const legalFormValue = toNumberOrNull(trimmedLegalFormId)
        payload.legal_form_id = legalFormValue

        payload.nonprofit = nonprofit.value

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

        if (organizerId.value == null) {
            throw new Error('Organizer ID missing for update')
        }

        const { status } = await apiFetch(`/api/admin/organizer/${organizerId.value}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })

        if (status >= 200 && status < 300) {
            success.value = te('organizer_updated') ? t('organizer_updated') : 'Organizer updated successfully'
        } else {
            throw new Error('Unexpected status code')
        }
    } catch (err: unknown) {
        success.value = null
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || (te('failed_to_update_organizer') ? t('failed_to_update_organizer') : t('unknown_error'))
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

.organizer-description-editor {
    margin-top: 0.5rem;
}

.nonprofit-checkbox {
    display: flex;
    flex-direction: row;
    align-items: start;
    gap: 0.75rem;
    padding: 0.5rem 0;
}

.nonprofit-checkbox input[type="checkbox"] {
    width: 1.2rem;
    height: 1.2rem;
    margin: 0;
    cursor: pointer;
}

.nonprofit-checkbox label {
    margin-bottom: 5px;
    padding-bottom: 50px;
    cursor: pointer;
    font-weight: 500;
    color: var(--color-text);
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

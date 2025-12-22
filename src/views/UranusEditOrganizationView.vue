<!--
  UranusEditOrganizationView.vue
-->
<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent
        :title="t('organization')"
        :subtitle="t('organization_edit_description')" />
    #{{ organizationId }}

    <form class="uranus-form" @submit.prevent="onSubmitForm" novalidate>
      <UranusCard>
        <UranusTextInput
            id="organization_name"
            size="big"
            required
            v-model="organizationName"
            :label="t('organization_name')"
            :error="fieldErrors.organizationName"
        />

        <UranusFormRow>
          <UranusLegalFormSelect v-model="legalFormId" />

          <UranusCheckboxButton
              id="nonprofitId"
              v-model="nonprofit"
              :label="t('nonprofit')"
          />

        </UranusFormRow>
      </UranusCard>

      <UranusCard>
        <UranusFormRow>
          <UranusTextInput
              id="street"
              required
              :flex=3
              v-model="street"
              :label="t('street')"
              :error="fieldErrors.street"
          />

          <UranusTextInput
              id="house_number"
              required
              v-model="houseNumber"
              :label="t('house_number')"
              :error="fieldErrors.houseNumber"
          />
        </UranusFormRow>

        <UranusTextInput
            id="address_addition"
            v-model="addressAddition"
            :label="t('address_addition')"
        />

        <UranusFormRow>
          <UranusTextInput
              id="postal_code"
              required
              v-model="postalCode"
              :label="t('postal_code')"
              :error="fieldErrors.postalCode"
          />

          <UranusTextInput
              id="city"
              required
              :flex=3
              v-model="city"
              :label="t('city')"
              :error="fieldErrors.city"
          />
        </UranusFormRow>

        <UranusFormRow>
          <UranusRegionSelect v-model:country-code="countryCode" v-model:state-code="stateCode" />
        </UranusFormRow>

        <div class="uranus-label-text">Geografische Position</div>
        <UranusMapLocationPicker
            v-model="location"
            :zoom="12"
            :selectable="true"
        />

        <ValueInfoComponent :label="t('geo_location')" :value="locationSummary" />
      </UranusCard>

      <UranusCard>

        <UranusFormRow>
          <UranusTextInput id="email" v-model="email" :label="t('email')" :error="fieldErrors.email" />
          <UranusTextInput id="phone" v-model="phone" :label="t('phone')" :error="fieldErrors.phone" />
        </UranusFormRow>

        <UranusTextInput id="website" v-model="website" :label="t('website')" :error="fieldErrors.website" />

        <UranusFieldLabel
            :id="descriptionLabelId"
            :label="t('description')"
            :error="fieldErrors.description">
          <MarkdownEditorComponent
              v-model="description"
              class="organization-description-editor"
              :aria-labelledby="descriptionLabelId"
              :placeholder="descriptionPlaceholder"
          />
        </UranusFieldLabel>

        <div class="form-group">
          <label for="holding_organization_id">
            {{ labelMessage('organization_holding_id') }}
          </label>
          <input v-model="holdingOrganizationId" id="holding_organization_id" type="text" inputmode="numeric" />
        </div>
      </UranusCard>


      <div class="form-actions">
        <button type="submit" class="uranus-button" :disabled="isSubmitting">
          {{ submitButtonLabel }}
        </button>
      </div>
    </form>

    <transition name="fade">
      <p v-if="error" class="feedback feedback--error">{{ error }}</p>
    </transition>
    <transition name="fade">
      <p v-if="success" class="feedback feedback--success">{{ success }}</p>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch, fetchCoordinatesForAddress } from '@/api'

import MarkdownEditorComponent from '@/components/MarkdownEditorComponent.vue'
import UranusRegionSelect from '@/components/selects/UranusRegionSelect.vue'
import ValueInfoComponent from "@/components/ValueInfoComponent.vue"
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue"
import UranusTextInput from "@/components/ui/UranusTextInput.vue"
import UranusFormRow from "@/components/ui/UranusFormRow.vue"
import UranusFieldLabel from "@/components/ui/UranusFieldLabel.vue"
import UranusCard from "@/components/ui/UranusCard.vue";
import UranusCheckboxButton from "@/components/ui/UranusCheckboxButton.vue";
import UranusLegalFormSelect from "@/components/selects/UranusLegalFormSelect.vue";
import UranusMapLocationPicker from "@/components/UranusMapLocationPicker.vue";
import {uranusUrlParamToInt} from "@/utils/UranusUrlUtils.ts";

interface LatLngLiteral {
    lat: number
    lng: number
}

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const organizationName = ref('')
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
const holdingOrganizationId = ref('')
const legalFormId = ref('')
const nonprofit = ref(false)
const location = ref<LatLngLiteral | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)
const fieldErrors = reactive({
    organizationName: null as string | null,
    street: null as string | null,
    houseNumber: null as string | null,
    postalCode: null as string | null,
    city: null as string | null,
    email: null as string | null,
    phone: null as string | null,
    website: null as string | null,
    description: null as string | null,
})

const requiredFieldMessage = computed(() => t('required_field'))
const missingRequiredMessage = computed(() => t('organization_form_missing_required'))
const invalidEmailMessage = computed(() => t('organization_form_invalid_email'))
const invalidWebsiteMessage = computed(() => t('organization_form_invalid_website'))
const organizationLoadErrorMessage = computed(() => t('organization_load_error'))
const descriptionPlaceholder = computed(() => t('organization_description_placeholder'))

const locationSummary = computed(() => {
    if (!location.value) {
        return t('organization_map_no_selection')
    }
    const { lat, lng } = location.value
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
})

const labelMessage = (key: string) => t(key)
const descriptionLabelId = 'organization-description-label'

interface OrganizationResponse {
    organization_id?: number
    name?: string
    organization_name?: string
    address_addition?: string | null
    street?: string | null
    house_number?: string | null
    postal_code?: string | null
    city?: string | null
    state_code?: string | null
    country_code?: string | null
    description?: string | null
    holding_organization_id?: number | string | null
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

const organizationId = computed(() => uranusUrlParamToInt(route.params.id))
const submitButtonLabel = computed(() => t('update_organization'))
const isLoadingOrganization = ref(false)

const toNumberOrNull = (value: string): number | null => {
    if (!value.trim().length) {
        return null
    }
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
}

const loadOrganizationById = async (id: number) => {
    if (isLoadingOrganization.value) {
        return
    }

    error.value = null
    success.value = null
    Object.keys(fieldErrors).forEach((key) => {
        fieldErrors[key as keyof typeof fieldErrors] = null
    })
    isLoadingOrganization.value = true

    try {
        const { data } = await apiFetch<OrganizationResponse>(`/api/admin/organization/${id}`)
        if (!data) {
            throw new Error('Organization not found')
        }

        const organizationNameValue = data.name ?? data.organization_name ?? ''
        organizationName.value = typeof organizationNameValue === 'string' ? organizationNameValue : ''

        addressAddition.value = typeof data.address_addition === 'string' ? data.address_addition : ''
        street.value = typeof data.street === 'string' ? data.street : ''
        houseNumber.value = typeof data.house_number === 'string' ? data.house_number : ''
        postalCode.value = typeof data.postal_code === 'string' ? data.postal_code : ''
        city.value = typeof data.city === 'string' ? data.city : ''

        const incomingCountry = typeof data.country_code === 'string' ? data.country_code.trim() : ''
        countryCode.value = incomingCountry

        const incomingState = typeof data.state_code === 'string' ? data.state_code.trim() : ''
        stateCode.value = incomingState
        description.value = typeof data.description === 'string' ? data.description : ''

        if (typeof data.holding_organization_id === 'number' || (typeof data.holding_organization_id === 'string' && data.holding_organization_id.trim().length)) {
            holdingOrganizationId.value = String(data.holding_organization_id).trim()
        } else {
            holdingOrganizationId.value = ''
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
            error.value = e.data?.error || organizationLoadErrorMessage.value
        } else {
            error.value = organizationLoadErrorMessage.value
        }
    } finally {
        isLoadingOrganization.value = false
    }
}

watch(
    organizationId,
    (id) => {
        if (id == null) {
            return
        }
        loadOrganizationById(id)
    },
    { immediate: true }
)

onMounted(() => {
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

const onSubmitForm = async () => {
    if (isSubmitting.value) {
        return
    }

    error.value = null
    success.value = null

    Object.keys(fieldErrors).forEach((key) => {
        fieldErrors[key as keyof typeof fieldErrors] = null
    })

    const trimmedName = organizationName.value.trim()
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
    const trimmedHoldingOrganizationId = holdingOrganizationId.value.trim()
    const trimmedLegalFormId = legalFormId.value.trim()

    fieldErrors.organizationName = trimmedName ? null : requiredFieldMessage.value
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

    const hasMissingRequired = [fieldErrors.organizationName, fieldErrors.street, fieldErrors.houseNumber, fieldErrors.postalCode, fieldErrors.city].some((value) => Boolean(value))
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

        const holdingIdValue = toNumberOrNull(trimmedHoldingOrganizationId)
        payload.holding_organization_id = holdingIdValue

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

      let apiUrl = '/api/admin/organization'
      if (organizationId.value) {
        apiUrl += `/${organizationId.value}`
      }

      console.log("apiUrl:", apiUrl)
      console.log("payload:", JSON.stringify(payload))

      const { status } = await apiFetch(apiUrl, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })

        if (status >= 200 && status < 300) {
            success.value = t('organization_updated')
            router.push(`/admin/organizations`)
        } else {
            throw new Error('Unexpected status code')
        }
    } catch (err: unknown) {
      console.log("err:", err)
        success.value = null
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || t('failed_to_update_organization')
        } else {
            error.value = t('unknown_error')
        }
    } finally {
        isSubmitting.value = false
    }
}

const clearMissingRequiredMessage = () => {
    if (error.value === missingRequiredMessage.value) {
        const stillHasRequiredError = [fieldErrors.organizationName, fieldErrors.street, fieldErrors.houseNumber, fieldErrors.postalCode, fieldErrors.city].some((value) => Boolean(value))
        if (!stillHasRequiredError) {
            error.value = null
        }
    }
}

watch(organizationName, (value) => {
    if (fieldErrors.organizationName && value.trim()) {
        fieldErrors.organizationName = null
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
.uranus-card {
    margin-bottom: 1rem;
}

.nonprofit-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0;
}

.nonprofit-checkbox input[type='checkbox'] {
    width: 1.15rem;
    height: 1.15rem;
    margin: 0;
    cursor: pointer;
}

.nonprofit-checkbox label {
    margin: 0;
    cursor: pointer;
    font-weight: 500;
    color: var(--color-text);
    line-height: 1.4;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
}




.feedback {
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

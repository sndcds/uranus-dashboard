<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent :title="t('create_organizer')" :subtitle="organizerDescription" />

    <section class="uranus-card">
      <form class="uranus-form" @submit.prevent="submitForm" novalidate>

        <UranusTextInput id="organizer_name" size="big" required
                         v-model="organizerName"
                         :label="t('organizer_name')"
                         :error="fieldErrors.organizerName"/>

        <UranusFormRow>
          <UranusTextInput id="street" required :flex=2
                           v-model="street"
                           :label="t('street')"
                           :error="fieldErrors.street"/>
          <UranusTextInput id="house_number" required
                           v-model="houseNumber"
                           :label="t('house_number')"
                           :error="fieldErrors.houseNumber"/>
        </UranusFormRow>

        <UranusFormRow>
          <UranusTextInput id="postal_code" required
                           v-model="postalCode"
                           :label="t('postal_code')"
                           :error="fieldErrors.postalCode"/>
          <UranusTextInput id="city" required :flex=2
                           v-model="city"
                           :label="t('city')"
                           :error="fieldErrors.city"/>
        </UranusFormRow>

        <UranusFormRow>
          <UranusTextInput id="email"
                           v-model="email"
                           :label="t('email')"
                           :error="fieldErrors.email"/>
          <UranusTextInput id="phone"
                           v-model="phone"
                           :label="t('phone')"
                           :error="fieldErrors.phone"/>
        </UranusFormRow>

        <UranusTextInput id="website"
                         v-model="website"
                         :label="t('website')"
                         :error="fieldErrors.website"/>

        <div>
          <LocationMapComponent v-model="location" :zoom="13" :selectable="true" class="venue-map-panel">
            <template #footer>
              {{ mapHint }}
            </template>
          </LocationMapComponent>
          <ValueInfoComponent
              :label="t('geo_location')"
              :value="locationSummary" />
        </div>

        <div class="form-actions" style="text-align: right">
          <button class="uranus-button" type="submit" :disabled="isSubmitting">{{ t('create_organizer') }}</button>
        </div>

      </form>


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
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue";
import UranusTextInput from "@/components/uranus/UranusTextInput.vue";
import UranusFormRow from "@/components/uranus/UranusFormRow.vue";

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
.venue-map-panel {
 max-width: 400px;
 aspect-ratio: 1/1;
}
</style>

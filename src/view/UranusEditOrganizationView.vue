<!--
  UranusEditOrganizationView.vue
-->
<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
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
            :error="fieldErrors.organizationName!"
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
              :flex="3"
              v-model="street"
              :label="t('street')"
              :error="fieldErrors.street!"
          />

          <UranusTextInput
              id="house_number"
              required
              v-model="houseNumber"
              :label="t('house_number')"
              :error="fieldErrors.houseNumber!"
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
              :error="fieldErrors.postalCode!"
          />

          <UranusTextInput
              id="city"
              required
              :flex="3"
              v-model="city"
              :label="t('city')"
              :error="fieldErrors.city!"
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

        <UranusValueInfo :label="t('geo_location')" :value="locationSummary" />
      </UranusCard>

      <UranusCard>

        <UranusFormRow>
          <UranusTextInput id="email" v-model="email" :label="t('email')" :error="fieldErrors.email!" />
          <UranusTextInput id="phone" v-model="phone" :label="t('phone')" :error="fieldErrors.phone!" />
        </UranusFormRow>

        <UranusTextInput id="website" v-model="website" :label="t('website')" :error="fieldErrors.website!" />

        <UranusFieldLabel
            :id="descriptionLabelId"
            :label="t('description')"
            :error="fieldErrors.description">
          <UranusMarkdownEditor
              v-model="description"
              class="organization-description-editor"
              :aria-labelledby="descriptionLabelId"
              :placeholder="descriptionPlaceholder"
          />
        </UranusFieldLabel>
      </UranusCard>

      <div class="form-actions">
        <button type="submit" class="uranus-ok-button" :disabled="isSubmitting">
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
import { computed, watch, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { apiFetch } from '@/api.ts'
import { fetchCoordinatesForAddress } from '@/api.ts'
import { useOrganization } from '@/composable/useOrganization.ts'

import UranusMarkdownEditor from '@/component/uranus/UranusMarkdownEditor.vue'
import UranusRegionSelect from '@/component/selects/UranusRegionSelect.vue'
import UranusValueInfo from "@/component/ui/UranusValueInfo.vue"
import UranusDashboardHero from "@/component/dashboard/UranusDashboardHero.vue"
import UranusTextInput from "@/component/ui/UranusTextInput.vue"
import UranusFormRow from "@/component/ui/UranusFormRow.vue"
import UranusFieldLabel from "@/component/ui/UranusFieldLabel.vue"
import UranusCard from "@/component/ui/UranusCard.vue";
import UranusCheckboxButton from "@/component/ui/UranusCheckboxButton.vue";
import UranusLegalFormSelect from "@/component/selects/UranusLegalFormSelect.vue";
import UranusMapLocationPicker from "@/component/UranusMapLocationPicker.vue";
import { uranusUrlParamToInt } from "@/util/UranusUrlUtils.ts";
import { toNumberOrNull } from "@/util/UranusUtils.ts"


// Destructure state & methods from composable
const {
  organizationName,
  addressAddition,
  street,
  houseNumber,
  postalCode,
  city,
  stateCode,
  countryCode,
  email,
  website,
  phone,
  description,
  holdingOrganizationId,
  legalFormId,
  nonprofit,
  location,
  isLoadingOrganization,
  error,
  success,
  fieldErrors,
  loadOrganizationById,
} = useOrganization()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const isSubmitting = ref(false)

const organizationId = computed(() => uranusUrlParamToInt(route.params.id))
const submitButtonLabel = computed(() => t('save'))
const descriptionPlaceholder = computed(() => t('organization_description_placeholder'))
const requiredFieldMessage = computed(() => t('required_field'))
const missingRequiredMessage = computed(() => t('organization_form_missing_required'))
const invalidEmailMessage = computed(() => t('organization_form_invalid_email'))
const invalidWebsiteMessage = computed(() => t('organization_form_invalid_website'))

const descriptionLabelId = 'organization-description-label'

const locationSummary = computed(() => {
  if (!location.value) return t('organization_map_no_selection')
  return `${location.value.lat.toFixed(5)}, ${location.value.lng.toFixed(5)}`
})

// Watch for organizationId changes and load data
watch(
    organizationId,
    (id) => {
      if (id != null) loadOrganizationById(id)
    },
    { immediate: true }
)

// Email/URL validators
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const isValidUrl = (value: string) => {
  try {
    const prefixed = value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`
    return Boolean(new URL(prefixed).hostname)
  } catch {
    return false
  }
}

// Submit handler
const onSubmitForm = async () => {
  if (isSubmitting.value) return

  error.value = null
  success.value = null
  Object.keys(fieldErrors).forEach((key) => (fieldErrors[key] = ''))

  const trimmed = {
    organizationName: organizationName.value.trim(),
    addressAddition: addressAddition.value.trim(),
    street: street.value.trim(),
    houseNumber: houseNumber.value.trim(),
    postalCode: postalCode.value.trim(),
    city: city.value.trim(),
    stateCode: stateCode.value.trim(),
    countryCode: countryCode.value.trim(),
    email: email.value.trim(),
    phone: phone.value.trim(),
    website: website.value.trim(),
    description: description.value.trim(),
    holdingOrganizationId: holdingOrganizationId.value.trim(),
    legalFormId: legalFormId.value.trim(),
  }

  // Validate required fields
  fieldErrors.organizationName = trimmed.organizationName ? '' : requiredFieldMessage.value
  fieldErrors.street = trimmed.street ? '' : requiredFieldMessage.value
  fieldErrors.houseNumber = trimmed.houseNumber ? '' : requiredFieldMessage.value
  fieldErrors.postalCode = trimmed.postalCode ? '' : requiredFieldMessage.value
  fieldErrors.city = trimmed.city ? '' : requiredFieldMessage.value
  fieldErrors.email = trimmed.email ? (isValidEmail(trimmed.email) ? '' : invalidEmailMessage.value) : ''
  fieldErrors.website = trimmed.website ? (isValidUrl(trimmed.website) ? '' : invalidWebsiteMessage.value) : ''

  if ([fieldErrors.organizationName, fieldErrors.street, fieldErrors.houseNumber, fieldErrors.postalCode, fieldErrors.city].some(Boolean)) {
    error.value = missingRequiredMessage.value
    return
  }
  if (fieldErrors.email) { error.value = fieldErrors.email; return }
  if (fieldErrors.website) { error.value = fieldErrors.website; return }

  isSubmitting.value = true

  try {
    const payload: Record<string, unknown> = {
      name: trimmed.organizationName,
      street: trimmed.street,
      house_number: trimmed.houseNumber,
      postal_code: trimmed.postalCode,
      city: trimmed.city,
      address_addition: trimmed.addressAddition || null,
      state_code: trimmed.stateCode || null,
      country_code: trimmed.countryCode || null,
      contact_email: trimmed.email || null,
      website_url: trimmed.website || null,
      contact_phone: trimmed.phone || null,
      description: trimmed.description || null,
      holding_organization_id: toNumberOrNull(trimmed.holdingOrganizationId),
      legal_form_id: toNumberOrNull(trimmed.legalFormId),
      nonprofit: nonprofit.value,
    }

    if (location.value) {
      payload.latitude = location.value.lat
      payload.longitude = location.value.lng
    } else {
      const query = [trimmed.street, trimmed.houseNumber, trimmed.postalCode, trimmed.city].filter(Boolean).join(' ')
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
    if (organizationId.value) apiUrl += `/${organizationId.value}`

    const { status } = await apiFetch(apiUrl, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })

    if (status >= 200 && status < 300) {
      success.value = t('organization_updated')
      router.push(`/admin/organizations`)
    } else throw new Error('Unexpected status code')
  } catch (err: unknown) {
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

// Clear field error messages dynamically
const clearMissingRequiredMessage = () => {
  if (error.value === missingRequiredMessage.value) {
    const hasError = [fieldErrors.organizationName, fieldErrors.street, fieldErrors.houseNumber, fieldErrors.postalCode, fieldErrors.city].some(Boolean)
    if (!hasError) error.value = null
  }
}

watch([organizationName, street, houseNumber, postalCode, city, email, website], ([oName, str, hNum, postal, c, em, web]) => {
  if (fieldErrors.organizationName && oName?.trim()) fieldErrors.organizationName = ''
  if (fieldErrors.street && str?.trim()) fieldErrors.street = ''
  if (fieldErrors.houseNumber && hNum?.trim()) fieldErrors.houseNumber = ''
  if (fieldErrors.postalCode && postal?.trim()) fieldErrors.postalCode = ''
  if (fieldErrors.city && c?.trim()) fieldErrors.city = ''
  if (fieldErrors.email && (!em?.trim() || isValidEmail(em))) fieldErrors.email = ''
  if (fieldErrors.website && (!web?.trim() || isValidUrl(web))) fieldErrors.website = ''
  clearMissingRequiredMessage()
})
</script>

<style scoped lang="scss">
.uranus-card { margin-bottom: 1rem; }

.nonprofit-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.25rem 0;
}
.nonprofit-checkbox input[type='checkbox'] { width: 1.15rem; height: 1.15rem; margin: 0; cursor: pointer; }
.nonprofit-checkbox label { margin: 0; cursor: pointer; font-weight: 500; line-height: 1.4; }

.form-actions { display: flex; justify-content: flex-end; }

.feedback {}

.fade-enter-active, .fade-leave-active { transition: opacity 0.25s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent :title="t('create_venue')" :subtitle="venueDescription" />

    <section class="uranus-card">
      <VenueForm ref="venueFormRef" :submit-label="t('create_venue')" :loading="isSubmitting"
          :error-message="error" :success-message="success" :show-description="false" :show-date-fields="false"
          @submit="handleSubmit" @clear-error="clearError" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch, fetchCoordinatesForAddress } from '@/api'

import VenueForm, { type VenueFormSubmitPayload } from '@/components/VenueForm.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue";

interface LatLngLiteral {
    lat: number
    lng: number
}

const { t, te } = useI18n()
const route = useRoute()
const organizerId = Number(route.params.id)

const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)
const venueFormRef = ref<InstanceType<typeof VenueForm> | null>(null)

const venueDescription = computed(() => (te('venue_create_description') ? t('venue_create_description') : 'Add the essential information for your venue profile.'))

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

const handleSubmit = async (formData: VenueFormSubmitPayload) => {
    if (isSubmitting.value) {
        return
    }

    error.value = null
    success.value = null
    isSubmitting.value = true

    try {
        const payload: Record<string, unknown> = {
            name: formData.name,
            street: formData.street,
            house_number: formData.houseNumber,
            postal_code: formData.postalCode,
            city: formData.city,
            contact_email: formData.contactEmail,
            website_url: formData.websiteUrl,
            contact_phone: formData.contactPhone,
            country_code: formData.countryCode,
            state_code: formData.stateCode,
            organizer_id: organizerId,
        }

        let coords: LatLngLiteral | null = formData.location

        if (!coords) {
            const query = [formData.street, formData.houseNumber, formData.postalCode, formData.city]
                .filter((value) => value.length)
                .join(' ')

            const nominatimResult = query.length ? await fetchCoordinatesForAddress(query) : null
            if (nominatimResult) {
                const latNumber = toNumberOrNull(nominatimResult.lat)
                const lonNumber = toNumberOrNull(nominatimResult.lon)
                if (latNumber != null && lonNumber != null) {
                    coords = { lat: latNumber, lng: lonNumber }
                    venueFormRef.value?.setLocation(coords)
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

const clearError = () => {
    if (error.value) {
        error.value = null
    }
}
</script>

<style scoped lang="scss">
.venue-page {
    @include form-page();
}

.venue-hero {
    @include form-hero(960px);
}

.venue-card {
    @include form-card(1080px, clamp(1.75rem, 4vw, 2.75rem), clamp(1.25rem, 3vw, 1.75rem));
}

@media (max-width: 480px) {
    .venue-card {
        padding: clamp(1.5rem, 6vw, 2rem);
    }
}
</style>

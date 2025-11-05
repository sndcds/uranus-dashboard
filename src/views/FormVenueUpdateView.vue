<template>
    <div class="uranus-main-layout">
        <DashboardHeroComponent :title="t('update_venue')" :subtitle="venueDescription" />
        <VenueForm ref="venueFormRef" :submit-label="t('update_venue')" :loading="isSubmitting || isLoadingVenue"
            :error-message="error" :success-message="success" :initial-values="formInitialValues"
            @submit="handleSubmit" :show-description="true" :show-date-fields="true" @clear-error="clearError" />
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { apiFetch, fetchCoordinatesForAddress } from '@/api'

import VenueForm, { type VenueFormInitialValues, type VenueFormSubmitPayload } from '@/components/VenueForm.vue'
import DashboardHeroComponent from "@/components/DashboardHeroComponent.vue";

interface LatLngLiteral {
    lat: number
    lng: number
}

const { t, te } = useI18n()
const route = useRoute()
const organizerId = Number(route.params.id)
const venueFormRef = ref<InstanceType<typeof VenueForm> | null>(null)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const isSubmitting = ref(false)
const isLoadingVenue = ref(false)
const formInitialValues = ref<VenueFormInitialValues | undefined>(undefined)

const venueDescription = computed(() => (te('venue_update_description') ? t('venue_update_description') : 'Update the essential information for your venue profile.'))

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

interface VenueResponse {
    venue_id?: number
    name?: string
    venue_name?: string
    street?: string | null
    house_number?: string | null
    postal_code?: string | null
    city?: string | null
    contact_email?: string | null
    website_url?: string | null
    contact_phone?: string | null
    latitude?: number | string | null
    longitude?: number | string | null
    description?: string | null
    opened_at?: string | null
    closed_at?: string | null
    country_code?: string | null
    state_code?: string | null
    lat?: number | string | null
    lon?: number | string | null
}

const toVenueId = (value: unknown): number | null => {
    if (Array.isArray(value)) {
        const [first] = value
        return toVenueId(first)
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

const venueId = computed(() => toVenueId(route.params.venueId))
const venueLoadErrorMessage = computed(() => (te('venue_load_error') ? t('venue_load_error') : 'Failed to load venue details.'))

const loadVenueById = async (id: number) => {
    if (isLoadingVenue.value) {
        return
    }

    isLoadingVenue.value = true
    error.value = null

    try {
        const { data } = await apiFetch<VenueResponse>(`/api/admin/venue/${id}`)
        if (!data) {
            throw new Error('Venue not found')
        }

        const venueNameValue = data.name ?? data.venue_name ?? ''
        const initial: VenueFormInitialValues = {
            venueName: typeof venueNameValue === 'string' ? venueNameValue : '',
            street: typeof data.street === 'string' ? data.street : '',
            houseNumber: typeof data.house_number === 'string' ? data.house_number : '',
            postalCode: typeof data.postal_code === 'string' ? data.postal_code : '',
            city: typeof data.city === 'string' ? data.city : '',
            email: typeof data.contact_email === 'string' ? data.contact_email : '',
            website: typeof data.website_url === 'string' ? data.website_url : '',
            phone: typeof data.contact_phone === 'string' ? data.contact_phone : '',
            description: typeof data.description === 'string' ? data.description : '',
            openedAt: typeof data.opened_at === 'string' ? data.opened_at : null,
            closedAt: typeof data.closed_at === 'string' ? data.closed_at : null,
            countryCode: typeof data.country_code === 'string' ? data.country_code : null,
            stateCode: typeof data.state_code === 'string' ? data.state_code : null,
        }

        const rawLat = data.latitude ?? data.lat ?? null
        const rawLng = data.longitude ?? data.lon ?? null
        const latNumber = typeof rawLat === 'number' ? rawLat : typeof rawLat === 'string' ? Number(rawLat) : null
        const lngNumber = typeof rawLng === 'number' ? rawLng : typeof rawLng === 'string' ? Number(rawLng) : null

        if (
            latNumber != null &&
            Number.isFinite(latNumber) &&
            lngNumber != null &&
            Number.isFinite(lngNumber)
        ) {
            initial.location = { lat: latNumber, lng: lngNumber }
        } else {
            initial.location = null
        }

        formInitialValues.value = initial
        if (initial.location) {
            venueFormRef.value?.setLocation(initial.location)
        }
    } catch (err) {
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || venueLoadErrorMessage.value
        } else {
            error.value = venueLoadErrorMessage.value
        }
    } finally {
        isLoadingVenue.value = false
    }
}

const handleSubmit = async (formData: VenueFormSubmitPayload) => {
    if (isSubmitting.value || venueId.value == null) {
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
            description: formData.description,
            opened_at: formData.openedAt,
            closed_at: formData.closedAt,
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

        const { status } = await apiFetch(`/api/admin/venue/${venueId.value}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        })

        if (status >= 200 && status < 300) {
            success.value = te('venue_updated') ? t('venue_updated') : 'Venue updated successfully'
        } else {
            throw new Error('Unexpected status code')
        }
    } catch (err: unknown) {
        success.value = null
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || t('failed_to_update_venue')
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

onMounted(() => {
    if (venueId.value != null) {
        loadVenueById(venueId.value)
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
    @include form-card(1080px, clamp(1.75rem, 4vw, 2.75rem), clamp(1.25rem, 3vw, 1.75rem));
}

@media (max-width: 480px) {
    .venue-card {
        padding: clamp(1.5rem, 6vw, 2rem);
    }
}
</style>

// src/composable/useOrganization.ts

import { ref, reactive } from 'vue'
import { apiFetch } from '@/api.ts' // your fetch wrapper
import type { OrganizationResponse } from '@/model/uranusOrganization.ts'

export function useOrganization() {
    // Reactive state
    const organizationName = ref('')
    const addressAddition = ref('')
    const street = ref('')
    const houseNumber = ref('')
    const postalCode = ref('')
    const city = ref('')
    const countryCode = ref('')
    const stateCode = ref('')
    const description = ref('')
    const holdingOrganizationId = ref('')
    const legalFormId = ref('')
    const nonprofit = ref(false)
    const email = ref('')
    const phone = ref('')
    const website = ref('')
    const location = ref<{ lat: number; lng: number } | null>(null)

    const isLoadingOrganization = ref(false)
    const error = ref<string | null>(null)
    const success = ref<string | null>(null)

    const fieldErrors = reactive<Record<string, string>>({
        organizationName: '',
        street: '',
        houseNumber: '',
        postalCode: '',
        city: '',
        email: '',
        website: '',
        phone: '',
        description: ''
    })
    const organizationLoadErrorMessage = ref('Failed to load organization.')

    // Core function
    const loadOrganizationById = async (id: number) => {
        if (isLoadingOrganization.value) return

        // reset state
        error.value = null
        success.value = null
        Object.keys(fieldErrors).forEach((key) => {
            fieldErrors[key] = ''
        })
        isLoadingOrganization.value = true

        try {
            const { data } = await apiFetch<OrganizationResponse>(
                `/api/admin/organization/${id}`
            )
            if (!data) throw new Error('Organization not found')

            organizationName.value = (data.name ?? data.organization_name ?? '') as string
            addressAddition.value = (data.address_addition ?? '') as string
            street.value = (data.street ?? '') as string
            houseNumber.value = (data.house_number ?? '') as string
            postalCode.value = (data.postal_code ?? '') as string
            city.value = (data.city ?? '') as string
            countryCode.value = (data.country_code ?? '').toString().trim()
            stateCode.value = (data.state_code ?? '').toString().trim()
            description.value = (data.description ?? '') as string

            holdingOrganizationId.value =
                data.holding_organization_id != null
                    ? String(data.holding_organization_id).trim()
                    : ''
            legalFormId.value =
                data.legal_form_id != null ? String(data.legal_form_id).trim() : ''

            nonprofit.value = Boolean(data.nonprofit)
            email.value = (data.contact_email ?? '') as string
            website.value = (data.website_url ?? '') as string
            phone.value = (data.contact_phone ?? '') as string

            const rawLat = data.latitude ?? data.lat ?? null
            const rawLng = data.longitude ?? data.lon ?? null
            const latNumber =
                typeof rawLat === 'number' ? rawLat : typeof rawLat === 'string' ? Number(rawLat) : null
            const lngNumber =
                typeof rawLng === 'number' ? rawLng : typeof rawLng === 'string' ? Number(rawLng) : null

            location.value =
                latNumber != null && Number.isFinite(latNumber) && lngNumber != null && Number.isFinite(lngNumber)
                    ? { lat: latNumber, lng: lngNumber }
                    : null
        } catch (err: unknown) {
            if (typeof err === 'object' && err && 'data' in err) {
                const e = err as { data?: { error?: string } }
                error.value = e.data?.error ?? organizationLoadErrorMessage.value
            } else {
                error.value = organizationLoadErrorMessage.value
            }
        } finally {
            isLoadingOrganization.value = false
        }
    }

    return {
        // state
        organizationName,
        addressAddition,
        street,
        houseNumber,
        postalCode,
        city,
        countryCode,
        stateCode,
        description,
        holdingOrganizationId,
        legalFormId,
        nonprofit,
        email,
        phone,
        website,
        location,

        // status
        isLoadingOrganization,
        error,
        success,
        fieldErrors,

        // actions
        loadOrganizationById
    }
}
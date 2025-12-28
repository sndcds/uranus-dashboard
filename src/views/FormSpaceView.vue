<template>
    <div class="uranus-main-layout">
        <UranusDashboardHero :title="title" :subtitle="subtitle" />

        <SpaceForm
            :submit-label="submitLabel"
            :loading="isSubmitting"
            :error-message="errorMessage"
            :success-message="successMessage"
            :initial-values="initialValues"
            @submit="handleSubmit"
            @clear-error="clearError"
        />
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch } from '@/api'

import UranusDashboardHero from '@/components/dashboard/UranusDashboardHero.vue'
import SpaceForm, { type SpaceFormInitialValues, type SpaceFormSubmitPayload } from '@/components/SpaceForm.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const venueId = Number(route.params.venueId)
const organizationId = Number(route.params.id)

const toSpaceId = (value: unknown): number | null => {
    if (Array.isArray(value)) {
        return toSpaceId(value[0])
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

const spaceId = toSpaceId(route.params.spaceId)

const isSubmitting = ref(false)
const isLoadingSpace = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const initialValues = ref<SpaceFormInitialValues>({})

const isEditMode = computed(() => spaceId != null)
const title = computed(() => t(isEditMode.value ? 'update_space' : 'create_space'))
const subtitle = computed(() => t(isEditMode.value ? 'space_edit_subtitle' : 'space_details_subtitle'))
const submitLabel = computed(() => t(isEditMode.value ? 'update_space' : 'save_space'))

const toNumber = (value: unknown, fallback = 0): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string') {
        const parsed = Number(value.trim())
        if (Number.isFinite(parsed)) {
            return parsed
        }
    }
    return fallback
}

const toNullableNumber = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value
    }
    if (typeof value === 'string') {
        const parsed = Number(value.trim())
        return Number.isFinite(parsed) ? parsed : null
    }
    return null
}

interface SpaceResponse {
    name?: string | null
    total_capacity?: number | string | null
    seating_capacity?: number | string | null
    building_level?: number | string | null
    space_type_id?: number | string | null
    website_url?: string | null
    description?: string | null
    accessibility_summary?: string | null
    accessibility_flags?: number | string | Array<number | string> | null
}

async function loadSpace() {
    if (spaceId == null) {
        return
    }

    isLoadingSpace.value = true
    errorMessage.value = null

    try {
        const { data } = await apiFetch<SpaceResponse | null>(`/api/admin/space/${spaceId}`)

        if (!data) {
            throw new Error('Space not found')
        }

        initialValues.value = {
            name: typeof data.name === 'string' ? data.name : '',
            totalCapacity: toNumber(data.total_capacity, 0),
            seatingCapacity: toNumber(data.seating_capacity, 0),
            buildingLevel: toNumber(data.building_level, 0),
            spaceTypeId: toNullableNumber(data.space_type_id),
            websiteUrl: typeof data.website_url === 'string' ? data.website_url : '',
            description: typeof data.description === 'string' ? data.description : '',
            accessibilitySummary: typeof data.accessibility_summary === 'string' ? data.accessibility_summary : '',
            accessibilityFlags: typeof data.accessibility_flags === 'number'
                ? data.accessibility_flags
                : toNullableNumber(data.accessibility_flags),
        }
    } catch (error) {
        console.error('Failed to load space', error)
        errorMessage.value = t('space_load_error')
    } finally {
        isLoadingSpace.value = false
    }
}

async function handleSubmit(payload: SpaceFormSubmitPayload) {
  isSubmitting.value = true
  errorMessage.value = null
  successMessage.value = null

  const finalPayload = {
    name: payload.name,
    total_capacity: payload.totalCapacity,
    seating_capacity: payload.seatingCapacity,
    building_level: payload.buildingLevel,
    space_type_id: payload.spaceTypeId,
    website_url: payload.websiteUrl,
    description: payload.description,
    accessibility_summary: payload.accessibilitySummary,
    accessibility_flags: payload.accessibilityFlags,
    venue_id: venueId,
  }


    try {
        const endpoint = isEditMode.value && spaceId != null
            ? `/api/admin/space/${spaceId}`
            : '/api/admin/space/create'
        const method = isEditMode.value ? 'PUT' : 'POST'

        const { status } = await apiFetch(endpoint, {
            method,
            body: JSON.stringify(finalPayload),
        })

        if (status >= 200 && status < 300) {
            successMessage.value = t(isEditMode.value ? 'space_updated_success' : 'space_created_success')

            // Navigate back to the venues list
            if (Number.isFinite(organizationId)) {
                setTimeout(() => {
                    router.push(`/admin/organization/${organizationId}/venues`)
                }, 1000)
            }
        } else {
            const failureKey = isEditMode.value ? 'update_space_failed' : 'save_space_failed'
            errorMessage.value = `${t(failureKey)} (status ${status}).`
        }
    } catch (error: unknown) {
        const defaultError = t(isEditMode.value ? 'update_space_failed' : 'save_space_failed')
        if (typeof error === 'object' && error && 'data' in error) {
            const err = error as { data?: { error?: string } }
            errorMessage.value = err.data?.error ?? defaultError
        } else if (error instanceof Error) {
            errorMessage.value = error.message || defaultError
        } else {
            errorMessage.value = defaultError
        }
    } finally {
        isSubmitting.value = false
    }
}

function clearError() {
    errorMessage.value = null
}

onMounted(async () => {
    if (spaceId != null) {
        await loadSpace()
    }
})
</script>
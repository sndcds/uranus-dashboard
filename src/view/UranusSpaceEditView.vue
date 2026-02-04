<!--
  UranusSpaceEditView.vue
-->
<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero :title="title" :subtitle="subtitle" />

    <UranusSpaceEditForm
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
import { apiFetch } from '@/api.ts'
import { useSpaceLoader } from '@/composable/useSpaceLoader.ts'

import UranusDashboardHero from '@/component/dashboard/UranusDashboardHero.vue'
import UranusSpaceEditForm, { type SpaceFormInitialValues, type SpaceFormSubmitPayload } from '@/component/UranusSpaceEditForm.vue'

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


const {
  isLoading: isLoadingSpace,
  error: loadError,
  loadSpace,
} = useSpaceLoader()

const spaceId = toSpaceId(route.params.spaceId)

const isSubmitting = ref(false)
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

async function handleSubmit(payload: SpaceFormSubmitPayload) {
  isSubmitting.value = true
  errorMessage.value = null
  successMessage.value = null

  const finalPayload = {
    space_id: payload.spaceId,
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

  console.log(JSON.stringify(finalPayload, null, 2))

  try {
    const endpoint = isEditMode.value && spaceId != null
      ? `/api/admin/space/${spaceId}` // Update
      : '/api/admin/space' // Create

    console.log("spaceId", spaceId)
    console.log("endpoint", endpoint)
    const { status } = await apiFetch(endpoint, {
      method: 'PUT',
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

    if (error instanceof Error) {
      // Standard JS Error
      errorMessage.value = error.message || defaultError
    } else if (typeof error === 'object' && error !== null) {
      // Possibly an API response with a `data.error` string
      const maybeApiError = error as { data?: { error?: string } }
      errorMessage.value = maybeApiError.data?.error ?? defaultError
    } else {
      // Fallback for anything else (string, null, etc.)
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
    const values = await loadSpace(spaceId)
    if (values) {
      initialValues.value = values
    }
  }
})
</script>
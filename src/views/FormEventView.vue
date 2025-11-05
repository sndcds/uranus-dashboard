<template>
  <div class="uranus-main-layout">
    <DashboardHeroComponent
        :title="t('event_form_title')"
        :subtitle="t('event_form_subtitle')"
    />

    <EventForm
        ref="eventFormRef"
        :submit-label="t('event_submit_button')"
        :loading="isSubmitting"
        :error-message="error"
        :success-message="success"
        :organizer-id="appStore.organizerId"
        @submit="handleSubmit"
        @clear-error="clearError"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { apiFetch } from '@/api'
import { useAppStore } from '@/store/appStore'

import DashboardHeroComponent from '@/components/DashboardHeroComponent.vue'
import EventForm, { type EventFormSubmitPayload } from '@/components/EventForm.vue'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const appStore = useAppStore()

const eventFormRef = ref<InstanceType<typeof EventForm> | null>(null)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)

const handleSubmit = async (payload: EventFormSubmitPayload) => {
    if (isSubmitting.value) {
        return
    }

    error.value = null
    success.value = null
    isSubmitting.value = true

    try {
        const { status, data } = await apiFetch('/api/admin/event/create', {
            method: 'POST',
            body: JSON.stringify(payload),
        })

        if (status >= 200 && status < 300) {
            success.value = t('event_submit_success')
            router.push(`/admin/event/${(data as any).event_id}`)
        } else {
            error.value = t('event_submit_error', { status })
        }
    } catch (err: unknown) {
        if (typeof err === 'object' && err && 'data' in err) {
            const e = err as { data?: { error?: string } }
            error.value = e.data?.error || t('event_submit_error_generic')
        } else if (err instanceof Error) {
            error.value = err.message
        } else {
            error.value = t('event_submit_error_generic')
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

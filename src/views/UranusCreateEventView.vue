<template>
  <div class="uranus-main-layout">
    <UranusDashboardHero
        :title="t('add_new_event_title')"
        :subtitle="t('event_form_subtitle')"
    />

    <UranusAddEventForm
        ref="eventFormRef"
        :submit-label="t('event_submit_button')"
        :loading="isSubmitting"
        :error-message="error"
        :success-message="success"
        :organization-id="appStore.organizationId"
        @submit="handleSubmit"
        @clear-error="clearError"
    />

  </div>
</template>

<script setup lang="ts">
import { onMounted, provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { apiFetch, deepClean } from '@/api.ts'
import { useAppStore } from '@/store/appStore.ts'

import UranusDashboardHero from '@/components/dashboard/UranusDashboardHero.vue'
import UranusAddEventForm from '@/components/event/UranusAddEventForm.vue'

const { t } = useI18n({ useScope: 'global' })
const router = useRouter()
const appStore = useAppStore()

interface ChoosableVenue {
    id: number
    name: string
    city: string
    country_code: string
}

const eventFormRef = ref<InstanceType<typeof UranusAddEventForm> | null>(null)
const isSubmitting = ref(false)
const error = ref<string | null>(null)
const success = ref<string | null>(null)
const choosableVenues = ref<ChoosableVenue[]>([])
provide('choosableVenues', choosableVenues)

const loadChoosableVenues = async () => {
    try {
        const { data } = await apiFetch<ChoosableVenue[]>('/api/admin/user/choosable-event-venues')
        choosableVenues.value = Array.isArray(data) ? data : []
        error.value = null
    } catch (err) {
        console.error(err)
        error.value = t('error_fetch_data_failed')
        choosableVenues.value = []
    }
}

onMounted(() => {
    void loadChoosableVenues()
})

const handleSubmit = async () => {
}

const clearError = () => {
    if (error.value) {
        error.value = null
    }
}
</script>

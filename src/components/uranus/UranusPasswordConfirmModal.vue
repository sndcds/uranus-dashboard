<template>
  <UranusModal
    :show="show"
    :title="title"
    :description="description"
    max-width="520px"
    @close="$emit('cancel')"
  >
    <form :id="formId" @submit.prevent="handleSubmit" class="uranus-form">
      <UranusFormRow v-if="timeSeries > 1">
        <span class="form-label">{{ t('delete_time_series_question') }}</span>

        <UranusRadioButton
            v-model="seriesChoice"
            value="single"
            name="time-series"
            style="margin-left: 12px"
        >
          {{ t('delete_time_series_option_single') }}
        </UranusRadioButton>

        <UranusRadioButton
            v-model="seriesChoice"
            value="series"
            name="time-series"
            style="margin-left: 12px"
        >
          {{ t('delete_time_series_option_series', { count: timeSeries }) }}
        </UranusRadioButton>

      </UranusFormRow>

      <UranusFormRow>
        <UranusPasswordInput
            v-model="password"
            id="password"
            required
            :label="t('enter_password_to_confirm')"
        />
      </UranusFormRow>

      <UranusErrorMessage v-if="error" :message="error" />
    </form>

    <template #actions>
      <div class="modal-actions">
        <UranusActionButton type="button" @click="$emit('cancel')">
          {{ t('cancel') }}
        </UranusActionButton>
        <UranusActionButton type="submit" :form="formId" :disabled="isSubmitting">
          {{ isSubmitting ? loadingText : confirmText }}
        </UranusActionButton>
      </div>
    </template>
  </UranusModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import UranusModal from '@/components/uranus/UranusModal.vue'
import UranusRadioButton from "@/components/ui/UranusRadioButton.vue";
import UranusActionButton from "@/components/ui/UranusActionButton.vue";
import UranusFormRow from "@/components/ui/UranusFormRow.vue";
import UranusPasswordInput from "@/components/ui/UranusPasswordInput.vue";
import UranusErrorMessage from "@/components/ui/UranusErrorMessage.vue";

const { t } = useI18n()

interface Props {
    show: boolean
    title: string
    description: string
    confirmText: string
    loadingText: string
    error?: string
    isSubmitting?: boolean
    timeSeries?: number
}

const props = withDefaults(defineProps<Props>(), {
    error: '',
    isSubmitting: false,
    timeSeries: 1,
})

const emit = defineEmits<{
    confirm: [payload: { password: string; deleteSeries?: boolean }]
    cancel: []
}>()

const password = ref('')
const formId = `password-confirm-${Math.random().toString(36).slice(2, 9)}`
const seriesChoice = ref<'single' | 'series'>('single')

// Reset password when modal is closed
watch(() => props.show, (newValue) => {
    if (!newValue) {
        password.value = ''
        seriesChoice.value = 'single'
    }
})

const handleSubmit = () => {
  emit('confirm', {
    password: password.value,
    deleteSeries: props.timeSeries > 1 ? seriesChoice.value === 'series' : undefined,
  })
}
</script>

<style scoped lang="scss">
.uranus-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-field {
  display: flex;
  align-items: start;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
}


.modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
}

.radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.radio-option {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
</style>

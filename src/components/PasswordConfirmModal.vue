<template>
  <UranusModal
    :show="show"
    :title="title"
    :description="description"
    max-width="520px"
    @close="$emit('cancel')"
  >
    <form :id="formId" @submit.prevent="handleSubmit" class="modal-form">
      <div v-if="timeSeries > 1" class="form-field">
        <span class="form-label">{{ t('delete_time_series_question') }}</span>

        <UranusRadioButton
            v-model="seriesChoice"
            value="single"
            name="time-series"
        >
          {{ t('delete_time_series_option_single') }}
        </UranusRadioButton>

        <UranusRadioButton
            v-model="seriesChoice"
            value="series"
            name="time-series"
        >
          {{ t('delete_time_series_option_series', { count: timeSeries }) }}
        </UranusRadioButton>

      </div>

      <div class="form-field">
        <label for="password-input" class="form-label">
          {{ t('password') }}
        </label>
        <input
          id="password-input"
          v-model="password"
          type="password"
          class="form-input"
          :placeholder="t('enter_password_to_confirm')"
          required
          autofocus
        />
      </div>

      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </form>

    <template #actions>
      <div class="modal-actions">
        <button type="button" @click="$emit('cancel')" class="uranus-action-button">
          {{ t('cancel') }}
        </button>
        <button
          type="submit"
          :form="formId"
          :disabled="isSubmitting"
          class="uranus-action-button"
        >
          {{ isSubmitting ? loadingText : confirmText }}
        </button>
      </div>
    </template>
  </UranusModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import UranusModal from '@/components/uranus/UranusModal.vue'
import UranusRadioButton from "@/components/ui/UranusRadioButton.vue";

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
.modal-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-text);
}

.form-input {
    padding: 0.75rem;
    border: 2px solid var(--border-soft);
    border-radius: 0.375rem;
    font-size: 1rem;
    background: var(--surface-primary, #ffffff);
    color: var(--color-text, #000000);
    transition: border-color 0.2s ease;

    &:focus {
        outline: none;
        border-color: var(--accent-primary);
    }
}

.error-message {
    padding: 0.75rem;
    background: #fee2e2;
    color: #991b1b;
    border-radius: 0.375rem;
    font-size: 0.9rem;
}

.uranus-button--danger {
    background: #dc2626;
    color: white;
    border-color: #dc2626;

    &:hover:not(:disabled) {
        background: #b91c1c;
        border-color: #b91c1c;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
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
    font-size: 0.95rem;
    color: var(--color-text);
}
</style>

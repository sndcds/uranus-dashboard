<template>
  <UranusModal :show="show" :title="title" max-width="520px" @close="$emit('cancel')">
    <UranusForm :id="formId" @submit.prevent="handleSubmit">
      <span class="form-label">{{ question }}</span>

      <UranusFeedback :show="!!props.error" type="error">
        {{ props.error }}
      </UranusFeedback>

      <UranusFormRow v-if="options?.length" class="options">
        <UranusRadioButton
            v-for="opt in options"
            :key="opt.value"
            v-model="selectedOption"
            :value="opt.value"
            name="choice"
            style="margin-left: 12px"
        >
          {{ opt.label }}
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

      <UranusFormActions>
        <UranusButton type="button" @click="$emit('cancel')">
          {{ t('cancel') }}
        </UranusButton>
        <UranusButton type="submit" :form="formId" :disabled="isSubmitting">
          {{ isSubmitting ? loadingText : confirmText }}
        </UranusButton>
      </UranusFormActions>

    </UranusForm>

  </UranusModal>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusRadioButton from '@/component/ui/UranusRadioButton.vue'
import UranusFormRow from '@/component/ui/UranusFormRow.vue'
import UranusPasswordInput from '@/component/ui/UranusPasswordInput.vue'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusFeedback from '@/component/uranus/UranusFeedback.vue'
import UranusFormActions from '@/component/ui/UranusFormActions.vue'
import UranusForm from '@/component/ui/UranusForm.vue'

const { t } = useI18n({ useScope: 'global' })

const localError = ref('')

interface Option {
  label: string
  value: string | number
}

interface Props {
  show: boolean
  title: string
  confirmText: string
  loadingText: string
  isSubmitting?: boolean
  // Flexible mode: either single confirmation or multiple options
  error: string
  question?: string
  options?: Option[] | null
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
  question: '',
  options: null,
})

const emit = defineEmits<{
  confirm: [payload: { password: string; selectedOption?: string | number }]
  cancel: []
}>()

const question = computed(() => props.question ?? '')
const password = ref('')
const formId = `password-confirm-${Math.random().toString(36).slice(2, 9)}`
const selectedOption = ref(props.options?.[0]?.value ?? '')

// Reset form when modal closes
watch(() => props.show, (newValue) => {
  if (!newValue) {
    password.value = ''
    selectedOption.value = props.options?.[0]?.value ?? ''
  }
})

const handleSubmit = async () => {
  const payload: { password: string; selectedOption?: string | number } = {
    password: password.value,
  }

  if (props.options?.length) {
    payload.selectedOption = selectedOption.value
  }

  try {
    // Await the parent handler
    await emit('confirm', payload)
    localError.value = ''
  } catch (err: any) {
    // Show error inside UranusFeedback
    localError.value = err.message || t('unexpected_error')
  }
}

</script>
<style scoped lang="scss">
.uranus-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.options {
  display: flex;
  flex-direction: column;
}

.actions {
  display: flex;
  gap: 0.6rem;
}
</style>
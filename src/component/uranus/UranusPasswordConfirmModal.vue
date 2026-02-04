<template>
  <UranusModal
      :show="show"
      :title="title"
      max-width="520px"
      @close="$emit('cancel')"
  >
    <form :id="formId" @submit.prevent="handleSubmit" class="uranus-form">
      <span class="form-label">{{ question }}</span>

      <!-- Option Selection -->
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

      <!-- Password Input -->
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
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'

import UranusModal from '@/component/uranus/UranusModal.vue'
import UranusRadioButton from "@/component/ui/UranusRadioButton.vue";
import UranusActionButton from "@/component/ui/UranusActionButton.vue";
import UranusFormRow from "@/component/ui/UranusFormRow.vue";
import UranusPasswordInput from "@/component/ui/UranusPasswordInput.vue";
import UranusErrorMessage from "@/component/ui/UranusErrorMessage.vue";

const { t, locale } = useI18n({ useScope: 'global' })

interface Option {
  label: string
  value: string | number
}

interface Props {
  show: boolean
  title: string
  confirmText: string
  loadingText: string
  error?: string
  isSubmitting?: boolean
  // Flexible mode: either single confirmation or multiple options
  question?: string
  options?: Option[] | null
}

const props = withDefaults(defineProps<Props>(), {
  error: '',
  isSubmitting: false,
  question: '',
  options: null,
})

const emit = defineEmits<{
  confirm: [payload: { password: string; selectedOption?: string | number }]
  cancel: []
}>()

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



const handleSubmit = () => {
  emit('confirm', {
    password: password.value,
    selectedOption: props.options?.length ? selectedOption.value : undefined
  })
}

const question = computed(() => props.question ?? '')
</script>

<style scoped lang="scss">
.uranus-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.options {
  display: flex;
  flex-direction: column;
}
</style>
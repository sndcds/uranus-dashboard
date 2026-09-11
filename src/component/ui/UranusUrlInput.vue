<template>
  <div class="uranus-url-input">
    <UranusLabel :id="id" :label="label" :required="required">
      <input
          v-bind="$attrs"
          :id="id"
          ref="input"
          type="url"
          class="uranus-input"
          :value="value"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          :aria-required="required"
          :aria-invalid="!isValid"
          :aria-describedby="message ? `${id}-message` : undefined"
          @input="onInput"
          @blur="onBlur"
          @focus="emit('focus', $event)"
      />
    </UranusLabel>
    <p v-if="message" :id="`${id}-message`" class="uranus-field-error" aria-live="polite">
      {{ message }}
    </p>
    <div v-if="validation === 'missing-protocol'" class="uranus-url-input-protocols">
      <UranusButton
          v-for="protocol in protocols"
          :key="protocol"
          type="button"
          size="small"
          :disabled="disabled || readonly"
          @click="addProtocol(protocol)"
      >
        {{ uranusStringInterpolate(t('input_url_add_protocol'), { protocol }) }}
      </UranusButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'
import { useI18n } from 'vue-i18n'
import UranusButton from '@/component/ui/UranusButton.vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'
import { validateHttpUrl } from '@/util/url'
import {uranusStringInterpolate} from "@/util/string.ts";

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  id: string
  label?: string | undefined
  modelValue?: string | null | undefined
  placeholder?: string | undefined
  required?: boolean | undefined
  disabled?: boolean | undefined
  readonly?: boolean | undefined
}>(), {
  label: '',
  modelValue: '',
  placeholder: 'https://',
  required: false,
  disabled: false,
  readonly: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'validity-change': [valid: boolean]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

const { t } = useI18n({ useScope: 'global' })
const protocols = ['https://', 'http://'] as const
const input = ref<HTMLInputElement | null>(null)
const value = ref(props.modelValue ?? '')
const touched = ref(false)
const validation = computed(() => validateHttpUrl(value.value))
const isValid = computed(() => validation.value === 'valid' && (!props.required || !!value.value.trim()))
const validationMessage = computed(() => {
  if (isValid.value) return ''
  if (!value.value.trim()) return t('input_required')
  return t(validation.value === 'missing-protocol' ? 'input_url_missing_protocol' : 'input_invalid_url')
})
const message = computed(() => touched.value || !!value.value ? validationMessage.value : '')

watch(() => props.modelValue, (newValue) => {
  value.value = newValue ?? ''
  touched.value = false
})
watch(isValid, (valid) => emit('validity-change', valid), { immediate: true })
watchEffect(() => input.value?.setCustomValidity(validationMessage.value))

function updateValue(newValue: string) {
  value.value = newValue.trim()
  if (input.value) input.value.value = value.value
  if (value.value !== (props.modelValue ?? '')) emit('update:modelValue', value.value)
}

function onInput(event: Event) {
  updateValue((event.target as HTMLInputElement).value)
}

function onBlur(event: FocusEvent) {
  updateValue(value.value)
  touched.value = true
  emit('blur', event)
}

function addProtocol(protocol: typeof protocols[number]) {
  if (props.disabled || props.readonly) return
  updateValue(protocol + value.value.trim().replace(/^\/\//, ''))
  input.value?.focus()
}

// Call before saving through a custom button or a keyboard shortcut.
function validate(): boolean {
  updateValue(value.value)
  touched.value = true
  if (!isValid.value) input.value?.focus()
  return isValid.value
}

defineExpose({ validate, isValid })
</script>

<style scoped lang="scss">
.uranus-url-input {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;

  p {
    margin-block: 0;
  }
}

.uranus-url-input-protocols {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>

<template>
  <div class="uranus-textfield-wrapper">
    <UranusFieldLabel
        :id="id"
        :label="label"
        :required="required"
        :error="error"
    >
      <div class="uranus-input-container">
        <!-- Optional slot for icons/buttons inside input -->
        <slot name="prefix"></slot>

        <input
            :id="id"
            :type="type"
            :value="modelValue"
            :class="['uranus-input', sizeClass]"
            :placeholder="placeholder"
            :autocomplete="autocomplete"
            :required="required"
            :disabled="disabled"
            :readonly="readonly"
            :name="inputName"
            :aria-required="required ? 'true' : 'false'"
            :aria-invalid="!!error"
            :aria-describedby="error ? id + '-error' : undefined"
            v-bind="$attrs"
            @input="onInput"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
        />

        <slot name="suffix"></slot>
      </div>

      <!-- Error message -->
      <span v-if="error" :id="id + '-error'" class="uranus-error-msg">{{ error }}</span>
    </UranusFieldLabel>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UranusFieldLabel from './UranusFieldLabel.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: [String, Number, null], default: '' },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }, // tiny / normal / medium / big
  flex: { type: [Number, String], default: 1 },
  error: { type: String, default: undefined },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  name: { type: String, default: '' },
  nullableNumber: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

// Computed for size
const sizeClass = computed(() => {
  switch (props.size) {
    case 'tiny': return 'uranus-tiny-text'
    case 'medium': return 'uranus-medium-text'
    case 'big': return 'uranus-big-text'
    default: return ''
  }
})

// Computed for name attribute
const inputName = computed(() => props.name || undefined)

// Input handler
const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number | null = target.value

  if (props.type === 'number') {
    if (props.nullableNumber && value === '') {
      // Emit null if empty and flag is true
      value = null
    } else {
      const parsed = Number(value)
      value = isNaN(parsed) ? '' : parsed
    }
  }

  emit('update:modelValue', value)
}
</script>


<style lang="scss">
.uranus-textfield-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.uranus-input-container {
  display: flex;
  align-items: center;
  position: relative;
}

.uranus-error-msg {
  color: #f44336;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

</style>
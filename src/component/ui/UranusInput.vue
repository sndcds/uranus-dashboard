<template>
  <div class="uranus-textfield" :class="stateClass">

    <!-- Native label -->
    <label
        v-if="label"
        :for="id"
        class="uranus-label"
    >
      {{ label }}
      <span v-if="required" class="required">*</span>
    </label>

    <div class="uranus-input-wrapper">

      <!-- Prefix Icon -->
      <span v-if="prefixIcon" class="icon prefix">
        <component :is="prefixIcon" />
      </span>

      <!-- Input -->
      <input
          :id="id"
          :type="type"
          :value="modelValue"
          :placeholder="placeholder"
          :autocomplete="autocomplete"
          :required="required"
          :disabled="disabled"
          :readonly="readonly"
          :name="name || undefined"
          :aria-required="required"
          :aria-invalid="state === 'error'"
          :aria-describedby="message ? id + '-msg' : undefined"
          class="uranus-input"
          @input="onInput"
          @blur="$emit('blur', $event)"
          @focus="$emit('focus', $event)"
      />

      <!-- Suffix Icon -->
      <span v-if="suffixIcon" class="icon suffix">
        <component :is="suffixIcon" />
      </span>

      <!-- Validation Icon -->
      <span v-if="stateIcon" class="icon state">
        <component :is="stateIcon" />
      </span>
    </div>

    <!-- Message -->
    <p v-if="message" :id="id + '-msg'" class="uranus-message">
      {{ message }}
    </p>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { CheckCircle, AlertCircle } from 'lucide-vue-next'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  id: { type: String, required: true },
  modelValue: { type: [String, Number, null], default: '' },

  label: String,
  placeholder: String,
  type: { type: String, default: 'text' },

  required: Boolean,
  disabled: Boolean,
  readonly: Boolean,

  name: String,
  autocomplete: { type: String, default: 'off' },

  state: {
    type: String,
    default: 'default', // default | error | success
  },
  message: String,

  prefixIcon: Object,
  suffixIcon: Object,

  nullableNumber: Boolean,
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

// Computed

const stateClass = computed(() => ({
  'is-error': props.state === 'error',
  'is-success': props.state === 'success',
}))

const stateIcon = computed(() => {
  if (props.state === 'error') return AlertCircle
  if (props.state === 'success') return CheckCircle
  return null
})

function onInput(e: Event) {
  const target = e.target as HTMLInputElement
  let value: string | number | null = target.value

  if (props.type === 'number') {
    if (props.nullableNumber && value === '') {
      value = null
    } else {
      const parsed = Number(value)
      value = isNaN(parsed) ? '' : parsed
    }
  }

  emit('update:modelValue', value)
}
</script>

<style scoped lang="scss">
.uranus-textfield {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  width: 100%;
}

.uranus-label {
  font-size: 0.85rem;
  font-weight: 500;
  display: inline;
  margin-left: 0.5rem;
  color: var(--uranus-color-2);
}

.required {
  margin-left: 2px;
  color: var(--uranus-error-color);
}

.uranus-input-wrapper {
  display: flex;
  align-items: center;
  position: relative;
}

// Input

.uranus-input {
  width: 100%;
  height: 40px;
  padding: 0 0.75rem;
  border: var(--uranus-input-border);
  border-radius: var(--uranus-input-border-radius);
  background: var(--uranus-input-bg);
  transition: all 0.2s ease;
}

// Icons

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 100%;
  position: absolute;
}

.icon.prefix {
  left: 0;
}

.icon.suffix {
  right: 0;
}

.icon.state {
  right: 0.5rem;
}

// Padding adjustments
.icon.prefix ~ .uranus-input {
  padding-left: 2rem;
}

.icon.suffix ~ .uranus-input {
  padding-right: 2rem;
}

// States

.is-error .uranus-input {
  border-color: #f44336;
}

.is-success .uranus-input {
  border-color: #4caf50;
}

// Message

.uranus-message {
  font-size: 0.8rem;
}

.is-error .uranus-message {
  color: #f44336;
}

.is-success .uranus-message {
  color: #4caf50;
}
</style>
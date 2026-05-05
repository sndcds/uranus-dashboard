<template>
  <div class="uranus-textfield-wrapper">
    <UranusLabel
        :id="id"
        :label="label ?? ''"
        :required="required"
        :error="error"
    >
      <div class="uranus-input-container">
        <!-- Optional slot for icons/buttons inside input -->
        <slot name="prefix"></slot>

        <input
            :id="id"
            :type="type"
            :value="internalValue"
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
            @keydown.enter="onEnter"
            @blur="$emit('blur', $event)"
            @focus="$emit('focus', $event)"
        />

        <slot name="suffix"></slot>
      </div>
    </UranusLabel>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import UranusLabel from '@/component/ui/UranusLabel.vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: false },
  modelValue: { type: [String, Number, null], default: '' },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }, // tiny / normal / medium / big
  flex: { type: [Number, String], default: 1 },
  error: { type: String, default: undefined },
  placeholder: { type: String, default: '' },
  updateOn: { type: String, default: 'input' }, // 'input' | 'enter'
  autocomplete: { type: String, default: 'off' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  name: { type: String, default: '' },
  nullableNumber: { type: Boolean, default: false },
})

const emitValue = (rawValue: string) => {
  let value: string | number | null = rawValue
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


const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const internalValue = ref(props.modelValue)

watch(
    () => props.modelValue,
    (val) => {
      internalValue.value = val
    }
)

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

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  internalValue.value = target.value
  if (props.updateOn === 'input') {
    emitValue(target.value)
  }
}

const onEnter = () => {
  if (props.updateOn === 'enter') {
    emitValue(internalValue.value as string)
  }
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
</style>
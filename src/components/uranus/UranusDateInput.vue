<template>
    <div class="uranus-textfield-wrapper" :style="{ flex: flexValue }">
        <UranusFieldLabel
            :id="id"
            :label="label"
            :required="required"
            :error="error"
        >
            <input
                :id="id"
                type="date"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                :class="['uranus-text-input', sizeClass]"
                :placeholder="placeholder"
                :autocomplete="autocomplete"
                :aria-required="required ? 'true' : 'false'"
                :aria-invalid="error ? 'true' : 'false'"
                :required="required"
                :disabled="disabled"
                :name="inputName"
                v-bind="$attrs"
            />
        </UranusFieldLabel>
    </div>
</template>

<script setup>
import { computed } from 'vue'

import UranusFieldLabel from '@/components/uranus/UranusFieldLabel.vue'

defineOptions({
    inheritAttrs: false,
})

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  modelValue: { type: String, default: '' },
  required: { type: Boolean, default: false },
  size: { type: String, default: 'normal' }, // tiny / normal / big
  flex: { type: [Number, String], default: 1 },
  error: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  autocomplete: { type: String, default: 'off' },
  disabled: { type: Boolean, default: false },
  name: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

const flexValue = computed(() => {
    return typeof props.flex === 'number' ? `${props.flex}` : props.flex
})

const sizeClass = computed(() => {
    switch (props.size) {
        case 'tiny': return 'uranus-tiny-text'
        case 'big': return 'uranus-big-text'
        default: return ''
    }
})

const inputName = computed(() => props.name || undefined)
</script>

<style scoped>
:deep(.uranus-text-input) {
    padding: 0.5rem 1rem;
    font-size: 1rem;
}
</style>

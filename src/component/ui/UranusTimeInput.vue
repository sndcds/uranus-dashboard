<template>
    <div class="uranus-textfield-wrapper" :style="{ flex: flexValue }">
        <UranusFieldLabel
            :id="id"
            :label="label"
            :required="required"
            :error="error"
        >
            <input
                type="time"
                :id="id"
                :value="modelValue"
                :class="['uranus-text-input', sizeClass]"
                :placeholder="placeholder"
                :autocomplete="autocomplete"
                :aria-required="required ? 'true' : 'false'"
                :aria-invalid="error ? 'true' : 'false'"
                @input="$emit('update:modelValue', $event.target.value)"
            />
        </UranusFieldLabel>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import UranusFieldLabel from './UranusFieldLabel.vue'

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
</script>

<style scoped>
</style>
<template>
    <div class="uranus-textfield-wrapper">
        <UranusFieldLabel
            :id="id"
            :label="label"
            :required="required"
            :error="error"
        >
            <div class="input-with-toggle">
                <input
                    :id="id"
                    :type="passwordFieldType"
                    :value="modelValue"
                    @input="$emit('update:modelValue', $event.target.value)"
                    :class="[sizeClass]"
                    :aria-required="required ? 'true' : 'false'"
                    :aria-invalid="error ? 'true' : 'false'"
                    :autocomplete="autocompleteValue"
                />
                <button
                    type="button"
                    class="password-toggle"
                    :aria-label="passwordToggleLabel"
                    :title="passwordToggleLabel"
                    :aria-pressed="isPasswordVisible"
                    @click="togglePasswordVisibility"
                >
                    <svg v-if="isPasswordVisible" class="password-toggle__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                            d="M12 5c-5.5 0-9.6 4.2-10.9 6.6a1 1 0 000 .8C2.4 15.8 6.5 20 12 20a11 11 0 006.8-2.3l1.1 1.1a1 1 0 101.4-1.4l-18-18A1 1 0 001.9.9l3.2 3.2A11 11 0 0112 5zm0 12c-3.2 0-6.1-2.1-8.1-4.9A13.1 13.1 0 015 9.4l2.1 2.1a4 4 0 005.4 5.4l2 2A9 9 0 0112 17zm0-6a2 2 0 01.3 4l-2.3-2.3A2 2 0 0112 11zm9.6.6a15.5 15.5 0 01-3 3.6 1 1 0 01-1.4-1.4A13.4 13.4 0 0020.3 12a13.6 13.6 0 00-3.8-3.6 1 1 0 111.1-1.7 15.6 15.6 0 013 3.9 1 1 0 01.1.9z"
                        />
                    </svg>
                    <svg v-else class="password-toggle__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                            d="M12 5c5.5 0 9.6 4.2 10.9 6.6a1 1 0 010 .8C21.6 15.8 17.5 20 12 20S2.4 15.8 1.1 12.4a1 1 0 010-.8C2.4 9.2 6.5 5 12 5zm0 12c4.1 0 7.5-3.2 8.9-5-1.4-1.8-4.8-5-8.9-5S4.5 10.2 3.1 12c1.4 1.8 4.8 5 8.9 5zm0-9a4 4 0 110 8 4 4 0 010-8zm0 2a2 2 0 100 4 2 2 0 000-4z"
                        />
                    </svg>
                </button>
            </div>
        </UranusFieldLabel>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import UranusFieldLabel from './UranusFieldLabel.vue'

const props = defineProps({
    id: { type: String, required: true },
    label: { type: String, required: true },
    modelValue: { type: String, default: '' },
    required: { type: Boolean, default: false },
    size: { type: String, default: 'normal' }, // tiny / normal / big
    flex: { type: [Number, String], default: 1 },
    error: { type: String, default: '' },
    autocomplete: { type: String, default: 'current-password' }
})

const emit = defineEmits(['update:modelValue'])

const isPasswordVisible = ref(false)

const togglePasswordVisibility = () => {
    isPasswordVisible.value = !isPasswordVisible.value
}

const passwordFieldType = computed(() =>
    isPasswordVisible.value ? 'text' : 'password'
)

const passwordToggleLabel = computed(() =>
    isPasswordVisible.value ? 'Hide password' : 'Show password'
)

const flexValue = computed(() =>
    typeof props.flex === 'number' ? `${props.flex}` : props.flex
)

const sizeClass = computed(() => {
    switch (props.size) {
        case 'tiny': return 'uranus-tiny-text'
        case 'big': return 'uranus-big-text'
        default: return ''
    }
})

const autocompleteValue = computed(() => props.autocomplete)
</script>

<style scoped lang="scss">

.input-with-toggle {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-toggle input {
  flex: 1;
  width: 100%;
  padding-right: 2.5rem;
  box-sizing: border-box;
}

.password-toggle {
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}

.password-toggle__icon {
    width: 1.25rem;
    height: 1.25rem;
    fill: currentColor;
}
</style>
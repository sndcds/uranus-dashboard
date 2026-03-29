<template>
    <UranusLabel
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
          class="uranus-input"
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
        <EyeOff v-if="isPasswordVisible"/>
        <Eye v-else />
      </button>
    </div>
  </UranusLabel>
</template>

<script setup>
import { ref, computed } from 'vue'
import UranusLabel from './UranusLabel.vue'
import { Eye, EyeOff } from "lucide-vue-next";

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
<template>
  <label
      :for="id"
      class="uranus-label"
      :style="{ flex: props.flex ?? 1 }"
  >
    <span class="uranus-label-row">
      {{ label }}<Asterisk v-if="required" class="uranus-field-required" aria-hidden="true"/>
    </span>

    <slot />

    <span v-if="error" class="uranus-field-error">
      {{ error }}
    </span>
  </label>
</template>

<script setup>
import { Asterisk } from 'lucide-vue-next'

const props = defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  required: { type: Boolean, default: false },
  error: { type: String, default: '' },
  flex: { type: [String, Number], default: 1 }
})
</script>

<style lang="scss">
.uranus-field-error {
  margin-left: 0.5rem;
  color: var(--uranus-error-color) !important;
}

.uranus-field-required {
  width: 16px;
  margin: 0;
  color: var(--uranus-error-color) !important;
}

</style>
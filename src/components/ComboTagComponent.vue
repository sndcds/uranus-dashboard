<template>
  <div
      class="uranus-combo-tag"
      :class="[theme, { 'has-close': editable }]">
    {{ label }}
    <button
        v-if="editable"
        type="button"
        class="close-btn"
        @click="$emit('remove')"
        aria-label="Remove tag">
      ×
    </button>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  theme?: string
  label: string
  editable?: boolean
}>(), {
  theme: 'light',
  editable: false,
})

const emit = defineEmits<{
  (e: 'remove'): void
}>()
</script>

<style scoped lang="scss">
</style>
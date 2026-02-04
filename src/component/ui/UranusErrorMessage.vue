<!--
  UranusErrorMessage.vue
-->
<template>
  <div v-if="message" class="error-message">
    {{ message }}
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  message?: string
}>()
</script>

<style scoped lang="scss">
.error-message {
  padding: 0.75rem;
  background: var(--uranus-notify-error-bg);
  color: var(--uranus-notify-error-color);
  border-radius: 0.375rem;
  font-size: 0.9rem;
  line-height: 1.4;
}
</style>
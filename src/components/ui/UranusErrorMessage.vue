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
  background: #fee2e2;
  color: #991b1b;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  line-height: 1.4;
}
</style>
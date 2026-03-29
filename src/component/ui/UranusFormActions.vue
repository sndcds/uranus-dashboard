<template>
  <div class="tab-actions">
    <slot />
  </div>
</template>

<script setup lang="ts">
// no props needed (yet)
</script>

<style scoped lang="scss">
.tab-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1rem;
}
</style>
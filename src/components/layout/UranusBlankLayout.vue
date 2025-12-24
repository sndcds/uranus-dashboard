<template>
  <div class="blank-layout">
    <slot />
  </div>
</template>

<script setup lang="ts">
// No JS needed for this minimal layout
</script>

<style scoped>
.blank-layout {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: #000; /* optional for fullscreen slideshow */
}
</style>
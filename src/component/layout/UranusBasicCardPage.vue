<!--
  src/component/layout/UranusBasicCardPage.vue
-->

<template>
  <div class="content">
    <slot />
  </div>
</template>

<script setup>
// no logic needed
</script>

<style scoped>
.content {
  display: flex;
  width: 100%;
  min-height: 100vh;
  flex-direction: column;
  align-items: center;
}
</style>
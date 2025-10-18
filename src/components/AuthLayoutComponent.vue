<template>
  <div class="auth-layout">
    <div class="auth-container">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>
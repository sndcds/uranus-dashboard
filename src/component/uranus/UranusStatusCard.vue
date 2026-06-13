<!--
  src/component/uranus/UranusStatusCard.vue
-->

<template>
  <div class="uranus-card uranus-status">

    <!-- LOADING -->
    <div
        v-if="state === 'loading'"
        class="uranus-status__state uranus-status__state--loading"
    >
      <p v-if="title" class="uranus-status__title">
        {{ title }}
      </p>

      <div class="spinner" />

      <p v-if="loadingMessage">
        {{ loadingMessage }}
      </p>
    </div>

    <!-- SUCCESS -->
    <div
        v-else-if="state === 'success'"
        class="uranus-status__state uranus-status__state--success"
    >
      <p v-if="title" class="uranus-status__title">
        {{ title }}
      </p>

      <div class="success-icon">✓</div>

      <div class="uranus-status__content">
        <slot name="success">
          <!-- fallback -->
        </slot>
      </div>
    </div>

    <!-- ERROR -->
    <div
        v-else
        class="uranus-status__state uranus-status__state--error"
    >
      <p v-if="title" class="uranus-status__title">
        {{ title }}
      </p>

      <div class="error-icon">!</div>

      <div class="uranus-status__content">
        <slot name="error">
          <!-- fallback -->
        </slot>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
defineProps<{
  state: 'loading' | 'success' | 'error'
  title?: string
  loadingMessage?: string
}>()
</script>

<style scoped lang="scss">
.uranus-status {
  min-height: 200px;
  max-width: 800px;
  display: flex;
  align-items: center;
}

.uranus-status__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
  padding: 2rem;
}

.uranus-status__title {
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
  color: var(--uranus-color, #111827);
}

.uranus-status__content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
}

/* ICONS */
.success-icon,
.error-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: white;
  font-weight: bold;
}

.success-icon {
  background: #10b981;
}

.error-icon {
  background: #ef4444;
}

/* LOADING */
.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(79, 70, 229, 0.1);
  border-top-color: var(--accent-primary, #4f46e5);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
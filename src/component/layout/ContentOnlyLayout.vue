<template>
  <div class="content-only-layout">
    <!-- Main content only -->
    <main class="content-only-layout__main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

// Optional: dynamic class based on route meta
const contentClass = computed(() => {
  const mode = route.meta.layoutMode as string | undefined
  return [
    'content-only-layout__content',
    mode === 'zero-padding' ? 'zero-padding' : ''
  ].filter(Boolean).join(' ')
})
</script>

<style scoped lang="scss">
.content-only-layout {
  box-sizing: border-box;
  min-height: 100dvh;
  height: auto;
  background: var(--uranus-bg);
}

.content-only-layout__main {
  box-sizing: border-box;
  width: 100%;
  min-height: 100dvh;
  height: auto;
  background: var(--uranus-bg);
  padding: 0;
  max-width: 100%;
}

/* Optional zero padding mode */
.zero-padding {
  padding: 0 !important;
}
</style>
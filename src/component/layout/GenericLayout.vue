<template>
  <div class="app-layout">
    <!-- Header -->
    <GenericHeader @toggle-sidebar="toggleSidebar" />

    <div class="app-layout__body">
      <!-- Sidebar -->
      <GenericSidebar
          v-if="showSidebar"
          :is-open="isSidebarOpen"
          :is-admin-page="isAdminPage"
          @close="closeSidebar"
      />

      <!-- Overlay for mobile -->
      <div v-if="isSidebarOpen" class="overlay" @click="closeSidebar"></div>

      <!-- Main content -->
      <main class="app-layout__main">
        <div :class="contentClass">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Footer -->
    <GenericFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import GenericHeader from '@/component/layout/GenericHeader.vue'
import GenericSidebar from '@/component/layout/GenericSidebar.vue'
import GenericFooter from '@/component/layout/GenericFooter.vue'

const route = useRoute()

// Determine if we show admin sidebar
const isAdminPage = computed(() => route.path.startsWith('/admin'))
const showSidebar = computed(() => true) // toggle globally or per route if needed

// Classes
const contentClass = computed(() => {
  const mode = route.meta.layoutMode as string | undefined
  return [
    'app-layout__content',
    mode === 'zero-padding' ? 'zero-padding' : ''
  ].filter(Boolean).join(' ')
})

// Sidebar state
const isSidebarOpen = ref(false)
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value }
const closeSidebar = () => { isSidebarOpen.value = false }
</script>

<style scoped lang="scss">
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--uranus-bg);
}

/* Body: sidebar + main content */
.app-layout__body {
  display: flex;
  flex: 1;
  position: relative;
  min-height: 0; // allow flex children to shrink properly
}

/* Overlay for mobile */
.overlay {
  display: none;
  @media (max-width: 768px) {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 100;
  }
}

/* Main content area */
.app-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--uranus-bg);
}

/* Inner content wrapper */
.app-layout__content {
  flex: 1;
  padding: 2rem;
  width: 100%;
  max-width: 100%;

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

/* Optional zero padding mode */
.zero-padding {
  padding: 0;
}
</style>
<template>
    <div class="generic-layout">
        <GenericHeader @toggle-sidebar="toggleSidebar" />

        <div class="generic-layout__container">
            <GenericSidebar :is-open="isSidebarOpen" :is-admin-page="isAdminPage" @close="closeSidebar" />

            <!-- Overlay for mobile -->
            <div v-if="isSidebarOpen" class="generic-layout__overlay" @click="closeSidebar"></div>

            <main class="generic-layout__main">
                <div :class="layoutClass">
                    <router-view />
                </div>

                <GenericFooter />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

import GenericHeader from '@/component/layout/GenericHeader.vue'
import GenericSidebar from '@/component/layout/GenericSidebar.vue'
import GenericFooter from '@/component/layout/GenericFooter.vue'

const route = useRoute()

// Check if we're on an admin page
const isAdminPage = computed(() => route.path.startsWith('/admin'))

const layoutClass = computed(() => {
  const mode = route.meta.layoutMode as string | undefined
  return [
    'generic-layout__content',
    mode === 'zero-padding' ? 'generic-layout__zero-padding' : ''
  ].filter(Boolean).join(' ')
})

const isSidebarOpen = ref(false)

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
    isSidebarOpen.value = false
}
</script>

<style scoped lang="scss">
.generic-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--uranus-nav-bg);
}

// Main Container
.generic-layout__container {
    display: flex;
    flex: 1;
    position: relative;
}

// Overlay for mobile
.generic-layout__overlay {
    display: none;

    @media (max-width: 768px) {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1050;
    }
}

// Main Content
.generic-layout__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.generic-layout__content {
  flex: 1;
  padding: 2rem;
  max-width: 100%;
  width:100%;
  background-color: var(--uranus-dashboard-bg);

  @media (max-width: 768px) {
    padding: 1rem;
  }
}

.generic-layout__zero-padding {
  padding: 0;
}

</style>

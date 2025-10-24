<template>
  <button type="button" class="sidebar__hamburger" :class="{ 'sidebar__hamburger--hidden': isOpen }"
    @click="toggleSidebar" :aria-label="isOpen ? 'Close menu' : 'Open menu'" aria-expanded="false">
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  </button>

  <div v-if="isOpen" class="sidebar__overlay" @click="closeSidebar"></div>

  <aside class="sidebar" :class="{ 'sidebar--open': isOpen }">
    <!-- Sidebar content -->
    <div class="sidebar__content">
      <div class="user-profile">
        <img src="https://i.pravatar.cc/250?u=mail@ashallendesign.co.uk" alt="User Profile" class="profile-image" />
        <span class="user-name">{{ userStore.displayName }}</span>
      </div>

      <nav class="sidebar__nav">
        <SidebarOptionComponent v-for="option in options" :key="option.id" :option="option"
          :active="option.route === activeRoute" @change="handleOptionChange" />
        <OrganizerChooserMenu />
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import SidebarOptionComponent from './SidebarOptionComponent.vue'
import { useUserStore } from '@/store/userStore'
import type { SidebarOption } from '@/types/types'
import OrganizerChooserMenu from './OrganizerChooserMenu.vue'

const props = defineProps<{
  options: SidebarOption[]
}>()

const emit = defineEmits<{
  change: [id: string]
}>()

const route = useRoute()
const userStore = useUserStore()

// Mobile sidebar state
const isOpen = ref(false)

// track the currently active route
const activeRoute = ref(route.path)

watch(route, (newRoute) => {
  activeRoute.value = newRoute.path
  // Close sidebar on route change (mobile)
  isOpen.value = false
})

// Mobile sidebar methods
const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const closeSidebar = () => {
  isOpen.value = false
}

const handleOptionChange = (optionId: string) => {
  emit('change', optionId)
  // Close sidebar after navigation on mobile
  isOpen.value = false
}
</script>

<style scoped lang="scss">
// Mobile-first: Hidden sidebar by default
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: var(--card-bg);
  border-right: 1px solid var(--border-soft);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 1000;
  display: flex;
  flex-direction: column;

  // Mobile: Overlay mode
  &.sidebar--open {
    transform: translateX(0);
  }
}

// Hamburger button - visible on mobile, positioned near edge
.sidebar__hamburger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;
  position: fixed;
  top: 1rem;
  left: 0.5rem; // Position near left edge but visible (8px from left)
  width: 44px;
  height: 44px;
  background: var(--card-bg);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  cursor: pointer;
  z-index: 1001;
  transition: all 0.2s ease;

  &:hover {
    background: var(--surface-muted);
    border-color: var(--accent-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
  }
}

// Hide hamburger on tablet and up
@media (min-width: 768px) {
  .sidebar__hamburger {
    display: none;
  }
}

// Hide hamburger when sidebar is open on mobile
.sidebar__hamburger--hidden {
  display: none;
}

.hamburger-line {
  width: 20px;
  height: 2px;
  background: var(--color-text);
  transition: all 0.3s ease;
  border-radius: 1px;
}

// Sidebar content
.sidebar__content {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  flex: 1;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
}

.profile-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--accent-primary);
}

.user-name {
  font-weight: 600;
  color: var(--color-text);
  font-size: 0.95rem;
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

// Mobile overlay
.sidebar__overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  backdrop-filter: blur(2px);
}

// Tablet and up: Show sidebar by default, hide hamburger
@media (min-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 280px;
    transform: translateX(0);
    border-radius: 0;

    &.sidebar--open {
      transform: translateX(0);
    }
  }

  .sidebar__hamburger {
    display: none;
  }

  .sidebar__overlay {
    display: none;
  }
}

// Desktop: Enhanced styling
@media (min-width: 1024px) {
  .sidebar {
    width: 320px;
  }

  .user-profile {
    padding: 1.25rem;
  }

  .profile-image {
    width: 48px;
    height: 48px;
  }

  .user-name {
    font-size: 1rem;
  }
}
</style>
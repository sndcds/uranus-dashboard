<template>
  <aside
      class="generic-sidebar"
      :class="{ 'generic-sidebar--open': isOpen, 'generic-sidebar--admin': isAdminPage }"
  >
    <nav class="generic-sidebar__nav">
      <!-- Admin Navigation -->
      <template v-if="isAdminPage">

        <router-link to="/admin/dashboard" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M520-600v-240h320v240H520ZM120-440v-400h320v400H120Zm400 320v-400h320v400H520Zm-400 0v-240h320v240H120Z"/></svg>          </span>
          <span class="generic-sidebar__nav-text">{{ t('nav_dashboard') }}</span>
        </router-link>

        <router-link
            to="/admin/todo-list"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="m438-240 226-226-58-58-169 169-84-84-57 57 142 142ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('nav_todo_list') }}</span>
        </router-link>

        <router-link to="/admin/organizations" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z"/></svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('nav_organizations') }}</span>
        </router-link>

        <router-link :to="venuesRoute" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M120-680v-160l160 80-160 80Zm600 0v-160l160 80-160 80Zm-280-40v-160l160 80-160 80ZM360-85q-52-5-102-15t-89.5-24.5Q129-139 104.5-158T80-200v-360q0-25 31.5-46.5t85.5-38q54-16.5 127-26t156-9.5q83 0 156 9.5t127 26q54 16.5 85.5 38T880-560v360q0 23-24.5 42t-64 33.5Q752-110 702-100T600-85v-195H360v195Zm120-435q97 0 167.5-11.5T760-558q0-5-76-23.5T480-600q-128 0-204 18.5T200-558q42 15 112.5 26.5T480-520Z"/></svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('nav_venues') }}</span>
        </router-link>

        <router-link :to="eventsRoute" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M580-240q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Z"/></svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('nav_events') }}</span>
        </router-link>

        <!--router-link to="/admin/settings" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('settings') }}</span>
        </router-link-->
      </template>

      <!-- Visitor Navigation -->
      <template v-else>
        <router-link v-if="tokenStore.isAuthenticated" to="/admin/dashboard" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('dashboard') }}</span>
        </router-link>
        <router-link to="/" class="generic-sidebar__nav-item" :class="{ 'generic-sidebar__nav-item--active': route.path === '/' }" exact @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('nav_events') }}</span>
        </router-link>
        <router-link to="/map" class="generic-sidebar__nav-item" active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"
                fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('nav_map') }}</span>
        </router-link>

        <router-link to="/about" class="generic-sidebar__nav-item" active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('nav_about') }}</span>
        </router-link>

        <router-link v-if="!tokenStore.isAuthenticated" to="/app/login" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11 7L9.6 8.4l2.6 2.6H2v2h10.2l-2.6 2.6L11 17l5-5-5-5zm9 12h-8v2h8c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-8v2h8v14z"
                fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('nav_login') }}</span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/appStore'
import { useTokenStore } from '@/store/tokenStore'

interface Props {
  isOpen: boolean
  isAdminPage: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
}>()

const { t } = useI18n()
const route = useRoute()
const appStore = useAppStore()
const tokenStore = useTokenStore()

const handleLinkClick = () => {
  emit('close')
}

// Dynamic routes based on organizationId
const venuesRoute = computed(() => {
  return `/admin/organization/${appStore.organizationId}/venues`
})

const eventsRoute = computed(() => {
  return `/admin/organization/${appStore.organizationId}/events`
})
</script>

<style scoped lang="scss">
.generic-sidebar {
  width: 250px;
  background: var(--surface-primary);
  border-right: 1px solid var(--border-soft);
  padding: 1.5rem 0;
  overflow-y: auto;
  transition: transform 0.3s ease;

  // Sticky positioning on desktop
  @media (min-width: 769px) {
    position: sticky;
    top: 80px;
    max-height: 100vh;
    align-self: flex-start;
  }

  // Hide visitor sidebar on desktop (shown only on mobile)
  &:not(.generic-sidebar--admin) {
    @media (min-width: 769px) {
      display: none;
    }
  }

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 1100;
    transform: translateX(-100%);
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

    &--open {
      transform: translateX(0);
    }
  }
}

.generic-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0 0.75rem;
  overflow: hidden;
}

.generic-sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  color: var(--color-text);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:hover {
    background: var(--uranus-surface-muted);
    color: var(--accent-primary);
  }

  &--active {
    background: var(--accent-muted);
    color: var(--accent-primary);
    font-weight: 600;
  }
}

.generic-sidebar__nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.generic-sidebar__nav-text {
  flex: 1;
}
</style>

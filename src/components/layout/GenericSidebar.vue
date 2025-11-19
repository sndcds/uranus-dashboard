<template>
  <aside class="generic-sidebar" :class="{ 'generic-sidebar--open': isOpen, 'generic-sidebar--admin': isAdminPage }">
    <nav class="generic-sidebar__nav">
      <!-- Admin Navigation -->
      <template v-if="isAdminPage">
        <router-link to="/admin/dashboard" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('dashboard') }}</span>
        </router-link>

        <router-link to="/admin/organizers" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('organizers') }}</span>
        </router-link>

        <router-link :to="venuesRoute" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('venues') }}</span>
        </router-link>

        <router-link :to="eventsRoute" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
                fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('events') }}</span>
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
          <span class="generic-sidebar__nav-text">{{ t('events') }}</span>
        </router-link>
        <router-link to="/map" class="generic-sidebar__nav-item" active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"
                fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('visitor_nav_map') }}</span>
        </router-link>

        <router-link to="/about" class="generic-sidebar__nav-item" active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <span class="generic-sidebar__nav-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="currentColor" />
            </svg>
          </span>
          <span class="generic-sidebar__nav-text">{{ t('visitor_nav_about') }}</span>
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
          <span class="generic-sidebar__nav-text">{{ t('visitor_nav_login') }}</span>
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

// Dynamic routes based on organizerId
const venuesRoute = computed(() => {
  return appStore.organizerId
    ? `/admin/organizer/${appStore.organizerId}/venues`
    : '/admin/organizer/venues/empty'
})

const eventsRoute = computed(() => {
  return appStore.organizerId
    ? `/admin/organizer/${appStore.organizerId}/events`
    : '/admin/organizer/events/empty'
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
    background: var(--surface-muted);
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

<template>
  <aside
      class="generic-sidebar"
      :class="{ 'generic-sidebar--open': isOpen, 'generic-sidebar--admin': isAdminPage }"
  >
    <nav class="generic-sidebar__nav">
      <!-- Admin Navigation -->
      <template v-if="isAdminPage">

        <router-link
            to="/admin/dashboard"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick"
        >
          <LayoutDashboard class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_dashboard') }}</span>
        </router-link>

        <router-link
            to="/admin/todo-list"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick"
        >
          <ListChecks class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_todo_list') }}</span>
        </router-link>

        <router-link
            to="/admin/organizations"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick"
        >
          <Building class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_organizations') }}</span>
        </router-link>

        <router-link :to="venuesRoute" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <Spotlight class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_venues') }}</span>
        </router-link>

        <router-link :to="eventsRoute" class="generic-sidebar__nav-item"
          active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
          <Calendar class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_events') }}</span>
        </router-link>
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

        <router-link to="/page/about" class="generic-sidebar__nav-item" active-class="generic-sidebar__nav-item--active" @click="handleLinkClick">
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
import { useAppStore } from '@/store/appStore.ts'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { LayoutDashboard, ListChecks, Building, Spotlight, Calendar } from 'lucide-vue-next'

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
  return `/admin/organization/${appStore.orgUuid}/venues`
})

const eventsRoute = computed(() => {
  return `/admin/organization/${appStore.orgUuid}/events`
})
</script>

<style scoped lang="scss">
.generic-sidebar {
  width: 250px;
  border-right: var(--uranus-dashboard-border-width) solid var(--uranus-dashboard-border-color);
  padding: 1.5rem 0;
  overflow-y: auto;
  transition: transform 0.3s ease;
  background: var(--uranus-nav-bg);
  height: calc(100vh - 80px);

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
    height: calc(100vh);

    &--open {
      transform: translateX(0);
    }
  }
}

.generic-sidebar__nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  overflow: hidden;
}

.generic-sidebar__nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  color: var(--uranus-nav-color);

  &:hover {
    color: var(--uranus-nav-color-hover);
    background: var(--uranus-nav-bg-hover);
  }

  &--active,
  &--active:hover {
    color: var(--uranus-nav-color-active);
    background: var(--uranus-nav-bg-active);
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

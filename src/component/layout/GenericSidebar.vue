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
            to="/admin/orgs"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick"
        >
          <Building class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_orgs') }}</span>
        </router-link>

        <router-link
            to="/admin/org/venues"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active" @click="handleLinkClick"
        >
          <MapPin class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_venues') }}</span>
        </router-link>

        <router-link
            to="/admin/org/events"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick">
          <Calendar class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_events') }}</span>
        </router-link>

        <hr>

        <router-link
            to="/admin/org/partners"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick"
        >
          <Handshake class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_partners') }}</span>
        </router-link>

        <router-link
            to="/admin/org/portals"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick">
          <Orbit class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_portals') }}</span>
        </router-link>

        <router-link
            to="/admin/org/favorite-lists"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick">
          <ListPlus class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_favorite_lists') }}</span>
        </router-link>

        <router-link
            to="/page/help"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick">
          <MessageCircleQuestionMark class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_help') }}</span>
        </router-link>
      </template>

      <!-- Visitor Navigation -->
      <template v-else>
        <router-link
            to="/"
            class="generic-sidebar__nav-item"
            :class="{ 'generic-sidebar__nav-item--active': route.path === '/' }"
            exact
            @click="handleLinkClick"
        >
          <Calendar class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_events') }}</span>
        </router-link>

        <router-link
            to="/map"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick"
        >
          <Map class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_map') }}</span>
        </router-link>

        <router-link
            to="/page/about"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick"
        >
          <Info class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ t('nav_about') }}</span>
        </router-link>

        <router-link
            v-if="!tokenStore.isAuthenticated"
            :to="authEntryRoute"
            class="generic-sidebar__nav-item"
            active-class="generic-sidebar__nav-item--active"
            @click="handleLinkClick"
        >
          <LogIn class="generic-sidebar__nav-icon"/>
          <span class="generic-sidebar__nav-text">{{ authEntryLabel }}</span>
        </router-link>
      </template>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { Info, LayoutDashboard, ListChecks, Building, Handshake, MapPin, Map, Calendar, Orbit, LogIn, ListPlus, MessageCircleQuestionMark } from 'lucide-vue-next'

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
const tokenStore = useTokenStore()
const authEntryRoute = computed(() => tokenStore.hasKnownAccount ? '/app/login' : '/app/signup')
const authEntryLabel = computed(() => tokenStore.hasKnownAccount ? t('nav_login') : t('nav_signup'))

const handleLinkClick = () => {
  emit('close')
}

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

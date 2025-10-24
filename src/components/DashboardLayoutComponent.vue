<template>
  <div class="dashboard-layout">
    <div class="sidebar-container">
      <SidebarComponent :options="sidebarOptions" @change="onSidebarChange" />
    </div>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SidebarComponent from './SidebarComponent.vue'
import type { SidebarOption } from '@/types/types'
import { useTokenStore } from "@/store/token"
import { useAppStore } from "@/store/appStore"

const router = useRouter()
const { t } = useI18n()
const tokenStore = useTokenStore()
const appStore = useAppStore()

const sidebarOptions = computed<SidebarOption[]>(() => [
  { id: 'dashboard', label: t('dashboard'), icon: '', route: '/' },
  { id: 'organizers', label: t('organizers'), icon: '', route: '/organizers' },
  { id: 'venues', label: t('venues'), icon: '', route: `/organizer/${appStore.organizerId ?? ''}/venues` },
  { id: 'events', label: t('events'), icon: '', route: `/organizer/${appStore.organizerId ?? ''}/events` },
  { id: 'settings', label: t('settings'), icon: '', route: '/settings' },
  { id: 'logout', label: t('logout'), icon: '', route: '' },
])

function onSidebarChange(id: string) {
  const option = sidebarOptions.value.find(o => o.id === id)
  if (option) {
    if (option.id === 'logout') {
      logout()
      return
    }
    if (option?.route) router.push(option.route)
  }
}

function logout() {
  tokenStore.clearTokens()
  router.push('/login')
}
</script>

<style scoped>
/* Mobile-first: Full width layout, sidebar hidden by default */
.dashboard-layout {
  min-height: 100vh;
  position: relative;
}

.sidebar-container {
  position: relative;
  width: 280px;
}

/* Mobile: Main content takes full width, with top padding for hamburger */
.main-content {
  width: 100%;
  min-height: 100vh;
  background: var(--page-gradient);
  padding: 5rem 1rem 2rem 1rem;
  /* Top padding for hamburger button */
}

/* Tablet and up: Sidebar layout */
@media (min-width: 768px) {
  .dashboard-layout {
    display: flex;
  }

  .main-content {
    flex: 1;
    padding: 2rem;
    margin-left: 0;
  }
}

/* Desktop: Enhanced spacing */
@media (min-width: 1024px) {
  .main-content {
    padding: 2.5rem;
  }
}
</style>

<template>
  <div class="uranus-dashboard-layout">
    <UranusAppMenu :options="sidebarOptions" @change="onSidebarChange" />

    <main class="uranus-main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { SidebarOption } from '@/types/types'
import { useTokenStore } from "@/store/token"
import { useAppStore } from "@/store/appStore"

import UranusAppMenu from "@/components/uranus/UranusAppMenu.vue"

const router = useRouter()
const { t } = useI18n()
const tokenStore = useTokenStore()
const appStore = useAppStore()

const sidebarOptions = computed<SidebarOption[]>(() => [
  { id: 'dashboard', label: t('dashboard'), icon: '', route: '/admin/dashboard' },
  { id: 'organizers', label: t('organizers'), icon: '', route: '/admin/organizers' },
  { 
    id: 'venues', 
    label: t('venues'), 
    icon: '', 
    route: appStore.organizerId 
      ? `/admin/organizer/${appStore.organizerId}/venues` 
      : '/admin/organizer/venues/empty' 
  },
  { 
    id: 'events', 
    label: t('events'), 
    icon: '', 
    route: appStore.organizerId 
      ? `/admin/organizer/${appStore.organizerId}/events` 
      : '/admin/organizer/events/empty' 
  },
  { id: 'settings', label: t('settings'), icon: '', route: '/admin/settings' }
])

function onSidebarChange(id: string) {
  if (id === 'logout') {
    logout()
  }
}

function logout() {
  tokenStore.clearTokens()
  router.push('/app/login')
}
</script>

<style scoped>
.uranus-dashboard-layout {
  position: relative;
}

.uranus-dashboard-layout {
  display: flex;
  flex-direction: row;
  min-height: 100vh;
}

/* Default (mobile) — sidebar overlays */
.uranus-main-content {
  flex: 1;
  width: 100%;
  transition: margin-left 0.3s ease;
}

/* Desktop and up — sidebar pushes content */
@media (min-width: 768px) {
  .uranus-main-content {
    margin-left: var(--uranus-app-menu-width);
  }
}
</style>

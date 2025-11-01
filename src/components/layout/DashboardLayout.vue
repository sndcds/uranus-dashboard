<template>
  <div class="uranus-dashboard-layout">
    <!--div class="sidebar-container">
      <SidebarComponent :options="sidebarOptions" @change="onSidebarChange" />
    </div-->
    <UranusAppMenu
        :options="sidebarOptions"
        @change="onSidebarChange" />
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

import SidebarComponent from '@/components/SidebarComponent.vue'
import UranusAppMenu from "@/components/uranus/UranusAppMenu.vue";

const router = useRouter()
const { t } = useI18n()
const tokenStore = useTokenStore()
const appStore = useAppStore()

const sidebarOptions = computed<SidebarOption[]>(() => [
  { id: 'dashboard', label: t('dashboard'), icon: '', route: '/' },
  { id: 'organizers', label: t('organizers'), icon: '', route: '/organizers' },
  { id: 'venues', label: t('venues'), icon: '', route: `/organizer/${appStore.organizerId ?? ''}/venues` },
  { id: 'events', label: t('events'), icon: '', route: `/organizer/${appStore.organizerId ?? ''}/events` },
  { id: 'settings', label: t('settings'), icon: '', route: '/settings' }
])

function onSidebarChange(id: string) {
  if (id === 'logout') {
    logout()
  }
}

function logout() {
  tokenStore.clearTokens()
  router.push('/login')
}
</script>

<style scoped>
/* Mobile-first: Full width layout, sidebar hidden by default */
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

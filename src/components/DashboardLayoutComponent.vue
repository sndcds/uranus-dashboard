<template>
  <div class="dashboard-layout">
    <SidebarComponent :options="sidebarOptions" @change="onSidebarChange" />
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
import { useTokenStore } from "@/store/token";
import { useAppStore } from "@/store/appStore";

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
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.main-content {
  flex: 1;
  background: linear-gradient(135deg, #f4f5ff, #edf9ff);
  padding: 24px;
}

</style>

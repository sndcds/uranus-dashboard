<template>
  <div class="dashboard-layout">
    <Sidebar :options="sidebarOptions" @change="onSidebarChange" />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Sidebar from './Sidebar.vue'
import type { SidebarOption } from '@/types'

const router = useRouter()
const { t } = useI18n()

const sidebarOptions: SidebarOption[] = [
  { id: 'dashboard', label: 'Dashboard', icon: '', route: '/' },
  { id: 'venues', label: t('venues'), icon: '', route: '/venues' },
  { id: 'settings', label: t('settings'), icon: '', route: '/settings' },
]

function onSidebarChange(id: string) {
  const option = sidebarOptions.find(o => o.id === id)
  if (option?.route) router.push(option.route)
}
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  position: sticky;
  top: 0;
  height: 100vh;
}

.main-content {
  flex: 1;
  padding: 24px;
  /* scroll happens naturally in browser, no overflow */
}
</style>
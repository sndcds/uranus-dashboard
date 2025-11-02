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
      <div class="user-profile" role="button" tabindex="0" aria-haspopup="true" :aria-expanded="isUserMenuOpen"
        @click="toggleUserMenu" @keydown.enter.prevent="toggleUserMenu" @keydown.space.prevent="toggleUserMenu">
        <img :src="avatarSrc" @error="onAvatarError" alt="User Profile" class="profile-image" />
        <span class="user-name">{{ userStore.displayName }}</span>

        <svg class="user-profile__chevron" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M3.22 5.22a.75.75 0 011.06 0L8 8.94l3.72-3.72a.75.75 0 011.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 010-1.06z"
            fill="currentColor"
          />
        </svg>
      </div>

      <transition name="fade">
        <div v-if="isUserMenuOpen" class="user-menu">
          <router-link to="/admin/user/messages/inbox" class="user-menu__link" @click="handleProfileClick">
            {{ t('user_messages_inbox') }}
          </router-link>
          <router-link to="/admin/user/messages/send" class="user-menu__link" @click="handleProfileClick">
            {{ t('user_messages_send') }}
          </router-link>
          <router-link to="/admin/user/profile" class="user-menu__link" @click="handleProfileClick">
            {{ t('user_profile') }}
          </router-link>
          <router-link to="/admin/user/permissions" class="user-menu__link" @click="handlePermissionsClick">
            {{ t('permissions') }}
          </router-link>
          <button type="button" class="user-menu__link user-menu__link--danger" @click="handleLogout">
            {{ t('logout') }}
          </button>
        </div>
      </transition>

      <nav class="sidebar__nav">
        <SidebarOptionComponent v-for="option in options" :key="option.id" :option="option"
          :active="option.route === activeRoute" @change="handleOptionChange" />
        <OrganizerChooserMenu />
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import type { SidebarOption } from '@/types/types'

import SidebarOptionComponent from './SidebarOptionComponent.vue'
import OrganizerChooserMenu from './OrganizerChooserMenu.vue'

const props = defineProps<{
  options: SidebarOption[]
}>()

const emit = defineEmits<{
  change: [id: string]
}>()

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const avatarErrored = ref(false)
const { t } = useI18n({ useScope: 'global' })

const avatarSrc = computed(() => {
  if (avatarErrored.value || !userStore.userId) {
    return '/default-avatar.webp'
  }
  const base = `${import.meta.env.VITE_API_URL}/api/user/${userStore.userId}/avatar/64`
  return userStore.avatarVersion ? `${base}?v=${userStore.avatarVersion}` : base
})

// Mobile sidebar state
const isOpen = ref(false)
const isUserMenuOpen = ref(false)

// track the currently active route
const activeRoute = ref(route.path)

watch(
  () => route.path,
  (newPath) => {
    activeRoute.value = newPath
    // Close sidebar on route change (mobile)
    isOpen.value = false
    isUserMenuOpen.value = false
  }
)

watch(
  () => [userStore.avatarVersion, userStore.userId],
  () => {
    avatarErrored.value = false
  }
)

function onAvatarError(event: Event) {
  avatarErrored.value = true
}

// Mobile sidebar methods
const toggleSidebar = () => {
  isOpen.value = !isOpen.value
}

const closeSidebar = () => {
  isOpen.value = false
  isUserMenuOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const handleProfileClick = async () => {
  closeUserMenu()
  isOpen.value = false
}

const handlePermissionsClick = async () => {
  closeUserMenu()
  if (route.path !== '/admin/user/permissions') {
    try {
      await router.push('/admin/user/permissions')
    } catch (err) {
      console.warn('Navigation aborted for permissions route', err)
    }
  }
  isOpen.value = false
}

const handleLogout = () => {
  emit('change', 'logout')
  closeUserMenu()
  isOpen.value = false
}

const onGlobalClick = (event: MouseEvent) => {
  if (!isUserMenuOpen.value) {
    return
  }

  const target = event.target as HTMLElement | null
  if (!target) {
    return
  }

  const profile = document.querySelector('.user-profile')
  const menu = document.querySelector('.user-menu')

  if (profile && profile.contains(target)) {
    return
  }

  if (menu && menu.contains(target)) {
    return
  }

  closeUserMenu()
}

onMounted(() => {
  window.addEventListener('click', onGlobalClick)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', onGlobalClick)
})

const handleOptionChange = async (optionId: string) => {
  const selectedOption = props.options.find((option) => option.id === optionId)

  if (!selectedOption) {
    return
  }

  if (selectedOption.id === 'logout') {
    emit('change', optionId)
    isOpen.value = false
    return
  }

  if (selectedOption.route && selectedOption.route !== activeRoute.value) {
    try {
      await router.push(selectedOption.route)
    } catch (err) {
      console.warn('Navigation aborted for route:', selectedOption.route, err)
    }
  }

  emit('change', optionId)
  // Close sidebar after navigation on mobile
  isOpen.value = false
  isUserMenuOpen.value = false
}
</script>

<style scoped lang="scss">
// Mobile-first: Hidden sidebar by default
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  max-width: 260px;
  background: var(--card-bg);
  background: transparent;
  border-right: 0px solid var(--border-soft);
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
  background: white;
  flex: 1;
  gap: 0;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.75rem;
  padding: 1rem;
  position: relative;
  transition: background 0.2s ease;

  &:hover,
  &:focus-visible {
    background: var(--surface-muted);
    outline: none;
  }
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

.user-profile__chevron {
  margin-left: auto;
  width: 1rem;
  height: 1rem;
  fill: var(--muted-text);
  transition: transform 0.2s ease;
  transform: rotate(0deg);
}

.user-profile[aria-expanded='true'] .user-profile__chevron {
  transform: rotate(180deg);
}

.user-menu {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin: 0;
  padding: 0.75rem;
  background: var(--card-bg);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
}

.user-menu__link {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  color: var(--color-text);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
  font: inherit;

  &:hover,
  &:focus-visible {
    background: var(--surface-muted);
    color: var(--accent-primary);
    outline: none;
  }

  &--danger {
    color: #dc2626;

    &:hover,
    &:focus-visible {
      background: rgba(220, 38, 38, 0.1);
      color: #b91c1c;
    }
  }
}

.sidebar__nav {
  display: flex;
  flex-direction: column;
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
}

// Tablet and up: Show sidebar by default, hide hamburger
@media (min-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 320px;
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

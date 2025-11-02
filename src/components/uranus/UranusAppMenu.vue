<template>
  <button type="button" class="uranus-app-menu-hamburger" :class="{ 'uranus-app-menu-hamburger-hidden': isOpen }"
    @click="toggleSidebar" :aria-label="isOpen ? 'Close menu' : 'Open menu'" aria-expanded="false">
    <span class="uranus-app-menu-hamburger-line"></span>
    <span class="uranus-app-menu-hamburger-line"></span>
    <span class="uranus-app-menu-hamburger-line"></span>
  </button>

  <div v-if="isOpen" class="uranus-app-menu-overlay" @click="closeSidebar">
  </div>

  <aside class="uranus-app-menu" :class="{ 'uranus-app-menu-open': isOpen }">

    <div class="user-profile-wrapper">
      <div
          class="user-profile"
          role="button"
          tabindex="0"
          aria-haspopup="true"
          :aria-expanded="isUserMenuOpen"
          @click="toggleUserMenu"
          @keydown.enter.prevent="toggleUserMenu"
          @keydown.space.prevent="toggleUserMenu">
        <img :src="avatarSrc" @error="onAvatarError" alt="User Profile" class="profile-image" />
        <span class="user-name">{{ userStore.displayName }}</span>

        <svg class="user-profile-chevron" viewBox="0 0 16 16" aria-hidden="true">
          <path
              d="M3.22 5.22a.75.75 0 011.06 0L8 8.94l3.72-3.72a.75.75 0 011.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 010-1.06z"
              fill="currentColor" />
        </svg>
      </div>

      <transition name="fade">
        <div v-if="isUserMenuOpen" class="user-menu">
          <router-link to="/admin/user/messages/inbox" class="user-menu-link" @click="handleProfileClick">
            {{ t('user_messages_inbox') }}
          </router-link>
          <router-link to="/admin/user/messages/send" class="user-menu-link" @click="handleProfileClick">
            {{ t('user_messages_send') }}
          </router-link>
          <router-link to="/admin/user/profile" class="user-menu-link" @click="handleProfileClick">
            {{ t('user_profile') }}
          </router-link>
          <router-link to="/admin/user/permissions" class="user-menu-link" @click="handlePermissionsClick">
            {{ t('permissions') }}
          </router-link>
          <button type="button" class="user-menu-link user-menu-link-danger" @click="handleLogout">
            {{ t('logout') }}
          </button>
        </div>
      </transition>

    </div>

    <nav class="uranus-app-menu-nav">
      <SidebarOptionComponent v-for="option in options" :key="option.id" :option="option"
                              :active="option.route === activeRoute" @change="handleOptionChange" />
    </nav>

  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import type { SidebarOption } from '@/types/types'

import SidebarOptionComponent from '@/components/SidebarOptionComponent.vue'

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
.user-profile {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0;
  padding-right: 0.4rem;
  gap: 0.5rem;
  cursor: pointer;
  background: var(--uranus-bg-color);;
  transition: background 0.2s ease;

  &:hover,
  &:focus-visible {
    background: var(--uranus-low-contrast-color);
    outline: none;
  }
}

.user-profile[aria-expanded='true'] {
  background: var(--uranus-low-contrast-color);
}

.user-profile-chevron {
  margin-left: auto;
  width: 20px;
  height: 20px;
  color: var(--uranus-color);
  transition: transform 0.2s ease;
  transform: rotate(0deg);
}

.user-profile[aria-expanded='true'] .user-profile-chevron {
  transform: rotate(180deg);
}

.user-profile-wrapper {
  position: relative; /* anchor for the absolute menu */
}

.user-menu {
  position: absolute;
  top: 100%; /* directly below the profile button */
  left: 0;
  width: 260px;
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: var(--uranus-low-contrast-color);
  border-radius: 4px;
  min-width: 200px; /* optional: control menu width */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.user-menu-link {
  display: block;          /* ensure full width like links */
  width: 100%;
  padding: 0.4rem 1.4rem;
  text-align: left;        /* align text like links */
  color: var(--uranus-color);
  background: transparent;
  border: none;            /* remove button border */
  outline: none;
  cursor: pointer;
  text-decoration: none;   /* remove underline if any */
  font: inherit;           /* match link font */
  transition: background 0.2s ease;

  &:hover {
    background: var(--uranus-medium-contrast-color);
  }
}

.user-menu-link.user-menu-link-danger {
  color: var(--uranus-error-color);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

</style>

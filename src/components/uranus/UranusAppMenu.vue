<template>
  <button
      type="button"
      class="uranus-app-menu-hamburger"
      :class="{ 'uranus-app-menu-hamburger-hidden': isOpen }"
      @click="toggleSidebar"
      :aria-label="isOpen ? 'Close menu' : 'Open menu'" aria-expanded="false">
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
    <span class="hamburger-line"></span>
  </button>

  <div v-if="isOpen"
       class="uranus-app-menu-overlay"
       @click="closeSidebar">
  </div>

  <aside
      class="uranus-app-menu"
      :class="{ 'uranus-app-menu-open': isOpen }">

    <!-- Sidebar content -->
    <div class="uranus-app-menu-content">
      <div
          class="user-profile"
          role="button"
          tabindex="0"
          aria-haspopup="true"
          :aria-expanded="isUserMenuOpen"
           @click="toggleUserMenu"
          @keydown.enter.prevent="toggleUserMenu"
          @keydown.space.prevent="toggleUserMenu">
        <img
            :src="avatarSrc"
            @error="onAvatarError"
            alt="User Profile"
            class="profile-image" />
        <span class="user-name">{{ userStore.displayName }}</span>

        <svg class="user-profile__chevron" viewBox="0 0 16 16" aria-hidden="true">
          <path
              d="M3.22 5.22a.75.75 0 011.06 0L8 8.94l3.72-3.72a.75.75 0 011.06 1.06l-4.25 4.25a.75.75 0 01-1.06 0l-4.25-4.25a.75.75 0 010-1.06z"
              fill="currentColor"
          />
        </svg>
      </div>

      <div name="fade">
        <div v-if="isUserMenuOpen" class="user-menu">
          <router-link
              to="/user/messages/inbox"
              class="user-menu__link"
              @click="handleProfileClick">
            {{ t('user_messages_inbox') }}
          </router-link>
          <router-link
              to="/user/messages/send"
              class="user-menu__link"
              @click="handleProfileClick">
            {{ t('user_messages_send') }}
          </router-link>
          <router-link
              to="/user/profile"
              class="user-menu__link"
              @click="handleProfileClick">
            {{ t('user_profile') }}
          </router-link>
          <router-link
              to="/user/permissions"
              class="user-menu__link"
              @click="handlePermissionsClick">
            {{ t('permissions') }}
          </router-link>
          <button type="button" class="user-menu__link user-menu__link--danger" @click="handleLogout">
            {{ t('logout') }}
          </button>
        </div>
      </div>

      <nav class="uranus-app-menu-nav">
        <SidebarOptionComponent
            v-for="option in options"
            :key="option.id"
            :option="option"
            :active="option.route === activeRoute"
            @change="handleOptionChange" />
        <!--OrganizerChooserMenu /-->
      </nav>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/userStore'
import type { SidebarOption } from '@../types/types'

import SidebarOptionComponent from '@/components/SidebarOptionComponent.vue'
import OrganizerChooserMenu from '@/components/OrganizerChooserMenu.vue'

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
  if (route.path !== '/user/permissions') {
    try {
      await router.push('/user/permissions')
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
</style>

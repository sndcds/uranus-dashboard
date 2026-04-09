<template>
  <header class="generic-header">

    <div class="generic-header__content">
      <!-- Logo / Brand -->
      <div class="generic-header__brand">
        <UranusLogo />

        <!-- Visitor Navigation -->
        <nav v-if="!isAdminPage" class="generic-header__nav">
          <router-link
              v-if="tokenStore.isAuthenticated"
              to="/admin/dashboard"
              class="generic-header__nav-link"
              active-class="generic-header__nav-link--active">
            {{ t('dashboard') }}
          </router-link>

          <router-link
              to="/"
              class="generic-header__nav-link"
              :class="{ 'generic-header__nav-link--active': route.path === '/' }" exact>
            {{ t('events') }}
          </router-link>

          <router-link
              to="/map"
              class="generic-header__nav-link"
              active-class="generic-header__nav-link--active">
            {{ t('nav_map') }}
          </router-link>

          <router-link
              to="/page/about"
              class="generic-header__nav-link"
              active-class="generic-header__nav-link--active">
            {{ t('nav_about') }}
          </router-link>

          <router-link
              v-if="!tokenStore.isAuthenticated"
              to="/app/login"
              class="generic-header__nav-link"
              active-class="generic-header__nav-link--active">
            {{ t('nav_login') }}
          </router-link>
        </nav>
        <nav v-else class="generic-header__nav">
          <router-link
              to="/"
              class="generic-header__nav-link"
              :class="{ 'generic-header__nav-link--active': route.path === '/' }" exact>
            {{ t('events') }}
          </router-link>
        </nav>
      </div>

      <!-- Header Actions -->
      <div class="generic-header__actions">
        <button class="generic-header__menu-toggle" @click="emit('toggle-sidebar')"
            :aria-label="t('toggle_menu')">
          <Menu />
        </button>

        <!-- Settings Menu (Theme & Language - Always Visible) -->
        <div class="generic-header__settings-menu">
          <button class="generic-header__settings-trigger" @click="toggleSettingsMenu"
              :aria-expanded="isSettingsMenuOpen" :aria-label="t('settings')">
            <Settings />
          </button>

          <!-- Settings Dropdown -->
          <div v-if="isSettingsMenuOpen" class="generic-header__settings-dropdown" @click="closeSettingsMenu">
            <!-- Theme Switcher -->
            <div class="generic-header__dropdown-section">
              <div class="generic-header__dropdown-options">
                <button @click.stop="setTheme('light')" class="generic-header__dropdown-option"
                    :class="{ 'generic-header__dropdown-option--active': currentTheme === 'light' }">
                  <Sun />
                  {{ t('settings_theme_light') }}
                </button>
                  <button @click.stop="setTheme('dark')" class="generic-header__dropdown-option"
                      :class="{ 'generic-header__dropdown-option--active': currentTheme === 'dark' }">
                      <Moon />
                    {{ t('settings_theme_dark') }}
                  </button>
              </div>
            </div>

            <div class="generic-header__dropdown-divider"></div>

            <!-- Language Switcher -->
            <div class="generic-header__dropdown-section">
              <div class="generic-header__dropdown-options">
                <button @click.stop="setLanguage('de')" class="generic-header__dropdown-option"
                    :class="{ 'generic-header__dropdown-option--active': currentLocale === 'de' }">
                  Deutsch
                </button>
                <button @click.stop="setLanguage('da')" class="generic-header__dropdown-option"
                        :class="{ 'generic-header__dropdown-option--active': currentLocale === 'da' }">
                  Dansk
                </button>
                <button @click.stop="setLanguage('en')" class="generic-header__dropdown-option"
                  :class="{ 'generic-header__dropdown-option--active': currentLocale === 'en' }">
                  English
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- User Menu (Only when authenticated) -->
        <div v-if="tokenStore.isAuthenticated" class="generic-header__user-menu">
          <button
              class="generic-header__user-trigger"
              @click="toggleUserMenu"
              :aria-expanded="isUserMenuOpen"
              :aria-label="t('user_profile')">
            <img v-if="userAvatarUrl" :src="userAvatarUrl" :alt="userName" class="generic-header__user-avatar" />
            <div v-else class="generic-header__user-avatar-placeholder">
              {{ userInitials }}
            </div>
            <span class="generic-header__user-name">{{ userName }}</span>
            <svg class="generic-header__user-caret"
                :class="{ 'generic-header__user-caret--open': isUserMenuOpen }" width="16" height="16"
                viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 6l4 4 4-4z" />
            </svg>
          </button>

          <!-- Dropdown Menu -->
          <div v-if="isUserMenuOpen" class="generic-header__user-dropdown" @click="closeUserMenu">
            <div class="generic-header__user-dropdown-header">
              <div class="generic-header__user-dropdown-info">
                <div class="generic-header__user-dropdown-name">{{ userName }}</div>
              </div>
            </div>

            <div class="generic-header__user-dropdown-divider"></div>

            <nav class="generic-header__user-dropdown-nav">
              <router-link
                  to="/admin/user/messages/inbox"
                  class="generic-header__user-dropdown-item"
              >
                <Inbox />
                {{ t('user_messages_inbox') }}
              </router-link>

            <router-link
                to="/admin/user/messages/send"
                class="generic-header__user-dropdown-item"
            >
              <Send />
              {{ t('user_messages_send') }}
            </router-link>

            <router-link to="/admin/user/profile" class="generic-header__user-dropdown-item">
              <UserRoundCog />
              {{ t('user_profile') }}
            </router-link>
          </nav>

          <div class="generic-header__user-dropdown-divider"></div>

          <button @click="handleLogout"
            class="generic-header__user-dropdown-item generic-header__user-dropdown-item--logout">
            <LogOut />
            {{ t('logout') }}
          </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { apiFetch, type LoginResponse } from '@/api.ts'
import { applyTheme } from '@/util/theme.ts'
import { Inbox, Send, UserRoundCog, LogOut, Settings, Menu, Sun, Moon } from 'lucide-vue-next'
import { useTokenStore } from '@/store/uranusTokenStore.ts'
import { useUserStore } from '@/store/userStore.ts'
import { useThemeStore } from '@/store/uranusThemeStore.ts'
import UranusLogo from '@/component/ui/UranusLogo.vue'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const tokenStore = useTokenStore()
const userStore = useUserStore()
const themeStore = useThemeStore()

const emit = defineEmits<{
    'toggle-sidebar': []
}>()

const isUserMenuOpen = ref(false)
const isSettingsMenuOpen = ref(false)

// Theme and locale
const currentTheme = ref<'light' | 'dark'>('light')
const currentLocale = computed(() => locale.value)

// Check if we're on an admin page
const isAdminPage = computed(() => route.path.startsWith('/admin'))

// User data
const userName = computed(() => userStore.displayName || 'User')
const userAvatarUrl = computed({
  get: () => userStore.userAvatarUrl,
  set: (avatarUrl) => userStore.setUserAvatarUrl(avatarUrl)
})


const userInitials = computed(() => {
  const name = userName.value
  const names = name.split(' ').filter(n => n.length > 0)
  if (names.length >= 2) {
    const first = names[0]?.[0]
    const last = names[names.length - 1]?.[0]
    if (first && last) {
      return (first + last).toUpperCase()
    }
  }
  return name.substring(0, 2).toUpperCase()
})

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
  isUserMenuOpen.value = false
}

const toggleSettingsMenu = () => {
  isSettingsMenuOpen.value = !isSettingsMenuOpen.value
}

const closeSettingsMenu = () => {
  isSettingsMenuOpen.value = false
}

// Theme switching
const setTheme = async (theme: 'light' | 'dark') => {
  currentTheme.value = theme
  applyTheme(theme)
  themeStore.setTheme(theme)

  // Save to API if authenticated
  if (tokenStore.isAuthenticated) {
    try {
      await apiFetch('/api/admin/user/settings', {
        method: 'PUT',
        body: JSON.stringify({
          theme: theme,
          locale: currentLocale.value
        })
      })
    } catch (err) {
      console.error('Failed to save theme setting:', err)
    }
  }
}

// Language switching
const setLanguage = async (lang: string) => {
  locale.value = lang
  localStorage.setItem('app-locale', lang)

  // Save to API if authenticated
  if (tokenStore.isAuthenticated) {
    try {
      await apiFetch('/api/admin/user/settings', {
        method: 'PUT',
        body: JSON.stringify({
          theme: currentTheme.value,
          locale: lang
        })
      })
    } catch (err) {
      console.error('Failed to save language setting:', err)
    }
  }
}

// Fetch user profile data
const fetchUserProfile = async () => {
  if (!tokenStore.isAuthenticated) return

  try {
    const { response } = await apiFetch<any>('/api/admin/user/profile')
    if (response) {
      const payload: LoginResponse = response.data
      userStore.setUserUuid(payload.user_uuid)
      userStore.setDisplayName(payload.display_name ?? '')
      userStore.setUserAvatarUrl(payload.avatar_url ?? null)
    }
  } catch (err) {
    console.error('Failed to fetch user profile:', err)
  }
}

// Initialize theme and locale from storage
const initializePreferences = () => {
  const storedTheme = themeStore.theme
  if (storedTheme) {
    currentTheme.value = storedTheme
    applyTheme(storedTheme)
  }

  const storedLocale = localStorage.getItem('app-locale')
  if (storedLocale) {
    locale.value = storedLocale
  }
}

// Close menus when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (isUserMenuOpen.value && !target.closest('.generic-header__user-menu')) {
    closeUserMenu()
  }
  if (isSettingsMenuOpen.value && !target.closest('.generic-header__settings-menu')) {
    closeSettingsMenu()
  }
}

const handleLogout = () => {
  tokenStore.clearTokens()
  userStore.resetUserState()
  router.push('/app/login')
}

// Watch for authentication state changes
watch(() => tokenStore.isAuthenticated, (isAuthenticated) => {
  if (isAuthenticated) {
    fetchUserProfile()
  }
})

// Watch the Pinia store value
watch(
  () => userStore.userAvatarUrl,
  (newAvatar) => {
    userAvatarUrl.value = newAvatar
  },
  { immediate: true } // update immediately on component mount
)

onMounted(() => {
  initializePreferences()
  fetchUserProfile()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  try {
    document.removeEventListener('click', handleClickOutside)
  } catch (err) {
    console.error("Unmount error in GenericHeader:", err)
  }
})
</script>

<style scoped lang="scss">
.generic-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--surface-primary);
  border-bottom: var(--uranus-dashboard-border-width) solid var(--uranus-dashboard-border-color);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  margin-bottom: 0;
}

.generic-header__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  max-width: 100%;
  background: var(--uranus-nav-bg);
}

.generic-header__brand {
  display: flex;
  align-items: center;
}

.generic-header__logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--accent-primary);
  transition: all 0.2s ease;

  &:hover {
    color: var(--accent-secondary);
    transform: translateY(-1px);
  }
}

.generic-header__logo-icon {
  flex-shrink: 0;
  transition: transform 0.3s ease;

  .generic-header__logo:hover & {
    transform: rotate(15deg);
  }
}

.generic-header__logo-text {
  display: inline-block;
}

// Visitor Navigation
.generic-header__nav {
  display: none;
  margin-left: 2rem;
  gap: 0.5rem;

  @media (min-width: 769px) {
    display: flex;
    align-items: center;
  }
}

.generic-header__nav-link {
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.8rem 1rem;
  border-radius: 0.375rem;
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

.generic-header__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.generic-header__menu-toggle,
.generic-header__settings-trigger {
  display: none;
  color: var(--uranus-nav-color);
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--uranus-nav-color-hover);
  }

  @media (max-width: 768px) {
    display: flex;
  }
}

.generic-header__settings-trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;

  &:hover {
    background: var(--uranus-nav-bg-hover);
  }
}

// Settings Menu
.generic-header__settings-menu {
  position: relative;
}

.generic-header__settings-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 240px;
  background: var(--uranus-nav-bg);
  border: 1px solid var(--uranus-dashboard-border-color);
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1200;
  overflow: hidden;
  animation: dropdown-fade-in 0.2s ease;
}

.generic-header__dropdown-section {
  padding: 0.75rem 0;
}

.generic-header__dropdown-section-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--uranus-muted-text);
  text-transform: uppercase;
  letter-spacing: 0.05em;

  svg {
    opacity: 0.6;
  }
}

.generic-header__dropdown-options {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.25rem 0;
}

.generic-header__dropdown-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  font-size: 0.9rem;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;

  svg {
    flex-shrink: 0;
    opacity: 0.7;
  }

  &:not(&--active):hover {
    background: var(--uranus-nav-bg-hover);
  }

  &--active {
    background: var(--uranus-nav-bg-active);
    color: var(--uranus-nav-color-active);
    &::before {
      content: '✓';
      position: absolute;
      right: 1rem;
      font-weight: bold;
    }
  }
}

.generic-header__dropdown-divider {
  height: 1px;
  background: var(--uranus-dashboard-border-color);
  margin: 0.5rem 0;
}

// User Menu
.generic-header__user-menu {
  position: relative;
}

.generic-header__user-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem;
  background: none;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: var(--uranus-nav-bg-hover);
  }

  @media (max-width: 640px) {
    .generic-header__user-name {
      display: none;
    }
  }
}

.generic-header__user-avatar,
.generic-header__user-avatar-placeholder {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
}

.generic-header__user-avatar {
  object-fit: cover;
  border: 2px solid var(--uranus-dashboard-border-color);
}

.generic-header__user-avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--uranus-color);
  font-weight: 600;
  font-size: 0.85rem;
  border: 1px solid var(--uranus-dashboard-border-color);
}

.generic-header__user-name {
  font-size: 0.9rem;
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--uranus-nav-color)
}

.generic-header__user-caret {
  flex-shrink: 0;
  transition: transform 0.2s ease;

  &--open {
    transform: rotate(180deg);
  }
}

.generic-header__user-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 240px;
  background: var(--uranus-nav-bg);
  border: 1px solid var(--uranus-dashboard-border-color);
  border-radius: 0.5rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 1200;
  overflow: hidden;
  animation: dropdown-fade-in 0.2s ease;
}

@keyframes dropdown-fade-in {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.generic-header__user-dropdown-header {
  padding: 0.75rem 1rem;
}

.generic-header__user-dropdown-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.generic-header__user-dropdown-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.generic-header__user-dropdown-email {
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.generic-header__user-dropdown-divider {
  height: 1px;
  background: var(--uranus-dashboard-border-color);
  margin: 0.5rem 0;
}

.generic-header__user-dropdown-nav {
  display: flex;
  flex-direction: column;
  padding: 0.25rem 0;
}

.generic-header__user-dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1rem;
  font-size: 0.9rem;
  text-decoration: none;
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.15s ease;
  color: var(--uranus-nav-color);

  svg {
    flex-shrink: 0;
    opacity: 0.7;
  }

  &:hover {
    background: var(--uranus-nav-bg-hover);
  }

  &--logout {
    color: #dc2626;

    &:hover {
      background: rgba(220, 38, 38, 0.1);
    }
  }
}

</style>

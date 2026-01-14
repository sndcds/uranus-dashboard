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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" />
          </svg>
        </button>

        <!-- Settings Menu (Theme & Language - Always Visible) -->
        <div class="generic-header__settings-menu">
          <button class="generic-header__settings-trigger" @click="toggleSettingsMenu"
              :aria-expanded="isSettingsMenuOpen" :aria-label="t('settings')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path
                  d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
            </svg>
          </button>

          <!-- Settings Dropdown -->
          <div v-if="isSettingsMenuOpen" class="generic-header__settings-dropdown" @click="closeSettingsMenu">
            <!-- Theme Switcher -->
            <div class="generic-header__dropdown-section">
              <div class="generic-header__dropdown-section-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path
                      d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
                </svg>
                {{ t('settings_theme') }}
              </div>
                <div class="generic-header__dropdown-options">
                  <button @click.stop="setTheme('light')" class="generic-header__dropdown-option"
                      :class="{ 'generic-header__dropdown-option--active': currentTheme === 'light' }">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path
                          d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                    </svg>
                    {{ t('settings_theme_light') }}
                  </button>
                    <button @click.stop="setTheme('dark')" class="generic-header__dropdown-option"
                        :class="{ 'generic-header__dropdown-option--active': currentTheme === 'dark' }">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
                      </svg>
                      {{ t('settings_theme_dark') }}
                    </button>
                </div>
            </div>

            <div class="generic-header__dropdown-divider"></div>

            <!-- Language Switcher -->
            <div class="generic-header__dropdown-section">
              <div class="generic-header__dropdown-section-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path
                      d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                </svg>
                {{ t('language') }}
              </div>
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
          <button class="generic-header__user-trigger" @click="toggleUserMenu" :aria-expanded="isUserMenuOpen"
              :aria-label="t('user_profile')">
              <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="generic-header__user-avatar" />
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
                <div class="generic-header__user-dropdown-email">{{ userEmail }}</div>
              </div>
            </div>

            <div class="generic-header__user-dropdown-divider"></div>

            <nav class="generic-header__user-dropdown-nav">
              <router-link to="/admin/user/messages/inbox" class="generic-header__user-dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path
                      d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
                {{ t('user_messages_inbox') }}
            </router-link>

            <router-link to="/admin/user/messages/send" class="generic-header__user-dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
              {{ t('user_messages_send') }}
            </router-link>

            <router-link to="/admin/user/profile" class="generic-header__user-dropdown-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
              </svg>
              {{ t('user_profile') }}
            </router-link>
          </nav>

          <div class="generic-header__user-dropdown-divider"></div>

          <button @click="handleLogout"
            class="generic-header__user-dropdown-item generic-header__user-dropdown-item--logout">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                  d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
            </svg>
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
import { useTokenStore } from '@/store/tokenStore.ts'
import { apiFetch } from '@/api.ts'
import { applyTheme } from '@/utils/theme.ts'
import { useUserStore } from '@/store/userStore.ts'

import UranusLogo from '@/components/ui/UranusLogo.vue'
import { useEventsFilterStore } from '@/store/eventsFilterStore.ts'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const tokenStore = useTokenStore()
const userStore = useUserStore()
const eventsFilterStore = useEventsFilterStore()

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
const userEmail = computed(() => userStore.emailAddress)
const userAvatar = computed({
  get: () => userStore.userAvatar,
  set: (avatarUrl) => userStore.setUserAvatar(avatarUrl)
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
  localStorage.setItem('app-theme', theme)

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
    const { data } = await apiFetch<{
      display_name: string
      email_address: string
      avatar_url: string | null
      user_id: number
    }>('/api/admin/user/profile')

    if (data) {
      userStore.setUserId(data.user_id)
      userStore.setDisplayName(data.display_name)
      userStore.setEmailAddress(data.email_address)
      userStore.setUserAvatar(data.avatar_url)
    }
  } catch (err) {
    console.error('Failed to fetch user profile:', err)
  }
}

// Initialize theme and locale from storage
const initializePreferences = () => {
  const storedTheme = localStorage.getItem('app-theme') as 'light' | 'dark' | null
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
  () => userStore.userAvatar,
  (newAvatar) => {
    userAvatar.value = newAvatar
  },
  { immediate: true } // update immediately on component mount
)

onMounted(() => {
  initializePreferences()
  fetchUserProfile()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
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
  background: var(--accent-primary);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  border: 2px solid var(--accent-primary);
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

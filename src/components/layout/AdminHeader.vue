<template>
    <header class="admin-header">
        <div class="admin-header__content">
            <!-- Logo / Brand -->
            <div class="admin-header__brand">
                <router-link to="/" class="admin-header__logo">
                    <span class="admin-header__logo-text">Uranus</span>
                </router-link>
            </div>

            <!-- Header Actions -->
            <div class="admin-header__actions">
                <button class="admin-header__menu-toggle" @click="emit('toggle-sidebar')" :aria-label="t('toggle_menu')">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 12h18M3 6h18M3 18h18" stroke="currentColor" stroke-width="2"
                            stroke-linecap="round" />
                    </svg>
                </button>

                <!-- User Menu -->
                <div class="admin-header__user-menu">
                    <button class="admin-header__user-trigger" @click="toggleUserMenu" :aria-expanded="isUserMenuOpen"
                        :aria-label="t('user_profile')">
                        <img v-if="userAvatar" :src="userAvatar" :alt="userName" class="admin-header__user-avatar" />
                        <div v-else class="admin-header__user-avatar-placeholder">
                            {{ userInitials }}
                        </div>
                        <span class="admin-header__user-name">{{ userName }}</span>
                        <svg class="admin-header__user-caret" :class="{ 'admin-header__user-caret--open': isUserMenuOpen }"
                            width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M4 6l4 4 4-4z" />
                        </svg>
                    </button>

                    <!-- Dropdown Menu -->
                    <div v-if="isUserMenuOpen" class="admin-header__user-dropdown" @click="closeUserMenu">
                        <div class="admin-header__user-dropdown-header">
                            <div class="admin-header__user-dropdown-info">
                                <div class="admin-header__user-dropdown-name">{{ userName }}</div>
                                <div class="admin-header__user-dropdown-email">{{ userEmail }}</div>
                            </div>
                        </div>

                        <div class="admin-header__user-dropdown-divider"></div>

                        <nav class="admin-header__user-dropdown-nav">
                            <router-link to="/admin/user/messages/inbox" class="admin-header__user-dropdown-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                                </svg>
                                {{ t('user_messages_inbox') }}
                            </router-link>

                            <router-link to="/admin/user/messages/send" class="admin-header__user-dropdown-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                                {{ t('user_messages_send') }}
                            </router-link>

                            <router-link to="/admin/user/profile" class="admin-header__user-dropdown-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                                </svg>
                                {{ t('user_profile') }}
                            </router-link>

                            <router-link to="/admin/user/permissions" class="admin-header__user-dropdown-item">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                                </svg>
                                {{ t('permissions') }}
                            </router-link>
                        </nav>

                        <div class="admin-header__user-dropdown-divider"></div>

                        <!-- Theme Switcher -->
                        <div class="admin-header__user-dropdown-section">
                            <div class="admin-header__user-dropdown-section-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
                                </svg>
                                {{ t('settings_theme') }}
                            </div>
                            <div class="admin-header__user-dropdown-options">
                                <button @click.stop="setTheme('light')" class="admin-header__user-dropdown-option"
                                    :class="{ 'admin-header__user-dropdown-option--active': currentTheme === 'light' }">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path
                                            d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
                                    </svg>
                                    {{ t('settings_theme_light') }}
                                </button>
                                <button @click.stop="setTheme('dark')" class="admin-header__user-dropdown-option"
                                    :class="{ 'admin-header__user-dropdown-option--active': currentTheme === 'dark' }">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path
                                            d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z" />
                                    </svg>
                                    {{ t('settings_theme_dark') }}
                                </button>
                            </div>
                        </div>

                        <div class="admin-header__user-dropdown-divider"></div>

                        <!-- Language Switcher -->
                        <div class="admin-header__user-dropdown-section">
                            <div class="admin-header__user-dropdown-section-label">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path
                                        d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
                                </svg>
                                {{ t('language') }}
                            </div>
                            <div class="admin-header__user-dropdown-options">
                                <button @click.stop="setLanguage('de')" class="admin-header__user-dropdown-option"
                                    :class="{ 'admin-header__user-dropdown-option--active': currentLocale === 'de' }">
                                    🇩🇪 Deutsch
                                </button>
                                <button @click.stop="setLanguage('en')" class="admin-header__user-dropdown-option"
                                    :class="{ 'admin-header__user-dropdown-option--active': currentLocale === 'en' }">
                                    🇬🇧 English
                                </button>
                                <button @click.stop="setLanguage('da')" class="admin-header__user-dropdown-option"
                                    :class="{ 'admin-header__user-dropdown-option--active': currentLocale === 'da' }">
                                    🇩🇰 Dansk
                                </button>
                            </div>
                        </div>

                        <div class="admin-header__user-dropdown-divider"></div>

                        <button @click="handleLogout"
                            class="admin-header__user-dropdown-item admin-header__user-dropdown-item--logout">
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useTokenStore } from '@/store/tokenStore'
import { apiFetch } from '@/api'
import { applyTheme } from '@/utils/theme'

const { t, locale } = useI18n()
const router = useRouter()
const tokenStore = useTokenStore()

const emit = defineEmits<{
    'toggle-sidebar': []
}>()

const isUserMenuOpen = ref(false)

// Theme and locale
const currentTheme = ref<'light' | 'dark'>('light')
const currentLocale = computed(() => locale.value)

// User data
const userName = ref('User')
const userEmail = ref('user@example.com')
const userAvatar = ref<string | null>(null)

const userInitials = computed(() => {
    const names = userName.value.split(' ').filter(n => n.length > 0)
    if (names.length >= 2) {
        const first = names[0]?.[0]
        const last = names[names.length - 1]?.[0]
        if (first && last) {
            return (first + last).toUpperCase()
        }
    }
    return userName.value.substring(0, 2).toUpperCase()
})

// Fetch user profile data
const fetchUserProfile = async () => {
    try {
        const { data } = await apiFetch<{
            display_name?: string
            email?: string
            photo_url?: string
        }>('/api/profile')

        if (data) {
            userName.value = data.display_name || 'User'
            userEmail.value = data.email || 'user@example.com'
            userAvatar.value = data.photo_url || null
        }
    } catch (err) {
        console.error('Failed to fetch user profile:', err)
    }
}

const toggleUserMenu = () => {
    isUserMenuOpen.value = !isUserMenuOpen.value
}

const closeUserMenu = () => {
    isUserMenuOpen.value = false
}

// Theme switching
const setTheme = (theme: 'light' | 'dark') => {
    currentTheme.value = theme
    applyTheme(theme)
    localStorage.setItem('app-theme', theme)
}

// Language switching
const setLanguage = (lang: string) => {
    locale.value = lang
    localStorage.setItem('app-locale', lang)
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

// Close user menu when clicking outside
const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (isUserMenuOpen.value && !target.closest('.admin-header__user-menu')) {
        closeUserMenu()
    }
}

const handleLogout = () => {
    tokenStore.clearTokens()
    router.push('/app/login')
}

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
.admin-header {
    position: sticky;
    top: 0;
    z-index: 1000;
    background: var(--surface-primary);
    border-bottom: 1px solid var(--border-soft);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    margin-bottom: 0;
}

.admin-header__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    max-width: 100%;
}

.admin-header__brand {
    display: flex;
    align-items: center;
}

.admin-header__logo {
    text-decoration: none;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-primary);
    transition: color 0.2s ease;

    &:hover {
        color: var(--accent-secondary);
    }
}

.admin-header__logo-text {
    display: inline-block;
}

.admin-header__actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.admin-header__menu-toggle {
    display: none;
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: var(--color-text);
    transition: color 0.2s ease;

    &:hover {
        color: var(--accent-primary);
    }

    @media (max-width: 768px) {
        display: flex;
    }
}

// User Menu
.admin-header__user-menu {
    position: relative;
}

.admin-header__user-trigger {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.375rem;
    background: none;
    border: 1px solid var(--border-soft);
    border-radius: 999px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--color-text);

    &:hover {
        background: var(--surface-muted);
        border-color: var(--border-soft);
    }

    @media (max-width: 640px) {
        .admin-header__user-name {
            display: none;
        }
    }
}

.admin-header__user-avatar,
.admin-header__user-avatar-placeholder {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
}

.admin-header__user-avatar {
    object-fit: cover;
    border: 2px solid var(--border-soft);
}

.admin-header__user-avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--accent-primary);
    color: white;
    font-weight: 600;
    font-size: 0.85rem;
    border: 2px solid var(--accent-primary);
}

.admin-header__user-name {
    font-size: 0.9rem;
    font-weight: 500;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.admin-header__user-caret {
    flex-shrink: 0;
    transition: transform 0.2s ease;

    &--open {
        transform: rotate(180deg);
    }
}

.admin-header__user-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 240px;
    background: var(--surface-primary);
    border: 1px solid var(--border-soft);
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

.admin-header__user-dropdown-header {
    padding: 0.75rem 1rem;
}

.admin-header__user-dropdown-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.admin-header__user-dropdown-name {
    font-weight: 600;
    font-size: 0.95rem;
    color: var(--color-text);
}

.admin-header__user-dropdown-email {
    font-size: 0.85rem;
    color: var(--muted-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.admin-header__user-dropdown-divider {
    height: 1px;
    background: var(--border-soft);
    margin: 0.5rem 0;
}

.admin-header__user-dropdown-nav {
    display: flex;
    flex-direction: column;
    padding: 0.25rem 0;
}

.admin-header__user-dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    font-size: 0.9rem;
    color: var(--color-text);
    text-decoration: none;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.15s ease;

    svg {
        flex-shrink: 0;
        opacity: 0.7;
    }

    &:hover {
        background: var(--surface-muted);
    }

    &--logout {
        color: #dc2626;

        &:hover {
            background: rgba(220, 38, 38, 0.1);
        }
    }
}

.admin-header__user-dropdown-section {
    padding: 0.75rem 0;
}

.admin-header__user-dropdown-section-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--muted-text);
    text-transform: uppercase;
    letter-spacing: 0.05em;

    svg {
        opacity: 0.6;
    }
}

.admin-header__user-dropdown-options {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.25rem 0;
}

.admin-header__user-dropdown-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    font-size: 0.9rem;
    color: var(--color-text);
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

    &:hover {
        background: var(--surface-muted);
    }

    &--active {
        background: var(--accent-muted);
        color: var(--accent-primary);
        font-weight: 600;

        &::before {
            content: '✓';
            position: absolute;
            right: 1rem;
            font-weight: bold;
        }
    }
}
</style>

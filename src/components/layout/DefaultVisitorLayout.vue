<template>
    <div class="visitor-layout">
        <header class="visitor-layout__topbar">
            <div class="visitor-layout__brand">
                <button type="button" class="visitor-layout__hamburger"
                    :class="{ 'visitor-layout__hamburger--hidden': isMobileMenuOpen }"
                    :aria-expanded="isMobileMenuOpen ? 'true' : 'false'" :aria-controls="mobileMenuId"
                    :aria-label="isMobileMenuOpen ? 'Close menu' : 'Open menu'" @click="toggleMobileMenu">
                    <span class="visitor-layout__hamburger-line"></span>
                    <span class="visitor-layout__hamburger-line"></span>
                    <span class="visitor-layout__hamburger-line"></span>
                </button>
                <slot name="brand">
                    <router-link to="/" class="visitor-layout__logo-link">
                        <span class="visitor-layout__logo-text">Uranus</span>
                    </router-link>
                </slot>
            </div>
            <div :id="mobileMenuId" class="visitor-layout__menu"
                :class="{ 'visitor-layout__menu--open': isMobileMenuOpen }">
                <nav class="visitor-layout__nav" aria-label="Main navigation" @click="handleNavClick">
                    <slot name="navigation">
                        <router-link v-for="link in defaultNav" :key="link.to" :to="link.to"
                            class="visitor-layout__nav-link" @click="closeMobileMenu">
                            {{ link.label }}
                        </router-link>
                    </slot>
                </nav>
                <div class="visitor-layout__actions">
                    <slot name="actions">
                        <label class="sr-only" for="visitor-language-select">{{ t('language') }}</label>
                        <select id="visitor-language-select" class="visitor-layout__select" v-model="selectedLocale">
                            <option v-for="option in localeOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>

                        <label class="sr-only" for="visitor-theme-select">{{ t('settings_theme') }}</label>
                        <select id="visitor-theme-select" class="visitor-layout__select" v-model="selectedTheme">
                            <option v-for="option in themeOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </slot>
                </div>
            </div>
        </header>
        <div v-if="isMobileMenuOpen" class="visitor-layout__overlay" @click="closeMobileMenu"></div>

        <main class="visitor-layout__content">
            <router-view />
        </main>

        <footer class="visitor-layout__footer">
            <div class="visitor-layout__footer-content">
                <div class="visitor-layout__footer-links">
                    <slot name="footer">
                        <router-link v-for="link in legalLinks" :key="link.to" :to="link.to"
                            class="visitor-layout__footer-link">
                            {{ link.label }}
                        </router-link>
                    </slot>
                </div>
                <p class="visitor-layout__footer-copy">© {{ currentYear }} Uranus</p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useThemeStore } from '@/store/themeStore'
import { useTokenStore } from '@/store/token'
import type { ThemeMode } from '@/utils/theme'

interface NavLink {
    to: string
    label: string
}

interface NavLinkConfig {
    to: string
    labelKey: string
}

const { t, locale, te } = useI18n({ useScope: 'global' })
const tokenStore = useTokenStore()
const route = useRoute()
const themeStore = useThemeStore()
const isMobileMenuOpen = ref(false)
const mobileMenuId = 'visitor-layout-mobile-menu'

const navConfigs: NavLinkConfig[] = [
    { to: '/events', labelKey: 'visitor_nav_events' },
    { to: '/login', labelKey: 'visitor_nav_login' },
    { to: '/signup', labelKey: 'visitor_nav_signup' },
]

const legalConfigs: NavLinkConfig[] = [
    { to: '/imprint', labelKey: 'visitor_footer_imprint' },
    { to: '/terms', labelKey: 'visitor_footer_terms' },
    { to: '/privacy', labelKey: 'visitor_footer_privacy' },
]

const defaultNav = computed<NavLink[]>(() =>
    navConfigs
        .filter(({ to }) => {
            if (tokenStore.accessToken) {
                return to !== '/login' && to !== '/signup'
            }
            return true
        })
        .map(({ to, labelKey }) => ({
            to,
            label: t(labelKey),
        }))
)

const legalLinks = computed<NavLink[]>(() =>
    legalConfigs.map(({ to, labelKey }) => ({
        to,
        label: t(labelKey),
    }))
)

const currentYear = computed(() => new Date().getFullYear())

const localeOptions: Array<{ value: string; label: string }> = [
    { value: 'en', label: 'English' },
    { value: 'da', label: 'Dansk' },
    { value: 'de', label: 'Deutsch' },
]

const themeOptions = computed(() => {
    const options: Array<{ value: ThemeMode; label: string }> = [
        { value: 'light', label: te('settings_theme_light') ? t('settings_theme_light') : 'Light theme' },
        { value: 'dark', label: te('settings_theme_dark') ? t('settings_theme_dark') : 'Dark theme' },
    ]
    return options
})

const selectedLocale = computed({
    get: () => locale.value,
    set: (value: string) => {
        locale.value = value
    },
})

const selectedTheme = computed({
    get: () => themeStore.theme,
    set: (value: ThemeMode) => {
        themeStore.setTheme(value)
    },
})

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
}

const closeMobileMenu = () => {
    isMobileMenuOpen.value = false
}

const handleNavClick = (event: MouseEvent) => {
    if (!isMobileMenuOpen.value) {
        return
    }

    const target = event.target as HTMLElement | null
    if (target?.closest('a')) {
        closeMobileMenu()
    }
}

watch(
    () => route.fullPath,
    () => {
        isMobileMenuOpen.value = false
    }
)
</script>

<style scoped lang="scss">
.visitor-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--page-bg);
    color: var(--color-text);
}

.visitor-layout__topbar {
    position: sticky;
    top: 0;
    z-index: 1200;
    display: flex;
    align-items: center;
    gap: clamp(1rem, 4vw, 2rem);
    justify-content: space-between;
    padding: clamp(1rem, 3vw, 1.5rem) clamp(1.25rem, 4vw, 2rem);
    background: var(--card-bg);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    border-bottom: 1px solid var(--border-soft, rgba(148, 163, 184, 0.2));
}

.visitor-layout__brand {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.visitor-layout__logo-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: inherit;
    font-weight: 700;
    font-size: clamp(1.2rem, 3vw, 1.5rem);
    letter-spacing: 0.02em;
}

.visitor-layout__logo-text {
    font-family: var(--font-brand, 'Inter', sans-serif);
}

.visitor-layout__hamburger {
    display: none;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 4px;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    border: 1px solid var(--border-soft, rgba(148, 163, 184, 0.4));
    background: var(--card-bg);
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.visitor-layout__hamburger:hover {
    background: var(--surface-muted, rgba(148, 163, 184, 0.1));
    border-color: var(--accent-primary, #4f46e5);
}

.visitor-layout__hamburger:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
}

.visitor-layout__hamburger-line {
    width: 20px;
    height: 2px;
    background: var(--color-text, #0f172a);
    border-radius: 1px;
    transition: all 0.3s ease;
}

.visitor-layout__hamburger--hidden {
    visibility: hidden;
    opacity: 0;
    pointer-events: none;
}

.visitor-layout__menu {
    display: flex;
    align-items: center;
    gap: clamp(1rem, 3vw, 2rem);
    flex: 1;
    justify-content: flex-end;
}

.visitor-layout__nav {
    flex: 1;
    display: flex;
    align-items: center;
    gap: clamp(0.75rem, 2vw, 1.25rem);
}

.visitor-layout__nav-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    font-weight: 600;
    color: var(--muted-text, #475569);
    text-decoration: none;
    transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.visitor-layout__nav-link.router-link-active,
.visitor-layout__nav-link:hover {
    color: var(--accent-primary, #4f46e5);
    background: rgba(79, 70, 229, 0.1);
    transform: translateY(-1px);
}

.visitor-layout__actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.visitor-layout__select {
    border-radius: 999px;
    border: 1px solid var(--border-soft, rgba(148, 163, 184, 0.4));
    background: var(--input-bg, #f1f5f9);
    padding: 0.65rem 1.1rem;
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--color-text, #0f172a);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.visitor-layout__select:focus {
    outline: none;
    border-color: var(--accent-primary, #4f46e5);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.visitor-layout__content {
    display: flex;
    flex: 1;
}

.visitor-layout__footer {
    background: var(--card-bg, #ffffff);
    border-top: 1px solid var(--border-soft, rgba(148, 163, 184, 0.2));
    padding: clamp(1.5rem, 4vw, 2.5rem) clamp(1.25rem, 5vw, 3rem);
}

.visitor-layout__footer-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
}

.visitor-layout__footer-links {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
}

.visitor-layout__footer-link {
    text-decoration: none;
    font-weight: 600;
    color: var(--muted-text, #475569);
    transition: color 0.2s ease;
}

.visitor-layout__footer-link:hover,
.visitor-layout__footer-link.router-link-active {
    color: var(--accent-primary, #4f46e5);
}

.visitor-layout__footer-copy {
    margin: 0;
    font-size: 0.9rem;
    color: var(--muted-text, #64748b);
}

.visitor-layout__overlay {
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.45);
    z-index: 1100;
}

@media (max-width: 960px) {
    .visitor-layout__hamburger {
        display: inline-flex;
    }

    .visitor-layout__menu {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: min(340px, 85vw);
        background: var(--card-bg);
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
        gap: 1.5rem;
        padding: clamp(1.75rem, 6vw, 2.5rem);
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        pointer-events: none;
        z-index: 1095;
        flex: none;
        overflow-y: auto;
    }

    .visitor-layout__menu--open {
        transform: translateX(0);
        pointer-events: auto;
    }

    .visitor-layout__nav {
        flex: initial;
        width: 100%;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .visitor-layout__nav-link {
        width: 100%;
        justify-content: flex-start;
        padding: 0.75rem 1rem;
    }

    .visitor-layout__actions {
        width: 100%;
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .visitor-layout__select {
        width: 100%;
    }
}

@media (max-width: 768px) {
    .visitor-layout__footer-content {
        align-items: center;
        text-align: center;
    }

    .visitor-layout__footer-links {
        justify-content: center;
    }
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}
</style>

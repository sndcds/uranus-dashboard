<template>
    <div class="visitor-layout">
        <header class="visitor-layout__topbar">
            <div class="visitor-layout__brand">
                <slot name="brand">
                    <router-link to="/" class="visitor-layout__logo-link">
                        <span class="visitor-layout__logo-text">Uranus</span>
                    </router-link>
                </slot>
            </div>
            <nav class="visitor-layout__nav" aria-label="Main navigation">
                <slot name="navigation">
                    <router-link v-for="link in defaultNav" :key="link.to" :to="link.to"
                        class="visitor-layout__nav-link">
                        {{ link.label }}
                    </router-link>
                </slot>
            </nav>
            <div class="visitor-layout__actions">
                <slot name="actions" />
            </div>
        </header>

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
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface NavLink {
    to: string
    label: string
}

interface NavLinkConfig {
    to: string
    labelKey: string
}

const { t } = useI18n({ useScope: 'global' })

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
    navConfigs.map(({ to, labelKey }) => ({
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
</script>

<style scoped lang="scss">
.visitor-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--page-bg, #f8fafc);
    color: var(--color-text, #0f172a);
}

.visitor-layout__topbar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    gap: clamp(1rem, 4vw, 2rem);
    justify-content: space-between;
    padding: clamp(1rem, 3vw, 1.5rem) clamp(1.25rem, 4vw, 2rem);
    background: var(--card-bg, #ffffff);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
    border-bottom: 1px solid var(--border-soft, rgba(148, 163, 184, 0.2));
}

.visitor-layout__brand {
    display: flex;
    align-items: center;
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

.visitor-layout__content {
    flex: 1;
    padding: clamp(2rem, 6vw, 3.5rem) clamp(1.25rem, 5vw, 3rem);
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

@media (max-width: 768px) {
    .visitor-layout__topbar {
        flex-wrap: wrap;
        gap: 1rem;
        justify-content: center;
        text-align: center;
    }

    .visitor-layout__nav {
        width: 100%;
        justify-content: center;
        flex-wrap: wrap;
    }

    .visitor-layout__actions {
        width: 100%;
        justify-content: center;
    }

    .visitor-layout__footer-content {
        align-items: center;
        text-align: center;
    }

    .visitor-layout__footer-links {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .visitor-layout__content {
        padding: clamp(1.25rem, 7vw, 2rem) clamp(1rem, 6vw, 1.5rem);
    }
}
</style>

<template>
    <div class="admin-layout">
        <!-- Header Bar -->
        <AdminHeader @toggle-sidebar="toggleSidebar" />

        <!-- Main Container -->
        <div class="admin-layout__container">
            <!-- Sidebar -->
            <aside class="admin-layout__sidebar" :class="{ 'admin-layout__sidebar--open': isSidebarOpen }">
                <nav class="admin-layout__nav">
                    <router-link to="/admin/dashboard" class="admin-layout__nav-item"
                        active-class="admin-layout__nav-item--active">
                        <span class="admin-layout__nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                                    fill="currentColor" />
                            </svg>
                        </span>
                        <span class="admin-layout__nav-text">{{ t('dashboard') }}</span>
                    </router-link>

                    <router-link to="/admin/organizers" class="admin-layout__nav-item"
                        active-class="admin-layout__nav-item--active">
                        <span class="admin-layout__nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                    fill="currentColor" />
                            </svg>
                        </span>
                        <span class="admin-layout__nav-text">{{ t('organizers') }}</span>
                    </router-link>

                    <router-link :to="venuesRoute" class="admin-layout__nav-item"
                        active-class="admin-layout__nav-item--active">
                        <span class="admin-layout__nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"
                                    fill="currentColor" />
                            </svg>
                        </span>
                        <span class="admin-layout__nav-text">{{ t('venues') }}</span>
                    </router-link>

                    <router-link :to="eventsRoute" class="admin-layout__nav-item"
                        active-class="admin-layout__nav-item--active">
                        <span class="admin-layout__nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
                                    fill="currentColor" />
                            </svg>
                        </span>
                        <span class="admin-layout__nav-text">{{ t('events') }}</span>
                    </router-link>

                    <router-link to="/admin/settings" class="admin-layout__nav-item"
                        active-class="admin-layout__nav-item--active">
                        <span class="admin-layout__nav-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                            </svg>
                        </span>
                        <span class="admin-layout__nav-text">{{ t('settings') }}</span>
                    </router-link>
                </nav>
            </aside>

            <!-- Overlay for mobile -->
            <div v-if="isSidebarOpen" class="admin-layout__overlay" @click="closeSidebar"></div>

            <!-- Main Content -->
            <main class="admin-layout__main">
                <div class="admin-layout__content">
                    <router-view />
                </div>

                <!-- Footer -->
                <footer class="admin-layout__footer">
                    <div class="admin-layout__footer-content">
                        <p class="admin-layout__footer-text">
                            &copy; {{ currentYear }} Uranus Dashboard
                        </p>
                        <nav class="admin-layout__footer-nav">
                            <router-link to="/imprint" class="admin-layout__footer-link">
                                {{ t('visitor_footer_imprint') }}
                            </router-link>
                            <router-link to="/privacy" class="admin-layout__footer-link">
                                {{ t('visitor_footer_privacy') }}
                            </router-link>
                            <router-link to="/terms" class="admin-layout__footer-link">
                                {{ t('visitor_footer_terms') }}
                            </router-link>
                        </nav>
                    </div>
                </footer>
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/store/appStore'
import AdminHeader from './AdminHeader.vue'

const { t } = useI18n()
const appStore = useAppStore()

const isSidebarOpen = ref(false)
const currentYear = computed(() => new Date().getFullYear())

// Dynamic routes based on organizerId
const venuesRoute = computed(() => {
    return appStore.organizerId
        ? `/admin/organizer/${appStore.organizerId}/venues`
        : '/admin/organizer/venues/empty'
})

const eventsRoute = computed(() => {
    return appStore.organizerId
        ? `/admin/organizer/${appStore.organizerId}/events`
        : '/admin/organizer/events/empty'
})

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
}

const closeSidebar = () => {
    isSidebarOpen.value = false
}
</script>

<style scoped lang="scss">
.admin-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--surface-primary);
}

// Main Container
.admin-layout__container {
    display: flex;
    flex: 1;
    position: relative;
}

// Sidebar
.admin-layout__sidebar {
    width: 250px;
    background: var(--surface-primary);
    border-right: 1px solid var(--border-soft);
    padding: 1.5rem 0;
    overflow-y: auto;
    transition: transform 0.3s ease;

    @media (max-width: 768px) {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        z-index: 1100;
        transform: translateX(-100%);
        box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

        &--open {
            transform: translateX(0);
        }
    }
}

.admin-layout__nav {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0 0.75rem;
}

.admin-layout__nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.95rem;
    transition: all 0.2s ease;

    &:hover {
        background: var(--surface-muted);
        color: var(--accent-primary);
    }

    &--active {
        background: var(--accent-muted);
        color: var(--accent-primary);
        font-weight: 600;
    }
}

.admin-layout__nav-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
}

.admin-layout__nav-text {
    flex: 1;
}

// Overlay for mobile
.admin-layout__overlay {
    display: none;

    @media (max-width: 768px) {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 1050;
    }
}

// Main Content
.admin-layout__main {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
}

.admin-layout__content {
    background-color: var(--uranus-bg-color-d1);
    flex: 1;
    padding: 2rem;
    max-width: 100%;

    @media (max-width: 768px) {
        padding: 1rem;
    }
}

// Footer
.admin-layout__footer {
    background: var(--surface-primary);
    border-top: 1px solid var(--border-soft);
    padding: 1.5rem 2rem;
    margin-top: auto;

    @media (max-width: 768px) {
        padding: 1.5rem 1rem;
    }
}

.admin-layout__footer-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    flex-wrap: wrap;
}

.admin-layout__footer-text {
    margin: 0;
    font-size: 0.9rem;
    color: var(--muted-text);
}

.admin-layout__footer-nav {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;

    @media (max-width: 768px) {
        gap: 1rem;
    }
}

.admin-layout__footer-link {
    font-size: 0.9rem;
    color: var(--muted-text);
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
        color: var(--accent-primary);
    }
}
</style>

import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/components/DashboardLayout.vue'
import AuthLayout from '@/components/AuthLayout.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import VenuesView from '@/views/VenuesView.vue'
import SettingsView from '@/views/SettingsView.vue'

const routes = [
    {
        path: '/',
        component: DashboardLayout,
        children: [
            {
                path: '',
                name: 'dashboard',
                component: DashboardView
            },
            {
                path: '/venues',
                name: 'venues',
                component: VenuesView
            },
            {
                path: '/settings',
                name: 'settings',
                component: SettingsView
            },
        ],
    },
    {
        path: '/login',
        component: AuthLayout,
        children: [
            {
                path: '',
                name: 'login',
                component: LoginView
            },
        ],
    },
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router

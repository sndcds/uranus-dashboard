import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayoutComponent from '@/components/DashboardLayoutComponent.vue'
import AuthLayoutComponent from '@/components/AuthLayoutComponent.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import OrganizerView from '@/views/OrganizerView.vue'
import SettingsView from '@/views/SettingsView.vue'

const routes = [
    {
        path: '/',
        component: DashboardLayoutComponent,
        children: [
            {
                path: '',
                name: 'dashboard',
                component: DashboardView
            },
            {
                path: '/venues',
                name: 'venues',
                component: OrganizerView
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
        component: AuthLayoutComponent,
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

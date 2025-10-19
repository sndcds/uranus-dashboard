import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayoutComponent from '@/components/DashboardLayoutComponent.vue'
import AuthLayoutComponent from '@/components/AuthLayoutComponent.vue'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import OrganizerDashboardView from '@/views/OrganizerDashboardView.vue'
import SettingsView from '@/views/SettingsView.vue'
import FormOrganizerView from '@/views/FormOrganizerView.vue'
import OrganizerVenueView from '@/views/OrganizerVenueView.vue'
import SignupView from '@/views/SignupView.vue'

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
                path: '/organizers',
                name: 'organizers',
                component: OrganizerDashboardView
            },
            {
                path: '/settings',
                name: 'settings',
                component: SettingsView
            },
            {
                path: '/organizer/create',
                name: 'create-organizer',
                component: FormOrganizerView
            },
            {
                path: '/organizer/:id',
                name: 'organizer',
                component: OrganizerVenueView
            }
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
            {
                path: '/signup',
                name: 'signup',
                component: SignupView
            }
        ],
    },
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router

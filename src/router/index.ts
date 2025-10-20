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
import FormVenueView from '@/views/FormVenueView.vue'
import FormSpaceView from '@/views/FormSpaceView.vue'
import EventDashboardView from '@/views/EventDashboardView.vue'
import FormEventView from '@/views/FormEventView.vue'

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
                path: '/organizer/:id/venue/create',
                name: 'create-venue',
                component: FormVenueView
            },
            {
                path: '/organizer/:id/venue/:venueId/space/create',
                name: 'create-space',
                component: FormSpaceView
            },
            {
                path: '/organizer/:id/venues',
                name: 'venues',
                component: OrganizerVenueView
            },
            {
                path: '/organizer/:id/events',
                name: 'organizer-events',
                component: EventDashboardView
            },
            {
                path: '/organizer/:id/event/create',
                name: 'create-event',
                component: FormEventView
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

import { createRouter, createWebHistory } from 'vue-router'
import { useTokenStore } from '@/store/token'

import DashboardLayout from '@/components/layout/DashboardLayout.vue'
import DefaultVisitorLayout from '@/components/layout/DefaultVisitorLayout.vue'

import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'
import OrganizerDashboardView from '@/views/OrganizerDashboardView.vue'
import SettingsView from '@/views/SettingsView.vue'
import FormOrganizerCreateView from '@/views/FormOrganizerCreateView.vue'
import OrganizerVenueView from '@/views/OrganizerVenueView.vue'
import SignupView from '@/views/SignupView.vue'
import FormVenueCreateView from '@/views/FormVenueCreateView.vue'
import FormSpaceView from '@/views/FormSpaceView.vue'
import EventDashboardView from '@/views/EventDashboardView.vue'
import FormEventView from '@/views/FormEventView.vue'
import EventView from '@/views/EventView.vue'
import UserPermissionView from '@/views/UserPermissionView.vue'
import FormUserProfileView from '@/views/FormUserProfileView.vue'
import EventCalendarView from '@/views/EventCalendarView.vue'
import FormOrganizerUpdateView from '@/views/FormOrganizerUpdateView.vue'
import FormVenueUpdateView from '@/views/FormVenueUpdateView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import MessageInboxView from '@/views/MessageInboxView.vue'
import MessageSendView from '@/views/MessageSendView.vue'

const routes = [
    {
        path: '/',
        component: DashboardLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                name: 'dashboard',
                component: DashboardView,
            },
            {
                path: '/organizers',
                name: 'organizers',
                component: OrganizerDashboardView,
            },
            {
                path: '/settings',
                name: 'settings',
                component: SettingsView,
            },
            {
                path: '/organizer/create',
                name: 'create-organizer',
                component: FormOrganizerCreateView,
            },
            {
                path: '/organizer/:id/edit',
                name: 'edit-organizer',
                component: FormOrganizerUpdateView,
            },
            {
                path: '/organizer/:id/venue/create',
                name: 'create-venue',
                component: FormVenueCreateView,
            },
            {
                path: '/organizer/:id/venue/:venueId/edit',
                name: 'edit-venue',
                component: FormVenueUpdateView,
            },
            {
                path: '/organizer/:id/venue/:venueId/space/create',
                name: 'create-space',
                component: FormSpaceView,
            },
            {
                path: '/organizer/:id/venue/:venueId/space/:spaceId/edit',
                name: 'edit-space',
                component: FormSpaceView,
            },
            {
                path: '/organizer/:id/venues',
                name: 'venues',
                component: OrganizerVenueView,
            },
            {
                path: '/organizer/:id/events',
                name: 'organizer-events',
                component: EventDashboardView,
            },
            {
                path: '/organizer/:id/event/create',
                name: 'create-event',
                component: FormEventView,
            },
            {
                path: '/event/:id',
                name: 'event-details',
                component: EventView,
            },
            {
                path: '/user/permissions',
                name: 'user-permissions',
                component: UserPermissionView,
            },
            {
                path: '/user/profile',
                name: 'user-profile',
                component: FormUserProfileView,
            },
            {
                path: '/user/messages/inbox',
                name: 'user-messages-inbox',
                component: MessageInboxView,
            },
            {
                path: '/user/messages/send',
                name: 'user-messages-send',
                component: MessageSendView,
            },
        ],
    },
    {
        path: '/events',
        component: DefaultVisitorLayout,
        children: [
            {
                path: '',
                name: 'events',
                component: EventCalendarView,
            },
        ],
    },
    {
        path: '/',
        component: DefaultVisitorLayout,
        meta: { guestOnly: true },
        children: [
            {
                path: '/login',
                name: 'login',
                component: LoginView,
            },
            {
                path: '/signup',
                name: 'signup',
                component: SignupView,
            },
            {
                path: '/forgot-password',
                name: 'forgot-password',
                component: ForgotPasswordView,
            },
            {
                path: '/reset-password',
                name: 'reset-password',
                component: ResetPasswordView,
            },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    const tokenStore = useTokenStore()
    const isAuthenticated = Boolean(tokenStore.accessToken)
    const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
    const guestOnly = to.matched.some((record) => record.meta?.guestOnly)

    if (requiresAuth && !isAuthenticated) {
        next({ name: 'login', query: { redirect: to.fullPath } })
        return
    }

    if (guestOnly && isAuthenticated) {
        next({ name: 'dashboard' })
        return
    }

    next()
})

export default router

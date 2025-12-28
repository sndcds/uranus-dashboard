import { createRouter, createWebHistory } from 'vue-router'
import { useTokenStore } from '@/store/tokenStore'

import UranusDashboardView from '@/views/UranusDashboardView.vue'
import UranusDashboardTodoListView from '@/views/UranusDashboardTodoListView.vue'
import LoginView from '@/views/LoginView.vue'
import UranusDashboardOrganizationsView from '@/views/UranusDashboardOrganizationsView.vue'
import SettingsView from '@/views/SettingsView.vue'
import UranusDashboardVenuesView from '@/views/UranusDashboardVenuesView.vue'
import SignupView from '@/views/SignupView.vue'
import FormVenueCreateView from '@/views/FormVenueCreateView.vue'
import FormSpaceView from '@/views/FormSpaceView.vue'
import UranusDashboardEventsView from '@/views/UranusDashboardEventsView.vue'
import UranusCreateEventView from '@/views/UranusCreateEventView.vue'
import UranusEditEventView from '@/views/UranusEditEventView.vue'
import UserPermissionView from '@/views/UserPermissionView.vue'
import FormUserProfileView from '@/views/FormUserProfileView.vue'
import EventCalendarView from '@/views/EventCalendarView.vue'
import UranusEditOrganizationView from '@/views/UranusEditOrganizationView.vue'
import UranusEditVenueView from '@/views/UranusEditVenueView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import MessageInboxView from '@/views/MessageInboxView.vue'
import MessageSendView from '@/views/MessageSendView.vue'
import UranusPublicEventView from '@/views/UranusPublicEventView.vue'
import ImprintView from '@/views/ImprintView.vue'
import PrivacyView from '@/views/PrivacyView.vue'
import TermsView from '@/views/TermsView.vue'
import AboutView from '@/views/AboutView.vue'
import FirstStepsView from '@/views/FirstStepsView.vue'
import MapView from '@/views/MapView.vue'
import EmptyVenuesView from '@/views/EmptyVenuesView.vue'
import EmptyEventsView from '@/views/EmptyEventsView.vue'
import UserActivateView from '@/views/UserActivateView.vue'
import InviteActivateView from '@/views/InviteActivateView.vue'
import FormOrganizationTeamView from '@/views/FormOrganizationTeamView.vue'
import UranusOrganizationMemberPermissionView from '@/views/UranusOrganizationMemberPermissionView.vue'
import UranusCalendarView from '@/views/UranusCalendarView.vue'
import UranusEventSlideshowView from '@/views/UranusEventSlideshowView.vue'


import GenericLayout from '@/components/layout/GenericLayout.vue'
import UranusBlankLayout from '@/components/layout/UranusBlankLayout.vue'

const routes = [
    {
        path: '/admin',
        component: GenericLayout,
        meta: { requiresAuth: true },
        children: [
            {
                path: '',
                redirect: { name: 'admin-dashboard' },
            },
            {
                path: 'dashboard',
                name: 'admin-dashboard',
                component: UranusDashboardView,
            },
            {
                path: 'todo-list',
                name: 'admin-todo-list',
                component: UranusDashboardTodoListView,
            },
            {
                path: 'organizations',
                name: 'admin-organizations',
                component: UranusDashboardOrganizationsView,
            },
            {
                path: 'settings',
                name: 'admin-settings',
                component: SettingsView,
            },
            {
                path: 'organization/create',
                name: 'admin-create-organization',
                component: UranusEditOrganizationView,
            },
            {
                path: 'organization/:id/edit',
                name: 'admin-edit-organization',
                component: UranusEditOrganizationView,
            },
            {
                path: 'organization/:id/team',
                name: 'admin-team-organization',
                component: FormOrganizationTeamView,
            },
            {
                path: 'organization/:id/venue/create',
                name: 'admin-create-venue',
                component: UranusEditVenueView,
            },
            {
                path: 'organization/:id/venue/:venueId/edit',
                name: 'admin-edit-venue',
                component: UranusEditVenueView,
            },
            {
                path: 'organization/:id/venue/:venueId/space/create',
                name: 'admin-create-space',
                component: FormSpaceView,
            },
            {
                path: 'organization/:id/venue/:venueId/space/:spaceId/edit',
                name: 'admin-edit-space',
                component: FormSpaceView,
            },
            {
                path: 'organization/:id/venues',
                name: 'admin-venues',
                component: UranusDashboardVenuesView,
            },
            {
                path: 'organization/venues/empty',
                name: 'admin-venues-empty',
                component: EmptyVenuesView,
            },
            {
                path: 'organization/:id/events',
                name: 'admin-organization-events',
                component: UranusDashboardEventsView,
            },
            {
                path: 'organization/events/empty',
                name: 'admin-events-empty',
                component: EmptyEventsView,
            },
            {
                path: 'organization/:id/event/create',
                name: 'admin-create-event',
                component: UranusCreateEventView,
            },
            {
                path: 'event/:id',
                name: 'admin-event-details',
                component: UranusEditEventView,
            },
            {
                path: 'user/permissions',
                name: 'admin-user-permissions',
                component: UserPermissionView,
            },
            {
                path: 'user/profile',
                name: 'admin-user-profile',
                component: FormUserProfileView,
            },
            {
                path: 'user/messages/inbox',
                name: 'admin-user-messages-inbox',
                component: MessageInboxView,
            },
            {
                path: 'user/messages/send',
                name: 'admin-user-messages-send',
                component: MessageSendView,
            },
            {
                path: 'invite/accept',
                name: 'admin-accept-invite',
                component: InviteActivateView,
            },
            {
                path: 'organization/:organizationId/member/:memberId/permission',
                name: 'admin-edit-member-permission',
                component: UranusOrganizationMemberPermissionView,
            }
        ],
    },
    {
        path: '/slideshow',
        name: 'event-slideshow',
        component: UranusEventSlideshowView,
    },
    {
        path: '/',
        component: GenericLayout,
        children: [
            {
                path: '',
                name: 'events',
                component: UranusCalendarView,
            },
            {
                path: 'event/:id/date/:eventDateId',
                name: 'event-details',
                component: UranusPublicEventView,
            },
            {
                path: 'imprint',
                name: 'imprint',
                component: ImprintView,
            },
            {
                path: 'privacy',
                name: 'privacy',
                component: PrivacyView,
            },
            {
                path: 'terms',
                name: 'terms',
                component: TermsView,
            },
            {
                path: 'about',
                name: 'about',
                component: AboutView,
            },
            {
                path: 'first-steps',
                name: 'first-steps',
                component: FirstStepsView,
            },
            {
                path: 'map',
                name: 'map',
                component: MapView,
                meta: { layoutMode: 'zero-padding' },
            }
        ],
    },
    {
        path: '/app',
        component: GenericLayout,
        meta: { guestOnly: true },
        children: [
            {
                path: 'login',
                name: 'app-login',
                component: LoginView,
            },
            {
                path: 'signup',
                name: 'app-signup',
                component: SignupView,
            },
            {
                path: 'forgot-password',
                name: 'app-forgot-password',
                component: ForgotPasswordView,
            },
            {
                path: 'reset-password',
                name: 'app-reset-password',
                component: ResetPasswordView,
            },
            {
                path: 'activate/account',
                name: 'app-activate-account',
                component: UserActivateView,
            }
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to) => {
    const tokenStore = useTokenStore()
    const isAuthenticated = tokenStore.isAuthenticated
    const requiresAuth = to.matched.some((record) => record.meta?.requiresAuth)
    const guestOnly = to.matched.some((record) => record.meta?.guestOnly)

    if (requiresAuth && !isAuthenticated) {
        return {
            name: 'app-login',
            query: { redirect: to.fullPath },
        }
    }

    if (guestOnly && isAuthenticated) {
        if (to.name !== 'events') {
            return { name: 'events' }
        }
        return true
    }

    return true
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import { useTokenStore } from '@/store/tokenStore'

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
import EventEditView from '@/views/EventEditView.vue'
import UserPermissionView from '@/views/UserPermissionView.vue'
import FormUserProfileView from '@/views/FormUserProfileView.vue'
import EventCalendarView from '@/views/EventCalendarView.vue'
import FormOrganizerUpdateView from '@/views/FormOrganizerUpdateView.vue'
import FormVenueUpdateView from '@/views/FormVenueUpdateView.vue'
import ForgotPasswordView from '@/views/ForgotPasswordView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import MessageInboxView from '@/views/MessageInboxView.vue'
import MessageSendView from '@/views/MessageSendView.vue'
import EventDetailView from '@/views/EventDetailView.vue'
import ImprintView from '@/views/ImprintView.vue'
import PrivacyView from '@/views/PrivacyView.vue'
import TermsView from '@/views/TermsView.vue'
import AboutView from '@/views/AboutView.vue'
import MapView from '@/views/MapView.vue'
import EmptyVenuesView from '@/views/EmptyVenuesView.vue'
import EmptyEventsView from '@/views/EmptyEventsView.vue'
import UserActivateView from '@/views/UserActivateView.vue'
import InviteActivateView from '@/views/InviteActivateView.vue'
import FormOrganizerTeamView from '@/views/FormOrganizerTeamView.vue'
import MemberPermissionView from '@/views/MemberPermissionView.vue'

import GenericLayout from '@/components/layout/GenericLayout.vue'

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
                component: DashboardView,
            },
            {
                path: 'organizers',
                name: 'admin-organizers',
                component: OrganizerDashboardView,
            },
            {
                path: 'settings',
                name: 'admin-settings',
                component: SettingsView,
            },
            {
                path: 'organizer/create',
                name: 'admin-create-organizer',
                component: FormOrganizerCreateView,
            },
            {
                path: 'organizer/:id/edit',
                name: 'admin-edit-organizer',
                component: FormOrganizerUpdateView,
            },
            {
                path: 'organizer/:id/team',
                name: 'admin-team-organizer',
                component: FormOrganizerTeamView,
            },
            {
                path: 'organizer/:id/venue/create',
                name: 'admin-create-venue',
                component: FormVenueCreateView,
            },
            {
                path: 'organizer/:id/venue/:venueId/edit',
                name: 'admin-edit-venue',
                component: FormVenueUpdateView,
            },
            {
                path: 'organizer/:id/venue/:venueId/space/create',
                name: 'admin-create-space',
                component: FormSpaceView,
            },
            {
                path: 'organizer/:id/venue/:venueId/space/:spaceId/edit',
                name: 'admin-edit-space',
                component: FormSpaceView,
            },
            {
                path: 'organizer/:id/venues',
                name: 'admin-venues',
                component: OrganizerVenueView,
            },
            {
                path: 'organizer/venues/empty',
                name: 'admin-venues-empty',
                component: EmptyVenuesView,
            },
            {
                path: 'organizer/:id/events',
                name: 'admin-organizer-events',
                component: EventDashboardView,
            },
            {
                path: 'organizer/events/empty',
                name: 'admin-events-empty',
                component: EmptyEventsView,
            },
            {
                path: 'organizer/:id/event/create',
                name: 'admin-create-event',
                component: FormEventView,
            },
            {
                path: 'event/:id',
                name: 'admin-event-details',
                component: EventEditView,
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
                path: 'organizer/:id/member/:memberId/permission',
                name: 'admin-edit-member-permission',
                component: MemberPermissionView,
            }
        ],
    },
    {
        path: '/',
        component: GenericLayout,
        children: [
            {
                path: '',
                name: 'events',
                component: EventCalendarView,
            },
            {
                path: 'event/:id/date/:eventDateId',
                name: 'event-details',
                component: EventDetailView,
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

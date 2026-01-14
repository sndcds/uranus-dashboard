import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { useTokenStore } from '@/store/tokenStore.ts'

import UranusDashboardView from '@/views/UranusDashboardView.vue'
import UranusDashboardTodosView from '@/views/UranusDashboardTodosView.vue'
import UranusLoginView from '@/views/UranusLoginView.vue'
import UranusDashboardOrganizationsView from '@/views/UranusDashboardOrganizationsView.vue'
import UranusSettingsView from '@/views/UranusSettingsView.vue'
import UranusDashboardVenuesView from '@/views/UranusDashboardVenuesView.vue'
import UranusSignupView from '@/views/UranusSignupView.vue'
import UranusSpaceEditView from '@/views/UranusSpaceEditView.vue'
import UranusDashboardEventsView from '@/views/UranusDashboardEventsView.vue'
import UranusCreateEventView from '@/views/UranusCreateEventView.vue'
import UranusEditEventView from '@/views/UranusEditEventView.vue'
import UranusUserProfileView from '@/views/UranusUserProfileView.vue'
import UranusEditOrganizationView from '@/views/UranusEditOrganizationView.vue'
import UranusEditVenueView from '@/views/UranusEditVenueView.vue'
import UranusForgotPasswordView from '@/views/UranusForgotPasswordView.vue'
import UranusResetPasswordView from '@/views/UranusResetPasswordView.vue'
import UranusMessageInboxView from '@/views/UranusMessageInboxView.vue'
import UranusMessageSendView from '@/views/UranusMessageSendView.vue'
import UranusPublicEventView from '@/views/public/UranusPublicEventView.vue'
import UranusHtmlView from '@/views/public/UranusHTMLView.vue'
import UranusVenueMapView from '@/views/UranusVenueMapView.vue'
import UserActivateView from '@/views/UserActivateView.vue'
import UranusInviteActivateView from '@/views/UranusInviteActivateView.vue'
import UranusOrganizationTeamView from '@/views/UranusOrganizationTeamView.vue'
import UranusOrganizationMemberPermissionView from '@/views/UranusOrganizationMemberPermissionView.vue'
import UranusCalendarView from '@/views/public/UranusCalendarView.vue'
import UranusEventSlideshowView from '@/views/UranusEventSlideshowView.vue'
import UranusDevThemeView from '@/views/UranusDevThemeView.vue'


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
                component: UranusDashboardTodosView,
            },
            {
                path: 'organizations',
                name: 'admin-organizations',
                component: UranusDashboardOrganizationsView,
            },
            {
                path: 'settings',
                name: 'admin-settings',
                component: UranusSettingsView,
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
                component: UranusOrganizationTeamView,
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
                component: UranusSpaceEditView,
            },
            {
                path: 'organization/:id/venue/:venueId/space/:spaceId/edit',
                name: 'admin-edit-space',
                component: UranusSpaceEditView,
            },
            {
                path: 'organization/:id/venues',
                name: 'admin-venues',
                component: UranusDashboardVenuesView,
            },
            {
                path: 'organization/:id/events',
                name: 'admin-organization-events',
                component: UranusDashboardEventsView,
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
                path: 'user/profile',
                name: 'admin-user-profile',
                component: UranusUserProfileView,
            },
            {
                path: 'user/messages/inbox',
                name: 'admin-user-messages-inbox',
                component: UranusMessageInboxView,
            },
            {
                path: 'user/messages/send',
                name: 'admin-user-messages-send',
                component: UranusMessageSendView,
            },
            {
                path: 'invite/accept',
                name: 'admin-accept-invite',
                component: UranusInviteActivateView,
            },
            {
                path: 'organization/:organizationId/member/:memberId/permissions',
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
                path: '/page/:pageName(.*)',
                component: UranusHtmlView,
                props: (route: RouteLocationNormalized) => ({
                    pageName: route.params.pageName as string
                })
            },
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
                path: 'map',
                name: 'map',
                component: UranusVenueMapView,
                meta: { layoutMode: 'zero-padding' },
            },
            {
                path: 'dev-theme-view',
                name: 'dev-theme-view',
                component: UranusDevThemeView,
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
                component: UranusLoginView,
            },
            {
                path: 'signup',
                name: 'app-signup',
                component: UranusSignupView,
            },
            {
                path: 'forgot-password',
                name: 'app-forgot-password',
                component: UranusForgotPasswordView,
            },
            {
                path: 'reset-password',
                name: 'app-reset-password',
                component: UranusResetPasswordView,
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

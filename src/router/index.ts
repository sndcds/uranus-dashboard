import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { useTokenStore } from '@/store/uranusTokenStore.ts'

import UranusDashboardView from '@/view/UranusDashboardView.vue'
import UranusDashboardTodosView from '@/view/UranusDashboardTodosView.vue'
import UranusLoginView from '@/view/UranusLoginView.vue'
import UranusDashboardVenuesView from '@/view/UranusDashboardVenuesView.vue'
import UranusSignupView from '@/view/UranusSignupView.vue'
import UranusSpaceEditView from '@/component/space/view/UranusSpaceEditView.vue'
import UranusUserProfileView from '@/view/UranusUserProfileView.vue'
import UranusForgotPasswordView from '@/view/UranusForgotPasswordView.vue'
import UranusResetPasswordView from '@/view/UranusResetPasswordView.vue'
import UranusMessageInboxView from '@/view/UranusMessageInboxView.vue'
import UranusMessageSendView from '@/view/UranusMessageSendView.vue'
import UranusEventView from '@/view/public/UranusEventView.vue'
import UranusHtmlView from '@/view/public/UranusHTMLView.vue'
import UranusVenueMapView from '@/view/public/UranusVenueMapView.vue'
import UserActivateView from '@/view/UserActivateView.vue'
import UranusInviteActivateView from '@/view/UranusInviteActivateView.vue'
import UranusOrganizationTeamView from '@/view/UranusOrganizationTeamView.vue'
import UranusOrganizationMemberPermissionView from '@/view/UranusOrganizationMemberPermissionView.vue'
import UranusCalendarView from '@/view/public/UranusCalendarView.vue'
import UranusEventSlideshowView from '@/view/public/UranusEventSlideshowView.vue'
import UranusDevThemeView from '@/view/UranusDevThemeView.vue'

import GenericLayout from '@/component/layout/GenericLayout.vue'
import UranusDashboardOrganizationsView from '@/view/admin/organization/UranusDashboardOrganizationsView.vue'
import UranusOrganizationEditView from "@/view/admin/organization/UranusOrganizationEditView.vue";
import UranusOrganizationCreateView from "@/view/admin/organization/UranusOrganizationCreateView.vue";
import UranusVenueCreateView from "@/view/admin/venue/UranusVenueCreateView.vue";
import UranusVenueEditView from "@/view/admin/venue/UranusVenueEditView.vue";
import UranusAdminEventsListView from '@/component/event/view/UranusAdminEventsListView.vue'
import UranusEventCreateView from "@/component/event/view/UranusEventCreateView.vue";
import UranusEventEditView from '@/component/event/view/UranusEventEditView.vue'


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
                path: 'organization/create',
                name: 'admin-create-organization',
                component: UranusOrganizationCreateView,
            },
            {
                path: 'organization/:id/edit',
                name: 'admin-edit-organization',
                component: UranusOrganizationEditView,
            },
            {
                path: 'organization/:id/team',
                name: 'admin-team-organization',
                component: UranusOrganizationTeamView,
            },
            {
                path: 'organization/:id/venue/create',
                name: 'admin-create-venue',
                component: UranusVenueCreateView,
            },
            {
                path: 'organization/:id/venue/:venueId/edit',
                name: 'admin-edit-venue',
                component: UranusVenueEditView,
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
                component: UranusAdminEventsListView,
            },
            {
                path: 'organization/:id/event/create',
                name: 'admin-create-event',
                component: UranusEventCreateView,
            },
            {
                path: 'event/:id',
                name: 'admin-event-details',
                component: UranusEventEditView,
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
                component: UranusEventView,
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
            },
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
